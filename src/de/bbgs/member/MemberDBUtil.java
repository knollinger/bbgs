package de.bbgs.member;

import java.io.ByteArrayInputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.contacts.ContactsDBUtil;
import de.bbgs.contacts.EContactDomain;
import de.bbgs.courses.CourseDBUtil;
import de.bbgs.dsgvo.EDSEState;
import de.bbgs.mail.MailDBUtils;
import de.bbgs.member.MemberModel.Course;
import de.bbgs.service.EAction;
import de.bbgs.utils.DBUtils;

/**
 *
 */
public class MemberDBUtil
{
    private static final String GETMEMBER_STMT = "select * from members where id=?";

    /**
     * @param member
     * @param conn
     * @return
     * @throws SQLException
     */
    public static int createMember(Member member, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "insert into members set vname=?, vname2= ?, zname=?, title=?, birth_date=?, sex=?, zip_code=?, city=?, street=?, photoagreement=?, phone=?, phone2=?, mobile=?, mobile2=?, email=?, email2=?, type=?, member_since=?, member_until=?, school=?");
            stmt.setString(1, member.vname.trim());
            stmt.setString(2, member.vname2.trim());
            stmt.setString(3, member.zname.trim());
            stmt.setString(4, member.title.trim());
            DBUtils.setDate(stmt, 5, member.birthDate);
            stmt.setString(6, member.sex.toString());
            stmt.setInt(7, member.zipCode);
            stmt.setString(8, member.city.trim());
            stmt.setString(9, member.street.trim());
            stmt.setString(10, member.fotoAgreement.name());
            stmt.setString(11, member.phone.trim());
            stmt.setString(12, member.phone2.trim());
            stmt.setString(13, member.mobile.trim());
            stmt.setString(14, member.mobile2.trim());
            stmt.setString(15, member.email.trim());
            stmt.setString(16, member.email2.trim());
            stmt.setString(17, member.memberType.name());
            DBUtils.setDate(stmt, 18, member.memberSince);
            DBUtils.setDate(stmt, 19, member.memberUntil);
            stmt.setInt(20, member.school);
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
     * @param member
     * @param conn
     * @throws SQLException
     */
    public static int updateMember(Member member, Connection conn) throws SQLException
    {

        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement(
                "update members set vname=?, vname2= ?, zname=?, title=?, birth_date=?, sex=?, zip_code=?, city=?, street=?, photoagreement=?, phone=?, phone2=?, mobile=?, mobile2=?, email=?, email2=?, type=?, member_since=?, member_until=?, school=? where id=?");
            stmt.setString(1, member.vname.trim());
            stmt.setString(2, member.vname2.trim());
            stmt.setString(3, member.zname.trim());
            stmt.setString(4, member.title.trim());
            DBUtils.setDate(stmt, 5, member.birthDate);
            stmt.setString(6, member.sex.toString());
            stmt.setInt(7, member.zipCode);
            stmt.setString(8, member.city.trim());
            stmt.setString(9, member.street.trim());
            stmt.setString(10, member.fotoAgreement.name());
            stmt.setString(11, member.phone.trim());
            stmt.setString(12, member.phone2.trim());
            stmt.setString(13, member.mobile.trim());
            stmt.setString(14, member.mobile2.trim());
            stmt.setString(15, member.email.trim());
            stmt.setString(16, member.email2.trim());
            stmt.setString(17, member.memberType.name());
            DBUtils.setDate(stmt, 18, member.memberSince);
            DBUtils.setDate(stmt, 19, member.memberUntil);
            stmt.setInt(20, member.school);
            stmt.setInt(21, member.id);
            stmt.executeUpdate();
            return member.id;
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param data
     * @param mimeType
     * @param memberId
     * @param domain
     * @param session
     * @param conn
     * @throws SQLException
     */
    public static void handleMemberInternalAttachment(byte[] data, String mimeType, int memberId,
        EAttachmentDomain domain, Connection conn) throws SQLException
    {
        if (data != null && data.length != 0 && mimeType != null && mimeType.length() != 0)
        {
            PreparedStatement stmt = null;
            try
            {
                stmt = conn.prepareStatement("update attachments set mimetype=?, file=? where domain=? and ref_id=?");
                stmt.setString(1, mimeType);
                stmt.setBlob(2, new ByteArrayInputStream(data));
                stmt.setString(3, domain.name());
                stmt.setInt(4, memberId);
                if (stmt.executeUpdate() == 0)
                {
                    DBUtils.closeQuitly(stmt);
                    stmt = conn.prepareStatement(
                        "insert into attachments set domain=?, ref_id=?, file=?, mimetype=?, file_name=?");
                    stmt.setString(1, domain.name());
                    stmt.setInt(2, memberId);
                    stmt.setBlob(3, new ByteArrayInputStream(data));
                    stmt.setString(4, mimeType);
                    stmt.setString(5, domain.name());
                    stmt.executeUpdate();
                }
            }
            finally
            {
                DBUtils.closeQuitly(stmt);
            }
        }
    }

    /**
     * @param id
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Member getMember(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement(GETMEMBER_STMT);
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                return MemberDBUtil.personFromResultSet(rs);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return null;
    }


    /**
     * @param rs
     * @return
     * @throws SQLException 
     */
    public static Member personFromResultSet(ResultSet rs) throws SQLException
    {
        Member result = new Member();

        result.id = rs.getInt("id");
        result.vname = rs.getString("vname");
        result.vname2 = rs.getString("vname2");
        result.zname = rs.getString("zname");
        result.title = rs.getString("title");
        result.birthDate = DBUtils.getDate(rs, "birth_date");
        result.sex = ESex.valueOf(rs.getString("sex"));
        result.zipCode = rs.getInt("zip_code");
        result.city = rs.getString("city");
        result.street = rs.getString("street");
        result.phone = rs.getString("phone");
        result.phone2 = rs.getString("phone2");
        result.mobile = rs.getString("mobile");
        result.mobile2 = rs.getString("mobile2");
        result.email = rs.getString("email");
        result.email2 = rs.getString("email2");
        result.memberType = EMemberType.valueOf(rs.getString("type"));
        result.memberSince = DBUtils.getDate(rs, "member_since");
        result.memberUntil = DBUtils.getDate(rs, "member_until");
        result.school = rs.getInt("school");
        result.fotoAgreement = EPhotoAgreement.valueOf(rs.getString("photoagreement"));
        result.dseState = EDSEState.valueOf(rs.getString("dse_state"));
        result.dseDate = DBUtils.getDate(rs, "dse_date");
        return result;
    }


    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    public static List<Member> getAllMembers(Connection conn) throws SQLException
    {
        List<Member> result = new ArrayList<Member>();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from members order by zname");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                result.add(MemberDBUtil.personFromResultSet(rs));
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
     * @throws SQLException
     */
    public static void deleteMember(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            AttachmentsDBUtil.deleteAttachments(id, EAttachmentDomain.MEMBER, conn);
            AttachmentsDBUtil.deleteAttachments(id, EAttachmentDomain.MAILSIG, conn);
            AttachmentsDBUtil.deleteAttachments(id, EAttachmentDomain.THUMBNAIL, conn);
            ContactsDBUtil.deleteContactsFor(id, EContactDomain.MEMBER, conn);
            CourseDBUtil.deleteMemberFromAllCourses(id, conn);
            MailDBUtils.deleteMemberFromAllMailGroups(id, conn);

            stmt = conn.prepareStatement("delete from members where id=?");
            stmt.setInt(1, id);
            stmt.executeUpdate();
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
    public static Collection<Course> getCourses(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<Course> result = new ArrayList<>();

            stmt = conn.prepareStatement("select c.id, c.name, cm.photo_agreement, m.photoagreement from courses c \n"
                + "    left join course_member cm on c.id = cm.course_id \n"
                + "    left join members m on m.id = cm.member_id where cm.member_id=? \n" + "    order by c.name;");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                MemberModel.Course c = new MemberModel.Course();
                c.courseId = rs.getInt("c.id");
                c.action = EAction.NONE;
                c.name = rs.getString("c.name");

                String agreement = rs.getString("cm.photo_agreement");
                if (agreement == null || agreement.equals(""))
                {
                    agreement = rs.getString("m.photoagreement");
                }
                c.photoAgreement = EPhotoAgreement.valueOf(agreement);
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
     * @param courses
     * @param memberId
     * @param conn
     * @throws SQLException 
     */
    public static void handleMemberCourseChanges(Collection<Course> courses, int memberId, Connection conn)
        throws SQLException
    {
        for (Course course : courses)
        {
            switch (course.action)
            {
                case CREATE :
                    MemberDBUtil.createCourseMember(course, memberId, conn);

                    break;

                case MODIFY :
                    MemberDBUtil.updateCourseMember(course, memberId, conn);
                    break;

                case REMOVE :
                    MemberDBUtil.removeMemberFromCourse(course, memberId, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param course
     * @param conn
     * @throws SQLException 
     */
    private static void createCourseMember(Course course, int memberId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("insert into course_member set photo_agreement=?, course_id=?, member_id=?");
            stmt.setString(1, course.photoAgreement.name());
            stmt.setInt(2, course.courseId);
            stmt.setInt(3, memberId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param course
     * @param conn
     * @throws SQLException 
     */
    private static void updateCourseMember(Course course, int memberId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement(
                "update course_member set photo_agreement=? where course_id=? and member_id=?");
            stmt.setString(1, course.photoAgreement.name());
            stmt.setInt(2, course.courseId);
            stmt.setInt(3, memberId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param course
     * @param conn
     * @throws SQLException 
     */
    private static void removeMemberFromCourse(Course course, int memberId, Connection conn) throws SQLException
    {

        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from course_member where course_id=? and member_id=?");
            stmt.setInt(1, course.courseId);
            stmt.setInt(2, memberId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
