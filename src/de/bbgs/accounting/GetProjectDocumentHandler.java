package de.bbgs.accounting;

import java.io.IOException;
import java.io.InputStream;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.member.EMemberType;
import de.bbgs.pdf.DocBuilder;
import de.bbgs.pdf.DocBuilder.DocPart;
import de.bbgs.pdf.PDFCreator;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.utils.IOUtils;

public class GetProjectDocumentHandler implements IGetDocServiceHandler
{
    private SimpleDateFormat dateFmt = null;
    private NumberFormat currencyFmt = null;

    /**
     * 
     */
    public GetProjectDocumentHandler()
    {
        this.dateFmt = new SimpleDateFormat("dd.MM.yyyy");


        this.currencyFmt = NumberFormat.getNumberInstance(Locale.GERMANY);
        this.currencyFmt.setMinimumFractionDigits(2);
        this.currencyFmt.setMaximumFractionDigits(2);
        this.currencyFmt.setGroupingUsed(true);
        this.currencyFmt.setRoundingMode(RoundingMode.HALF_EVEN);
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "projectDocument";
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, de.bbgs.session.SessionWrapper)
     */
    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {
        Connection conn = null;
        InputStream in = null;

        int projId = Integer.parseInt(req.getParameter("id"));

        try
        {
            in = this.getClass().getResourceAsStream("project_document.adoc");
            conn = ConnectionPool.getConnection();

            DocBuilder db = new DocBuilder(in);
            this.createTitlePage(projId, db, conn);
            this.createPlanningPage(projId, db, conn);
            this.createMembersPage(projId, db, conn);
            this.createPaymentPage(projId, db, conn);
            this.createOutgoingsPage(projId, db, conn);

            byte[] pdf = this.createPDF(db);
            rsp.setContentType("application/pdf");
            rsp.setContentLength(pdf.length);
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.getOutputStream().write(pdf);
        }
        finally
        {
            DBUtils.closeQuitly(conn);
            IOUtils.closeQuitly(in);
        }
    }

