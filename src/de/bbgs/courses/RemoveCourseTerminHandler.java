package de.bbgs.courses;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * Der Handler, um einen Kurs mit all seinen Terminen zu löschen
 *
 */
public class RemoveCourseTerminHandler implements IXmlServiceHandler
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
        try
        {
            conn = ConnectionPool.getConnection();
            Request req = (Request)request;
            CourseDBUtil.removeTermin(req.id, conn);
            rsp = new Response();
        }
        catch (SQLException e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally {
            DBUtils.closeQuitly(conn);
        }
        return rsp;
    }

    @XmlRootElement(name = "remove-course-termin-request")
    @XmlType(name = "RemoveCourseTerminHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "id")
        public int id;
    }

    @XmlRootElement(name = "remove-course-termin-ok-response")
    @XmlType(name = "RemoveCourseTerminHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
