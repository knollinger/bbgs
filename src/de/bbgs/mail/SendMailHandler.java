package de.bbgs.mail;

import java.sql.Connection;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.Attachment;
import de.bbgs.courses.Course;
import de.bbgs.member.EMemberType;
import de.bbgs.member.Member;
import de.bbgs.partner.Partner;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.service.ThreadPool;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.IJAXBObject;

/**
 * @author anderl
 *
 */
public class SendMailHandler implements IXmlServiceHandler
{
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
        SendMailTask task = new SendMailTask((Request) request, session);
        ThreadPool.getInstance().submit(task);
        return new Response();
    }


    /**
     * @author anderl
     *
     */
    private static class SendMailTask implements Runnable
    {
        private Request request;
        private SessionWrapper session;

        /**
         * @param req
         */
        public SendMailTask(Request req, SessionWrapper session)
        {
            this.request = req;
            this.session = session;
        }

        @Override
        public void run()
        {
            Connection conn = null;
            try
            {
                conn = ConnectionPool.getConnection();
                MailSenderInfo senderInfo = MailDBUtils.getMailSenderInfo(this.session, conn);
                Message msg = SendMailHelper.composeMessage(senderInfo, this.request.subject, this.request.body,
                    this.request.attachments);

                InternetAddress[] recipents = this.resolveAdresses(this.request.recipients, conn);
                for (InternetAddress recipient : recipents)
                {
                    this.sendOneMail(recipient, msg);
                }
            }
            catch (Exception e)
            {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            finally
            {
                DBUtils.closeQuitly(conn);
            }
        }

        /**
         * @param recipient
         * @param msg
         */
        private void sendOneMail(InternetAddress recipient, Message msg)
        {
            try
            {
                msg.setRecipient(Message.RecipientType.TO, recipient);
                Transport.send(msg);
            }
            catch (MessagingException e)
            {
                // TODO
            }
        }

        /**
         * 
         * @param recipients
         * @return
         * @throws SQLException 
         */
        private InternetAddress[] resolveAdresses(Recipents recipients, Connection conn) throws SQLException
        {

            Set<InternetAddress> addresses = new HashSet<>();
            addresses.addAll(SendMailHelper.resolveMemberAddresses(recipients.members, conn));
            addresses.addAll(SendMailHelper.resolveMemberTypeAddresses(recipients.memberTypes, conn));
            addresses.addAll(SendMailHelper.resolveCourseAddresses(recipients.courses, conn));
            addresses.addAll(SendMailHelper.resolvePartnerAddresses(recipients.partner, conn));
            addresses.addAll(SendMailHelper.resolveCustomGroupAddresses(recipients.groups, conn));

            InternetAddress[] result = new InternetAddress[addresses.size()];
            addresses.toArray(result);
            return result;
        }
    }

    /**
     * @author anderl
     *
     */
    @XmlType(name="SendMailHandler.Recipients")
    public static class Recipents
    {

        @XmlElementWrapper(name = "members")
        @XmlElement(name = "member")
        public List<Member> members = new ArrayList<>();

        @XmlElementWrapper(name = "types")
        @XmlElement(name = "member-type")
        List<MemberTypeWrapper> memberTypes = new ArrayList<>();

        @XmlElementWrapper(name = "courses")
        @XmlElement(name = "course")
        public List<Course> courses = new ArrayList<>();

        @XmlElementWrapper(name = "partners")
        @XmlElement(name = "partner")
        public List<Partner> partner = new ArrayList<>();

        @XmlElementWrapper(name = "custom-groups")
        @XmlElement(name = "custom-group")
        public List<CustomMailGroup> groups = new ArrayList<>();
    }

    /**
     * @author anderl
     *
     */
    @XmlType(name="SendMailHandler.MemberTypeWrapper")
    public static class MemberTypeWrapper
    {
        @XmlElement(name = "type")
        public EMemberType type;
    }

    /**
     * @author anderl
     *
     */
    @XmlRootElement(name = "send-mail-req")
    @XmlType(name = "SendMailHandler.Request")
    public static class Request implements IJAXBObject
    {

        @XmlElement(name = "subject")
        public String subject = "";

        @XmlElement(name = "send-to")
        public Recipents recipients = new Recipents();

        @XmlElement(name = "body")
        public String body = "";

        @XmlElementWrapper(name = "attachments")
        @XmlElement(name = "attachment")
        public List<Attachment> attachments = new ArrayList<>();
    }

    @XmlRootElement(name = "send-mail-ok-rsp")
    @XmlType(name = "SendMailHandler.Response")
    public static class Response implements IJAXBObject
    {
    }

}
