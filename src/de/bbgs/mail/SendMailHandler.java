package de.bbgs.mail;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import org.jsoup.Jsoup;

import de.bbgs.attachments.Attachment;
import de.bbgs.courses.Course;
import de.bbgs.mail.addressbook.CustomMailGroup;
import de.bbgs.member.EMemberType;
import de.bbgs.member.Member;
import de.bbgs.partner.Partner;
import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 * @author anderl
 *
 */
public class SendMailHandler implements IXmlServiceHandler
{
    private static final String ERR_INV_ADDRESS = "Die Addresse '%1$s' ist nicht korrekt.";
    
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
        IJAXBObject result = null;
        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();
            Request req = (Request) request;

            MessageBuilder builder = new MessageBuilder(conn);
            builder.withSubject(req.subject) //
                .withSender(session.getAccountId()) //
                .withContent(Jsoup.parse(req.body));

            for (Member m : req.recipients.members)
            {
                builder.addMember(m.id);
            }

            for (EMemberType type : req.recipients.memberTypes)
            {
                builder.addMembersOfType(type);
            }

            for (Course course : req.recipients.courses)
            {
                builder.addCourseMembers(course.id);
            }

            for (CustomMailGroup group : req.recipients.groups)
            {
                builder.addMailGroup(group.id);
            }

            for (Partner partner : req.recipients.partners)
            {
                builder.addPartner(partner.id);
            }

            for (Attachment a : req.attachments)
            {
                builder.addAttachment(a.name, a.mimeType, a.content);
            }

            List<Message> messages = builder.createMessages();
            for (Message message : messages)
            {
                Transport.send(message);
            }
            result = new Response();
        }
        catch (AddressException e)
        {
            result = new ErrorResponse(String.format(ERR_INV_ADDRESS, e.getRef()));
            e.printStackTrace();
        }
        catch (Exception e)
        {
            result = new ErrorResponse(e.getMessage());
            e.printStackTrace();
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return result;
    }


    /**
     * @author anderl
     *
     */
    @XmlType(name = "SendMailHandler.Recipients")
    public static class Recipients
    {
        @XmlElementWrapper(name = "members")
        @XmlElement(name = "member")
        public List<Member> members = new ArrayList<>();

        @XmlElementWrapper(name = "types")
        @XmlElement(name = "member-type")
        public List<EMemberType> memberTypes = new ArrayList<>();

        @XmlElementWrapper(name = "courses")
        @XmlElement(name = "course")
        public List<Course> courses = new ArrayList<>();

        @XmlElementWrapper(name = "partners")
        @XmlElement(name = "partner")
        public List<Partner> partners = new ArrayList<>();

        @XmlElementWrapper(name = "custom-groups")
        @XmlElement(name = "custom-group")
        public List<CustomMailGroup> groups = new ArrayList<>();
    }

    /**
     * @author anderl
     *
     */
    @XmlRootElement(name = "send-mail-req")
    @XmlType(name = "SendMailHandler.NewRequest")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "subject")
        public String subject = "";

        @XmlElement(name = "send-to")
        public Recipients recipients = new Recipients();

        @XmlElement(name = "body")
        public String body = "";

        @XmlElementWrapper(name = "attachments")
        @XmlElement(name = "attachment")
        public List<Attachment> attachments = new ArrayList<>();
    }

    @XmlRootElement(name = "send-mail-ok-rsp")
    @XmlType(name = "SendMailHandler.ResponseNew")
    public static class Response implements IJAXBObject
    {
    }
}
