package de.bbgs.contacts;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.service.EAction;
import de.bbgs.utils.DBUtils;

/**
 * Datenbank-Helper für die Arbeit mit Kontakten
 *
 */
public class ContactsDBUtil
{
    /**
     * @param refId
     * @param domain
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<Contact> getAllContacts(int refId, EContactDomain domain, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<Contact> result = new ArrayList<Contact>();

            stmt = conn.prepareStatement("select * from contacts where ref_id=? and domain=? order by zname");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Contact contact = new Contact();
                contact.action = EAction.NONE;
                contact.id = rs.getInt("id");
                contact.zname = rs.getString("zname");
                contact.vname = rs.getString("vname");
                contact.vname2 = rs.getString("vname2");
                contact.title = rs.getString("title");
                contact.phone = rs.getString("phone");
                contact.mobile = rs.getString("mobile");
                contact.email = rs.getString("email");
                contact.phone2 = rs.getString("phone2");
                contact.mobile2 = rs.getString("mobile2");
                contact.email2 = rs.getString("email2");
                contact.zipCode = rs.getInt("zip_code");
                contact.city = rs.getString("city");
                contact.street = rs.getString("street");

                String relation = rs.getString("relation");
                contact.relation = (relation != null) ? ERelation.valueOf(relation) : ERelation.OTHER;
                result.add(contact);
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
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException 
     */
    public static void deleteContactsFor(int refId, EContactDomain domain, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from contacts where ref_id=? and domain=?");
            stmt.setInt(1,  refId);
            stmt.setString(2,  domain.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * 
     * @param contacts
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException
     */
    public static void handleContactChanges(Collection<Contact> contacts, int refId, EContactDomain domain,
        Connection conn) throws SQLException
    {
        for (Contact contact : contacts)
        {
            ContactsDBUtil.handleContactChanges(contact, refId, domain, conn);
        }
    }

    /**
     * @param contact
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException
     */
    public static void handleContactChanges(Contact contact, int refId, EContactDomain domain, Connection conn)
        throws SQLException
    {
        switch (contact.action)
        {
            case CREATE :
                ContactsDBUtil.handleCreate(contact, refId, domain, conn);
                break;

            case MODIFY :
                ContactsDBUtil.handleUpdate(contact, conn);
                break;

            case REMOVE :
                ContactsDBUtil.handleRemove(contact.id, conn);
                break;

            default :
                break;
        }
    }


    /**
     * @param contact
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException
     */
    private static void handleCreate(Contact contact, int refId, EContactDomain domain, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement(
                "insert into contacts set zname=?, vname=?, vname2=?, title=?, phone=?, mobile=?, email=?, phone2=?, mobile2=?, email2=?, ref_id=?, domain=?, relation=?, zip_code=?, city=?, street=?");
            stmt.setString(1, contact.zname);
            stmt.setString(2, contact.vname);
            stmt.setString(3, contact.vname2);
            stmt.setString(4, contact.title);
            stmt.setString(5, contact.phone);
            stmt.setString(6, contact.mobile);
            stmt.setString(7, contact.email);
            stmt.setString(8, contact.phone2);
            stmt.setString(9, contact.mobile2);
            stmt.setString(10, contact.email2);
            stmt.setInt(11, refId);
            stmt.setString(12, domain.name());
            stmt.setString(13, contact.relation.name());
            stmt.setInt(14, contact.zipCode);
            stmt.setString(15, contact.city);
            stmt.setString(16, contact.street);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param contact
     * @param conn
     * @throws SQLException 
     */
    private static void handleUpdate(Contact contact, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement(
                "update contacts set zname=?, vname=?, vname2=?, title=?, phone=?, mobile=?, email=? , phone2=?, mobile2=?, email2=?, relation=?, zip_code=?, city=?, street=? where id=?");
            stmt.setString(1, contact.zname);
            stmt.setString(2, contact.vname);
            stmt.setString(3, contact.vname2);
            stmt.setString(4, contact.title);
            stmt.setString(5, contact.phone);
            stmt.setString(6, contact.mobile);
            stmt.setString(7, contact.email);
            stmt.setString(8, contact.phone2);
            stmt.setString(9, contact.mobile2);
            stmt.setString(10, contact.email2);
            stmt.setString(11, contact.relation.name());
            stmt.setInt(12, contact.zipCode);
            stmt.setString(13, contact.city);
            stmt.setString(14, contact.street);
            stmt.setInt(15, contact.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param id
     * @param conn
     * @throws SQLException
     */
    private static void handleRemove(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from contacts where id=?");
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
