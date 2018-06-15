package de.bbgs.dsgvo;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
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
public class GetDSGVOOverviewHandler implements IXmlServiceHandler
{

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
        IJAXBObject rsp = null;
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            Response response = new Response();
            
            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select id, vname, zname, email, dsgvo_state, dsgvo_date from members order by zname, vname");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                Item i = new Item();
                i.id = rs.getInt("id");
                i.zname = rs.getString("zname");
                i.vname = rs.getString("vname");
                i.email = rs.getString("email");
                i.state = EDSGVOState.valueOf(rs.getString("dsgvo_state"));
                i.date = DBUtils.getDate(rs, "dsgvo_date");
                response.dsgvoItems.add(i);
            }
            rsp = response;
        }
        catch (SQLException e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);            
            DBUtils.closeQuitly(conn);
        }
        return rsp;
    }

    @XmlRootElement(name = "get-dsgvo-overview-req")
    @XmlType(name = "GetDSGVOOverviewHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    /**
     *
     */
    @XmlType(name="GetDSGVOOverviewHandler.Response.Item")
    public static class Item
    {
        @XmlElement(name = "id")
        public int id;

        @XmlElement(name = "vname")
        public String vname;

        @XmlElement(name = "zname")
        public String zname;

        @XmlElement(name = "email")
        public String email;
        
        @XmlElement(name="state")
        public EDSGVOState state;
        
        @XmlElement(name="date")
        public String date;
    }

    @XmlRootElement(name = "get-dsgvo-overview-ok-rsp")
    @XmlType(name = "GetDSGVOOverviewHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "dsgvo-item")
        public Collection<Item> dsgvoItems = new ArrayList<>();
    }
}
