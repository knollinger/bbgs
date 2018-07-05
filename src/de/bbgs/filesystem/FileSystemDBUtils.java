package de.bbgs.filesystem;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import de.bbgs.attachments.Attachment;
import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
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
        FolderContentModel model = new FolderContentModel();
        model.parents = FileSystemDBUtils.getParentChain(fldrId, conn);
        model.items.addAll(FileSystemDBUtils.getSubFolders(fldrId, conn));
        model.items.addAll(FileSystemDBUtils.getFiles(fldrId, conn));
        return model;
    }

    /**
     * 
     * @param fldrId
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static List<FileSystemObject> getSubFolders(int fldrId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        List<FileSystemObject>  result = new ArrayList<>();

        try
        {
            stmt = conn.prepareStatement("select * from filesystem where type='FOLDER' and parentId=? order by name");
            stmt.setInt(1, fldrId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                FileSystemObject fso = new FileSystemObject();
                fso.id = rs.getInt("id");
                fso.parentId = fldrId;
                fso.type = FileSystemObject.TYPE.FOLDER;
                fso.name = rs.getString("name");
                fso.created = DBUtils.getTimestamp(rs, "created");
                fso.accessed = DBUtils.getTimestamp(rs, "last_accessed");
                result.add(fso);
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
     * 
     * @param fldrId
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static List<FileSystemObject> getFiles(int fldrId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        List<FileSystemObject>  result = new ArrayList<>();

        try
        {
            stmt = conn.prepareStatement("select f.*, a.mimetype from filesystem f left join attachments a on a.domain=\"FILESYS\" and a.ref_id = f.id where f.type='FILE' and parentId=? order by name;");
            stmt.setInt(1, fldrId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                FileSystemObject fso = new FileSystemObject();
                fso.id = rs.getInt("f.id");
                fso.parentId = fldrId;
                fso.type = FileSystemObject.TYPE.FILE;
                fso.name = rs.getString("f.name");
                fso.created = DBUtils.getTimestamp(rs, "f.created");
                fso.accessed = DBUtils.getTimestamp(rs, "f.last_accessed");
                fso.mimetype = rs.getString("a.mimetype");
                result.add(fso);
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
     * @param elemId
     * @param conn
     * @return
     */
    private static List<String> getParentChain(int elemId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        List<String> result = new ArrayList<>();

        try
        {
            stmt = conn.prepareStatement("select name, parentId from filesystem where id=?");
            int currId = elemId;
            while (currId != -1)
            {
                stmt.setInt(1, currId);
                rs = stmt.executeQuery();
                if (rs.next())
                {
                    result.add(0, rs.getString("name"));
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
     * @param id
     * @param name
     * @param conn
     * @throws SQLException 
     */
    public static void renameObject(int id, String name, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("update filesystem set name=? where id=?");
            stmt.setString(1, name);
            stmt.setInt(2, id);
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
    public static void removeObject(int id, Connection conn) throws SQLException
    {
        if (FileSystemDBUtils.isFolder(id, conn))
        {
            FileSystemDBUtils.removeFolder(id, conn);
        }
        else
        {
            FileSystemDBUtils.removeFile(id, conn);
        }
    }

    /**
     * @param id
     * @param conn
     * @throws SQLException 
     */
    public static void createFile(int parentId, String name, String mimeType, byte[] data, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("insert into filesystem set name=?, parentId=?, type=?");
            stmt.setString(1, name);
            stmt.setInt(2, parentId);
            stmt.setString(3, FileSystemObject.TYPE.FILE.name());
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            if (rs.next())
            {

                int fsoId = rs.getInt(1);
                Attachment a = new Attachment();
                a.name = name;
                a.mimeType = mimeType;
                a.content = data;
                AttachmentsDBUtil.createAttachment(a, fsoId, EAttachmentDomain.FILESYS, conn);
            }
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
     * @throws SQLException 
     */
    private static void removeFile(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("delete from filesystem where id=?");
            stmt.setInt(1, id);
            stmt.executeUpdate();
            AttachmentsDBUtil.deleteAttachments(id, EAttachmentDomain.FILESYS, conn);
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
    private static void removeFolder(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select id from filesystem where parentId=?");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                int childId = rs.getInt("id");
                FileSystemDBUtils.removeObject(childId, conn);
            }
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);

            stmt = conn.prepareStatement("delete from filesystem where id=?");
            stmt.setInt(1, id);
            stmt.executeUpdate();
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
    private static boolean isFolder(int id, Connection conn) throws SQLException
    {

        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select type from filesystem where id=?");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                FileSystemObject.TYPE type = FileSystemObject.TYPE.valueOf(rs.getString("type")); 
                return type.equals(FileSystemObject.TYPE.FOLDER);
            }
            return false;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
}
