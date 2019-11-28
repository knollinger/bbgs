package de.bbgs.member;

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
        result.add(OkResponse.class);
        result.add(PossibleDuplicatesResponse.class);
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
        IJAXBObject rsp = null;
        try
        {
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);

            MemberModel model = (MemberModel) request;
            if (model.force)
            {
                rsp = this.save(model, session, conn);
            }
            else
            {
                PossibleDuplicatesResponse possibleDuplicates = this.checkUniqueness(model, session, conn);
                if (possibleDuplicates.members.size() != 0)
                {
                    rsp = possibleDuplicates;
                }
                else
                {
                    rsp = this.save(model, session, conn);
                }
            }

            conn.commit();
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
     * @param model
     * @param session
     * @param conn
     * @return
     * @throws SQLException 
     */
    private PossibleDuplicatesResponse checkUniqueness(MemberModel model, SessionWrapper session, Connection conn)
        throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        PossibleDuplicatesResponse rsp = new PossibleDuplicatesResponse();

        try
        {
            stmt = conn.prepareStatement(
                "select * from members where zname like ? and vname like ? order by zname, vname");
            stmt.setString(1, "%" + model.coreData.zname + "%");
            stmt.setString(2, "%" + model.coreData.vname + "%");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                rsp.members.add(MemberDBUtil.personFromResultSet(rs));
            }
            return rsp;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * Speichere das Mdel
     * @param model
     * @param session
     * @param conn
     * @throws SQLException
     */
    private IJAXBObject save(MemberModel model, SessionWrapper session, Connection conn) throws SQLException
    {

        int id = model.coreData.id;
        if (id == 0)
        {
            id = MemberDBUtil.createMember(model.coreData, conn);
            AuditLog.logCreate(this, session, conn, "CREATE_MEMBER", Integer.valueOf(id), model.coreData.zname,
                model.coreData.vname);
        }
        else
        {
            id = MemberDBUtil.updateMember(model.coreData, conn);
            AuditLog.logUpdate(this, session, conn, "UPDATE_MEMBER", Integer.valueOf(id), model.coreData.zname,
                model.coreData.vname);
        }

        MemberDBUtil.handleMemberInternalAttachment(model.coreData.image, model.coreData.imageMimeType, id,
            EAttachmentDomain.THUMBNAIL, conn);
        MemberDBUtil.handleMemberInternalAttachment(model.coreData.mailsig, model.coreData.mailsigMimetype, id,
            EAttachmentDomain.MAILSIG, conn);

        ContactsDBUtil.handleContactChanges(model.contacts, id, EContactDomain.MEMBER, conn);
        AttachmentsDBUtil.handleAttachmentChanges(model.attachments, id, EAttachmentDomain.MEMBER, conn);
        NotesDBUtil.handleNoteChanges(model.notes, id, ENoteDomain.MEMBER, conn);
        MemberDBUtil.handleMemberCourseChanges(model.courses, id, conn);

        return new OkResponse();
    }

    /**
    *
    */
    @XmlRootElement(name = "save-member-model-ok-response")
    @XmlType(name = "SaveMemberModelHandler.OkResponse")
    public static class OkResponse implements IJAXBObject
    {
    }

    /**
    *
    */
    @XmlRootElement(name = "save-member-model-possible-duplicates-response")
    @XmlType(name = "SaveMemberModelHandler.PossibleDuplicatesResponse")
    public static class PossibleDuplicatesResponse implements IJAXBObject
    {
        @XmlElement(name = "member")
        @XmlElementWrapper(name = "members")
        public List<Member> members = new ArrayList<>();
    }
}
