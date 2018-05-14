package de.bbgs.accounting;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.accounting.ProjectModel.ProjectInvoiceItem;
import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.service.EAction;
import de.bbgs.session.AccountDBUtil;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.DBUtils;

/**
 *
 */
public class AccountingDBUtils
{
    private static final String DELETE_ITEM_SQL = "delete from invoice_items where id=?";
    private static final String UPDATE_ITEM_SQL = "update invoice_items set ref_id=?, name=?, description=?, konto=?, type=? where id=?";
    private static final String CREATE_ITEM_SQL = "insert into invoice_items set ref_id=?, name=?, description=?, konto=?, type=?";
    private static final String GET_ITEMS_SQL = "select * from invoice_items order by konto, name";
    private static final String GET_ITEMS_BYTYPE_SQL = "select * from invoice_items where type=? order by konto, name";
    private static final String GET_PROJECT_ITEM_SQL = "select * from invoice_items where ref_id=? order by konto, name";
    private static final String GET_ITEMS_BYPROJECT_SQL = "select * from invoice_items where ref_id=? order by konto, name";

    private static final String GET_ALL_INCOMMING_RECORDS_SQL = "select i.*, r.* from invoice_items i left join invoice_records r on r.to_invoice = i.id where i.type='INCOME' order by r.date, i.konto";

