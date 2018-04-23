package de.bbgs.notes;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import de.bbgs.service.EAction;
import de.bbgs.utils.DBUtils;

public class NotesDBUtil
{
    public static Collection<Note> getAllNotes(int refId, ENoteDomain domain, Connection conn) throws SQLException
    {
        Collection<Note> result = new ArrayList<Note>();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from notes where ref_id=? and domain=?");
            stmt.setInt(1, refId);
            stmt.setString(2, domain.name());
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Note note = new Note();
                note.id = rs.getInt("id");
                note.action = EAction.NONE;
                note.description = rs.getString("note");
                note.type = translateType(rs.getString("title"));
                result.add(note);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return result;
    }

    /**
     * @param notes
     * @param conn
     * @throws SQLExcception
     */
    public static void handleNoteChanges(Collection<Note> notes, int refId, ENoteDomain domain, Connection conn) throws SQLException
    {
        for (Note note : notes)
        {
            switch (note.action)
            {
                case CREATE :
                    NotesDBUtil.createNote(note, refId, domain, conn);
                    break;

                case MODIFY :
                    NotesDBUtil.updateNote(note, conn);
                    break;

                case REMOVE :
                    NotesDBUtil.deleteNote(note, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param note
     * @param refId
     * @param domain
     * @param conn
     * @throws SQLException 
     */
    private static void createNote(Note note, int refId, ENoteDomain domain, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into notes set ref_id=?, title=?, note=?, domain=?");
            stmt.setInt(1, refId);
            stmt.setString(2, note.type.name());
            stmt.setString(3, note.description);
            stmt.setString(4, domain.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param note
     * @param conn
     * @throws SQLException
     */
    private static void updateNote(Note note, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("update notes set title=?, note=? where id=?");
            stmt.setString(1, note.type.name());
            stmt.setString(2, note.description);
            stmt.setInt(3, note.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param note
     * @param conn
     * @throws SQLException
     */
    private static void deleteNote(Note note, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from notes where id=?");
            stmt.setInt(1, note.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
        
    }

    /**
     * @param note
     * @param conn
     * @throws SQLException
     */
    public static void deleteNotesFor(int id, ENoteDomain domain, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from notes where ref_id=? AND domain=?");
            stmt.setInt(1, id);
            stmt.setString(2, domain.name());
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
        
    }
    
    private static ENoteType translateType(String text)
    {
        ENoteType type = ENoteType.UNKNOWN;
        try
        {
            type = ENoteType.valueOf(text);
        }
        catch (IllegalArgumentException e)
        {
            type = ENoteType.UNKNOWN;
        }
        return type;
    }
}
