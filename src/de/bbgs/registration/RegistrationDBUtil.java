package de.bbgs.registration;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.courses.ECourseType;
import de.bbgs.registration.GetRegistrationModelHandler.CourseDesc;
import de.bbgs.registration.GetRegistrationModelHandler.LocationDesc;
import de.bbgs.registration.GetRegistrationModelHandler.PartnerDesc;
import de.bbgs.registration.GetRegistrationModelHandler.TerminDesc;
import de.bbgs.utils.DBUtils;

/**
 * 
 *
 */
public class RegistrationDBUtil
{
    // @formatter:off
    private static final String GET_COMMING_SOON_COURSES = "select c.id, c.name, c.description, c.type, t.date, t.start, t.end, t.location_id\n"
        + "    from courses c \n" 
        + "    left join course_termins t on t.ref_id = c.id \n"
        + "    where t.date > current_date \n" 
        + "    order by c.id, t.date";
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

                TerminDesc t = new TerminDesc();
                t.date = DBUtils.getDate(rs, "t.date");
                t.from = DBUtils.getTime(rs, "t.start");
                t.until = DBUtils.getTime(rs, "t.end");
                t.locationId = rs.getInt("t.location_id");
                c.termine.add(t);
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

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<LocationDesc> getLocations(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        Collection<LocationDesc> result = new ArrayList<>();
        try
        {
            stmt = conn.prepareStatement("select id, name, zip_code, city, street from course_locations order by name");
            rs = stmt.executeQuery();
            while(rs.next()) {
                
                LocationDesc desc = new LocationDesc();
                desc.id = rs.getInt("id");
                desc.name = rs.getString("name");
                desc.zipcode = rs.getInt("zip_code");
                desc.city = rs.getString("city");
                desc.street = rs.getString("street");
                result.add(desc);
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
