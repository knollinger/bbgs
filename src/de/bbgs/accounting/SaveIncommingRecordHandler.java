package de.bbgs.accounting;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * 
 */
public class SaveIncommingRecordHandler implements IXmlServiceHandler
{

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return InvoiceRecordsModel.class;
    }

    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(InvoiceRecordsModel.class);
        result.add(Response.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject rsp = null;
        Connection conn = null;

        try
        {
            InvoiceRecordsModel mdl = (InvoiceRecordsModel) request;
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);
            AccountingDBUtils.handleInvoiceRecordsChanges(mdl.records,  conn);
            conn.commit();
            rsp = new Response();
        }
        catch (SQLException e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return rsp;
    }

    @XmlRootElement(name = "save-invoice-record-ok-rsp")
    @XmlType(name = "SaveInvoiceRecordHandler.Response")
    public static class Response implements IJAXBObject
    {
    }

}
