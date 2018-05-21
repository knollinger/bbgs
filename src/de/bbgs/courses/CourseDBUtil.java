package de.bbgs.courses;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.contacts.Contact;
import de.bbgs.contacts.ContactsDBUtil;
import de.bbgs.contacts.EContactDomain;
import de.bbgs.member.EMemberType;
import de.bbgs.member.EPhotoAgreement;
import de.bbgs.member.ESex;
import de.bbgs.member.Member;
import de.bbgs.named_colors.NamedColorsDBUtil;
import de.bbgs.notes.ENoteDomain;
import de.bbgs.notes.NotesDBUtil;
import de.bbgs.service.EAction;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.DBUtils;

/**
 *
 */
public class CourseDBUtil
{
    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    public static List<Course> getAllCourses(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            List<Course> result = new ArrayList<>();
            stmt = conn.prepareStatement("select * from courses order by name");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Course c = new Course();
                c.id = rs.getInt("id");
                c.name = rs.getString("name");
                c.type = ECourseType.valueOf(rs.getString("type"));
                c.color = rs.getInt("color_id");
                c.description = rs.getString("description");
                result.add(c);
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
     * Lösche einen Kurs, alle seine Termine und alle MemberAssoziierungen
     * 
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    public static void deleteCourse(int courseId, Connection conn) throws SQLException
    {
        conn.setAutoCommit(false);

        CourseDBUtil.deleteAllCourseMembers(courseId, conn);
        CourseDBUtil.deleteAllCourseTermins(courseId, conn);
        CourseDBUtil.deleteAllCourseAttachments(courseId, conn);
        CourseDBUtil.deleteAllCourseNotes(courseId, conn);

        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from courses where id =?");
            stmt.setInt(1, courseId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
        conn.commit();

    }

    /**
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private static void deleteAllCourseMembers(int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from course_member where course_id=?");
            stmt.setInt(1, courseId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private static void deleteAllCourseTermins(int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from course_termins where ref_id=?");
            stmt.setInt(1, courseId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private static void deleteAllCourseAttachments(int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from attachments where ref_id=? and domain=?");
            stmt.setInt(1, courseId);
            stmt.setString(2, EAttachmentDomain.COURSE.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private static void deleteAllCourseNotes(int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from notes where ref_id=? and domain=?");
            stmt.setInt(1, courseId);
            stmt.setString(2, ENoteDomain.COURSE.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    public static Collection<Course> getCoursesByMemberId(int memberId, Connection conn) throws SQLException
    {
        Collection<Course> courses = new ArrayList<Course>();
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement(
                "select * from courses where id in (select distinct course_id from course_member where member_id=?) order by name;");
            stmt.setInt(1, memberId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Course course = new Course();
                course.id = rs.getInt("id");
                course.name = rs.getString("name");
                course.description = rs.getString("description");
                course.color = rs.getInt("color_id");
                course.type = ECourseType.valueOf(rs.getString("type"));
                courses.add(course);
            }
            return courses;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param courseId
     * @param conn
     * @return <code>null</code>, wenn kein solcher Kurs gefunden wurde
     * 
     * @throws SQLException
     */
    public static CourseModel getCourseModel(int courseId, Connection conn) throws SQLException
    {
        CourseModel mdl = null;


        if (courseId == 0)
        {
            mdl = new CourseModel();
            mdl.locations.addAll(CourseDBUtil.getAllLocations(conn));
            mdl.colors.addAll(NamedColorsDBUtil.getAllNamedColors(conn));
        }
        else
        {
            mdl = CourseDBUtil.loadCourseCoreData(courseId, conn);
            if (mdl != null)
            {
                mdl.member.addAll(CourseDBUtil.getAllMembersByCourseId(courseId, conn));
                mdl.termine.addAll(CourseDBUtil.loadTermine(courseId, conn));
                mdl.notes.addAll(NotesDBUtil.getAllNotes(courseId, ENoteDomain.COURSE, conn));
                mdl.attachments.addAll(AttachmentsDBUtil.getAllAttachments(courseId, EAttachmentDomain.COURSE, conn));
                mdl.locations.addAll(CourseDBUtil.getAllLocations(conn));
                mdl.colors.addAll(NamedColorsDBUtil.getAllNamedColors(conn));
            }
        }
        return mdl;
    }


    /**
     * 
     * @param id
     * @param conn
     * @return
     * @throws SQLException
     */
    private static CourseModel loadCourseCoreData(int id, Connection conn) throws SQLException
    {
        CourseModel result = null;

        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement(
                "select c.name, c.description, c.color_id, c.type, n.color from courses c join named_colors n on c.color_id = n.id where c.id=?");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                result = new CourseModel();
                result.id = id;
                result.name = rs.getString("c.name");
                result.description = rs.getString("c.description");
                result.colorId = rs.getInt("c.color_id");
                result.color = rs.getString("n.color");
                result.type = ECourseType.valueOf(rs.getString("type"));
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
     * @param terminId
     * @param conn
     * @return
     * @throws SQLException
     */
    public static CourseTerminModel getCourseTerminModel(int terminId, Connection conn) throws SQLException
    {
        CourseTerminModel mdl = null;
        if (terminId == 0)
        {
            mdl = new CourseTerminModel();
            mdl.locations.addAll(CourseDBUtil.getAllLocations(conn));
        }
        else
        {
            mdl = CourseDBUtil.loadTerminCoreData(terminId, conn);
            if (mdl != null)
            {
                int courseId = mdl.courseId;
                mdl.member.addAll(CourseDBUtil.getAllMembersByTerminId(terminId, conn));
                mdl.notes.addAll(NotesDBUtil.getAllNotes(courseId, ENoteDomain.COURSE, conn));
                mdl.attachments.addAll(AttachmentsDBUtil.getAllAttachments(courseId, EAttachmentDomain.COURSE, conn));
                mdl.locations.addAll(CourseDBUtil.getAllLocations(conn));
            }
        }
        return mdl;
    }

    /**
     * @param terminId
     * @param conn
     * @return
     * @throws SQLException
     */
    private static CourseTerminModel loadTerminCoreData(int terminId, Connection conn) throws SQLException
    {
        CourseTerminModel mdl = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select c.id, c.name, c.description, t.date, t.start, t.end, t.location_id from course_termins t left join courses c on c.id = t.ref_id where t.id=?");
            stmt.setInt(1, terminId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                mdl = new CourseTerminModel();
                mdl.courseId = rs.getInt("c.id");
                mdl.name = rs.getString("c.name");
                mdl.description = rs.getString("c.description");

                mdl.termin = new Termin();
                mdl.termin.id = terminId;
                mdl.termin.date = DBUtils.getDate(rs, "t.date");
                mdl.termin.startTime = DBUtils.getTime(rs, "t.start");
                mdl.termin.endTime = DBUtils.getTime(rs, "t.end");
                mdl.termin.locationId = rs.getInt("t.location_id");
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return mdl;
    }

    public static Collection<Member> getAllMembersByCourseId(int courseId, Connection conn) throws SQLException
    {
        Collection<Member> result = new ArrayList<Member>();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select * from members where id in (select distinct member_id from course_member where course_id =?) order by zname");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Member m = new Member();

                m.id = rs.getInt("id");
                m.vname = rs.getString("vname");
                m.vname2 = rs.getString("vname2");
                m.zname = rs.getString("zname");
                m.title = rs.getString("title");
                m.birthDate = DBUtils.getDate(rs, "birth_date");
                m.sex = ESex.valueOf(rs.getString("sex"));
                m.zipCode = rs.getInt("zip_code");
                m.city = rs.getString("city");
                m.street = rs.getString("street");
                m.fotoAgreement = EPhotoAgreement.valueOf(rs.getString("photoagreement"));
                m.phone = rs.getString("phone");
                m.phone2 = rs.getString("phone2");
                m.mobile = rs.getString("mobile");
                m.mobile2 = rs.getString("mobile2");
                m.email = rs.getString("email");
                m.email2 = rs.getString("email2");
                m.memberType = EMemberType.valueOf(rs.getString("type"));
                m.memberSince = DBUtils.getDate(rs, "member_since");
                m.memberUntil = DBUtils.getDate(rs, "member_until");
                m.school = rs.getInt("school");
                result.add(m);
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    public static Collection<Member> getAllMembersByTerminId(int terminId, Connection conn) throws SQLException
    {
        Collection<Member> result = new ArrayList<Member>();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            String sql = "select * from members where id in \n" + 
                "(\n" + 
                "    select distinct member_id from course_member where course_id in\n" + 
                "    (\n" + 
                "        select ref_id from course_termins where id=?\n" + 
                "    )\n" + 
                ")";
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, terminId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Member m = new Member();
                m.id = rs.getInt("id");
                m.zname = rs.getString("zname");
                m.vname = rs.getString("vname");
                m.vname2 = rs.getString("vname2");
                m.city = rs.getString("city");
                m.street = rs.getString("street");
                m.memberType = EMemberType.valueOf(rs.getString("type"));
                result.add(m);
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
     * @param id
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static Collection<Termin> loadTermine(int id, Connection conn) throws SQLException
    {
        List<Termin> result = new ArrayList<Termin>();
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement(
                "select id, date, start, end, location_id from course_termins where ref_id=? order by date, start");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Termin t = new Termin();
                t.id = rs.getInt("id");
                t.date = DBUtils.getDate(rs, "date");
                t.startTime = DBUtils.getTime(rs, "start");
                t.endTime = DBUtils.getTime(rs, "end");
                t.locationId = rs.getInt("location_id");
                result.add(t);
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
     * @param mdl
     * @param conn
     * @throws SQLException
     */
    public static void saveCourseModel(CourseModel mdl, SessionWrapper session, Connection conn) throws SQLException
    {
        if (mdl.id == 0)
        {
            CourseDBUtil.createCourse(mdl, conn);
        }
        else
        {
            CourseDBUtil.updateCourse(mdl, conn);
        }

        CourseDBUtil.handleMemberDeletions(mdl, conn);
        CourseDBUtil.handleTerminChanges(mdl, conn);
        CourseDBUtil.handleMemberCreations(mdl, conn);

        NotesDBUtil.handleNoteChanges(mdl.notes, mdl.id, ENoteDomain.COURSE, conn);
        AttachmentsDBUtil.handleAttachmentChanges(mdl.attachments, mdl.id, EAttachmentDomain.COURSE, session, conn);
    }

    /**
     * @param model
     * @param conn
     * @throws SQLException
     */
    private static void createCourse(CourseModel model, Connection conn) throws SQLException
    {

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("insert into courses set name=?, description=?, color_id=?, type=?");
            stmt.setString(1, model.name);
            stmt.setString(2, model.description);
            stmt.setInt(3, model.colorId);
            stmt.setString(4, model.type.name());
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            rs.next();
            model.id = rs.getInt(1);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param model
     * @param conn
     * @throws SQLException
     */
    private static void updateCourse(CourseModel model, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update courses set name=?, description=?, color_id=?, type=? where id=?");
            stmt.setString(1, model.name);
            stmt.setString(2, model.description);
            stmt.setInt(3, model.colorId);
            stmt.setString(4, model.type.name());
            stmt.setInt(5, model.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * 
     * @param mdl
     * @param termine
     * @param conn
     * @throws SQLException 
     */
    private static void handleTerminChanges(CourseModel mdl, Connection conn) throws SQLException
    {
        for (Termin t : mdl.termine)
        {
            switch (t.action)
            {
                case CREATE :
                    CourseDBUtil.createTermin(mdl.id, t, conn);
                    break;

                case MODIFY :
                    CourseDBUtil.updateTermin(mdl.id, t, conn);
                    break;

                case REMOVE :
                    CourseDBUtil.removeTermin(mdl.id, t, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param courseId
     * @param t
     * @param conn
     * @throws SQLException
     */
    private static void createTermin(int courseId, Termin t, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "insert into course_termins set ref_id=?, date=?, start=?, end=?, location_id=?");
            stmt.setInt(1, courseId);
            DBUtils.setDate(stmt, 2, t.date);
            DBUtils.setTime(stmt, 3, t.startTime);
            DBUtils.setTime(stmt, 4, t.endTime);
            stmt.setInt(5, t.locationId);
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            rs.next();
            t.id = rs.getInt(1);
            t.action = EAction.NONE;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param id
     * @param t
     * @param conn
     * @throws SQLException
     */
    private static void updateTermin(int id, Termin t, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update course_termins set date=?, start=?, end=?, location_id=? where id=?");
            DBUtils.setDate(stmt, 1, t.date);
            DBUtils.setTime(stmt, 2, t.startTime);
            DBUtils.setTime(stmt, 3, t.endTime);
            stmt.setInt(4, t.locationId);
            stmt.setInt(5, t.id);
            stmt.executeUpdate();
            t.action = EAction.NONE;
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param id
     * @param t
     * @param conn
     * @throws SQLException
     */
    private static void removeTermin(int id, Termin t, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from course_termins where id=?");
            stmt.setInt(1, t.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param mdl
     * @param conn
     * @throws SQLException 
     */
    private static void handleMemberCreations(CourseModel mdl, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            for (Member member : mdl.member)
            {
                if (member.action.equals(EAction.CREATE))
                {
                    stmt = conn.prepareStatement("insert into course_member set course_id=?, member_id=?");
                    stmt.setInt(1, mdl.id);
                    stmt.setInt(2, member.id);
                    stmt.executeUpdate();
                }
            }
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param mdl
     * @param conn
     * @throws SQLException 
     */
    private static void handleMemberDeletions(CourseModel mdl, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from course_member where member_id=? and course_id=?");
            for (Member member : mdl.member)
            {
                if (member.action.equals(EAction.REMOVE))
                {
                    stmt.setInt(1, member.id);
                    stmt.setInt(2, mdl.id);
                    stmt.executeUpdate();
                }
            }
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    public static List<Location> getAllLocations(Connection conn) throws SQLException
    {
        List<Location> result = new ArrayList<Location>();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select l.id, l.name, l.description, l.zip_code, l.city, l.street, l.homepage, c.id, c.zname, c.vname, c.vname2, c.title, c.phone, c.mobile, c.email, c.phone2, c.mobile2, c.email2 from course_locations l left join contacts c on  l.id = c.ref_id and c.domain='COURSELOC' order by l.name, c.zname");
            rs = stmt.executeQuery();

            Location currLoc = null;
            while (rs.next())
            {
                int id = rs.getInt("l.id");
                if (currLoc == null || currLoc.id != id)
                {
                    if (currLoc != null)
                    {
                        result.add(currLoc);
                    }
                    currLoc = new Location();
                    currLoc.id = id;
                    currLoc.name = rs.getString("l.name");
                    currLoc.description = rs.getString("l.description");
                    currLoc.zipCode = rs.getInt("l.zip_code");
                    currLoc.city = rs.getString("l.city");
                    currLoc.street = rs.getString("l.street");
                    currLoc.homepage = rs.getString("l.homepage");
                    currLoc.action = EAction.NONE;
                }

                int contactId = rs.getInt("c.id");
                if (contactId > 0)
                {
                    Contact contact = new Contact();
                    contact.action = EAction.NONE;
                    contact.id = contactId;
                    contact.zname = rs.getString("c.zname");
                    contact.vname = rs.getString("c.vname");
                    contact.vname2 = rs.getString("c.vname2");
                    contact.title = rs.getString("c.title");
                    contact.phone = rs.getString("c.phone");
                    contact.mobile = rs.getString("c.mobile");
                    contact.email = rs.getString("c.email");
                    contact.phone2 = rs.getString("c.phone2");
                    contact.mobile2 = rs.getString("c.mobile2");
                    contact.email2 = rs.getString("c.email2");
                    currLoc.contacts.add(contact);
                }
            }

            if (currLoc != null)
            {
                result.add(currLoc);
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
     * @param id
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Location getCourseLocation(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            Location result = new Location();
            result.id = id;
            if (id != 0)
            {
                result.contacts.addAll(ContactsDBUtil.getAllContacts(id, EContactDomain.COURSELOC, conn));
                result.attachments.addAll(AttachmentsDBUtil.getAllAttachments(id, EAttachmentDomain.COURSELOC, conn));
                result.notes.addAll(NotesDBUtil.getAllNotes(id, ENoteDomain.COURSELOC, conn));

                stmt = conn.prepareStatement(
                    "select name, description, zip_code, city, street, homepage from course_locations where id=?");
                stmt.setInt(1, id);
                rs = stmt.executeQuery();
                if (rs.next())
                {
                    result.name = rs.getString("name");
                    result.description = rs.getString("description");
                    result.zipCode = rs.getInt("zip_code");
                    result.city = rs.getString("city");
                    result.street = rs.getString("street");
                    result.homepage = rs.getString("homepage");
                }
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
     * @param location
     * @param conn
     * @throws SQLException 
     */
    public static void saveCourseLocation(Location location, SessionWrapper session, Connection conn)
        throws SQLException
    {
        if (location.id == 0)
        {
            location.id = CourseDBUtil.createLocation(location, conn);
        }
        else
        {
            CourseDBUtil.updateLocation(location, conn);
        }
        ContactsDBUtil.handleContactChanges(location.contacts, location.id, EContactDomain.COURSELOC, conn);
        AttachmentsDBUtil.handleAttachmentChanges(location.attachments, location.id, EAttachmentDomain.COURSELOC,
            session, conn);
        NotesDBUtil.handleNoteChanges(location.notes, location.id, ENoteDomain.COURSELOC, conn);
    }


    /**
     * @param location
     * @return
     * @throws SQLException 
     */
    private static int createLocation(Location location, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "insert into course_locations set name=?, description=?, zip_code=?, city=?, street=?, homepage=?");
            stmt.setString(1, location.name);
            stmt.setString(2, location.description);
            stmt.setInt(3, location.zipCode);
            stmt.setString(4, location.city);
            stmt.setString(5, location.street);
            stmt.setString(6, location.homepage);
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            rs.next();
            return rs.getInt(1);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param location
     * @throws SQLException 
     */
    private static void updateLocation(Location location, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "update course_locations set name=?, description=?, zip_code=?, city=?, street=?, homepage=? where id=?");
            stmt.setString(1, location.name);
            stmt.setString(2, location.description);
            stmt.setInt(3, location.zipCode);
            stmt.setString(4, location.city);
            stmt.setString(5, location.street);
            stmt.setString(6, location.homepage);
            stmt.setInt(7, location.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param mdl
     * @param conn
     * @throws SQLException 
     */
    public static void saveCourseTerminModel(CourseTerminModel mdl, SessionWrapper session, Connection conn)
        throws SQLException
    {
        try
        {
            int courseId = mdl.courseId;
            int terminId = mdl.termin.id;
            if (terminId == 0)
            {
                CourseDBUtil.createTermin(courseId, mdl.termin, conn);
            }
            else
            {
                CourseDBUtil.updateTermin(courseId, mdl.termin, conn);
            }

            CourseDBUtil.handleMemberChanges(mdl.member, courseId, conn);
            NotesDBUtil.handleNoteChanges(mdl.notes, courseId, ENoteDomain.COURSE, conn);
            AttachmentsDBUtil.handleAttachmentChanges(mdl.attachments, courseId, EAttachmentDomain.COURSE, session,
                conn);
        }
        finally
        {
        }
    }


    /**
     * Behandle Änderungen in der Zuordnung mehrerer Members zu einem Kurs
     * 
     * @param members
     * @param courseId
     * @param conn
     * @throws SQLException 
     */
    private static void handleMemberChanges(List<Member> members, int courseId, Connection conn) throws SQLException
    {
        for (Member member : members)
        {
            switch (member.action)
            {
                case CREATE :
                    CourseDBUtil.createCourseAssociation(courseId, member.id, conn);
                    break;

                case REMOVE :
                    CourseDBUtil.removeCourseAssociation(courseId, member.id, conn);
                    break;

                default :
                    break;
            }
            
        }
    }

    /**
     * Behandle Änderungen in der Zuordnung eines Members zu mehreren Kursen
     * 
     * @param courses
     * @param memberId
     * @param conn
     * @throws SQLException
     */
    public static void handleMemberCourseChanges(Collection<Course> courses, int memberId, Connection conn) throws SQLException
    {
        for (Course course : courses)
        {
            switch (course.action)
            {
                case CREATE :
                    CourseDBUtil.createCourseAssociation(course.id, memberId, conn);
                    break;

                case REMOVE :
                    CourseDBUtil.removeCourseAssociation(course.id, memberId, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param course
     * @param memberId
     * @param conn
     * @throws SQLException 
     */
    private static void createCourseAssociation(int courseId, int memberId, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into course_member set member_id=?, course_id =?");
            stmt.setInt(1, memberId);
            stmt.setInt(2, courseId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param course
     * @param memberId
     * @param conn
     * @throws SQLException 
     */
    private static void removeCourseAssociation(int courseId, int memberId, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from course_member where member_id=? and course_id=?");
            stmt.setInt(1, memberId);
            stmt.setInt(2, courseId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param memberId
     * @param conn
     * @throws SQLException
     */
    public static void deleteMemberFromAllCourses(int memberId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from course_member where member_id=?");
            stmt.setInt(1, memberId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

}
