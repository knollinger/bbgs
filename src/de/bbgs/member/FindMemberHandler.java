package de.bbgs.member;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.logging.AuditLog;
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
public class FindMemberHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
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
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject result = null;
        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();
            Request req = (Request) request;
            Response rsp = new Response();
            if (req.allMembers)
            {
                AuditLog.logQuery(this, session, conn, "GET_ALL_MEMBERS");
                rsp.members.addAll(this.transform(MemberDBUtil.getAllMembers(conn)));
            }
            else
            {
                AuditLog.logQuery(this, session, conn, "GET_MEMBERS_BY_QUERY", req.query);
                rsp.members.addAll(MemberDBUtil.performFulltextSearch(req.query, conn));
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

    /**
     * @param allMembers
     * @return
     */
    private Collection<? extends FoundMember> transform(List<Member> allMembers)
    {
        Collection<FoundMember> result = new ArrayList<>(allMembers.size());
        for (Member member : allMembers)
        {
            FoundMember m = new FoundMember();
            m.id = member.id;
            m.memberType = member.memberType;
            m.zname = member.zname;
            m.vname = member.vname;
            m.zipCode = member.zipCode;
            m.city = member.city;
            m.street = member.street;
            result.add(m);
        }
        return result;
    }

    @XmlRootElement(name = "member-finder-req")
    @XmlType(name = "FindMemberHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "show-all")
        public boolean allMembers = false;

        @XmlElement(name = "query")
        public String query = "";
    }

    @XmlRootElement(name = "member-finder-ok-rsp")
    @XmlType(name = "FindMemberHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElementWrapper(name = "members")
        @XmlElement(name = "member")
        public List<FoundMember> members = new ArrayList<>();
    }
}
