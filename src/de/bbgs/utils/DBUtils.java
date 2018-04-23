package de.bbgs.utils;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Time;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;

/**
 * 
 *
 */
public class DBUtils
{
    private static final SimpleDateFormat DATE_FMT = new SimpleDateFormat("dd.MM.yyyy");
    private static final SimpleDateFormat TIME_FMT = new SimpleDateFormat("HH:mm");
    private static final SimpleDateFormat TIMESTAMP_FMT = new SimpleDateFormat("dd.MM.yyyy-HH:mm:ss");

    /**
     * @param conn
     */
    public static void closeQuitly(Connection conn)
    {
        if (conn != null)
        {
            try
            {
                conn.close();
            }
            catch (SQLException e)
            {
                // quitly means quitly!
            }
        }
    }

    /**
     * @param stmt
     */
    public static void closeQuitly(Statement stmt)
    {
        if (stmt != null)
        {
            try
            {
                stmt.close();
            }
            catch (SQLException e)
            {
                // quitly means quitly!
            }
        }
    }


    /**
     * @param rs
     */
    public static void closeQuitly(ResultSet rs)
    {
        if (rs != null)
        {
            try
            {
                rs.close();
            }
            catch (SQLException e)
            {
                // quitly means quitly!
            }
        }
    }

    /**
     * @param rs
     * @param name
     * @return
     * @throws SQLException 
     */
    public static String getDate(ResultSet rs, String name) throws SQLException
    {
        Date date = rs.getDate(name);
        if (date == null)
        {
            return "";
        }
        return DATE_FMT.format(date);
    }

    /**
     * @throws SQLException 
     * 
     */
    public static void setDate(PreparedStatement stmt, int idx, String value) throws SQLException
    {
        Date date = null;
        if(value != null && !value.equals("")) {

            try
            {
                date = new Date(DATE_FMT.parse(value.trim()).getTime());
            }
            catch (ParseException e)
            {
                throw new SQLException(String.format("'%1$s' is not a valid date string", value));
            }
        }
        stmt.setDate(idx,  date);
    }

    /**
     * @param rs
     * @param name
     * @return
     * @throws SQLException 
     */
    public static String getTime(ResultSet rs, String name) throws SQLException
    {
        Time time = rs.getTime(name);
        if (time == null)
        {
            return "";
        }
        return TIME_FMT.format(time);
    }

    /**
     * @throws SQLException 
     * 
     */
    public static void setTime(PreparedStatement stmt, int idx, String value) throws SQLException
    {
        Time time = null;
        if(value != null && !value.equals("")) {

            try
            {
                time = new Time(TIME_FMT.parse(value.trim()).getTime());
            }
            catch (ParseException e)
            {
                throw new SQLException(String.format("'%1$s' is not a valid time string", value));
            }
        }
        stmt.setTime(idx,  time);
    }

    /**
     * @param rs
     * @param name
     * @return
     * @throws SQLException 
     */
    public static String getTimestamp(ResultSet rs, String name) throws SQLException
    {
        Timestamp time = rs.getTimestamp(name);
        if (time == null)
        {
            return "";
        }
        return TIMESTAMP_FMT.format(time);
    }

    /**
     * @throws SQLException 
     * 
     */
    public static void setTimestamp(PreparedStatement stmt, int idx, String value) throws SQLException
    {
        Timestamp time = null;
        if(value != null && !value.equals("")) {

            try
            {
                time = new Timestamp(TIMESTAMP_FMT.parse(value).getTime());
            }
            catch (ParseException e)
            {
                throw new SQLException(String.format("'%1$s' is not a valid timestamp string", value));
            }
        }
        stmt.setTimestamp(idx,  time);
    }
}
