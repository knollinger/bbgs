package de.bbgs.partner;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

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
public class SavePartnerModelHandler implements IXmlServiceHandler
{
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return PartnerModel.class;
    }

    /**
     * 
     * @return
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(PartnerModel.class);
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
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);

            PartnerModel model = (PartnerModel) request;

            int partnerId = model.coreData.id;
            if (partnerId == 0)
            {
                partnerId = PartnerDBUtil.createPartner(model.coreData, conn);
            }
            else
            {
                PartnerDBUtil.updatePartner(model.coreData, conn);
            }
            ContactsDBUtil.handleContactChanges(model.contacts, partnerId, EContactDomain.PARTNER, conn);
            NotesDBUtil.handleNoteChanges(model.notes, partnerId, ENoteDomain.PARTNER, conn);
            AttachmentsDBUtil.handleAttachmentChanges(model.attachments, partnerId, EAttachmentDomain.PARTNER, conn);

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
    @XmlRootElement(name = "save-partnermodel-ok-rsp")
    @XmlType(name = "save-partnermodel-ok-rsp")
    public static class Response implements IJAXBObject
    {
    }
}
