package de.bbgs.mail;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;
import javax.xml.bind.JAXBException;

import de.bbgs.attachments.Attachment;
import de.bbgs.contacts.Contact;
import de.bbgs.courses.Course;
import de.bbgs.mail.SendMailHandler.MemberTypeWrapper;
import de.bbgs.member.EMemberType;
import de.bbgs.member.Member;
import de.bbgs.partner.Partner;
import de.bbgs.setup.EmailSetup;
import de.bbgs.setup.SetupReader;

/**
 * @author anderl
 *
 */
public class MailHelper
{
    /**
     * @param members
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> resolveMemberAddresses(Collection<Member> members, Connection conn)
        throws SQLException
    {
        Set<Integer> memberIds = new HashSet<>();
        for (Member m : members)
        {
            memberIds.add(Integer.valueOf(m.id));
        }

        return MailDBUtils.getAllMemberEmails(memberIds, conn);
    }


    /**
     * @param memberTypes
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> resolveMemberTypeAddresses(Collection<MemberTypeWrapper> memberTypes,
        Connection conn) throws SQLException
    {
        Set<EMemberType> types = new HashSet<>();
        for (MemberTypeWrapper t : memberTypes)
        {
            types.add(t.type);
        }
        return MailDBUtils.getAllMemberTypeEmails(types, conn);
    }

    /**
     * @param members
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> resolvePartnerAddresses(Collection<Partner> partners, Connection conn)
        throws SQLException
    {
        Set<Integer> contactIds = new HashSet<>();
        for (Partner p : partners)
        {
            contactIds.add(Integer.valueOf(p.id));
        }

        return MailDBUtils.getAllContactEmails(contactIds, conn);
    }

    /**
     * @param members
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> resolveContactAddresses(Collection<Contact> contacts, Connection conn)
        throws SQLException
    {
        Set<Integer> contactIds = new HashSet<>();

        for (Contact c : contacts)
        {
            contactIds.add(Integer.valueOf(c.id));
        }

        return MailDBUtils.getAllContactEmails(contactIds, conn);
    }


    /**
     * @param courses
     * @param conn
     * @return
     * @throws SQLException
     */
    public static Collection<? extends InternetAddress> resolveCourseAddresses(List<Course> courses, Connection conn)
        throws SQLException
    {
        Set<Integer> courseIds = new HashSet<>();
        for (Course c : courses)
        {
            courseIds.add(Integer.valueOf(c.id));
        }

        return MailDBUtils.getAllCourseEmails(courseIds, conn);
    }


    /**
     * 
     * @param groups
     * @param conn
     * @return
     * @throws SQLException 
     */
    public static Collection<InternetAddress> resolveCustomGroupAddresses(List<CustomMailGroup> groups, Connection conn)
        throws SQLException
    {
        Set<Integer> groupIds = new HashSet<>();
        for (CustomMailGroup c : groups)
        {
            groupIds.add(Integer.valueOf(c.id));
        }

        return MailDBUtils.getAllCustomGroupEmails(groupIds, conn);
    }

    /**
     * 
     * @param address
     * @return
     */
    public static InternetAddress resolveAddress(String address)
    {
        try
        {
            return new InternetAddress(address);
        }
        catch (AddressException e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return null;
    }

    /**
     * @param mailSenderInfo
     * @param subject
     * @param body
     * @param attachments
     * @return
     * @throws MessagingException
     * @throws JAXBException
     */
    public static Message composeMessage(MailSenderInfo mailSenderInfo, String subject, String body,
        Collection<Attachment> attachments) throws MessagingException, JAXBException
    {
        Message msg = new MimeMessage(MailHelper.getMailSession());
        msg.setSubject(subject);

        msg.setFrom(new InternetAddress(SetupReader.getSetup().getEmailSetup().send.from));
        msg.setReplyTo(new InternetAddress[]{mailSenderInfo.getInternetAddress()});

        // erzeuge den BodyPart. Sollten wir eine Signature in der Session haben, 
        // so fügen wir ein <img>-Tag mit der CID-Referenz auf die MailSignatur 
        // an den Body an. Das Image selbst ist nachert ein eigener BodyPart und 
        // wird zum schluss angehängt.
        if (mailSenderInfo.hasSignature())
        {
            body += "<br><br><img src='cid:signature'>";
        }
        BodyPart msgBodyPart = new MimeBodyPart();
        msgBodyPart.setContent(body, "text/html");

        // erzeuge den MultiPart und füge schon mal den BodyPart an
        Multipart multipart = new MimeMultipart();
        multipart.addBodyPart(msgBodyPart);

        // jetzt wird es Zeit, gegebenenfalls die MailSignatur hinzu zu fügen
        if (mailSenderInfo.hasSignature())
        {
            BodyPart sigBodyPart = new MimeBodyPart();
            DataSource src = new ByteArrayDataSource(mailSenderInfo.getSignature(), mailSenderInfo.getSigMimeType());
            sigBodyPart.setDataHandler(new DataHandler(src));
            sigBodyPart.setHeader("Content-ID", "<signature>");
            multipart.addBodyPart(sigBodyPart);
        }

        // Und die Parts für die Attachments
        for (Attachment attachment : attachments)
        {
            BodyPart attachBodyPart = new MimeBodyPart();
            attachBodyPart.setFileName(attachment.name);

            byte[] data = attachment.content;
            String mimeType = attachment.mimeType;
            DataSource src = new ByteArrayDataSource(data, mimeType);
            attachBodyPart.setDataHandler(new DataHandler(src));
            multipart.addBodyPart(attachBodyPart);
        }
        msg.setContent(multipart);
        return msg;
    }

    /**
     * @return
     * @throws JAXBException
     */
    public static Session getMailSession() throws JAXBException
    {
        EmailSetup setup = SetupReader.getSetup().getEmailSetup();

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", setup.send.useStartTLS);
        props.put("mail.smtp.host", setup.send.host);
        props.put("mail.smtp.port", setup.send.port);

        javax.mail.Session sess = javax.mail.Session.getInstance(props, new UIDPwdAuthenticator(setup));
        return sess;
    }

    /**
     * @author anderl
     *
     */
    private static class UIDPwdAuthenticator extends Authenticator
    {
        private String userId;
        private String passwd;

        /**
         * @param setup
         */
        public UIDPwdAuthenticator(EmailSetup setup)
        {
            this.userId = setup.send.user;
            this.passwd = setup.send.passwd;
        }

        /* (non-Javadoc)
         * @see javax.mail.Authenticator#getPasswordAuthentication()
         */
        protected PasswordAuthentication getPasswordAuthentication()
        {
            return new PasswordAuthentication(this.userId, this.passwd);
        }
    }

    /**
     * @param store
     */
    public static void closeQuietly(Store store)
    {
        if (store != null)
        {
            try
            {
                store.close();
            }
            catch (Exception e)
            {
                // do nothing
            }
        }
    }
}

