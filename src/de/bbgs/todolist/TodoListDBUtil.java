package de.bbgs.todolist;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.service.EAction;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.DBUtils;

/**
 *
 */
public class TodoListDBUtil
{

    public static Collection<TodoTask> getAllTasks(Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            Collection<TodoTask> result = new ArrayList<>();

            stmt = conn.prepareStatement("select * from todolist order by todo_date");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                TodoTask t = new TodoTask();
                t.id = rs.getInt("id");
                t.action = EAction.NONE;
                t.title = rs.getString("title");
                t.description = rs.getString("description");
                t.todoDate = DBUtils.getDate(rs, "todo_date");
                t.rememberDate = DBUtils.getDate(rs, "remember_date");
                t.userId = rs.getInt("userid");

                t.attachments.addAll(AttachmentsDBUtil.getAllAttachments(t.id, EAttachmentDomain.TODOLIST, conn));
                result.add(t);
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
     * @param domain
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<? extends TodoTask> getAllTasksByRefId(int id, ETaskDomain domain, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            Collection<TodoTask> result = new ArrayList<>();

            stmt = conn.prepareStatement("select * from todolist where domain=? and ref_id=? order by todo_date");
            stmt.setString(1, domain.name());
            stmt.setInt(2, id);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                TodoTask t = new TodoTask();
                t.action = EAction.NONE;
                t.id = rs.getInt("id");
                t.title = rs.getString("title");
                t.description = rs.getString("description");
                t.todoDate = DBUtils.getDate(rs, "todo_date");
                t.rememberDate = DBUtils.getDate(rs, "remember_date");
                t.userId = rs.getInt("userid");
                
                t.attachments.addAll(AttachmentsDBUtil.getAllAttachments(t.id, EAttachmentDomain.TODOLIST, conn));
                result.add(t);
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
     * @param tasks
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException
     */
    public static void handleTodoListChanges(Collection<TodoTask> tasks, int refId, ETaskDomain domain,
        SessionWrapper session, Connection conn) throws SQLException
    {
        for (TodoTask task : tasks)
        {
            switch (task.action)
            {
                case CREATE :
                    TodoListDBUtil.createTask(task, refId, domain, session, conn);
                    break;

                case MODIFY :
                    TodoListDBUtil.updateTask(task, refId, domain, session, conn);
                    break;

                case REMOVE :
                    TodoListDBUtil.removeTask(task, refId, domain, session, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param task
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException 
     */
    private static void createTask(TodoTask task, int refId, ETaskDomain domain, SessionWrapper session, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            // color?
            stmt = conn.prepareStatement(
                "insert into todolist set ref_id=?, domain=?, title=?, description=?, todo_date=?, remember_date=?, userid=?");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            stmt.setString(3, task.title);
            stmt.setString(4, task.description);
            DBUtils.setDate(stmt, 5, task.todoDate);
            DBUtils.setDate(stmt, 6, task.rememberDate);
            stmt.setInt(7, task.userId);
            stmt.executeUpdate();
            
            rs = stmt.getGeneratedKeys();
            if(rs.next()) {
                task.id = rs.getInt(1);
                AttachmentsDBUtil.handleAttachmentChanges(task.attachments, task.id, EAttachmentDomain.TODOLIST, session, conn);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param task
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException 
     */
    private static void updateTask(TodoTask task, int refId, ETaskDomain domain, SessionWrapper session, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            // color?
            stmt = conn.prepareStatement(
                "update todolist set ref_id=?, domain=?, title=?, description=?, todo_date=?, remember_date=?, userid=? where id=?");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            stmt.setString(3, task.title);
            stmt.setString(4, task.description);
            DBUtils.setDate(stmt, 5, task.todoDate);
            DBUtils.setDate(stmt, 6, task.rememberDate);
            stmt.setInt(7, task.userId);
            stmt.setInt(8, task.id);
            stmt.executeUpdate();
            AttachmentsDBUtil.handleAttachmentChanges(task.attachments, task.id, EAttachmentDomain.TODOLIST, session, conn);
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param task
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException 
     */
    private static void removeTask(TodoTask task, int refId, ETaskDomain domain, SessionWrapper session, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            AttachmentsDBUtil.deleteAttachments(task.id, EAttachmentDomain.TODOLIST, conn);
            stmt = conn.prepareStatement("delete from todolist where id=?");
            stmt.setInt(1, task.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param refId
     * @param partnertermin
     * @param conn
     * @throws SQLException 
     */
    public static void deleteTasksFor(int refId, ETaskDomain domain, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from todolist where ref_id=? and domain=?");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
