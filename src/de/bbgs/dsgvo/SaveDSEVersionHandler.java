package de.bbgs.dsgvo;

import java.io.ByteArrayInputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
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
public class SaveDSEVersionHandler implements IXmlServiceHandler
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

        Request req = (Request) request;
        if (!req.type.equalsIgnoreCase("application/pdf"))
        {
            rsp = new ErrorResponse("Die Datenschutzerklärung muss als PDF vorliegen!");
        }
        else
        {
            try
            {
                conn = ConnectionPool.getConnection();
                stmt = conn.prepareStatement(
                    "insert into attachments set domain=?, file_name=?, file=?, mimetype=?, attached_from=?, attached_at=?, ref_id=0");
                stmt.setString(1, EAttachmentDomain.DSE.name());
                stmt.setString(2, req.name);
                stmt.setBlob(3, new ByteArrayInputStream(req.data));
                stmt.setString(4, req.type);
                stmt.setInt(5, session.getAccountId());
                stmt.setTimestamp(6, new Timestamp(System.currentTimeMillis()));
                stmt.executeUpdate();
                rsp = new Response();
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
        }
        return rsp;
    }

    @XmlRootElement(name = "save-dse-version-req")
    @XmlType(name = "SaveDSEVersionHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "name")
        public String name = "";

        @XmlElement(name = "type")
        public String type = "";

        @XmlElement(name = "data")
        public byte[] data = new byte[0];
    }


    @XmlRootElement(name = "save-dse-version-ok-rsp")
    @XmlType(name = "SaveDSEVersionsHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