    /**
     * @param db
     * @return
     * @throws IOException
     * @throws InterruptedException
     */
    private byte[] createPDF(DocBuilder db) throws Exception
    {
        InputStream in = null;
        try
        {
            in = db.getDocument();
            return PDFCreator.transform(in);
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }

    /**
     * @param projId
     * @param db
     * @param conn
     * @throws SQLException 
     */
    private void createTitlePage(int projId, DocBuilder db, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select c.name, c.description, min(t.date) as start, max(t.date) as end from courses c left join course_termins t on t.ref_id = c.id where c.id=? group by c.id");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                DocPart part = db.duplicateSection("TITLE_PAGE");
                part.replaceTag("$NAME$", rs.getString("c.name"));
                part.replaceTag("$FROM$", this.dateFmt.format(rs.getDate("start")));
                part.replaceTag("$UNTIL$", dateFmt.format(rs.getDate("end")));
                part.replaceTag("$DESCRIPTION$", rs.getString("c.description"));
                part.replaceTag("$TODAY$", this.dateFmt.format(new Date(System.currentTimeMillis())));
                part.commit();

                db.removeSection("TITLE_PAGE");
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param db
     * @param conn
     * @throws SQLException
     */
    private void createMembersPage(int projId, DocBuilder db, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select m.zname, m.vname, m.type from courses c \n"
                + "    join course_member cm on cm.course_id=c.id\n"
                + "    join members m on m.id = cm.member_id\n" + "    where c.id=?\n"
                + "    order by m.type, m.zname, m.vname");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                DocPart part = db.duplicateSection("MEMBER_ROW");
                part.replaceTag("$ZNAME$", rs.getString("zname"));
                part.replaceTag("$VNAME$", rs.getString("vname"));
                part.replaceTag("$TYPE$", EMemberType.valueOf(rs.getString("type")).toHumanReadable());
                part.commit();
            }
            db.removeSection("MEMBER_ROW");
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param projId
     * @param db
     * @param conn
     * @throws SQLException
     */
    private void createPlanningPage(int projId, DocBuilder db, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select p.amount, p.description, i.konto, i.name  from planning_items p left join invoice_items i on i.id = p.invoice_item_id where p.proj_id = ? order by i.konto, i.name");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();

            double total = 0.0f;
            DocPart part = null;
            while (rs.next())
            {
                part = db.duplicateSection("PLANNING_ROW");

                String name = String.format("%1$d - %2$s", rs.getInt("i.konto"), rs.getString("i.name"));
                part.replaceTag("$NAME$", name);

                double amount = rs.getDouble("p.amount");
                total += amount;
                part.replaceTag("$AMOUNT$", this.currencyFmt.format(amount));
                part.replaceTag("$DESCRIPTION$", rs.getString("p.description"));
                part.commit();
            }
            db.removeSection("PLANNING_ROW");

            part = db.duplicateSection("PLANNING_TOTAL");
            part.replaceTag("$AMOUNT$", this.currencyFmt.format(total));
            part.commit();
            db.removeSection("PLANNING_TOTAL");
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param db
     * @param conn
     * @throws SQLException
     */
    private void createPaymentPage(int projId, DocBuilder db, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select r.amount, r.description, i.konto, i.name from invoice_records r left join invoice_items i on i.id = r.source\n"
                    + " where target in(select id from invoice_items where ref_id=?) order by i.konto, i.name;");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();

            DocPart part = null;
            double total = this.calculateDemand(projId, conn);
            while (rs.next())
            {
                part = db.duplicateSection("PAYMENT_ROW");
                String name = String.format("%1$d - %2$s", Integer.valueOf(rs.getInt("i.konto")),
                    rs.getString("i.name"));
                part.replaceTag("$NAME$", name);

                double amount = rs.getDouble("r.amount");
                part.replaceTag("$AMOUNT$", this.currencyFmt.format(amount));
                total -= amount;

                part.replaceTag("$DESCRIPTION$", rs.getString("r.description"));
                part.commit();
            }
            db.removeSection("PAYMENT_ROW");

            part = db.duplicateSection("PAYMENT_TOTAL");
            part.replaceTag("$AMOUNT$", this.currencyFmt.format(total));
            part.commit();
            db.removeSection("PAYMENT_TOTAL");

        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param conn
     * @return
     * @throws SQLException
     */
    private double calculateDemand(int projId, Connection conn) throws SQLException
    {

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select sum(amount) as total from planning_items where proj_id=?");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();
            rs.next();
            return rs.getDouble("total");
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param db
     * @param conn
     * @throws SQLException 
     */
    public void createOutgoingsPage(int projId, DocBuilder db, Connection conn) throws SQLException
    {

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select r.amount, r.description, r.source, r.target, i.konto, i.name, i.id from invoice_records r\n"
                    + "left join invoice_items i on r.target = i.id\n" + " where source in\n"
                    + "(select id from invoice_items where ref_id=?) order by i.konto, i.name");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();

            DocPart part = null;
            double total = 0.0f;
            int lastItemId = 0;
            while (rs.next())
            {
                int currItemId = rs.getInt("i.id");
                if (currItemId != lastItemId)
                {
                    this.createOutgoingCategoryRow(projId, rs, db, conn);
                    lastItemId = currItemId;
                }
                total = this.createOutgoingDataRow(rs, total, db);
            }
            db.removeSection("OUTGOING_ROW");

            part = db.duplicateSection("OUTGOING_TOTAL");
            part.replaceTag("$PLANNED$", this.currencyFmt.format(this.calculateDemand(projId, conn)));
            part.replaceTag("$AMOUNT$", this.currencyFmt.format(total));
            part.commit();
            db.removeSection("OUTGOING_TOTAL");

        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    private void createOutgoingCategoryRow(int projId, ResultSet rs, DocBuilder db, Connection conn) throws SQLException
    {
        DocPart part = db.duplicateSection("OUTGOING_ROW");
        String name = String.format("%1$d - %2$s", Integer.valueOf(rs.getInt("i.konto")), rs.getString("i.name"));
        part.replaceTag("$NAME$", name);

        int invItemId = rs.getInt("r.target");
        double planned = this.getPlannedForInvoiceItem(projId, invItemId, conn);        
        part.replaceTag("$PLANNED$", this.currencyFmt.format(planned));        
        
        int projItemId = rs.getInt("r.source");
        double payed = this.getPayedForInvoiceItem(projItemId, invItemId, conn);                
        part.replaceTag("$AMOUNT$", this.currencyFmt.format(payed));

        part.replaceTag("$DESCRIPTION$", "");
        part.commit();
    }

    /**
     * @param projId
     * @param invItemId
     * @param conn
     * @return
     * @throws SQLException
     */
    private double getPlannedForInvoiceItem(int projId, int invItemId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            double total = 0.0f;
            stmt = conn.prepareStatement("select sum(amount) as planned from planning_items where proj_id=? and invoice_item_id=?");
            stmt.setInt(1,  projId);
            stmt.setInt(2,  invItemId);
            rs = stmt.executeQuery();
            if(rs.next()) {
                total = rs.getDouble("planned");
            }
            return total;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projItemId
     * @param invItemId
     * @param conn
     * @return
     * @throws SQLException
     */
    private double getPayedForInvoiceItem(int projItemId, int invItemId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            double total = 0.0f;
            stmt = conn.prepareStatement("select sum(amount) as payed from invoice_records where source=? and target=?");
            stmt.setInt(1,  projItemId);
            stmt.setInt(2,  invItemId);
            rs = stmt.executeQuery();
            if(rs.next()) {
                total = rs.getDouble("payed");
            }
            return total;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @throws SQLException 
     * 
     */
    private double createOutgoingDataRow(ResultSet rs, double total, DocBuilder db) throws SQLException
    {
        DocPart part = db.duplicateSection("OUTGOING_ROW");
        part.replaceTag("$NAME$", "");

        double amount = rs.getDouble("r.amount");
        part.replaceTag("$PLANNED$", "");
        part.replaceTag("$AMOUNT$", this.currencyFmt.format(amount));
        total += amount;

        part.replaceTag("$DESCRIPTION$", rs.getString("r.description"));
        part.commit();
        return total;
    }

}
