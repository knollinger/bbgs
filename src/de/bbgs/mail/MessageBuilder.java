package de.bbgs.mail;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.UUID;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.mail.Address;
import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;
import javax.xml.bind.JAXBException;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.contacts.EContactDomain;
import de.bbgs.member.EMemberType;
import de.bbgs.setup.EmailSetup;
import de.bbgs.setup.SetupReader;
import de.bbgs.utils.DBUtils;
import de.bbgs.utils.IOUtils;

/**
 * Erzeuge eine MimeMessage...Stück für Stück
 * <br>
 * Klassisches Builder-Pattern...wir sammeln erst mal alles zusammen und bauen dann die Message
 * 
 */
class MessageBuilder
{
    private static final int MAX_RECIPIENTS_PER_MAIL = 100;

    private Connection conn;
    private InternetAddress senderAddy;
    private Set<InternetAddress> recipients = new HashSet<>();
    private String subject;
    private Document content;
    private List<Attachment> attachments = new ArrayList<>();
    private Attachment mailSig;

    /**
     * 
     * @param conn
     */
    public MessageBuilder(Connection conn)
    {
        this.conn = conn;
    }

    /**
     * Setze das Subject
     * 
     * @param subject
     * @return
     */
    public MessageBuilder withSubject(String subject)
    {
        this.subject = subject;
        return this;
    }

    /**
     * Setze die absendende AccountId
     * 
     * @param accountId
     * @return this
     * @throws SQLException 
     * @throws IOException 
     */
    public MessageBuilder withSender(int accountId) throws SQLException, IOException
    {
        this.senderAddy = this.inetAddressFromMemberId(accountId);
        this.mailSig = this.getMailSignature(accountId);
        return this;
    }

    /**
     * Füge einen Member zur Liste der Recipients hinzu
     * @param memberId
     * @return this
     * @throws SQLException 
     * @throws UnsupportedEncodingException 
     */
    public MessageBuilder addMember(int memberId) throws UnsupportedEncodingException, SQLException
    {
        this.recipients.add(this.inetAddressFromMemberId(memberId));
        return this;
    }

    /**
     * Füge eine MailGroup zur Liste der Recipients hinzu
     * @param mailGroupId
     * @return
     * @throws SQLException 
     * @throws UnsupportedEncodingException 
     */
    public MessageBuilder addMailGroup(int mailGroupId) throws SQLException, UnsupportedEncodingException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = this.conn.prepareStatement("select member_id from mail_group_members where group_id=?");
            stmt.setInt(1, mailGroupId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                this.recipients.add(this.inetAddressFromMemberId(rs.getInt("member_id")));
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return this;
    }

