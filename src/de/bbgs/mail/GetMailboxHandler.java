package de.bbgs.mail;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Properties;

import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.search.SearchTerm;
import javax.xml.bind.JAXBException;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.setup.EmailSetup;
import de.bbgs.setup.SetupReader;
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
        Store store = null;

        try
        {
            store = this.getMailbox();

            Response response = new Response();
            response.inbox = this.readFolder(store, "INBOX");
            response.sent = this.readFolder(store, "[Gmail]/Sent Mail");
            rsp = response;
        }
        catch (Exception e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            MailHelper.closeQuietly(store);
        }

        return rsp;
    }

    /**
     * @param store
     * @param string
     * @return
     * @throws MessagingException 
     */
    private FolderDesc readFolder(Store store, String folderName) throws MessagingException
    {
        Folder f = store.getFolder(folderName);
        f.open(Folder.READ_ONLY);

        FolderDesc result = new FolderDesc();
        result.name = f.getFullName();
        result.unread = f.getUnreadMessageCount();

        MailMatcher matcher = new MailMatcher(new Date(), new Date());
        for (Message m : f.search(matcher))
        {

            MessageDesc d = new MessageDesc();
            d.subject = m.getSubject();
            d.from = m.getFrom().toString();
            d.to = m.getAllRecipients().toString();
            d.date = m.getSentDate();
            result.messages.add(d);
        }
        f.close(false);
        return result;
    }

    /**
     * @return
     * @throws JAXBException
     * @throws MessagingException
     */
    private Store getMailbox() throws JAXBException, MessagingException
    {
        Properties props = new Properties();
        props.setProperty("mail.store.protocol", "imaps");
        Session session = Session.getDefaultInstance(props, null);
        Store store = session.getStore("imaps");

        EmailSetup setup = SetupReader.getSetup().getEmailSetup();
        String host = setup.receive.host;
        int port = setup.receive.port;
        String userid = setup.receive.user;
        String passwd = setup.receive.passwd;
        store.connect(host, port, userid, passwd);

        return store;
    }

    /**
     * 
     * @author anderl
     *
     */
    private class MailMatcher extends SearchTerm
    {
        private Date from;
        private Date until;

        /**
         * @param from
         * @param until
         */
        public MailMatcher(Date from, Date until)
        {
            this.from = from;
            this.until = until;
        }

        /* (non-Javadoc)
         * @see javax.mail.search.SearchTerm#match(javax.mail.Message)
         */
        @Override
        public boolean match(Message msg)
        {
            try
            {
                Date sent = msg.getSentDate();
                return (sent.compareTo(this.from) >= 0 && sent.compareTo(this.until) <= 0);
            }
            catch (MessagingException e)
            {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            return false;
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
        public String from;
        public String to;
        public Date date;
        public String subject;
    }

    /**
     * @author anderl
     *
     */
    public static class FolderDesc
    {

        @XmlElement(name = "name")
        public String name;

        @XmlElement(name = "unread")
        public int unread;

        @XmlElement(name = "message")
        public Collection<MessageDesc> messages = new ArrayList<>();
    }
    @XmlRootElement(name = "get-mailbox-ok-rsp")
    @XmlType(name = "GetMailboxHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "inbox")
        public FolderDesc inbox = new FolderDesc();

        @XmlElement(name = "sent")
        public FolderDesc sent = new FolderDesc();
    }
}
