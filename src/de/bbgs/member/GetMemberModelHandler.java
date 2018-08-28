package de.bbgs.member;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.contacts.ContactsDBUtil;
import de.bbgs.contacts.EContactDomain;
import de.bbgs.logging.AuditLog;
import de.bbgs.notes.ENoteDomain;
import de.bbgs.notes.NotesDBUtil;
import de.bbgs.partner.PartnerDBUtil;
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
public class GetMemberModelHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        List<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(MemberModel.class);
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

            Request req = (Request) request;
            MemberModel model = new MemberModel();

            conn = ConnectionPool.getConnection();
            if (req.id != 0)
            {
                model.coreData = MemberDBUtil.getMember(req.id, conn);
                model.contacts = ContactsDBUtil.getAllContacts(req.id, EContactDomain.MEMBER, conn);
                model.attachments = AttachmentsDBUtil.getAllAttachments(req.id, EAttachmentDomain.MEMBER, conn);
                model.notes = NotesDBUtil.getAllNotes(req.id, ENoteDomain.MEMBER, conn);
                model.courses = MemberDBUtil.getCourses(req.id, conn);
                AuditLog.logQuery(this, session, conn, "GET_MEMBER_BY_ID", Integer.valueOf(req.id), model.coreData.zname, model.coreData.vname);
            }
            
            model.partner = PartnerDBUtil.getAllCoopPartners(conn);
            return model;
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
    @XmlRootElement(name = "get-member-model-request")
    @XmlType(name = "get-member-model-request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "id")
        public int id;
    }
}
