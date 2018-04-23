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
 * @author anderl
 *
 */
public class GetInvoiceItemModelHandler implements IXmlServiceHandler
{

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#needsSession()
     */
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getResponsibleFor()
     */
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        ArrayList<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(InvoiceItemModel.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#handleRequest(de.bbgs.xml.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Object rsp = null;
        Connection conn = null;

        try
        {
            conn = ConnectionPool.getConnection();
            InvoiceItemModel e = new InvoiceItemModel();
            e.items.addAll(AccountingDBUtils.getAllInvoiceItems(conn));
            rsp = e;
        }
        catch (SQLException e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }

        return (IJAXBObject) rsp;
    }

    @XmlRootElement(name = "get-invoice-item-model-req")
    @XmlType(name = "GetInvoiceItemModelHandler.Request")
    public static class Request implements IJAXBObject
    {

    }
}