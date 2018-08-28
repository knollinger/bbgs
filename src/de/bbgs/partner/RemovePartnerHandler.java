package de.bbgs.partner;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.contacts.ContactsDBUtil;
import de.bbgs.contacts.EContactDomain;
import de.bbgs.notes.ENoteDomain;
import de.bbgs.notes.NotesDBUtil;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 *
 */
public class RemovePartnerHandler implements IXmlServiceHandler
{
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /**
     * 
     * @return
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /**
     * @return
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /**
     * @param request
     * @param session
     * @return
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject rsp = null;
        Connection conn = null;
        try
        {
            Request req = (Request)request;
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);

            AttachmentsDBUtil.deleteAttachments(req.id, EAttachmentDomain.PARTNER, conn);
            NotesDBUtil.deleteNotesFor(req.id, ENoteDomain.PARTNER, conn);
            ContactsDBUtil.deleteContactsFor(req.id, EContactDomain.PARTNER, conn);
            PartnerDBUtil.deletePartner(req.id, conn);
            
            conn.commit();
            return new Response();
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
    @XmlRootElement(name = "remove-partner-req")
    @XmlType(name="RemovePartnerHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name="id")
        public int id = 0;
    }

    /**
     * 
     */
    @XmlRootElement(name = "remove-partner-ok-rsp")
    @XmlType(name="RemovePartnerHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
