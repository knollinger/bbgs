package de.bbgs.accounting;

import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.text.NumberFormat;
import java.util.Collection;
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
 * @author anderl
 *
 */
public class PrintInvoiceItemsOverviewHandler implements IGetDocServiceHandler
{
    private NumberFormat currencyFmt;

    /**
     * 
     */
    public PrintInvoiceItemsOverviewHandler()
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
        return "invoice_items_overview.pdf";
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
        Connection conn = null;

        try
        {
            conn = ConnectionPool.getConnection();
            DocBuilder db = new DocBuilder(this.getClass().getResourceAsStream("invoice_items_overview.adoc"));
            this.createTitlePage(db);
            this.createOverview(db, conn);

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
     * @param db
     */
    private void createTitlePage(DocBuilder db)
    {
        DocPart part = db.duplicateSection("HEADER");
        part.replaceTag("$NOW$", new Date(System.currentTimeMillis()));
        part.commit();
        db.removeSection("HEADER");
    }

    /**
     * @param db
     * @param conn
     * @throws SQLException 
     */
    private void createOverview(DocBuilder db, Connection conn) throws SQLException
    {
        double total = 0.0f;
        Collection<InvoiceItem> invoiceItems = AccountingDBUtils.getAllInvoiceItemsByType(EInvoiceItemType.INCOME,
            conn);
        for (InvoiceItem invoiceItem : invoiceItems)
        {
            int konto = invoiceItem.kontoNr;
            String name = invoiceItem.name;
            double amount = AccountingDBUtils.getItemAmount(invoiceItem.id, conn);
            total += amount;

            DocPart part = db.duplicateSection("ROW");
            part.replaceTag("$KONTO$", String.format("%1$04d", konto));
            part.replaceTag("$NAME$", name);
            part.replaceTag("$AMOUNT$", currencyFmt.format(amount));
            part.commit();
        }
        db.removeSection("ROW");
        DocPart part = db.duplicateSection("FOOTER");
        part.replaceTag("$TOTAL$", currencyFmt.format(total));
        part.commit();
        db.removeSection("FOOTER");
    }
}