    /**
     * Füge einen Kurs zur Liste der Recipients hinzu
     * @param courseId
     * @return this
     * @throws SQLException 
     * @throws UnsupportedEncodingException 
     */
    public MessageBuilder addCourseMembers(int courseId) throws SQLException, UnsupportedEncodingException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = this.conn.prepareStatement("select member_id from course_member where course_id=?");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                this.recipients.add(this.inetAddressFromMemberId(rs.getInt("member_id")));
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return this;
    }

    /**
     * Füge alle Mitglieder mit einem definierten Typ zur Liste der Recipients hinzu
     * @param memberType
     * @return this
     * @throws SQLException 
     * @throws UnsupportedEncodingException 
     */
    public MessageBuilder addMembersOfType(EMemberType type) throws SQLException, UnsupportedEncodingException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = this.conn.prepareStatement("select id from members where type=?");
            stmt.setString(1, type.name());
            rs = stmt.executeQuery();
            while (rs.next())
            {
                this.recipients.add(this.inetAddressFromMemberId(rs.getInt("id")));
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return this;
    }


    /**
     * Füge einen Partner zur Liste der Recipients hinzu
     * @param partnerId
     * @return this
     * @throws SQLException 
     * @throws UnsupportedEncodingException 
     */
    public MessageBuilder addPartner(int partnerId) throws SQLException, UnsupportedEncodingException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = this.conn.prepareStatement("select zname, vname, email from contacts where ref_id=? and domain=?");
            stmt.setInt(1, partnerId);
            stmt.setString(2, EContactDomain.PARTNER.name());
            rs = stmt.executeQuery();
            while (rs.next())
            {
                String zname = rs.getString("zname");
                String vname = rs.getString("vname");
                String email = rs.getString("email");
                this.recipients.add(this.createInetAddress(zname, vname, email));
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return this;
    }

    /**
     * @param doc
     * @return
     */
    public MessageBuilder withContent(Document doc)
    {
        this.content = doc.clone();
        return this;
    }

    /**
     * @param fileName
     * @param mimeType
     * @param content
     * @return
     */
    public MessageBuilder addAttachment(String fileName, String mimeType, byte[] content)
    {
        this.attachments.add(new Attachment(fileName, mimeType, content));
        return this;
    }

    /**
     * erzeuge die Message(s). 
     * 
     * @return
     * @throws MailConfigurationException 
     * @throws MailAddressException 
     * @throws MailContentException 
     * @throws MessagingException 
     */
    public List<Message> createMessages()
        throws MailConfigurationException, MailAddressException, MailContentException, MessagingException
    {
        Address[] recipients = this.composeRecipients();

        List<Message> messages = new ArrayList<>();

        for (int i = 0; i < recipients.length; i += MAX_RECIPIENTS_PER_MAIL)
        {

            Address[] addrChunk = Arrays.copyOfRange(recipients, i,
                Math.min(i + MAX_RECIPIENTS_PER_MAIL, recipients.length));
            Message msg = new MimeMessage(this.getMailSession());
            msg.setSubject(this.subject);
            msg.setFrom(this.getFrom());
            msg.setReplyTo(new InternetAddress[]{this.senderAddy});
            msg.setRecipients(Message.RecipientType.BCC, addrChunk);

            Multipart body = new MimeMultipart("related");
            for (BodyPart bodyPart : this.createBodyParts())
            {
                body.addBodyPart(bodyPart);
            }
            msg.setContent(body);
            messages.add(msg);
        }

        return messages;
    }

    /**
     * @return
     */
    private Address[] composeRecipients()
    {
        InternetAddress[] result = new InternetAddress[this.recipients.size()];
        this.recipients.toArray(result);
        return result;
    }

    /**
     * Erzeuge aus dem HTML-Document der Nachricht eine Liste von MimeParts. Alle Data-URIs der Images werden in
     * MimeParts übertragen und die src-Referenzen entsprechend umgeschrieben. Der erste Part der Liste ist das
     * modifizierte HTML-Dokument, danach folgen die referenzierten Images. Sollte eine Mail-Signatur existieren wird diese
     * am Ende angehängt.
     * 
     * @throws URISyntaxException 
     * @throws MessagingException 
     */
    private List<BodyPart> createBodyParts() throws MailContentException, MessagingException
    {
        List<BodyPart> parts = new ArrayList<>();

        Document doc = this.content; // Clone entfernt
        doc.head().appendChild(this.createStyles());

        Elements images = doc.select("img");
        for (Element image : images)
        {
            URI imgURI = this.extractImageSource(image);
            if (imgURI.getScheme().equalsIgnoreCase("data"))
            {
                UUID uuid = UUID.randomUUID();
                image.attr("src", String.format("cid:%1$s", uuid));

                String contentType = this.getContentTypeFromDataURI(imgURI);
                byte[] data = this.getImageFromDataURI(imgURI);
                parts.add(this.makeImagePart(contentType, data, uuid));
            }
        }

        // alle attachments anhängen
        for (Attachment attachment : this.attachments)
        {
            parts.add(this.createAttachment(attachment));
        }

        // ggf. eine MailSignature anhängen
        if (this.mailSig != null)
        {
            Element img = doc.createElement("img");
            UUID uuid = UUID.randomUUID();
            img.attr("src", String.format("cid:%1$s", uuid));
            doc.body().appendChild(img);
            parts.add(this.makeImagePart(this.mailSig.mimeType, this.mailSig.content, uuid));
        }

        // Das HTML an den Anfang der PartList
        String body = doc.html();
        BodyPart part = new MimeBodyPart();
        part.setContent(body, "text/html;charset=utf8");
        parts.add(0, part);
        return parts;
    }

    /**
     * @param img
     * @return
     * @throws MailContentException
     */
    private URI extractImageSource(Element img) throws MailContentException
    {
        try
        {
            return new URI(img.attr("src"));
        }
        catch (URISyntaxException e)
        {
            throw new MailContentException(e);
        }

    }
    /**
     * Erzeuge einen BodyPart für ein Image
     * @param contentType
     * @param data
     * @param uuid
     * @return
     * @throws MessagingException
     */
    private BodyPart makeImagePart(String contentType, byte[] data, UUID uuid) throws MessagingException
    {
        BodyPart part = new MimeBodyPart();
        part.setHeader("Content-ID", String.format("<%1$s>", uuid));
        part.setHeader("Content-Disposition", "inline");
        DataSource src = new ByteArrayDataSource(data, contentType);
        part.setDataHandler(new DataHandler(src));
        return part;
    }

    /**
     * extrahiere den ContentType aus einer Data-URI
     * @param uri
     * @return
     */
    private String getContentTypeFromDataURI(URI uri)
    {
        String[] parts = uri.getSchemeSpecificPart().split(";");
        return parts[0];
    }

    /**
     * @param attachment
     * @return
     * @throws MessagingException 
     */
    private BodyPart createAttachment(Attachment attachment) throws MessagingException
    {
        BodyPart part = new MimeBodyPart();
        String fileName = attachment.fileName.replace(' ', '_');
        part.addHeader("Content-Disposition", String.format("attachment; filename=%1$s", fileName));
        DataSource src = new ByteArrayDataSource(attachment.getContent(), attachment.getMimeType());
        part.setDataHandler(new DataHandler(src));
        return part;
    }


    /**
     * Extrahiere die Daten aus einer Data-URI
     * 
     * @param uri
     * @return
     */
    private byte[] getImageFromDataURI(URI uri)
    {
        String[] parts = uri.getSchemeSpecificPart().split(";");
        parts = parts[1].split(",");
        String imgBase64 = parts[parts.length - 1];
        return Base64.getDecoder().decode(imgBase64.getBytes());
    }

    /**
     * @return
     */
    private Element createStyles()
    {
        Element styles = this.content.createElement("style");
        styles.appendText("html { width: 800px; }\n");
        styles.appendText("body { width: 800px; margin-left: auto; margin-right: auto; }\n");
        styles.appendText("img { max-width: 800px; }\n");
        return styles;
    }

    /**
     * liefere die MailSession
     * 
     * @return
     * @throws MailConfigurationException 
     * @throws JAXBException
     */
    private Session getMailSession() throws MailConfigurationException
    {
        try
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
        catch (JAXBException e)
        {
            throw new MailConfigurationException(e);
        }
    }

    /**
     * @return
     * @throws MailConfigurationException
     * @throws MailAddressException 
     */
    private InternetAddress getFrom() throws MailConfigurationException, MailAddressException
    {

        try
        {
            EmailSetup setup = SetupReader.getSetup().getEmailSetup();
            String from = setup.send.from;
            try
            {
                return this.createInetAddress("Bayerns beste Gipfelstürmer", "", from);
            }
            catch (UnsupportedEncodingException e)
            {
                throw new MailAddressException(from, e);
            }

        }
        catch (JAXBException e)
        {
            throw new MailConfigurationException(e);
        }
    }

    /**
     * baue die InternetAddress für die gegebene MemberId zusammen
     * 
     * @param memberId
     * @return <code>null</code> wenn kein solcher Member gefunden werden konnte.
     * @throws SQLException
     * @throws UnsupportedEncodingException
     */
    private InternetAddress inetAddressFromMemberId(int memberId) throws SQLException, UnsupportedEncodingException
    {

        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = this.conn.prepareStatement("select zname, vname, email from members where id=?");
            stmt.setInt(1, memberId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                return this.createInetAddress(rs.getString("zname"), rs.getString("vname"), rs.getString("email"));
            }
            return null;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param zname
     * @param vname
     * @param email
     * @return
     * @throws UnsupportedEncodingException
     */
    private InternetAddress createInetAddress(String zname, String vname, String email)
        throws UnsupportedEncodingException
    {
        String name = String.format("%1$s, %2$s", zname, vname);
        return new InternetAddress(email, name, "UTF-8");
    }

    /**
     * @param memberId
     * @return
     * @throws SQLException 
     * @throws IOException 
     */
    private Attachment getMailSignature(int memberId) throws SQLException, IOException
    {
        Attachment result = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = this.conn.prepareStatement(
                "select file_name, file, mimetype from attachments where domain=? and ref_id=?;");
            stmt.setString(1, EAttachmentDomain.MAILSIG.name());
            stmt.setInt(2, memberId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                ByteArrayOutputStream img = new ByteArrayOutputStream();
                IOUtils.transferUntilEOF(rs.getBlob("file").getBinaryStream(), img);
                result = new Attachment(rs.getString("file_name"), rs.getString("mimetype"), img.toByteArray());
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
        return result;
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
     * @author anderl
     *
     */
    private static class Attachment
    {
        private String fileName;
        private String mimeType;
        private byte[] content;

        /**
         * @param fileName
         * @param mimeType
         * @param content
         */
        public Attachment(String fileName, String mimeType, byte[] content)
        {
            this.fileName = fileName;
            this.mimeType = mimeType;
            this.content = content;
        }

        /**
         * @return den FileName
         */
        public String getFileName()
        {
            return this.fileName;
        }

        /**
         * @return den MimeType
         */
        public String getMimeType()
        {
            return this.mimeType;
        }

        /**
         * @return den Content als base64-String
         */
        public byte[] getContent()
        {
            return this.content;
        }


    }
}
