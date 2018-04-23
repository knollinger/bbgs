package de.bbgs.accounting;

import de.bbgs.pdf.DocBuilder;
import de.bbgs.pdf.PDFCreator;
import de.bbgs.pdf.DocBuilder.DocPart;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.NumberFormat;
import java.util.Locale;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * @author anderl
 *
 */
public class PrintProjectHandler implements IGetDocServiceHandler
{
    private NumberFormat currencyFmt;

    /**
     * 
     */
    public PrintProjectHandler()
    {
        this.currencyFmt = NumberFormat.getNumberInstance(Locale.GERMANY);
        this.currencyFmt.setMinimumFractionDigits(2);
        this.currencyFmt.setMaximumFractionDigits(2);
        this.currencyFmt.setGroupingUsed(true);
        this.currencyFmt.setRoundingMode(RoundingMode.HALF_EVEN);
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    public String getResponsibleFor()
    {
        return "print-project.pdf";
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#needsSession()
     */
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, de.bbgs.session.SessionWrapper)
     */
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {
        int projId = Integer.parseInt(req.getParameter("project-id"));
        Connection conn = null;

        try
        {
            conn = ConnectionPool.getConnection();
            DocBuilder db = new DocBuilder(this.getClass().getResourceAsStream("project.adoc"));
            this.createTitlePage(projId, db, conn);
            double planned = this.createPlanningPage(projId, db, conn);
            this.createPaymentPage(projId, planned, db, conn);
            this.createOutgoingPage(projId,  db, conn);
            
            byte[] result = PDFCreator.transform(db.getDocument());
            rsp.setContentLength(result.length);
            rsp.setContentType("application/pdf");
            rsp.setStatus(200);
            rsp.getOutputStream().write(result);
        }
        finally
        {
            DBUtils.closeQuitly(conn);
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
            stmt = conn.prepareStatement("select * from projects where id=?");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();
            rs.next();
            DocPart part = db.duplicateSection("HEADER");
            part.replaceTag("$PROJ_NAME$", rs.getString("name"));
            part.replaceTag("$NOW$", new Date(System.currentTimeMillis()));
            part.replaceTag("$PROJ_FROM$", rs.getDate("from"));
            part.replaceTag("$PROJ_UNTIL$", rs.getDate("until"));
            part.replaceTag("$DESCRIPTION$", rs.getString("description"));
            part.commit();
            db.removeSection("HEADER");
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
     * @return
     * @throws SQLException
     */
    private double createPlanningPage(int projId, DocBuilder db, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select i.konto, i.name, p.amount from planning_items p left join invoice_items i on p.item_ref=i.id where proj_ref=? order by i.konto, i.name");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();
            double total = 0.0D;

            DocPart part;
            while (rs.next())
            {
                part = db.duplicateSection("PLANNING_ROW");
                part.replaceTag("$PLANNING_ACCOUNT$", rs.getInt("konto"));
                part.replaceTag("$PLANNING_NAME$", rs.getString("name"));
                double amount = rs.getDouble("amount");
                part.replaceTag("$PLANNING_AMOUNT$", this.currencyFmt.format(amount));
                total += amount;
                part.commit();
            }

            db.removeSection("PLANNING_ROW");
            part = db.duplicateSection("PLANNING_FOOTER");
            part.replaceTag("$PLANNING_TOTAL$", this.currencyFmt.format(total));
            part.commit();
            db.removeSection("PLANNING_FOOTER");

            return total;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param planned
     * @param db
     * @param conn
     * @throws SQLException
     */
    private void createPaymentPage(int projId, double planned, DocBuilder db, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            double remaining = planned;
            int projItemId = this.getProjectItemId(projId, conn);
            if (projItemId != -1)
            {
                stmt = conn.prepareStatement(
                    "select r.amount, i.konto, i.name from invoice_items i left join invoice_records r on r.from_invoice=i.id where r.to_invoice=?;");
                stmt.setInt(1, projItemId);
                rs = stmt.executeQuery();

                while (rs.next())
                {
                    DocPart part1 = db.duplicateSection("PAYMENT_ROW");
                    part1.replaceTag("$PAYMENT_ACCOUNT$", rs.getInt("i.konto"));
                    part1.replaceTag("$PAYMENT_NAME$", rs.getString("i.name"));
                    double amount = rs.getDouble("r.amount");
                    part1.replaceTag("$PAYMENT_AMOUNT$", this.currencyFmt.format(amount));
                    remaining -= amount;
                    part1.commit();
                }
            }

            db.removeSection("PAYMENT_ROW");
            DocPart part2 = db.duplicateSection("PAYMENT_FOOTER");
            part2.replaceTag("$PAYMENT_TOTAL$", this.currencyFmt.format(remaining));
            part2.commit();
            db.removeSection("PAYMENT_FOOTER");
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
    private void createOutgoingPage(int projId, DocBuilder db, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            double total = 0.0f;
            int projItemId = this.getProjectItemId(projId, conn);
            if (projItemId != -1)
            {
                stmt = conn.prepareStatement(
                    "select r.amount, i.konto, i.name from invoice_items i left join invoice_records r on r.to_invoice=i.id where r.from_invoice=?;");
                stmt.setInt(1, projItemId);
                rs = stmt.executeQuery();

                while (rs.next())
                {
                    DocPart part1 = db.duplicateSection("OUTGOING_ROW");
                    part1.replaceTag("$OUTGOING_ACCOUNT$", rs.getInt("i.konto"));
                    part1.replaceTag("$OUTGOING_NAME$", rs.getString("i.name"));
                    double amount = rs.getDouble("r.amount");
                    part1.replaceTag("$OUTGOING_AMOUNT$", this.currencyFmt.format(amount));
                    total += amount;
                    part1.commit();
                }
            }

            db.removeSection("OUTGOING_ROW");
            DocPart part2 = db.duplicateSection("OUTGOING_FOOTER");
            part2.replaceTag("$OUTGOING_TOTAL$", this.currencyFmt.format(total));
            part2.commit();
            db.removeSection("OUTGOING_FOOTER");
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
     * @return -1, wenn kein solches Item gefunden wurde
     * @throws SQLException
     */
    private int getProjectItemId(int projId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            int id = -1;
            stmt = conn.prepareStatement("select id from invoice_items where ref_id=? and type=\'PLANNING\'");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                id = rs.getInt("id");
            }
            return id;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
}