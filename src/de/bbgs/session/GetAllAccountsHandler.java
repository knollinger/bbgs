package de.bbgs.session;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

public class GetAllAccountsHandler implements IXmlServiceHandler
{

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> classes = new ArrayList<Class<? extends IJAXBObject>>();
        classes.add(Request.class);
        classes.add(Response.class);
        return classes;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#handleRequest(de.bbgs.io.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject rsp = null;
        Connection conn = null;

        try
        {
            conn = ConnectionPool.getConnection();
            Response result = new Response();
            result.accounts.addAll(AccountDBUtil.getAllAccounts(conn));
            rsp = result;
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

    /**
     * 
     */
    @XmlRootElement(name = "get-login-accounts-request")
    @XmlType(name = "get-login-accounts-request")
    public static class Request implements IJAXBObject
    {

    }

    @XmlRootElement(name = "get-login-accounts-ok-response")
    @XmlType(name = "get-login-accounts-ok-response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "account")
        Collection<AccountInfo> accounts = new ArrayList<AccountInfo>();
    }
}
