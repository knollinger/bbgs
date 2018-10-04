package de.bbgs.registration;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.courses.ECourseType;
import de.bbgs.registration.GetRegistrationModelHandler.CourseDesc;
import de.bbgs.registration.GetRegistrationModelHandler.PartnerDesc;
import de.bbgs.utils.DBUtils;

/**
 * 
 *
 */
public class RegistrationDBUtil
{
    // @formatter:off
    private static final String GET_COMMING_SOON_COURSES = "select c.id, c.name, c.description, c.type, min(t.date) as begin, max(t.date) as end from course_termins t \n" + 
        "    left join courses c on c.id = t.ref_id \n" + 
//        "    where current_date > t.date\n" +               // TODO: muss noch in lesserThen geändert werden!
        "    group by t.ref_id";
    // @formatter on
    
    private static final String GET_PARTNERS = "select id, name from partner where type='COOP' order by name";

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<PartnerDesc> getPartners(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        Collection<PartnerDesc> result = new ArrayList<>();
        try
        {
            stmt = conn.prepareStatement(GET_PARTNERS);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                PartnerDesc p = new PartnerDesc();
                p.id = rs.getInt("id");
                p.name = rs.getString("name");
                result.add(p);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);

        }
        return result;
    }

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<CourseDesc> getCoursesCommingSoon(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        Collection<CourseDesc> result = new ArrayList<>();
        try
        {
            int lastId = -1;
            CourseDesc c = null;

            stmt = conn.prepareStatement(GET_COMMING_SOON_COURSES);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                int currId = rs.getInt("c.id");
                if (currId != lastId)
                {
                    if (c != null)
                    {
                        result.add(c);
                    }
                    c = new CourseDesc();
                    c.id = lastId = currId;
                    c.name = rs.getString("c.name");
                    c.description = rs.getString("c.description");
                    c.type = ECourseType.valueOf(rs.getString("c.type"));
                }
            }
            if (c != null)
            {
                result.add(c);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return result;
    }

}
