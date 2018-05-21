package de.bbgs.courses;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.named_colors.NamedColor;
import de.bbgs.named_colors.NamedColorsDBUtil;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * Ein {@link IXmlServiceHandler}, welcher die die Namen, Beschreibungen und Ids
 * aller Kurse liefert.
 *
 */
public class GetAllCoursesHandler implements IXmlServiceHandler {
	@Override
	public Class<? extends IJAXBObject> getResponsibleFor() {
		return Request.class;
	}

	@Override
	public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses() {
		Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
		result.add(Request.class);
		result.add(Response.class);
		return result;
	}

	@Override
	public boolean needsSession() {
		return false;
	}

	/**
	 * dispatcher, welcher anhand des Request-Types auf die spezialisierten Methoden
	 * verzweigt und aus dem ganzen Theater dann eine Antwort generiert.
	 * 
	 * @param request
	 * @param session
	 */
	@Override
	public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session) {

		IJAXBObject result = null;
		Connection conn = null;

		try {
			conn = ConnectionPool.getConnection();
			
			Response rsp = new Response();
			rsp.courses = CourseDBUtil.getAllCourses(conn);
			result = rsp;

		} catch (SQLException e) {
			result = new ErrorResponse(e.getMessage());
		}

		finally {
			DBUtils.closeQuitly(conn);

		}
		return result;
	}

	@XmlRootElement(name = "get-all-courses-request")
	@XmlType(name = "GetAllCoursesHandler.Request")
	public static class Request implements IJAXBObject {
	}

	@XmlRootElement(name = "get-all-courses-ok-response")
	@XmlType(name = "GetAllCoursesHandler.Response")
	public static class Response implements IJAXBObject {

		@XmlElement(name = "course")
		@XmlElementWrapper(name = "courses")
		public List<Course> courses = new ArrayList<>();
	}
}
