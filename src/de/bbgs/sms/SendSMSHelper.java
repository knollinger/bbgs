package de.bbgs.sms;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import de.bbgs.contacts.Contact;
import de.bbgs.courses.Course;
import de.bbgs.mail.CustomMailGroup;
import de.bbgs.member.EMemberType;
import de.bbgs.member.Member;
import de.bbgs.partner.Partner;
import de.bbgs.sms.SendSMSHandler.MemberTypeWrapper;

/**
 * @author anderl
 *
 */
class SendSMSHelper
{
    /**
     * @param members
     * @return
     * @throws SQLException 
     */
    public static Collection<SMSAddress> resolveSMSAddrByMemberIds(Collection<Member> members, Connection conn)
        throws SQLException
    {
        Set<Integer> memberIds = new HashSet<>();
        for (Member m : members)
        {
            memberIds.add(Integer.valueOf(m.id));
        }
        return SMSDBUtils.getAllSMSAddressesByMemberIds(memberIds, conn);
    }


    /**
     * @param memberTypes
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> resolveSMSAddrByMemberType(Collection<MemberTypeWrapper> memberTypes,
        Connection conn) throws SQLException
    {
        Set<EMemberType> types = new HashSet<>();
        for (MemberTypeWrapper t : memberTypes)
        {
            types.add(t.type);
        }
        return SMSDBUtils.getAllSMSAddressesByMemberTypes(types, conn);
    }

    /**
     * @param partners
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> resolvePartnerAddresses(Collection<Partner> partners, Connection conn)
        throws SQLException
    {
        Set<Integer> contactIds = new HashSet<>();
        for (Partner p : partners)
        {
            contactIds.add(Integer.valueOf(p.id));
        }

        return SMSDBUtils.getAllSMSAddressesByContactIds(contactIds, conn);
    }

    /**
     * @param contacts
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> resolveContactAddresses(Collection<Contact> contacts, Connection conn)
        throws SQLException
    {
        Set<Integer> contactIds = new HashSet<>();

        for (Contact c : contacts)
        {
            contactIds.add(Integer.valueOf(c.id));
        }

        return SMSDBUtils.getAllSMSAddressesByContactIds(contactIds, conn);
    }


    /**
     * @param courses
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> resolveCourseAddresses(Collection<Course> courses, Connection conn)
        throws SQLException
    {
        Set<Integer> courseIds = new HashSet<>();
        for (Course c : courses)
        {
            courseIds.add(Integer.valueOf(c.id));
        }

        return SMSDBUtils.getAllSMSAddressesByCourseIds(courseIds, conn);
    }


    /**
     * @param groups
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<SMSAddress> resolveCustomGroupAddresses(Collection<CustomMailGroup> groups, Connection conn)
        throws SQLException
    {
        Set<Integer> groupIds = new HashSet<>();
        for (CustomMailGroup c : groups)
        {
            groupIds.add(Integer.valueOf(c.id));
        }

        return SMSDBUtils.getAllSMSAddressesByGroupIds(groupIds, conn);
    }
}

