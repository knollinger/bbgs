package de.bbgs.mail;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.member.EMemberType;
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
public class GetAdressbookHandler implements IXmlServiceHandler
{

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

        try
        {
            conn = ConnectionPool.getConnection();

            Response response = new Response();
            response.members = MailDBUtils.getAllMembers(conn);
            response.types = this.fillMemberTypes();
            response.courses = MailDBUtils.getAllCourses(conn);
            response.partners = MailDBUtils.getAllPartners(conn);            
            response.custom = MailDBUtils.getAllCustomGroups(conn);
            rsp = response;
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
     * @return
     */
    private List<EMemberType> fillMemberTypes()
    {
        List<EMemberType> result = new ArrayList<>();

        for (EMemberType type : EMemberType.values())
        {
            if (type != EMemberType.UNKNOWN)
            {
                result.add(type);
            }
        }
        return result;
    }

    @XmlRootElement(name = "get-adressbook-request")
    public static class Request implements IJAXBObject
    {

    }

    @XmlRootElement(name = "get-adressbook-ok-response")
    @XmlType(name = "GetAdressbookHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "member")
        @XmlElementWrapper(name = "members")
        List<MailMember> members = new ArrayList<>();

        @XmlElement(name = "member-type")
        @XmlElementWrapper(name = "member-types")
        List<EMemberType> types = new ArrayList<>();

        @XmlElement(name = "course")
        @XmlElementWrapper(name = "courses")
        List<MailCourse> courses = new ArrayList<>();

        @XmlElement(name = "partner")
        @XmlElementWrapper(name = "partners")
        List<MailPartner> partners = new ArrayList<>();

        @XmlElement(name = "custom-group")
        @XmlElementWrapper(name = "custom-groups")
        List<CustomMailGroup> custom = new ArrayList<>();
    }

}
