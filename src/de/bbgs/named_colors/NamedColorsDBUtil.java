package de.bbgs.named_colors;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import de.bbgs.service.EAction;
import de.bbgs.utils.DBUtils;

/**
 * 
 * @author anderl
 *
 */
public class NamedColorsDBUtil
{
    /**
     * @param conn
     * @return die Collection aller NamedColors
     * @throws SQLException
     */
    public static List<NamedColor> getAllNamedColors(Connection conn) throws SQLException
    {

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from named_colors");
            rs = stmt.executeQuery();

            List<NamedColor> result = new ArrayList<>();
            while (rs.next())
            {
                NamedColor nc = new NamedColor();
                nc.id = rs.getInt("id");
                nc.action = EAction.NONE;
                nc.name = rs.getString("name");
                nc.value = rs.getString("color");
                result.add(nc);
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
     * @param model
     * @param conn
     * @throws SQLException
     */
    public static void saveNamedColors(NamedColorsModel model, Connection conn) throws SQLException
    {
        for (NamedColor color : model.colors)
        {
            switch (color.action)
            {
                case CREATE :
                    NamedColorsDBUtil.createColor(color, conn);
                    break;

                case MODIFY :
                    NamedColorsDBUtil.updateColor(color, conn);
                    break;

                case REMOVE :
                    NamedColorsDBUtil.removeColor(color, conn);
                    break;

                default :
                    break;
            }
        }
    }

    /**
     * @param color
     * @param conn
     * @throws SQLException 
     */
    private static void createColor(NamedColor color, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into named_colors set name=?, color=?");
            stmt.setString(1, color.name);
            stmt.setString(2, color.value);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param color
     * @param conn
     * @throws SQLException 
     */
    private static void updateColor(NamedColor color, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("update named_colors set name=?, color=? where id=?");
            stmt.setString(1, color.name);
            stmt.setString(2, color.value);
            stmt.setInt(3,  color.id);
            stmt.executeUpdate();

        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param color
     * @param conn
     * @throws SQLException 
     */
    private static void removeColor(NamedColor color, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;

        try
        {
            stmt = conn.prepareStatement("delete from named_colors where id=?");
            stmt.setInt(1,  color.id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
