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

import de.bbgs.member.EMemberType;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * 
 */
public class GetCourseCalendarHandler implements IXmlServiceHandler
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

    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject result = null;

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Request req = (Request) request;

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select t.id, t.ref_id, t.date, t.start, t.end, c.name, nc.color, nc.name, l.name from course_termins t left join courses c on t.ref_id = c.id left join named_colors nc on c.color_id = nc.id left join course_locations l on l.id = t.location_id where t.date between ? and ? order by t.date, t.start;");
            DBUtils.setDate(stmt, 1, req.from);
            DBUtils.setDate(stmt, 2, req.until);
            rs = stmt.executeQuery();
            
            Response rsp = new Response();
            while (rs.next())
            {
                CalEntry entry = new CalEntry();
                int terminId = rs.getInt("t.id");
                entry.terminId = terminId;
                entry.courseId = rs.getInt("t.ref_id");
                entry.date = DBUtils.getDate(rs, "t.date");
                entry.startTime = DBUtils.getTime(rs, "t.start");
                entry.endTime = DBUtils.getTime(rs, "t.end");
                entry.name = rs.getString("c.name");
                entry.color = rs.getString("nc.color");
                entry.category = rs.getString("nc.name");
                entry.location = rs.getString("l.name");
                entry.teachers = this.fillTeachers(terminId, conn);
                rsp.entries.add(entry);
            }
            result = rsp;
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
     * 
     * @param terminId
     * @param conn
     * @return
     * @throws SQLException
     */
    private List<String> fillTeachers(int terminId, Connection conn) throws SQLException {
     
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            List<String> result = new ArrayList<String>();
            
            String sql = " select zname, vname from members where id in \n" + 
                "    (\n" + 
                "        select member_id from course_member where course_id in\n" + 
                "        (\n" + 
                "            select ref_id from course_termins where id = ?\n" + 
                "        ) \n" + 
                "        and (type=? or type=?)\n" + 
                "    )";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, terminId);
            stmt.setString(2, EMemberType.TEACHER.name());
            stmt.setString(3, EMemberType.FEST.name());
            rs = stmt.executeQuery();
            while(rs.next()) {
                
                String name = String.format("%1$S.%2$s", rs.getString("vname").charAt(0), rs.getString("zname"));
                result.add(name);
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
  }
    /**
     * 
     */
    @XmlRootElement(name = "get-course-termins-between-req")
    @XmlType(name = "GetCourseCalendarHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "from")
        public String from = "";

        @XmlElement(name = "until")
        public String until = "";
    }

    public static class CalEntry
    {
        @XmlElement(name = "id")
        public int terminId;

        @XmlElement(name = "course-id")
        public int courseId;

        @XmlElement(name = "name")
        public String name;

        @XmlElement(name = "color")
        public String color;

        @XmlElement(name = "category")
        public String category;

        @XmlElement(name = "date")
        public String date = "";


        @XmlElement(name = "begin")
        public String startTime;

        @XmlElement(name = "end")
        public String endTime;
        
        @XmlElement(name="location")
        public String location;

        @XmlElement(name="teacher")
        @XmlElementWrapper(name="teachers")
        public List<String> teachers = new ArrayList<String>();
    }

    @XmlRootElement(name = "get-course-termins-between-rsp")
    @XmlType(name = "GetCourseCalendarHandler.Response")
    public static class Response implements IJAXBObject
    {

        @XmlElement(name = "cal-entry")
        @XmlElementWrapper(name = "cal-entries")
        public Collection<CalEntry> entries = new ArrayList<CalEntry>();
    }
}
