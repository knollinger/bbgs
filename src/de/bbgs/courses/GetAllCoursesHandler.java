package de.bbgs.courses;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

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
 * Ein {@link IXmlServiceHandler}, welcher die die Namen, Beschreibungen und 
 * Ids aller Kurse liefert.
 *
 */
public class GetAllCoursesHandler implements IXmlServiceHandler
{
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    @Override
    public boolean needsSession()
    {
        return false;
    }


    /**
     * dispatcher, welcher anhand des Request-Types auf die spezialisierten
     * Methoden verzweigt und aus dem ganzen Theater dann eine Antwort generiert.
     * 
     * @param request
     * @param session
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Request req = (Request) request;

        IJAXBObject result = null;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            conn = ConnectionPool.getConnection();
            switch (req.mode)
            {
                case ALL :
                    stmt = this.getAllCoursesStmt(conn);
                    break;

                case FROM_UNTIL :
                    stmt = this.getCoursesFromUntilStmt(req.from, req.until, conn);
                    break;

                case KEYWORDS :
                    stmt = this.getCoursesByKeyWordsStmt(req.keywords, conn);
                    break;

                case MEMBER :
                    stmt = this.getCoursesByMembersStmt(req.memberId, conn);
                    break;

            }
            
            rs = stmt.executeQuery();
            result = this.createRspFromResultSet(rs);
        }
        catch (SQLException e)
        {
            result = new ErrorResponse(e.getMessage());
        }

        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);

        }
        return result;
    }

    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    private PreparedStatement getAllCoursesStmt(Connection conn) throws SQLException
    {
        return conn.prepareStatement("select id, name, description, color_id, type from courses order by name");
    }

    /**
     * @param from
     * @param until
     * @param conn
     * @return
     * @throws SQLException
     */
    private PreparedStatement getCoursesFromUntilStmt(String from, String until, Connection conn) throws SQLException
    {
        PreparedStatement stmt = conn.prepareStatement("select * from courses where id in(select distinct ref_id from course_termins where date between ? AND ?)");
        DBUtils.setDate(stmt, 1, from);
        DBUtils.setDate(stmt, 2, until);
        return stmt;
    }

    /**
     * @param keywords
     * @param conn
     * @return
     * @throws SQLException
     */
    private PreparedStatement getCoursesByKeyWordsStmt(String keywords, Connection conn) throws SQLException
    {
        String qry = String.format("%%%1$s%%", keywords);
        PreparedStatement stmt = conn.prepareStatement("select * from courses where name like ? or description like ?");
        stmt.setString(1, qry);
        stmt.setString(2, qry);
        return stmt;
    }

    /**
     * @param memberId
     * @param conn
     * @return
     * @throws SQLException
     */
    private PreparedStatement getCoursesByMembersStmt(int memberId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = conn.prepareStatement("select * from courses where id in (select distinct course_id from course_member where member_id =?)");
        stmt.setInt(1, memberId);
        return stmt;
    }

    /**
     * Erzeuge die Antwort aus einem ResultSet
     * @param rs
     * @return
     * @throws SQLException
     */
    private Response createRspFromResultSet(ResultSet rs) throws SQLException
    {

        Response response = new Response();
        while (rs != null && rs.next())
        {
            Course course = new Course();
            course.id = rs.getInt("id");
            course.name = rs.getString("name");
            course.description = rs.getString("description");
            course.color = rs.getInt("color_id");
            course.type = ECourseType.valueOf(rs.getString("type"));
            response.courses.add(course);
        }
        return response;
    }

    public enum Mode
    {
        ALL, FROM_UNTIL, KEYWORDS, MEMBER
    }

    @XmlRootElement(name = "get-all-courses-request")
    @XmlType(name="GetAllCoursesHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "mode")
        public Mode mode;

        @XmlElement(name = "from")
        public String from = "";

        @XmlElement(name = "until")
        public String until;

        @XmlElement(name = "keywords")
        public String keywords;

        @XmlElement(name = "member-id")
        public int memberId;
    }

    @XmlRootElement(name = "get-all-courses-ok-response")
    @XmlType(name="GetAllCoursesHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "course")
        @XmlElementWrapper(name = "courses")
        public List<Course> courses = new ArrayList<Course>();
    }
}
