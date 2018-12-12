package de.bbgs.sms;

import java.io.IOException;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.courses.Course;
import de.bbgs.mail.CustomMailGroup;
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
public class SendSMSHandler implements IXmlServiceHandler
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
        SendSMSTask task = new SendSMSTask((Request) request, session);
        ThreadPool.getInstance().submit(task);
        return new Response();
    }

    /**
     * @author anderl
     *
     */
    private static class SendSMSTask implements Runnable
    {
        private Request request;

        /**
         * @param req
         */
        public SendSMSTask(Request req, SessionWrapper session)
        {
            this.request = req;
        }

        @Override
        public void run()
        {
            Connection conn = null;
            try
            {
                conn = ConnectionPool.getConnection();
                Collection<SMSAddress> recipents = this.resolveAdresses(this.request.recipients, conn);
                Collection<SMSAddress> undeliverable = SMSSender.sendSMS(this.request.body, recipents);
                for (SMSAddress smsAddress : undeliverable)
                {
                    String msg = String.format(
                        "SMS konnte an '%1$s, %2$s' nicht zugestellt werden, keine Mobilfunk-Nummer bekannt",
                        smsAddress.getZname(), smsAddress.getVname());
                    this.sendNotification(msg);
                }
            }
            catch (IOException e)
            {
                this.sendNotification("Sorry, das SMS-Gateway ist leider nicht erreichbar");
            }
            catch (SendSMSException e)
            {
                this.sendNotification("Sorry, da ist was schief gegangen. Ursache: " + e.getMessage());
            }
            catch (Exception e)
            {
                this.sendNotification("Sorry, da ist was schief gegangen. Ursache: " + e.getMessage());
            }
            finally
            {
                DBUtils.closeQuitly(conn);
            }
        }

        /**
         * @param msg
         */
        private void sendNotification(String msg)
        {
//            try
//            {
//                Notification n = new Notification();
//                n.who = this.session.getAccountName();
//                n.id = this.session.getAccountId();
//                n.title = "SMS-Versand";
//                n.msg = msg;
//                n.timeStamp = TIMESTAMP_FMT.format(new Timestamp(System.currentTimeMillis()));
//                NotificationQueueManager.getInstance().sendUnicast(this.session.getAccountName(), n);
//            }
//            catch (InterruptedException e)
//            {
//                Thread.currentThread().interrupt();
//            }
        }

        /**
         * 
         * @param recipients
         * @return
         * @throws SQLException 
         */
        private Collection<SMSAddress> resolveAdresses(Recipents recipients, Connection conn) throws SQLException
        {

            Set<SMSAddress> addresses = new HashSet<>();
            addresses.addAll(SendSMSHelper.resolveSMSAddrByMemberIds(recipients.members, conn));
            addresses.addAll(SendSMSHelper.resolveSMSAddrByMemberType(recipients.memberTypes, conn));
            addresses.addAll(SendSMSHelper.resolveCourseAddresses(recipients.courses, conn));
            addresses.addAll(SendSMSHelper.resolvePartnerAddresses(recipients.partner, conn));
            addresses.addAll(SendSMSHelper.resolveCustomGroupAddresses(recipients.groups, conn));

            return addresses;
        }
    }

    /**
     * @author anderl
     *
     */
    @XmlType(name = "SendSMSHandler.Recipients")
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
    @XmlType(name = "SendSMSHandler.MemberTypeWrapper")
    public static class MemberTypeWrapper
    {
        @XmlElement(name = "type")
        public EMemberType type;
    }

    /**
     * @author anderl
     *
     */
    @XmlRootElement(name = "send-sms-req")
    @XmlType(name = "SendSMSHandler.Request")
    public static class Request implements IJAXBObject
    {

        @XmlElement(name = "send-to")
        public Recipents recipients = new Recipents();

        @XmlElement(name = "body")
        public String body = "";
    }

    @XmlRootElement(name = "send-sms-ok-rsp")
    @XmlType(name = "SendSMSHandler.Response")
    public static class Response implements IJAXBObject
    {
    }

}
