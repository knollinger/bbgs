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
import de.bbgs.courses.CourseDBUtil;
import de.bbgs.notes.ENoteDomain;
import de.bbgs.notes.NotesDBUtil;
import de.bbgs.partner.PartnerDBUtil;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.BBGSLog;
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

            BBGSLog.logInfo("Benutzer '%1$s' fragt MemberModel für die Id %2$d ab", session.getAccountName(),
                Integer.valueOf(req.id));
            conn = ConnectionPool.getConnection();
            if (req.id != 0)
            {
                BBGSLog.logInfo("Ermittle Stammdaten");
                model.coreData = MemberDBUtil.getMember(req.id, conn);

                BBGSLog.logInfo("Ermittle Angehörige");
                model.contacts = ContactsDBUtil.getAllContacts(req.id, EContactDomain.MEMBER, conn);

                BBGSLog.logInfo("Ermittle Dateianhänge");
                model.attachments = AttachmentsDBUtil.getAllAttachments(req.id, EAttachmentDomain.MEMBER, conn);

                BBGSLog.logInfo("Ermittle Notizen");
                model.notes = NotesDBUtil.getAllNotes(req.id, ENoteDomain.MEMBER, conn);

                BBGSLog.logInfo("Ermittle Kurse");
                model.courses = CourseDBUtil.getCoursesByMemberId(req.id, conn);
            }
            
            BBGSLog.logInfo("Ermittle mögliche Partner-Institute");
            model.partner = PartnerDBUtil.getAllCoopPartners(conn);
            
            BBGSLog.logInfo("Model erfolgreich geladen");
            return model;
        }
        catch (SQLException e)
        {
            BBGSLog.logError("Fehler beim Datenbank-Zugriff.", e);
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
