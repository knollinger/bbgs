package de.bbgs.sms;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.HashSet;

import de.bbgs.member.EMemberType;
import de.bbgs.utils.DBUtils;

/**
 *
 */
public class SMSDBUtils
{
    /**
     * @param memberIds
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<SMSAddress> getAllSMSAddressesByMemberIds(Collection<Integer> memberIds, Connection conn)
        throws SQLException
    {
        String sql = "select zname, vname, mobile from members where id=?";
        return getAllSMSAddressesByIds(memberIds, sql, conn);
    }

    /**
     * @param courseIds
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> getAllSMSAddressesByCourseIds(Collection<Integer> courseIds, Connection conn)
        throws SQLException
    {
        String sql = "select distinct zname, vname, mobile from members m join course_member cm on cm.member_id = m.id where cm.course_id = ?";
        return getAllSMSAddressesByIds(courseIds, sql, conn);
    }

    /**
     * @param contactIds
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> getAllSMSAddressesByContactIds(Collection<Integer> contactIds, Connection conn)
        throws SQLException
    {
        String sql = "select zname, vname, mobile from contacts where id=?";
        return getAllSMSAddressesByIds(contactIds, sql, conn);
    }


    /**
     * @param groupIds
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> getAllSMSAddressesByGroupIds(Collection<Integer> groupIds, Connection conn)
        throws SQLException
    {
        String sql = "select zname, vname, mobile from members m join mail_group_members g on g.member_id = m.id where g.group_id = ?";
        return getAllSMSAddressesByIds(groupIds, sql, conn);
    }

    public static Collection<SMSAddress> getAllSMSAddressesByMemberTypes(Collection<EMemberType> types, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<SMSAddress> result = new HashSet<>();
            stmt = conn.prepareStatement("select zname, vname, mobile from members where type=?");
            for (EMemberType type : types)
            {
                stmt.setString(1, type.name());
                rs = stmt.executeQuery();
                if (rs.next())
                {
                    SMSAddress addr = new SMSAddress();
                    addr.setZname(rs.getString("zname"));
                    addr.setVname(rs.getString("vname"));
                    addr.setMobile(rs.getString("mobile"));
                    result.add(addr);
                }
                DBUtils.closeQuitly(rs);
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
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static Collection<SMSAddress> getAllSMSAddressesByIds(Collection<Integer> memberIds, String sql,
        Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<SMSAddress> result = new HashSet<>();
            stmt = conn.prepareStatement(sql);
            for (Integer memberId : memberIds)
            {
                stmt.setInt(1, memberId.intValue());
                rs = stmt.executeQuery();
                if (rs.next())
                {

                    SMSAddress addr = new SMSAddress();
                    addr.setZname(rs.getString("zname"));
                    addr.setVname(rs.getString("vname"));
                    addr.setMobile(rs.getString("mobile"));
                    result.add(addr);
                }
                DBUtils.closeQuitly(rs);
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
}
