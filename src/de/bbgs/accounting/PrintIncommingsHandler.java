package de.bbgs.accounting;

import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.util.Collection;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.pdf.DocBuilder;
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
            
            DocBuilder b = this.createDocument(records);
            byte[] pdf = PDFCreator.transform(b.getDocument());
            
            rsp.setContentLength(pdf.length);
            rsp.setContentType("application/pdf");
            rsp.getOutputStream().write(pdf);
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
    }

    private DocBuilder createDocument(Collection<InvoiceRecord> records) throws IOException
    {
        DocBuilder doc = new DocBuilder(this.getClass().getResourceAsStream("incommings_overview.adoc"));
        
        
        return doc;
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
