package de.bbgs.filesystem;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import de.bbgs.utils.DBUtils;

/**
 *
 */
public class FileSystemDBUtils
{
    /**
     * 
     * @param fldrId
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static FolderContentModel getFolderContentModel(int fldrId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        FolderContentModel model = new FolderContentModel();
        try
        {
            stmt = conn.prepareStatement("select * from filesystem where parentId=? order by name");
            stmt.setInt(1, fldrId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                FileSystemObject fsObject = FileSystemDBUtils.loadFSObjectFromResultSet(rs);
                model.items.add(fsObject);
            }
            model.parents = FileSystemDBUtils.getParentChain(fldrId, conn);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return model;
    }

    /**
     * @param elemId
     * @param conn
     * @return
     */
    private static List<FileSystemObject> getParentChain(int elemId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        List<FileSystemObject> result = new ArrayList<>();

        try
        {
            stmt = conn.prepareStatement("select * from filesystem where id=?");
            int currId = elemId;
            while (currId != -1)
            {
                stmt.setInt(1, currId);
                rs = stmt.executeQuery();
                if (rs.next())
                {
                    result.add(0, FileSystemDBUtils.loadFSObjectFromResultSet(rs));
                    currId = rs.getInt("parentId");
                }
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
     * @param rs
     * @return
     * @throws SQLException 
     */
    private static FileSystemObject loadFSObjectFromResultSet(ResultSet rs) throws SQLException
    {

        FileSystemObject fso = new FileSystemObject();
        fso.id = rs.getInt("id");
        fso.parentId = rs.getInt("parentId");
        fso.blobId = rs.getInt("blobId");
        fso.name = rs.getString("name");
        fso.created = DBUtils.getTimestamp(rs, "created");
        fso.accessed = DBUtils.getTimestamp(rs, "last_accessed");
        return fso;
    }
}
