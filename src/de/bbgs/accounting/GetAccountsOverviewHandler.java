package de.bbgs.accounting;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * Liefert eine Übersicht über alle Konten incl Salden
 *
 */
public class GetAccountsOverviewHandler implements IXmlServiceHandler
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
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#handleRequest(de.bbgs.xml.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject result = null;
        Connection conn = null;

        try
        {
            Response rsp = new Response();
            
            conn = ConnectionPool.getConnection();
            Collection<InvoiceItem> invoiceItems = AccountingDBUtils.getAllInvoiceItemsByType(EInvoiceItemType.INCOME, conn);
            for (InvoiceItem invoiceItem : invoiceItems)
            {
                Item i = new Item();
                i.konto = invoiceItem.kontoNr;
                i.name = invoiceItem.name;
                i.amount = AccountingDBUtils.getItemAmount(invoiceItem.id, conn);
                rsp.items.add(i);
                rsp.total += i.amount;
            }
            result = rsp;
        }
        catch (SQLException e)
        {
            result = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return result;
    }

    @XmlRootElement(name = "get-accounts-overview-req")
    @XmlType(name = "GetAccountsOverviewHandler.Request")
    public static class Request implements IJAXBObject
    {
    }

    public static class Item
    {
        @XmlElement(name = "konto")
        public int konto;
        
        @XmlElement(name = "name")
        public String name;
        
        @XmlElement(name = "amount")
        public double amount;
    }
    
    @XmlRootElement(name = "get-accounts-overview-ok-rsp")
    @XmlType(name = "GetAccountsOverviewHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name="total")
        public double total = 0.0f;
        
        @XmlElement(name="item")
        @XmlElementWrapper(name="items")
        public List<Item> items = new ArrayList<>();
    }
}
