package de.bbgs.logging;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.DBUtils;

public class AuditLog
{
    enum Mode
    {
        QUERY, UPDATE, CREATE, REMOVE
    }

    private static final int MAX_MSG_SIZE = 2048;

    /**
     * @param callee
     * @param session
     * @param conn
     * @param msgId
     * @param params
     * @throws SQLException 
     */
    public static void logQuery(Object callee, SessionWrapper session, Connection conn, String msgId, Object... params) throws SQLException
    {
        AuditLog.writeLog(callee, session, conn, Mode.QUERY, msgId, params);
    }

    /**
     * @param callee
     * @param session
     * @param conn
     * @param msgId
     * @param params
     * @throws SQLException 
     */
    public static void logUpdate(Object callee, SessionWrapper session, Connection conn, String msgId, Object... params) throws SQLException
    {
        AuditLog.writeLog(callee, session, conn, Mode.UPDATE, msgId, params);
    }

    /**
     * @param callee
     * @param session
     * @param conn
     * @param msgId
     * @param params
     * @throws SQLException 
     */
    public static void logCreate(Object callee, SessionWrapper session, Connection conn, String msgId, Object... params) throws SQLException
    {
        AuditLog.writeLog(callee, session, conn, Mode.CREATE, msgId, params);
    }

    /**
     * @param callee
     * @param session
     * @param conn
     * @param msgId
     * @param params
     * @throws SQLException 
     */
    public static void logRemove(Object callee, SessionWrapper session, Connection conn, String msgId, Object... params) throws SQLException
    {
        AuditLog.writeLog(callee, session, conn, Mode.REMOVE, msgId, params);
    }

    /**
     * @param callee
     * @param session
     * @param conn
     * @param mode
     * @param msgId
     * @param params
     * @throws SQLException 
     */
    private static void writeLog(Object callee, SessionWrapper session, Connection conn, Mode mode, String msgId,
        Object... params) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            Message msg = MessageCatalog.getMessage(callee, msgId, params);
            
            String text = (msg.getMsg().length() > MAX_MSG_SIZE) ? msg.getMsg().substring(0,  MAX_MSG_SIZE) : msg.getMsg();
            stmt = conn.prepareStatement("insert into auditlog set uid=?, timestamp=?, type=?, message=?");
            stmt.setInt(1, session.getAccountId());
            stmt.setTimestamp(2, msg.getTimestamp());
            stmt.setString(3,  mode.name());
            stmt.setString(4,  text);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
