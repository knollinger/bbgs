package de.bbgs.accounting;

import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.GregorianCalendar;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.pdf.DocBuilder;
import de.bbgs.pdf.DocBuilder.DocPart;
import de.bbgs.pdf.PDFCreator;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;

/**
 *
 */
public class GetInvoiceRecordsDocumentHandler implements IGetDocServiceHandler
{
    private static final SimpleDateFormat DATE_FMT = new SimpleDateFormat("dd.MM.yyyy");
    
    // @formatter:off
    private static final String SQL = "select r.amount, r.description, r.date, u.accountName, i.konto, i.name from invoice_records r\n"
        + "left join user_accounts u on r.user_ref = u.id\n"
        + "left join invoice_items i on i.id = r.to_invoice\n"
        + "where r.date between ? and ?\n"
        + "order by r.date";
    // @formatter:on
    private NumberFormat currencyFmt = NumberFormat.getNumberInstance(Locale.GERMANY);

    /**
     * 
     */
    public GetInvoiceRecordsDocumentHandler()
    {
        this.currencyFmt = NumberFormat.getNumberInstance(Locale.GERMANY);
        this.currencyFmt.setMinimumFractionDigits(2);
        this.currencyFmt.setMaximumFractionDigits(2);
        this.currencyFmt.setGroupingUsed(true);
        this.currencyFmt.setRoundingMode(RoundingMode.HALF_EVEN);
    }
    
    @Override
    public String getResponsibleFor()
    {
        return "invoice_records_overview.pdf";
    }

    @Override
    public boolean needsSession()
    {
        return true;
    }

    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {

        int year = Integer.parseInt(req.getParameter("year"));
        try
        {

            DocBuilder db = new DocBuilder(this.getClass().getResourceAsStream("invoice_records_overview.adoc"));
            this.fillDocHeader(db, year);
            this.fillInvoiceRecords(db, year);

            byte[] result = PDFCreator.transform(db.getDocument());
            rsp.setContentLength(result.length);
            rsp.setContentType("application/pdf");
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.getOutputStream().write(result);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    /**
     * @param db
     * @param year
     */
    private void fillDocHeader(DocBuilder db, int year)
    {
        DocPart part = db.duplicateSection("HEADER");
        part.replaceTag("$YEAR$", Integer.toString(year));
        part.replaceTag("$NOW$", DATE_FMT.format(new Date(System.currentTimeMillis())));
        part.commit();
        db.removeSection("HEADER");
    }


    /**
     * @param db
     * @param year
     */
    private void fillInvoiceRecords(DocBuilder db, int year)
    {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Date begin = new Date(new GregorianCalendar(year, 0, 1).getTimeInMillis());
            Date end = new Date(new GregorianCalendar(year, 11, 31).getTimeInMillis());
            double total = 0.0f;

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement(GetInvoiceRecordsDocumentHandler.SQL);
            stmt.setDate(1, begin);
            stmt.setDate(2, end);
            rs = stmt.executeQuery();

            DocPart p;
            while (rs.next())
            {
                double amount = rs.getDouble("r.amount");
                total += amount;

                p = db.duplicateSection("ROW");
                p.replaceTag("$AMOUNT$", this.currencyFmt.format(amount));
                p.replaceTag("$INVOICE_ITEM_KTO$", rs.getInt("i.konto"));
                p.replaceTag("$INVOICE_ITEM_NAME$", rs.getString("i.name"));
                p.replaceTag("$DATE$", rs.getDate("r.date"));
                p.replaceTag("$USER$", rs.getString("u.accountName"));
                p.replaceTag("$DESCRIPTION$", rs.getString("r.description"));
                p.commit();
            }
            db.removeSection("ROW");

            p = db.duplicateSection("FOOTER");
            p.replaceTag("$TOTAL$", this.currencyFmt.format(total));
            p.commit();
            db.removeSection("FOOTER");

        }
        catch (SQLException e)
        {
            e.printStackTrace();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
    }
}
