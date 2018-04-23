package de.bbgs.session;

import java.sql.Connection;
import java.sql.PreparedStatement;
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

/**
 * Verarbeitet die Requests zum Kennwort-Wechsel
 *
 */
public class ChangePasswordHandler implements IXmlServiceHandler
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
        PreparedStatement stmt = null;
        try
        {
            Request req = (Request) request;
            conn = ConnectionPool.getConnection();

            String oldPwd = PasswordUtil.hashPassword(req.oldPwd);
            String newPwd = PasswordUtil.hashPassword(req.newPwd);

            stmt = conn.prepareStatement("update user_accounts set pwdhash=? where id=? and pwdhash=?");
            stmt.setString(1, newPwd);
            stmt.setInt(2, session.getAccountId());
            stmt.setString(3, oldPwd);
            if (stmt.executeUpdate() == 0)
            {
                result = new ErrorResponse("Das alte Kennwort ist falsch");
            }
            else
            {
                result = new Response();
            }
        }
        catch (Exception e)
        {
            result = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
        return result;
    }

    @XmlRootElement(name = "change-password-req")
    @XmlType(name = "ChangePasswordHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "old-pwd")
        public String oldPwd;

        @XmlElement(name = "new-pwd")
        public String newPwd;
    }

    @XmlRootElement(name = "change-password-ok-rsp")
    @XmlType(name = "ChangePasswordHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
