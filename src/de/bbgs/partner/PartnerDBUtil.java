package de.bbgs.partner;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.contacts.ContactsDBUtil;
import de.bbgs.contacts.EContactDomain;
import de.bbgs.notes.ENoteDomain;
import de.bbgs.notes.NotesDBUtil;
import de.bbgs.utils.DBUtils;

/**
 * 
 *
 */
public class PartnerDBUtil
{
    /**
     * 
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static List<Partner> getAllPartners(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from partner order by type, name");
            rs = stmt.executeQuery();

            List<Partner> result = new ArrayList<Partner>();
            while (rs.next())
            {
                Partner p = new Partner();
                PartnerDBUtil.loadPartnerFromResultSet(rs, p);
                result.add(p);
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
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static List<Partner> getAllCoopPartners(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from partner where type=? order by name");
            stmt.setString(1, EPartnerType.COOP.name());
            rs = stmt.executeQuery();

            List<Partner> result = new ArrayList<Partner>();
            while (rs.next())
            {
                Partner p = new Partner();
                PartnerDBUtil.loadPartnerFromResultSet(rs, p);
                result.add(p);
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
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static List<Partner> getAllSponsorPartners(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from partner where type=? order by name ");
            stmt.setString(1, EPartnerType.SPONSOR.name());
            rs = stmt.executeQuery();

            List<Partner> result = new ArrayList<Partner>();
            while (rs.next())
            {
                Partner p = new Partner();
                PartnerDBUtil.loadPartnerFromResultSet(rs, p);
                result.add(p);
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
    public static PartnerModel getPartnerModel(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            PartnerModel result = new PartnerModel();
            if (id != 0)
            {
                stmt = conn.prepareStatement("select * from partner where id=?");
                stmt.setInt(1, id);
                rs = stmt.executeQuery();
                if (rs.next())
                {
                    PartnerDBUtil.loadPartnerFromResultSet(rs, result.coreData);
                    result.contacts.addAll(ContactsDBUtil.getAllContacts(id, EContactDomain.PARTNER, conn));
                    result.notes.addAll(NotesDBUtil.getAllNotes(id, ENoteDomain.PARTNER, conn));
                    result.attachments.addAll(AttachmentsDBUtil.getAllAttachments(id, EAttachmentDomain.PARTNER, conn));
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
     * @param rs
     * @return
     * @throws SQLException
     */
    private static void loadPartnerFromResultSet(ResultSet rs, Partner p) throws SQLException
    {
        p.id = rs.getInt("id");
        p.type = EPartnerType.valueOf(rs.getString("type"));
        p.name = rs.getString("name");
        p.desc = rs.getString("description");
        p.partnerSince = DBUtils.getDate(rs, "partner_from");
        p.partnerUntil = DBUtils.getDate(rs, "partner_until");
        p.zipCode = rs.getInt("zipcode");
        p.city = rs.getString("city");
        p.street = rs.getString("street");
        p.homepage = rs.getString("homepage");
    }


    /**
     * @param coreData
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static int createPartner(Partner coreData, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("insert into partner set type=?, name=?, description=?, partner_from=?, partner_until=?, zipcode=?, city=?, street=?, homepage=?");
            stmt.setString(1, coreData.type.name());
            stmt.setString(2, coreData.name);
            stmt.setString(3, coreData.desc);
            DBUtils.setDate(stmt, 4, coreData.partnerSince);
            DBUtils.setDate(stmt, 5, coreData.partnerUntil);
            stmt.setInt(6,  coreData.zipCode);
            stmt.setString(7,  coreData.city);
            stmt.setString(8,  coreData.street);
            stmt.setString(9,  coreData.homepage);
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
     * @param coreData
     * @param conn
     * @throws SQLException 
     */
    public static void updatePartner(Partner coreData, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("update partner set type=?, name=?, description=?, partner_from=?, partner_until=?, zipcode=?, city=?, street=?, homepage=? where id=?");
            stmt.setString(1, coreData.type.name());
            stmt.setString(2, coreData.name);
            stmt.setString(3, coreData.desc);
            DBUtils.setDate(stmt, 4, coreData.partnerSince);
            DBUtils.setDate(stmt, 5, coreData.partnerUntil);
            stmt.setInt(6,  coreData.zipCode);
            stmt.setString(7,  coreData.city);
            stmt.setString(8,  coreData.street);
            stmt.setString(9,  coreData.homepage);
            stmt.setInt(10,  coreData.id);
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
    public static void deletePartner(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from partner where id=?");
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
