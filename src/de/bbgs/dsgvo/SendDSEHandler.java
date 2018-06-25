package de.bbgs.dsgvo;

import java.sql.Connection;
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
public class SendDSEHandler implements IXmlServiceHandler
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

        try
        {
            conn = ConnectionPool.getConnection();
            Request req = (Request) request;
            this.sendMail(req.sendTo, session, conn);
            rsp = new Response();
        }
        catch (Exception e)
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
     * @param intValue
     */
    private void sendMail(int id, SessionWrapper session, Connection conn)
    {
        try
        {

            DSEUtils.sendDSEMail(id, session, conn);
            DSEUtils.markAsSend(id, conn);
        }
        catch (Exception e)
        {
            // TODO: logging
        }
    }

    /**
     *
     */
    @XmlRootElement(name = "send-dse-mail-req")
    @XmlType(name = "SendDSGVOHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "send-to")
        public int sendTo;
    }

    /**
     *
     */
    @XmlRootElement(name = "send-dse-mail-ok-rsp")
    @XmlType(name = "SendDSGVOHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
