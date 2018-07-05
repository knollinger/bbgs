package de.bbgs.mail;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * 
 */
public class GetMailboxHandler implements IXmlServiceHandler
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
            stmt = conn.prepareStatement(
                "select m.*, f.folder_name from mailbox m left join `mailbox_folders` f on m.`id`=f.`ref_id` order by  f.`folder_name`, m.`sent-date` DESC");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                MessageDesc desc = new MessageDesc();
                desc.id = rs.getInt("m.id");
                desc.folderName = rs.getString("f.folder_name");
                desc.from = rs.getString("m.from");
                desc.to = this.getRecipients(desc.id, conn);
                desc.folderName = rs.getString("f.folder_name");
                desc.sent = DBUtils.getDate(rs, "m.sent-date");
                desc.received = DBUtils.getDate(rs, "m.recv-date");
                desc.subject = rs.getString("m.subject");
                response.messages.add(desc);
            }
            rsp = response;
        }
        catch (Exception e)
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

    /**
     * @param id
     * @param conn
     * @return
     * @throws SQLException
     */
    public Collection<String> getRecipients(int id, Connection conn) throws SQLException
    {
        Collection<String> result = new ArrayList<>();
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select * from mailbox_recipients where ref_id=?");
            stmt.setInt(1, id);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                result.add(rs.getString("to"));
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }


    @XmlRootElement(name = "get-mailbox-req")
    @XmlType(name = "GetMailboxHandler.Request")
    public static class Request implements IJAXBObject
    {
    }

    /**
     * @author anderl
     *
     */
    public static class MessageDesc
    {
        @XmlElement(name = "id")
        public int id;

        @XmlElement(name = "folder")
        public String folderName;

        @XmlElement(name = "from")
        public String from;

        @XmlElementWrapper(name = "recipients")
        @XmlElement(name = "to")
        public Collection<String> to = new ArrayList<>();

        @XmlElement(name = "sent")
        public String sent;

        @XmlElement(name = "recv")
        public String received;

        @XmlElement(name = "subject")
        public String subject;
    }


    @XmlRootElement(name = "get-mailbox-ok-rsp")
    @XmlType(name = "GetMailboxHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "msg")
        public Collection<MessageDesc> messages = new ArrayList<>();
    }
}
