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
import de.bbgs.notes.ENoteDomain;
import de.bbgs.notes.NotesDBUtil;
import de.bbgs.service.EAction;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.DBUtils;

/**
 *
 */
public class ProjectsDBUtils
{
    /**
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<Project> getAllProjects(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Collection<Project> result = new ArrayList<>();

        try
        {
            stmt = conn.prepareStatement("select * from projects order by `from`");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Project p = ProjectsDBUtils.getProjectFromResultSet(rs);
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
     * @param id
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static ProjectModel getProjectModel(int id, Connection conn) throws SQLException
    {
        ProjectModel mdl = new ProjectModel();
        if (id != 0)
        {
            mdl.coreData = ProjectsDBUtils.getProjectById(id, conn);
            mdl.notes.addAll(NotesDBUtil.getAllNotes(id, ENoteDomain.PROJECT, conn));
            mdl.attachments.addAll(AttachmentsDBUtil.getAllAttachments(id, EAttachmentDomain.PROJECT, conn));

            mdl.planningItems = ProjectsDBUtils.getPlanningItemsFor(id, conn);
        }
        mdl.projAccount = AccountingDBUtils.getProjectItem(id, conn);
        mdl.projAccount.incomeRecords = AccountingDBUtils.getIncommingRecordsByItemId(mdl.projAccount.id, conn);
        mdl.projAccount.outgoRecords = AccountingDBUtils.getOutgoingRecordsByItemId(mdl.projAccount.id, conn);
        mdl.invoiceItems.addAll(AccountingDBUtils.getAllInvoiceItemsByType(EInvoiceItemType.INCOME, conn));
        mdl.invoiceItems.addAll(AccountingDBUtils.getAllInvoiceItemsByType(EInvoiceItemType.OUTGO, conn));
        return mdl;
    }

    /**
     * @param projId
     * @param conn
     * @return
     * @throws SQLException
     */
    private static Collection<PlanningItem> getPlanningItemsFor(int projId, Connection conn) throws SQLException
    {
        Collection<PlanningItem> result = new ArrayList<>();
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select p.*,i.konto from planning_items p left join invoice_items i on p.item_ref = i.id where p.proj_ref=? order by i.konto");
            stmt.setInt(1, projId);
            rs = stmt.executeQuery();

            while (rs.next())
            {
                PlanningItem p = new PlanningItem();
                p.id = rs.getInt("p.id");
                p.projRef = rs.getInt("p.proj_ref");
                p.itemRef = rs.getInt("p.item_ref");
                p.kontoNr = rs.getInt("i.konto");
                p.amount = rs.getDouble("p.amount");
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
     * @param id
     * @param conn
     * @return
     * @throws SQLException
     */
    private static Project getProjectById(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select * from projects where id=?");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                return ProjectsDBUtils.getProjectFromResultSet(rs);
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
    private static Project getProjectFromResultSet(ResultSet rs) throws SQLException
    {

        Project p = new Project();
        p.id = rs.getInt("id");
        p.action = EAction.NONE;
        p.name = rs.getString("name");
        p.description = rs.getString("description");
        p.from = DBUtils.getDate(rs, "from");
        p.until = DBUtils.getDate(rs, "until");
        return p;
    }

    /*-----------------------------------------------------------------------*/
    /**
     * 
     * @param mdl
     * @param conn
     * @throws SQLException 
     */
    public static void saveProjectModel(ProjectModel mdl, SessionWrapper session, Connection conn) throws SQLException
    {
        int projId = mdl.coreData.id;
        switch (mdl.coreData.action)
        {
            case CREATE :
                projId = ProjectsDBUtils.createProject(mdl.coreData, conn);
                break;

            case MODIFY :
                ProjectsDBUtils.updateProject(mdl.coreData, conn);
                break;

            default :
                break;
        }

        NotesDBUtil.handleNoteChanges(mdl.notes, projId, ENoteDomain.PROJECT, conn);
        AttachmentsDBUtil.handleAttachmentChanges(mdl.attachments, projId, EAttachmentDomain.PROJECT, session, conn);
        ProjectsDBUtils.savePlanningItems(projId, mdl.planningItems, conn);
        ProjectsDBUtils.saveProjectItem(projId, mdl.projAccount, session, conn);
    }

    /**
     * @param coreData
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static int createProject(Project coreData, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("insert into projects set `name`=?, `description`=?, `from`=?, `until`=?");
            stmt.setString(1, coreData.name);
            stmt.setString(2, coreData.description);
            DBUtils.setDate(stmt, 3, coreData.from);
            DBUtils.setDate(stmt, 4, coreData.until);
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
    private static void updateProject(Project coreData, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement(
                "update projects set `name`=?, `description`=?, `from`=?, `until`=? where id=?");
            stmt.setString(1, coreData.name);
            stmt.setString(2, coreData.description);
            DBUtils.setDate(stmt, 3, coreData.from);
            DBUtils.setDate(stmt, 4, coreData.until);
            stmt.setInt(5, coreData.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param projItem
     * @param conn
     * @throws SQLException 
     */
    private static void saveProjectItem(int projId, ProjectInvoiceItem projItem, SessionWrapper session,
        Connection conn) throws SQLException
    {
        int itemId = projItem.id;
        projItem.refId = projId;
        switch (projItem.action)
        {
            case CREATE :
                itemId = ProjectsDBUtils.createProject(projItem, conn);
                break;

            case MODIFY :
                ProjectsDBUtils.updateProject(projItem, conn);
                break;

            default :
                break;
        }

        for (InvoiceRecord r : projItem.incomeRecords)
        {
            r.to = itemId;
        }
        AccountingDBUtils.handleInvoiceRecordsChanges(projItem.incomeRecords, session, conn);

        for (InvoiceRecord r : projItem.outgoRecords)
        {
            r.from = itemId;
        }
        AccountingDBUtils.handleInvoiceRecordsChanges(projItem.outgoRecords, session, conn);
    }

    /**
     * @param projItem
     * @param conn
     * @return
     * @throws SQLException 
     */
    private static int createProject(ProjectInvoiceItem projItem, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "insert into invoice_items set ref_id=?, type=?, konto=?, name=?, description=?");
            stmt.setInt(1, projItem.refId);
            stmt.setString(2, EInvoiceItemType.PLANNING.name());
            stmt.setInt(3, 0);
            stmt.setString(4, "");
            stmt.setString(5, "");
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
     * @param projItem
     * @param conn
     * @throws SQLException 
     */
    private static void updateProject(ProjectInvoiceItem projItem, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement(
                "update invoice_items set ref-id=?, type=?, konto=?, name=?, description=? where id=?");
            stmt.setInt(1, projItem.refId);
            stmt.setString(2, EInvoiceItemType.PLANNING.name());
            stmt.setInt(3, 0);
            stmt.setString(4, "");
            stmt.setString(5, "");
            stmt.setInt(6, projItem.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param planningItems
     * @param conn
     * @throws SQLException 
     */
    private static void savePlanningItems(int projId, Collection<PlanningItem> planningItems, Connection conn)
        throws SQLException
    {
        for (PlanningItem planningItem : planningItems)
        {
            switch (planningItem.action)
            {
                case CREATE :
                    ProjectsDBUtils.createPlanningItem(projId, planningItem, conn);
                    break;

                case MODIFY :
                    ProjectsDBUtils.updatePlanningItem(projId, planningItem, conn);
                    break;

                case REMOVE :
                    ProjectsDBUtils.removePlanningItem(projId, planningItem, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param projId
     * @param planningItem
     * @param conn
     * @throws SQLException 
     */
    private static void createPlanningItem(int projId, PlanningItem planningItem, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into planning_items set proj_ref=?, item_ref=?, amount=?");
            stmt.setInt(1, projId);
            stmt.setInt(2, planningItem.itemRef);
            stmt.setDouble(3, planningItem.amount);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param projId
     * @param planningItem
     * @param conn
     * @throws SQLException 
     */
    private static void updatePlanningItem(int projId, PlanningItem planningItem, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update planning_items set proj_ref=?, item_ref=?, amount=? where id=?");
            stmt.setInt(1, projId);
            stmt.setInt(2, planningItem.itemRef);
            stmt.setDouble(3, planningItem.amount);
            stmt.setInt(4, planningItem.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }

    }

    /**
     * @param projId
     * @param planningItem
     * @param conn
     * @throws SQLException 
     */
    private static void removePlanningItem(int projId, PlanningItem planningItem, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from planning_items where id=?");
            stmt.setInt(1, planningItem.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
