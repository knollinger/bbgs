package de.bbgs.filesystem;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

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
public class UploadAttachmentsHandler implements IXmlServiceHandler
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
        Request req = (Request) request;

        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);

            for (UploadObj ulo : req.files)
            {
                FileSystemDBUtils.createFile(req.parentId, ulo.name, ulo.mimeType, ulo.data, session, conn);
            }
            conn.commit();
            rsp = new Response();
        }
        catch (SQLException e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }

        return rsp;
    }

    /**
     *
     */
    public static class UploadObj
    {
        @XmlElement(name = "name")
        public String name;

        @XmlElement(name = "mime-type")
        public String mimeType;

        @XmlElement(name = "data")
        public byte[] data;
    }

    /**
     *
     */
    @XmlRootElement(name = "upload-filesystem-objects-req")
    @XmlType(name = "UploadAttachmentsHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "parent-id")
        public int parentId;

        @XmlElement(name = "file")
        List<UploadObj> files = new ArrayList<>();
    }

    /**
     *
     */
    @XmlRootElement(name = "upload-filesystem-objects-ok-rsp")
    @XmlType(name = "UploadAttachmentsHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
