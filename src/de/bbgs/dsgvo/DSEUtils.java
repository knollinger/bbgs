package de.bbgs.dsgvo;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;
import javax.xml.bind.JAXBException;

import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.mail.MailHelper;
import de.bbgs.session.SessionWrapper;
import de.bbgs.setup.SetupReader;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.utils.IOUtils;

/**
 *
 */
public class DSEUtils
{
    private static final String SUBJECT = "Bayerns beste Gipfelstürmer - Datenschutz-Erklärung";

    /**
     * @return
     * @throws SQLException
     */
    public static Collection<DSEInfoItem> getDSEOverview() throws SQLException
    {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {

            Collection<DSEInfoItem> result = new ArrayList<>();

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement(
                "select id, vname, zname, email, dse_state, dse_date from members order by zname, vname");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                DSEInfoItem i = new DSEInfoItem();
                i.id = rs.getInt("id");
                i.zname = rs.getString("zname");
                i.vname = rs.getString("vname");
                i.email = rs.getString("email");
                i.state = EDSEState.valueOf(rs.getString("dse_state"));
                i.date = DBUtils.getDate(rs, "dse_date");
                result.add(i);
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     * @param id
     * @param conn
     * @throws SQLException 
     */
    public static void markAsSend(int id, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("update members set dse_state=?, dse_date=? where id=?");
            stmt.setString(1, EDSEState.PENDING.name());
            stmt.setDate(2, new Date(System.currentTimeMillis()));
            stmt.setInt(3, id);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param memberId
     * @param session
     * @param conn
     * @return
     * @throws SQLException
     * @throws JAXBException
     * @throws AddressException
     * @throws MessagingException
     * @throws IOException
     */
    public static boolean sendDSEMail(int memberId, SessionWrapper session, Connection conn)
        throws SQLException, JAXBException, AddressException, MessagingException, IOException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select id, vname, zname, email from members where id=?");
            stmt.setInt(1, memberId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                String vname = rs.getString("vname");
                String zname = rs.getString("zname");
                String email = rs.getString("email");
                if (email != null)
                {
                    Message msg = new MimeMessage(MailHelper.getMailSession());
                    msg.setSubject(SUBJECT);

                    msg.setFrom(new InternetAddress(SetupReader.getSetup().getEmailSetup().send.from));
                    msg.setRecipients(Message.RecipientType.TO, new InternetAddress[]{new InternetAddress(email)});

                    Multipart multipart = new MimeMultipart();
                    multipart.addBodyPart(DSEUtils.createMailBody(memberId, email, vname, zname, session));
                    multipart.addBodyPart(DSEUtils.createAttachment());

                    msg.setContent(multipart);

                    Transport.send(msg);
                    return true;
                }
            }
            return false;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param id
     * @param email
     * @param vname
     * @param zname
     * @param session
     * @return
     * @throws IOException
     * @throws MessagingException
     */
    private static BodyPart createMailBody(int id, String email, String vname, String zname, SessionWrapper session)
        throws IOException, MessagingException
    {
        InputStream in = null;

        try
        {
            String src = "/" + DSEUtils.class.getPackage().getName();
            src = src.replaceAll("\\.", "/");
            src += "/dse_mail_template.html";
            in = DSEUtils.class.getResourceAsStream(src);

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            IOUtils.transferUntilEOF(in, buffer);

            String body = buffer.toString();
            body = body.replaceAll("_ID_", Integer.toString(id));
            body = body.replaceAll("_ZNAME_", zname);
            body = body.replaceAll("_VNAME_", vname);
            body = body.replaceAll("_EMAIL_", email);
            body = body.replaceAll("_BASEURL_", session.getBaseURL().toString());

            BodyPart msgBodyPart = new MimeBodyPart();
            msgBodyPart.setContent(body, "text/html; charset=utf-8");
            return msgBodyPart;
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }

    /**
     * @return
     * @throws MessagingException
     * @throws IOException
     * @throws SQLException 
     */
    private static BodyPart createAttachment() throws MessagingException, IOException, SQLException
    {
        InputStream in = null;

        try
        {
            BodyPart attachBodyPart = new MimeBodyPart();
            attachBodyPart.setFileName("Datenschutz-Erklärung.pdf");

//            String path = "/" + DSEUtils.class.getPackage().getName();
//            path = path.replaceAll("\\.", "/");
//            path += "/dse.pdf";
//            in = DSEUtils.class.getResourceAsStream(path);

            in = DSEUtils.getDSEDocument();
            DataSource src = new ByteArrayDataSource(in, "application/pdf");
            attachBodyPart.setDataHandler(new DataHandler(src));
            return attachBodyPart;
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }

    /**
     * @return <code>null</code>, wenn kein DSE-Dokument gefunden wurde
     * 
     * @throws SQLException 
     */
    private static InputStream getDSEDocument() throws SQLException
    {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            InputStream result = null;
            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select file from attachments where domain=? order by attached_at desc");
            stmt.setString(1, EAttachmentDomain.DSE.name());
            rs = stmt.executeQuery();
            if (rs.next())
            {
                Blob b = rs.getBlob("file");
                result = b.getBinaryStream();
            }
            return result;
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
    }
}
