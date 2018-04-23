package de.bbgs.mail;

import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.mail.internet.InternetAddress;

import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.member.EMemberType;
import de.bbgs.partner.EPartnerType;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.DBUtils;

public class MailDBUtils
{
    public static List<MailMember> getAllMembers(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select id, zname, vname, email, mobile from members order by zname");
            rs = stmt.executeQuery();

            List<MailMember> rsp = new ArrayList<>();
            while (rs.next())
            {
                MailMember m = new MailMember();
                m.id = rs.getInt("id");
                m.zname = rs.getString("zname");
                m.vname = rs.getString("vname");
                m.email = rs.getString("email");
                m.mobile = rs.getString("mobile");
                rsp.add(m);
            }
            return rsp;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * 
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static List<MailCourse> getAllCourses(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select id, name, description from courses order by name;");
            rs = stmt.executeQuery();

            List<MailCourse> result = new ArrayList<>();

            while (rs.next())
            {
                MailCourse c = new MailCourse();
                c.id = rs.getInt("id");
                c.name = rs.getString("name");
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
     * @param conn
     * @return
     * @throws SQLException
     */
    public static List<CustomMailGroup> getAllCustomGroups(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            List<CustomMailGroup> result = new ArrayList<>();

            stmt = conn.prepareStatement("select id, name, description from mail_groups order by name");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                CustomMailGroup cmg = new CustomMailGroup();
                cmg.id = rs.getInt("id");
                cmg.name = rs.getString("name");
                cmg.description = rs.getString("description");
                result.add(cmg);
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
    public static CustomMailGroupModel getCustomGroupModel(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            CustomMailGroupModel result = new CustomMailGroupModel();
            result.id = id;
            if (id > 0)
            {
                stmt = conn.prepareStatement("select name, description from mail_groups where id=?");
                stmt.setInt(1, id);
                rs = stmt.executeQuery();
                if (rs.next())
                {
                    result.name = rs.getString("name");
                    result.description = rs.getString("description");
                    DBUtils.closeQuitly(rs);
                    DBUtils.closeQuitly(stmt);

                    stmt = conn.prepareStatement(
                        "select m.id, m.zname, m.vname, m.city, m.street, m.type from mail_group_members gm left join members m on gm.member_id = m.id where gm.group_id=? order by m.zname;");
                    stmt.setInt(1, id);
                    rs = stmt.executeQuery();
                    while (rs.next())
                    {

                        GroupMember m = new GroupMember();
                        m.id = rs.getInt("m.id");
                        m.zname = rs.getString("m.zname");
                        m.vname = rs.getString("m.vname");
                        m.city = rs.getString("m.city");
                        m.street = rs.getString("m.street");
                        m.type = EMemberType.valueOf(rs.getString("m.type"));
                        result.members.add(m);
                    }
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
     * @param model
     * @param conn
     * @throws SQLException
     */
    public static void saveCustomMailGroupModel(CustomMailGroupModel model, Connection conn) throws SQLException
    {
        if (model.id > 0)
        {
            MailDBUtils.updateMailGroup(model, conn);
        }
        else
        {
            model.id = MailDBUtils.createMailGroup(model, conn);
        }

        int groupId = model.id;
        for (GroupMember m : model.members)
        {
            switch (m.action)
            {
                case CREATE :
                    MailDBUtils.createMemberAssociation(groupId, m.id, conn);
                    break;

                case REMOVE :
                    MailDBUtils.removeMemberAssociation(groupId, m.id, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param model
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static int createMailGroup(CustomMailGroupModel model, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("insert into mail_groups set name=?, description=?");
            stmt.setString(1, model.name);
            stmt.setString(2, model.description);
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
     * @param model
     * @param conn
     * @throws SQLException 
     */
    private static void updateMailGroup(CustomMailGroupModel model, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("update mail_groups set name=?, description=? where id=?");
            stmt.setString(1, model.name);
            stmt.setString(2, model.description);
            stmt.setInt(3, model.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param groupId
     * @param memberId
     * @throws SQLException 
     */
    private static void createMemberAssociation(int groupId, int memberId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("insert into mail_group_members set group_id=?, member_id=?");
            stmt.setInt(1, groupId);
            stmt.setInt(2, memberId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param groupId
     * @param memberId
     */
    private static void removeMemberAssociation(int groupId, int memberId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("delete from mail_group_members where group_id=? and member_id=?");
            stmt.setInt(1, groupId);
            stmt.setInt(2, memberId);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * 
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static List<MailPartner> getAllPartners(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            List<MailPartner> result = new ArrayList<>();
            stmt = conn.prepareStatement(
                "select p.name, p.type, c.id, c.zname, c.vname, c.mobile, c.email from partner p left join contacts c on p.id = c.ref_id where c.domain=\"PARTNER\" order by p.name, c.zname");
            rs = stmt.executeQuery();
            while (rs.next())
            {

                MailPartner mp = new MailPartner();
                mp.name = rs.getString("p.name");
                mp.type = EPartnerType.valueOf(rs.getString("p.type"));
                mp.id = rs.getInt("c.id");
                mp.zname = rs.getString("c.zname");
                mp.vname = rs.getString("c.vname");
                mp.mobile = rs.getString("c.mobile");
                mp.email = rs.getString("c.email");

                result.add(mp);
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
     * @param memberIds
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> getAllMemberEmails(Collection<Integer> memberIds, Connection conn)
        throws SQLException
    {
        return MailDBUtils.getInternetAddresses(memberIds, "select zname, vname, email from members where id=?", conn);
    }

    /**
     * 
     * @param contactIds
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> getAllContactEmails(Collection<Integer> contactIds, Connection conn)
        throws SQLException
    {
        return MailDBUtils.getInternetAddresses(contactIds, "select vname, zname, email from contacts where id=?",
            conn);
    }

    /**
     * 
     * @param types
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> getAllMemberTypeEmails(Collection<EMemberType> types, Connection conn)
        throws SQLException
    {
        Set<InternetAddress> result = new HashSet<>();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        for (EMemberType type : types)
        {
            try
            {
                stmt = conn.prepareStatement("select distinct zname, vname, email from members where type=?");
                stmt.setString(1, type.name());
                rs = stmt.executeQuery();
                while (rs.next())
                {
                    String email = rs.getString("email");
                    String name = String.format("%1$s, %2$s", rs.getString("zname"), rs.getString("vname"));
                    try
                    {
                        InternetAddress ina = new InternetAddress(email, name);
                        result.add(ina);
                    }
                    catch (Exception e)
                    {
                        // TODO
                    }
                }
            }
            finally
            {
                DBUtils.closeQuitly(rs);
                DBUtils.closeQuitly(stmt);
            }
        }
        return result;
    }

    /**
     * @param courseIds
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> getAllCourseEmails(Collection<Integer> courseIds, Connection conn)
        throws SQLException
    {
        String sql = "select distinct zname, vname, email from members m join course_member cm on cm.member_id = m.id where cm.course_id = ?";
        return MailDBUtils.getInternetAddresses(courseIds,sql, conn);
    }

    /**
     * @param groupIds
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<InternetAddress> getAllCustomGroupEmails(Set<Integer> groupIds, Connection conn)
        throws SQLException
    {
        return MailDBUtils.getInternetAddresses(groupIds,
            "select zname, vname, email from members m join mail_group_members g on g.member_id = m.id where g.group_id = ?",
            conn);
    }

    /**
     * @param ids
     * @param sql
     * @param conn
     * @return
     * @throws SQLException
     */
    private static Collection<InternetAddress> getInternetAddresses(Collection<Integer> ids, String sql,
        Connection conn) throws SQLException
    {
        Set<InternetAddress> result = new HashSet<>();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        for (Integer id : ids)
        {
            try
            {
                stmt = conn.prepareStatement(sql);
                stmt.setInt(1, id.intValue());
                rs = stmt.executeQuery();
                while (rs.next())
                {
                    String email = rs.getString("email");
                    if (email != null && email != "")
                    {
                        String name = String.format("%1$s, %2$s", rs.getString("zname"), rs.getString("vname"));
                        try
                        {
                            InternetAddress ina = new InternetAddress(email, name);
                            result.add(ina);
                        }
                        catch (Exception e)
                        {
                            // TODO
                        }
                    }
                }
            }
            finally
            {
                DBUtils.closeQuitly(rs);
                DBUtils.closeQuitly(stmt);
            }
        }
        return result;
    }

    /**
     * 
     * @param session
     * @param conn
     * @return
     * @throws SQLException
     */
    public static MailSenderInfo getMailSenderInfo(SessionWrapper session, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            MailSenderInfo info = new MailSenderInfo();
            stmt = conn.prepareStatement(
                "select zname, vname, email, file, mimetype from members m left join attachments a on a.ref_id = m.id where m.id=? and a.domain=?");
            stmt.setInt(1, session.getAccountId());
            stmt.setString(2, EAttachmentDomain.MAILSIG.name());
            rs = stmt.executeQuery();
            if (rs.next())
            {

                info.setZName(rs.getString("zname"));
                info.setVName(rs.getString("vname"));
                info.setEmail(rs.getString("email"));

                String mimeType = rs.getString("mimetype");
                Blob signature = rs.getBlob("file");
                if (mimeType != null && mimeType != "" && signature != null && signature.length() != 0)
                {
                    info.setSigMimeType(mimeType);
                    info.setSignature(signature.getBytes(1, (int) signature.length()));
                }
            }
            return info;
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
     * @throws SQLException 
     */
    public static void deleteMemberFromAllMailGroups(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from mail_group_members where member_id=?");
            stmt.setInt(1,  id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
