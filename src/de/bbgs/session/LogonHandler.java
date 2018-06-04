package de.bbgs.session;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.member.Member;
import de.bbgs.member.MemberDBUtil;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * 
 *
 */
public class LogonHandler implements IXmlServiceHandler
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
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#handleRequest(de.bbgs.io.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Connection conn = null;
        IJAXBObject result = null;
        
        try
        {
            conn = ConnectionPool.getConnection();
            Request req = (Request)request;
            
            String uid = req.uid;
            String pwd = req.passwd;
            int memberId = this.verifyUser(uid, pwd, session, conn);
            if (memberId == -1)
            {
                result = new ErrorResponse("Die Benutzer-Kennung und/oder das Kennwort sind nicht korrekt");
            }
            else
            {
                Member m = MemberDBUtil.getMember(memberId, conn);
                session.setAccountId(memberId);
                session.setAccountName(uid);
                session.setEmail(m.email);
                session.setMailSignature(m.mailsig, m.mailsigMimetype);
                result = new Response();
            }            
        }
        catch (Exception e)
        {
            new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return result;
    }

    /**
     * 
     * @param uid
     * @param pwd
     * @param session
     * @param conn
     * @return
     * @throws Exception
     */
    private int verifyUser(String uid, String pwd, SessionWrapper session, Connection conn) throws Exception
    {
        int memberId = -1;

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select id from user_accounts where accountName = ? and pwdhash = ?");
            stmt.setString(1, uid);
            stmt.setString(2, PasswordUtil.hashPassword(pwd));
            rs = stmt.executeQuery();
            if (rs.next())
            {
                memberId = rs.getInt("id");
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return memberId;
    }

    /**
     * 
     */
    @XmlRootElement(name = "login-user-request")
    @XmlType(name = "LogonHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "uid")
        public String uid;

        @XmlElement(name = "passwd")
        public String passwd;
    }

    @XmlRootElement(name = "login-user-ok-response")
    @XmlType(name = "LogonHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
