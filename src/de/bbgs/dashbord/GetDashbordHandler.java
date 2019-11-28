package de.bbgs.dashbord;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * @author anderl
 *
 */
public class GetDashbordHandler implements IXmlServiceHandler
{
    private static final long DAY_IN_MILLIES = 1000 * 60 * 60 * 24;

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#handleRequest(de.bbgs.xml.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Connection conn = null;
        IJAXBObject result = null;

        try
        {
            conn = ConnectionPool.getConnection();

            Response rsp = new Response();
            rsp.entries.addAll(this.scanBirthdays(conn));
            rsp.entries.addAll(this.scanCourses(conn));
            Collections.sort(rsp.entries, new DashbordEntryComparator());
            result = rsp;
        }
        catch (Exception e)
        {
            result = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return result;
    }

    /**
     * @param conn
     * @return
     * @throws SQLException 
     */
    private List<DashbordEntry> scanBirthdays(Connection conn) throws SQLException
    {
        List<DashbordEntry> result = new ArrayList<>();        
        Date from = new Date(System.currentTimeMillis());
        Date until = new Date(System.currentTimeMillis() + 7 * DAY_IN_MILLIES);

        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement(
                "select zname, vname, birth_date from members where birth_date between ? and ?");
            stmt.setDate(1, from);
            stmt.setDate(2, until);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                DashbordEntry dbe = new DashbordEntry();
                dbe.type = EDashbordEntryType.BIRTHDAY;
                dbe.date = rs.getDate("birth_date");
                dbe.title = String.format("%Geburtstag 1$s %2$s", rs.getString("name"), rs.getString("zname"));
                dbe.text = "";
                result.add(dbe);
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
     */
    private List<DashbordEntry> scanCourses(Connection conn)
    {
        List<DashbordEntry> result = new ArrayList<>();
        
        return result;
    }

    @XmlRootElement(name = "get-dashbord-req")
    @XmlType(name = "GetDashbordHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    @XmlRootElement(name = "get-dashbord-ok-rsp")
    @XmlType(name = "GetDashbordHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "entry")
        @XmlElementWrapper(name = "entries")
        List<DashbordEntry> entries = new ArrayList<>();
    }
}
