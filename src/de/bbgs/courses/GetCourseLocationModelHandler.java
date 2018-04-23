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
 * 
 */
public class GetCourseLocationModelHandler implements IXmlServiceHandler
{
    /**
     * 
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /**
     * 
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
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Location.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject result = null;
        Connection conn = null;

        try
        {
            Request req = (Request)request;
            conn = ConnectionPool.getConnection();
            return CourseDBUtil.getCourseLocation(req.id, conn);
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
     * 
     */
    @XmlRootElement(name = "get-course-locationmodel-req")
    @XmlType(name = "GetCourseLocationModelHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name="id")
        public int id = 0;
    }
}
