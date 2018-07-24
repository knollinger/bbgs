package de.bbgs.accounting;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.service.EAction;
import de.bbgs.utils.DBUtils;

/**
 * Die Datenbank-Werkzeuge für die Buchhaltung
 *
 */
public class AccountingDBUtils
{
    /**
     * liefere alle InvoiceItems
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
            stmt = conn.prepareStatement("select * from invoice_items order by konto, name");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceItem i = new InvoiceItem();
                i.id = rs.getInt("id");
                i.refId = rs.getInt("ref_id");
                i.account = rs.getInt("konto");
                i.name = rs.getString("name");
                i.description = rs.getString("description");
                result.add(i);
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
     * @param items
     * @param conn
     * @throws SQLException 
     */
    public static void saveAllInvoiceItems(Collection<InvoiceItem> items, Connection conn) throws SQLException
    {
        for (InvoiceItem item : items)
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
                    AccountingDBUtils.removeInvoiceItem(item.id, conn);
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
    private static int createInvoiceItem(InvoiceItem item, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("insert into invoice_items set ref_id=?, konto=?, name=?, description=?");
            stmt.setInt(1, item.refId);
            stmt.setInt(2, item.account);
            stmt.setString(3, item.name);
            stmt.setString(4, item.description);
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
     * @param item
     * @param conn
     * @throws SQLException 
     */
    private static void updateInvoiceItem(InvoiceItem item, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement(
                "update invoice_items set ref_id=?, konto=?, name=?, description=? where id=?");
            stmt.setInt(1, item.refId);
            stmt.setInt(2, item.account);
            stmt.setString(3, item.name);
            stmt.setString(4, item.description);
            stmt.setInt(5, item.id);
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
    private static void removeInvoiceItem(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from invoice_items where id=?");
            stmt.setInt(1, id);
            stmt.executeUpdate();
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
    public static Collection<InvoiceItem> getAllIncommingItems(Connection conn) throws SQLException
    {
        Collection<InvoiceItem> result = new ArrayList<>();

        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select * from invoice_items where konto >= 5730 and konto < 5800");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceItem i = new InvoiceItem();
                i.id = rs.getInt("id");
                i.refId = rs.getInt("ref_id");
                i.account = rs.getInt("konto");
                i.name = rs.getString("name");
                i.description = rs.getString("description");
                result.add(i);
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
     * @param from
     * @param until
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InvoiceRecord> getAllIncommingRecordsBetween(Date from, Date until, Connection conn)
        throws SQLException
    {
        Collection<InvoiceRecord> result = new ArrayList<>();

        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select * from invoice_records where date between ? and ? order by date");
            stmt.setDate(1, from);
            stmt.setDate(2, until);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceRecord r = new InvoiceRecord();
                r.id = rs.getInt("id");
                r.amount = rs.getDouble("amount");
                r.source = rs.getInt("source");
                r.target = rs.getInt("target");
                r.description = rs.getString("description");
                r.date = rs.getDate("date");
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
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InvoiceRecord> getAllIncommingRecords(Connection conn) throws SQLException
    {
        Collection<InvoiceRecord> result = new ArrayList<>();

        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select * from invoice_records order by date");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceRecord r = new InvoiceRecord();
                r.id = rs.getInt("id");
                r.amount = rs.getDouble("amount");
                r.source = rs.getInt("source");
                r.target = rs.getInt("target");
                r.description = rs.getString("description");
                r.date = rs.getDate("date");
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
     * @param records
     * @param conn
     * @throws SQLException 
     */
    public static void saveAllIncommings(Collection<InvoiceRecord> records, Connection conn) throws SQLException
    {
        for (InvoiceRecord record : records)
        {
            switch (record.action)
            {
                case CREATE :
                    AccountingDBUtils.createIncomming(record, conn);
                    break;

                case MODIFY :
                    AccountingDBUtils.updateIncomming(record, conn);
                    break;

                case REMOVE :
                    AccountingDBUtils.removeIncomming(record.id, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param record
     * @param conn
     * @return
     * @throws SQLException
     */
    private static int createIncomming(InvoiceRecord record, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "insert into invoice_records set source=?, target=?, amount=?, description=?, date=?");
            stmt.setInt(1, record.source);
            stmt.setInt(2, record.target);
            stmt.setDouble(3, record.amount);
            stmt.setString(4, record.description);
            stmt.setDate(5, record.date);
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
     * @param record
     * @param conn
     * @throws SQLException
     */
    private static void updateIncomming(InvoiceRecord record, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement(
                "update invoice_records set source=?, target=?, amount=?, description=?, date=? where id=?");
            stmt.setInt(1, record.source);
            stmt.setInt(2, record.target);
            stmt.setDouble(3, record.amount);
            stmt.setString(4, record.description);
            stmt.setDate(5, record.date);
            stmt.setInt(6, record.id);
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
    private static void removeIncomming(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from invoice_records where id=?");
            stmt.setInt(1, id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /*-----------------------------------------------------------------------*/
    /*
     * All about projects
     */

    /**
     * @return die Liste aller als Projekt markierten Kurse, niemals <code>null</code>
     * @throws SQLException 
     */
    public static Collection<? extends ProjectDescription> getAllProjects(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<ProjectDescription> result = new ArrayList<>();

            stmt = conn.prepareStatement(
                "select c.id, c.name, c.description, min(t.date) AS start, max(t.date) AS end from courses c left join course_termins t on c.id = t.ref_id where c.type=\"ONETIME\" group by c.id order by start, c.name;");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                ProjectDescription p = new ProjectDescription();
                p.id = rs.getInt("c.id");
                p.name = rs.getString("c.name");
                p.description = rs.getString("c.description");
                p.from = rs.getDate("start");
                p.until = rs.getDate("end");
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
     * Lade das Model des Projektes mit der angegebenen ID
     * 
     * @param id
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static ProjectModel getProjectModel(int id, Connection conn) throws SQLException
    {
        ProjectModel model = new ProjectModel();
        model.coreData = AccountingDBUtils.getProjectCoreData(id, conn);
        model.planningItems = AccountingDBUtils.getProjectPlanningItems(id, conn);
        model.projectItem = AccountingDBUtils.getProjectItem(id, conn);
        model.invoiceRecords = AccountingDBUtils.getProjectInvoiceRecords(model.projectItem.id, conn);
        model.invoiceItems = AccountingDBUtils.getInOutInvoiceItems(conn);
        return model;
    }

    /**
     * @param id
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static ProjectDescription getProjectCoreData(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select c.id, c.name, c.description, min(t.date) AS start, max(t.date) AS end from courses c left join course_termins t on c.id = t.ref_id where c.id=? group by c.id");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                ProjectDescription c = new ProjectDescription();
                c.id = id;
                c.name = rs.getString("c.name");
                c.description = rs.getString("c.description");
                c.from = rs.getDate("start");
                c.until = rs.getDate("end");
                return c;
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
     * @param projectId
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static Collection<PlanningItem> getProjectPlanningItems(int projectId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<PlanningItem> response = new ArrayList<>();

            stmt = conn.prepareStatement("select * from planning_items where proj_id=?");
            stmt.setInt(1, projectId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                PlanningItem p = new PlanningItem();
                p.action = EAction.NONE;
                p.id = rs.getInt("id");
                p.projId = rs.getInt("proj_id");
                p.invItemId = rs.getInt("invoice_item_id");
                p.amount = rs.getDouble("amount");
                p.description = rs.getString("description");
                response.add(p);
            }
            return response;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
    /**
     * @param projId
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static InvoiceItem getProjectItem(int projId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from invoice_items where ref_id=? and konto=?");
            stmt.setInt(1, projId);
            stmt.setInt(2, 0);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                InvoiceItem i = new InvoiceItem();
                i.id = rs.getInt("id");
                i.action = EAction.NONE;
                i.refId = rs.getInt("ref_id");
                i.account = 0;
                i.name = rs.getString("name");
                i.description = rs.getString("description");
                return i;
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
     * @param planningItemId
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static Collection<InvoiceRecord> getProjectInvoiceRecords(int planningItemId, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<InvoiceRecord> response = new ArrayList<>();

            stmt = conn.prepareStatement("select * from invoice_records where source=? or target=?");
            stmt.setInt(1, planningItemId);
            stmt.setInt(2, planningItemId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceRecord r = new InvoiceRecord();
                r.action = EAction.NONE;
                r.id = rs.getInt("id");
                r.source = rs.getInt("source");
                r.target = rs.getInt("target");
                r.amount = rs.getDouble("amount");
                r.description = rs.getString("description");
                r.date = rs.getDate("date");
                response.add(r);
            }
            return response;
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
    private static Collection<InvoiceItem> getInOutInvoiceItems(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Collection<InvoiceItem> response = new ArrayList<>();

            stmt = conn.prepareStatement("select * from invoice_items where konto != 0");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                InvoiceItem r = new InvoiceItem();
                r.action = EAction.NONE;
                r.id = rs.getInt("id");
                r.refId = rs.getInt("ref_id");
                r.account = rs.getInt("konto");
                r.name = rs.getString("name");
                r.description = rs.getString("description");
                response.add(r);
            }
            return response;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
}
