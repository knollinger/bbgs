package de.bbgs.member;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

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
 * @author anderl
 *
 */
public class SearchMemberHandler implements IXmlServiceHandler
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
        IJAXBObject rsp = null;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Response response = new Response();
            Request req = (Request) request;
            conn = ConnectionPool.getConnection();
            
            stmt = conn.prepareStatement("select * from members where zname like ? and vname like ? order by zname, vname");
            stmt.setString(1, req.zname == null ? "" : "%" + req.zname + "%");
            stmt.setString(2, req.vname == null ? "" : "%" + req.vname + "%");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                response.found.add(MemberDBUtil.personFromResultSet(rs));
            }
            rsp = response;

        }
        catch (SQLException e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
        return rsp;
    }

    @XmlRootElement(name = "search-member-req")
    @XmlType(name = "SearchMemberHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "zname")
        public String zname;

        @XmlElement(name = "vname")
        public String vname;
    }

    @XmlRootElement(name = "search-member-ok-rsp")
    @XmlType(name = "SearchMemberHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElementWrapper(name = "members")
        @XmlElement(name = "member")
        public Collection<Member> found = new ArrayList<>();
    }
}
