package de.bbgs.accounting;

import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.pdf.DocBuilder;
import de.bbgs.pdf.DocBuilder.DocPart;
import de.bbgs.pdf.PDFCreator;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.utils.ProjectYearUtils;

/**
 * @author anderl
 *
 */
public class PrintIncommingsHandler implements IGetDocServiceHandler
{
    private SimpleDateFormat dateFmt = new SimpleDateFormat("dd.MM.yyyy");

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "incommings_overview.pdf";
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

        try
        {
            conn = ConnectionPool.getConnection();
            Date[] fromUntil = this.extractProjYearFromRequest(req);
            Collection<InvoiceRecord> records = null;
            if (fromUntil.length == 0)
            {
                records = AccountingDBUtils.getAllIncommingRecords(conn);
            }
            else
            {
                records = AccountingDBUtils.getAllIncommingRecordsBetween(fromUntil[0], fromUntil[1], conn);
            }

            Map<Integer, String> items = this.getAllInvoiceItems(conn);

            DocBuilder doc = new DocBuilder(this.getClass().getResourceAsStream("incommings_overview.adoc"));
            this.createTitlePage(doc, fromUntil);
            this.fillRecords(doc, records, items);
            byte[] pdf = PDFCreator.transform(doc.getDocument());

            rsp.setContentLength(pdf.length);
            rsp.setContentType("application/pdf");
            rsp.getOutputStream().write(pdf);
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     * 
     * @param db
     * @param fromUntil
     */
    private void createTitlePage(DocBuilder db, Date[] fromUntil)
    {

        DocPart part = db.duplicateSection("TITLE_PAGE");
        if (fromUntil.length == 0)
        {
            part.replaceTag("$FROM-UNTIL$", "Gesamter Zeitraum");
        }
        else
        {
            String date = this.dateFmt.format(fromUntil[0]);
            date += " - ";
            date += this.dateFmt.format(fromUntil[1]);
            part.replaceTag("$FROM-UNTIL$", date);
        }

        part.replaceTag("$TODAY$", this.dateFmt.format(new Date(System.currentTimeMillis())));

        part.commit();
        db.removeSection("TITLE_PAGE");
    }

    /**
     * @param records
     * @param items 
     * @return
     * @throws IOException
     */
    private void fillRecords(DocBuilder doc, Collection<InvoiceRecord> records, Map<Integer, String> items) throws IOException
    {
        double total = 0.0f;
        for (InvoiceRecord invoiceRecord : records)
        {
            DocPart part = doc.duplicateSection("ROW");
            part.replaceTag("$KTO$", items.get(invoiceRecord.target));
            part.replaceTag("$AMOUNT$", invoiceRecord.amount);
            part.replaceTag("$DATE$", invoiceRecord.date);
            part.replaceTag("$DESC$", invoiceRecord.description);
            part.commit();
            total += invoiceRecord.amount;
        }
        doc.removeSection("ROW");

        DocPart part = doc.duplicateSection("TOTAL");
        part.replaceTag("$AMOUNT$", total);
        part.commit();
        doc.removeSection("TOTAL");
    }

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    private Map<Integer, String> getAllInvoiceItems(Connection conn) throws SQLException
    {
        Map<Integer, String> result = new HashMap<>();
        
        Collection<InvoiceItem> items = AccountingDBUtils.getAllIncommingItems(conn);
        for (InvoiceItem invoiceItem : items)
        {
            result.put(Integer.valueOf(invoiceItem.id), invoiceItem.name);
        }
        return result;
    }
    
    /**
     * @param req
     * @return ein leeres Array, wenn kein Projektjahr angegeben wurde, 
     *         anderen falls das Array mit dem Start-Datum an Position 0 
     *         und dem EndDatum an Position 1
     */
    private Date[] extractProjYearFromRequest(HttpServletRequest req)
    {
        Date[] fromUntil = {};

        String param = req.getParameter("proj-year");
        if (param != null)
        {
            int projYear = Integer.parseInt(param);
            fromUntil = new Date[2];
            fromUntil[0] = ProjectYearUtils.getStartOfProjectYear(projYear);
            fromUntil[1] = ProjectYearUtils.getEndOfProjectYear(projYear);
        }
        return fromUntil;
    }
}
