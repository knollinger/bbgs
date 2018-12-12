package de.bbgs.dsgvo;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 *
 */
public class GetDSEVersionsHandler implements IXmlServiceHandler
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
            stmt = conn.prepareStatement("select a.id, a.file_name, a.attached_at, u.accountName from attachments a left join user_accounts u on a.attached_from=u.id where domain=? order by a.attached_at desc");
            stmt.setString(1, EAttachmentDomain.DSE.name());
            rs = stmt.executeQuery();
            while (rs.next())
            {
                DSEVersion v = new DSEVersion();
                v.id = rs.getInt("a.id");
                v.accountName = rs.getString("u.accountName");
                v.date = DBUtils.getTimestamp(rs, "a.attached_at");
                v.fileName = rs.getString("a.file_name");
                response.versions.add(v);
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

    @XmlRootElement(name = "get-dse-versions-req")
    @XmlType(name = "GetDSEVersionsHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    public static class DSEVersion
    {
        @XmlElement(name = "id")
        public int id = 0;

        @XmlElement(name = "date")
        public String date = "";

        @XmlElement(name = "file-name")
        public String fileName;

        @XmlElement(name = "account")
        public String accountName;
    }

    @XmlRootElement(name = "get-dse-versions-ok-rsp")
    @XmlType(name = "GetDSEVersionsHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "version")
        @XmlElementWrapper(name = "versions")
        public List<DSEVersion> versions = new ArrayList<>();
    }
}