    private static final String CREATE_RECORD_SQL = "insert into invoice_records set from_invoice=?, to_invoice=?, amount=?, description=?, date=?";
    private static final String UPDATE_RECORD_SQL = "update invoice_records set from_invoice=?, to_invoice=?, amount=?, description=?, date=? where id=?";
    private static final String DELETE_RECORD_SQL = "delete from invoice_records where id=?";

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InvoiceItem> getAllInvoiceItems(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<InvoiceItem> result = new ArrayList<>();
            stmt = conn.prepareStatement(GET_ITEMS_SQL);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceItem item = new InvoiceItem();
                item.action = EAction.NONE;
                item.id = rs.getInt("id");
                item.kontoNr = rs.getInt("konto");
                item.name = rs.getString("name");
                item.description = rs.getString("description");
                item.type = EInvoiceItemType.valueOf(rs.getString("type"));
                result.add(item);
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
    public static Collection<InvoiceItem> getAllInvoiceItemsByType(EInvoiceItemType type, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<InvoiceItem> result = new ArrayList<>();
            stmt = conn.prepareStatement(GET_ITEMS_BYTYPE_SQL);
            stmt.setString(1, type.name());
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceItem item = new InvoiceItem();
                item.action = EAction.NONE;
                item.id = rs.getInt("id");
                item.refId = rs.getInt("ref_id");
                item.kontoNr = rs.getInt("konto");
                item.name = rs.getString("name");
                item.description = rs.getString("description");
                item.type = EInvoiceItemType.valueOf(rs.getString("type"));
                result.add(item);
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
    public static ProjectInvoiceItem getProjectItem(int projId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            ProjectInvoiceItem result = new ProjectInvoiceItem();
            if (projId == 0)
            {
                result.action = EAction.CREATE;
                result.type = EInvoiceItemType.PLANNING;
            }
            else
            {
                stmt = conn.prepareStatement(GET_PROJECT_ITEM_SQL);
                stmt.setInt(1, projId);
                rs = stmt.executeQuery();
                rs.next();

                result.action = EAction.NONE;
                result.id = rs.getInt("id");
                result.refId = rs.getInt("ref_id");
                result.kontoNr = rs.getInt("konto");
                result.name = rs.getString("name");
                result.description = rs.getString("description");
                result.type = EInvoiceItemType.valueOf(rs.getString("type"));
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
    public static Collection<InvoiceItem> getAllInvoiceItemsByProject(int projectId, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<InvoiceItem> result = new ArrayList<>();
            stmt = conn.prepareStatement(GET_ITEMS_BYPROJECT_SQL);
            stmt.setInt(1, projectId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceItem item = new InvoiceItem();
                item.action = EAction.NONE;
                item.id = rs.getInt("id");
                item.refId = rs.getInt("ref_id");
                item.kontoNr = rs.getInt("konto");
                item.name = rs.getString("name");
                item.description = rs.getString("description");
                item.type = EInvoiceItemType.valueOf(rs.getString("type"));
                result.add(item);
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
     * @param mdl
     * @param conn
     * @throws SQLException 
     */
    public static void handleInvoiceItemModelChanges(InvoiceItemModel mdl, Connection conn) throws SQLException
    {
        for (InvoiceItem item : mdl.items)
        {
            switch (item.action)
            {
                case CREATE :
                    AccountingDBUtils.createInvoiceItem(item, conn);
                    break;

                case MODIFY :
                    AccountingDBUtils.updateInvoiceItem(item, conn);
                    break;

                case REMOVE :
                    AccountingDBUtils.removeInvoiceItem(item, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param item
     * @param conn
     * @throws SQLException 
     */
    public static void createInvoiceItem(InvoiceItem item, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            item.sanitizeType();
            stmt = conn.prepareStatement(CREATE_ITEM_SQL);
            stmt.setInt(1, item.refId);
            stmt.setString(2, item.name);
            stmt.setString(3, item.description);
            stmt.setInt(4, item.kontoNr);
            stmt.setString(5, item.type.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param item
     * @param conn
     * @throws SQLException 
     */
    public static void updateInvoiceItem(InvoiceItem item, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            item.sanitizeType();
            stmt = conn.prepareStatement(UPDATE_ITEM_SQL);
            stmt.setInt(1, item.refId);
            stmt.setString(2, item.name);
            stmt.setString(3, item.description);
            stmt.setInt(4, item.kontoNr);
            stmt.setString(5, item.type.name());
            stmt.setInt(6, item.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param item
     * @param conn
     * @throws SQLException 
     */
    public static void removeInvoiceItem(InvoiceItem item, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement(DELETE_ITEM_SQL);
            stmt.setInt(1, item.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @throws SQLException 
     * 
     */
    public static InvoiceRecordsModel getIncommingRecords(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            InvoiceRecordsModel result = new InvoiceRecordsModel();
            stmt = conn.prepareStatement(GET_ALL_INCOMMING_RECORDS_SQL);
            rs = stmt.executeQuery();

            int lastId = -1;
            while (rs.next())
            {
                int id = rs.getInt("i.id");
                if (lastId != id)
                {

                    InvoiceItem item = new InvoiceItem();
                    item.id = id;
                    item.refId = -1;
                    item.action = EAction.NONE;
                    item.kontoNr = rs.getInt("i.konto");
                    item.name = rs.getString("i.name");
                    item.description = rs.getString("description");
                    item.type = EInvoiceItemType.valueOf(rs.getString("i.type"));
                    result.items.add(item);
                    lastId = id;
                }

                InvoiceRecord r = new InvoiceRecord();
                r.id = rs.getInt("r.id");
                r.action = EAction.NONE;
                r.from = 0;
                r.to = rs.getInt("r.to_invoice");
                r.amount = rs.getDouble("r.amount");
                r.description = rs.getString("r.description");
                r.date = DBUtils.getDate(rs, "r.date");
                //r.attachments = new ArrayList<>();   
                result.records.add(r);
            }

            result.users.addAll(AccountDBUtil.getAllAccounts(conn));
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param records
     * @param session
     * @param conn
     * @throws SQLException
     */
    public static void handleInvoiceRecordsChanges(Collection<? extends InvoiceRecord> records, SessionWrapper session,
        Connection conn) throws SQLException
    {
        for (InvoiceRecord record : records)
        {
            switch (record.action)
            {
                case CREATE :
                    AccountingDBUtils.createInvoiceRecord(record, session, conn);
                    break;

                case MODIFY :
                    AccountingDBUtils.updateInvoiceRecord(record, session, conn);
                    break;

                case REMOVE :
                    AccountingDBUtils.deleteInvoiceRecord(record, session, conn);
                    break;

                default :
                    break;

            }
        }
    }

    /**
     * @param rec
     * @param session
     * @param conn
     * @throws SQLException
     */
    public static void createInvoiceRecord(InvoiceRecord rec, SessionWrapper session, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(CREATE_RECORD_SQL);
            stmt.setInt(1, rec.from);
            stmt.setInt(2, rec.to);
            stmt.setDouble(3, rec.amount);
            stmt.setString(4, rec.description);
            DBUtils.setDate(stmt, 5, rec.date);
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            if (rs.next())
            {
                rec.id = rs.getInt(1);
                AttachmentsDBUtil.handleAttachmentChanges(rec.attachments, rec.id, EAttachmentDomain.ACCRECORD, session,
                    conn);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param rec
     * @param session
     * @param conn
     * @throws SQLException
     */
    public static void updateInvoiceRecord(InvoiceRecord rec, SessionWrapper session, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement(UPDATE_RECORD_SQL);
            stmt.setInt(1, rec.from);
            stmt.setInt(2, rec.to);
            stmt.setDouble(3, rec.amount);
            stmt.setString(4, rec.description);
            DBUtils.setDate(stmt, 5, rec.date);
            stmt.setInt(6, rec.id);
            stmt.executeUpdate();
            AttachmentsDBUtil.handleAttachmentChanges(rec.attachments, rec.id, EAttachmentDomain.ACCRECORD, session,
                conn);
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param rec
     * @param session
     * @param conn
     * @throws SQLException
     */
    public static void deleteInvoiceRecord(InvoiceRecord rec, SessionWrapper session, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            AttachmentsDBUtil.deleteAttachments(rec.id, EAttachmentDomain.ACCRECORD, conn);
            stmt = conn.prepareStatement(DELETE_RECORD_SQL);
            stmt.setInt(1, rec.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param itemId
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<InvoiceRecord> getIncommingRecordsByItemId(int itemId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            Collection<InvoiceRecord> result = new ArrayList<>();
            stmt = conn.prepareStatement("select * from invoice_records where to_invoice=?");
            stmt.setInt(1, itemId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceRecord r = new InvoiceRecord();
                r.action = EAction.NONE;
                r.id = rs.getInt("id");
                r.amount = rs.getDouble("amount");
                r.date = DBUtils.getDate(rs, "date");
                r.description = rs.getString("description");
                r.from = rs.getInt("from_invoice");
                r.to = rs.getInt("to_invoice");
                result.add(r);
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
     * @param itemId
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<InvoiceRecord> getOutgoingRecordsByItemId(int itemId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            Collection<InvoiceRecord> result = new ArrayList<>();
            stmt = conn.prepareStatement("select * from invoice_records where from_invoice=?");
            stmt.setInt(1, itemId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceRecord r = new InvoiceRecord();
                r.action = EAction.NONE;
                r.id = rs.getInt("id");
                r.amount = rs.getDouble("amount");
                r.date = DBUtils.getDate(rs, "date");
                r.description = rs.getString("description");
                r.from = rs.getInt("from_invoice");
                r.to = rs.getInt("to_invoice");
                result.add(r);
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
