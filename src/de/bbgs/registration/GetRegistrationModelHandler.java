package de.bbgs.registration;

import java.sql.Connection;
import java.sql.Date;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.contacts.Contact;
import de.bbgs.courses.ECourseType;
import de.bbgs.member.Member;
import de.bbgs.notes.Note;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * 
 * @author anderl
 *
 */
public class GetRegistrationModelHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
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
            conn = ConnectionPool.getConnection();
            Response rsp = new Response();
            rsp.partners = RegistrationDBUtil.getPartners(conn);
            rsp.courses = RegistrationDBUtil.getCoursesCommingSoon(conn);
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

    @XmlRootElement(name = "get-registration-model-req")
    @XmlType(name = "GetRegistrationModelHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    /**
    *
    */
    public static class CourseDesc
    {
        @XmlElement(name = "id")
        public int id = -1;

        @XmlElement(name = "name")
        public String name = "";

        @XmlElement(name = "description")
        public String description = "";

        @XmlElement(name = "type")
        public ECourseType type = ECourseType.NONE;
        
        @XmlElement(name="from")
        public Date from;

        @XmlElement(name="until")
        public Date until;
    }

    public static class PartnerDesc
    {
        @XmlElement(name = "id")
        public int id = -1;

        @XmlElement(name = "name")
        public String name = "";
    }

    @XmlRootElement(name = "get-registration-model-ok-rsp")
    @XmlType(name = "GetRegistrationModelHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "core-data")
        public Member member = new Member();

        @XmlElement(name = "course")
        @XmlElementWrapper(name = "courses")
        public Collection<CourseDesc> courses = new ArrayList<>();

        @XmlElement(name = "partner")
        @XmlElementWrapper(name = "partners")
        public Collection<PartnerDesc> partners = new ArrayList<>();

        @XmlElement(name = "contact")
        @XmlElementWrapper(name = "contacts")
        public Collection<Contact> contacts = new ArrayList<>();

        @XmlElement(name = "note")
        @XmlElementWrapper(name = "notes")
        public Collection<Note> notes = new ArrayList<>();
    }
}
