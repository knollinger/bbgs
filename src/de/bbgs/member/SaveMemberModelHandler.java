package de.bbgs.member;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.contacts.ContactsDBUtil;
import de.bbgs.contacts.EContactDomain;
import de.bbgs.logging.AuditLog;
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
 *
 */
public class SaveMemberModelHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return MemberModel.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        List<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(MemberModel.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#handleRequest(de.bbgs.io.IJAXBObject, de.bbgs.session.Session)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Connection conn = null;
        try
        {
            MemberModel model = (MemberModel) request;
            int id = model.coreData.id;

            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);

            if (id == 0)
            {                
                id = MemberDBUtil.createMember(model.coreData, conn);
                AuditLog.logCreate(this, session, conn, "CREATE_MEMBER", Integer.valueOf(id), model.coreData.zname, model.coreData.vname);                
            }
            else
            {
                id = MemberDBUtil.updateMember(model.coreData, conn);
                AuditLog.logUpdate(this, session, conn, "UPDATE_MEMBER", Integer.valueOf(id), model.coreData.zname, model.coreData.vname);                
            }
            
            MemberDBUtil.handleMemberInternalAttachment(model.coreData.image, model.coreData.imageMimeType, id, EAttachmentDomain.THUMBNAIL, conn);
            MemberDBUtil.handleMemberInternalAttachment(model.coreData.mailsig, model.coreData.mailsigMimetype, id, EAttachmentDomain.MAILSIG, conn);

            ContactsDBUtil.handleContactChanges(model.contacts, id, EContactDomain.MEMBER, conn);
            AttachmentsDBUtil.handleAttachmentChanges(model.attachments, id, EAttachmentDomain.MEMBER, conn);
            NotesDBUtil.handleNoteChanges(model.notes, id, ENoteDomain.MEMBER, conn);
            MemberDBUtil.handleMemberCourseChanges(model.courses, id, conn);

            conn.commit();
            return new Response();
        }
        catch (SQLException e)
        {
            return new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     *
     */
    @XmlRootElement(name = "save-member-model-ok-response")
    @XmlType(name = "SaveMemberModelHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
