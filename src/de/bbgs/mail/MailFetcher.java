package de.bbgs.mail;

import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Properties;

import javax.mail.Address;
import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Store;
import javax.xml.bind.JAXBException;

import de.bbgs.attachments.AttachmentsDBUtil;
import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.setup.EmailSetup.ConnectionDesc;
import de.bbgs.setup.Setup;
import de.bbgs.setup.SetupReader;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;

/**
 * liest das Postfach aus und speichert den ganzen Spass in der Datenbank
 *
 */
public class MailFetcher implements Runnable
{
    private static String[] foldersToScan = {"INBOX", "[Gmail]/Gesendet"};
    
    /* (non-Javadoc)
     * @see java.lang.Runnable#run()
     */
    @Override
    public void run()
    {
        while (!Thread.currentThread().isInterrupted())
        {
            this.fetchMails();            
            try
            {
                Thread.sleep(60000);
            }
            catch (InterruptedException e)
            {
                Thread.currentThread().interrupt();
            }            
        }
    }

    /**
     * 
     */
    private void fetchMails()
    {
        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);
            Store s = this.getStore();

            for (String folderName : foldersToScan)
            {
                Folder f = s.getFolder(folderName);
                this.enumFolder(f, conn);
            }

            s.close();
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
     * @param f
     * @param conn
     * @throws IOException 
     * @throws SQLException 
     * @throws MessagingException 
     */
    private void enumFolder(Folder f, Connection conn) throws MessagingException, SQLException, IOException
    {
        System.out.println("scan folder " + f.getFullName());
        if ((f.getType() & Folder.HOLDS_MESSAGES) == Folder.HOLDS_MESSAGES)
        {
            this.loadAllMessages(f, conn);
        }
    }

    /**
     *  holt den MailStore und connected diesen
     * @return
     * @throws JAXBException
     * @throws MessagingException
     */
    private Store getStore() throws JAXBException, MessagingException
    {
        Setup setup = SetupReader.getSetup();
        ConnectionDesc connDesc = setup.getEmailSetup().receive;


        Properties props = System.getProperties();
        props.setProperty("mail.store.protocol", connDesc.protocol);
        Session session = Session.getDefaultInstance(props, null);

        String host = setup.getEmailSetup().receive.host;
        String user = setup.getEmailSetup().receive.user;
        String pass = setup.getEmailSetup().receive.passwd;

        Store store = session.getStore(connDesc.protocol);
        store.connect(host, user, pass);
        return store;
    }

    /**
     * @param f
     * @throws MessagingException 
     * @throws SQLException 
     * @throws IOException 
     */
    private void loadAllMessages(Folder f, Connection conn) throws MessagingException, SQLException, IOException
    {
        PreparedStatement stmt = null;
        try
        {
            f.open(Folder.READ_WRITE);
            Message[] messages = f.getMessages();
            for (int i = 0; i < messages.length; i++)
            {
                System.out.println("load message #" + messages[i].getMessageNumber());
                this.storeMessage(messages[i], conn);
            }

            //close the store and folder objects
            f.close(false);
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param message
     * @param conn
     * @throws SQLException 
     * @throws MessagingException 
     * @throws IOException 
     */
    private void storeMessage(Message message, Connection conn) throws SQLException, MessagingException, IOException
    {
        PreparedStatement stmt = null;
        try
        {
            boolean mustCommit = false;

            String msgId = message.getHeader("Message-ID")[0];
            int id = this.isMessageInDb(msgId, conn);
            if (id == -1)
            {
                id = this.storeEnvelope(message, conn);
                this.storeRecipients(id, message.getAllRecipients(), conn);
                AttachmentsDBUtil.createAttachment(message.getContentType(), message.getInputStream(), id,
                    EAttachmentDomain.EMAIL, conn);
                mustCommit = true;
            }

            String folderName = message.getFolder().getName();
            if (!this.isFolderAssociationInDB(id, folderName, conn))
            {
                this.storeFolderAssociation(id, folderName, conn);
                mustCommit = true;
            }

            if (mustCommit)
            {
                conn.commit();
            }
            message.setFlag(Flags.Flag.DELETED, true);
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param id
     * @param folderName
     * @param conn
     * @return
     * @throws SQLException 
     */
    private boolean isFolderAssociationInDB(int id, String folderName, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select `ref_id` from `mailbox_folders` where `ref_id`=? and `folder_name`=?");
            stmt.setInt(1, id);
            stmt.setString(2, folderName);
            rs = stmt.executeQuery();
            return rs.next();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }

    }

    /**
     * @param id
     * @param folderName
     * @param conn
     * @throws SQLException
     */
    private void storeFolderAssociation(int id, String folderName, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into mailbox_folders set ref_id=?, folder_name=?");
            stmt.setInt(1, id);
            stmt.setString(2, folderName);
            stmt.executeUpdate();
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }

    }

    /**
     * @param message
     * @param conn
     * @return
     * @throws SQLException
     * @throws MessagingException
     */
    private int storeEnvelope(Message message, Connection conn) throws SQLException, MessagingException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement(
                "insert into `mailbox` set `msg-id`=?, `subject`=?, `from`=?, `sent-date`=?, `recv-date`=?");

            stmt.setString(1, message.getHeader("Message-ID")[0]);
            stmt.setString(2, message.getSubject());
            stmt.setString(3, message.getFrom()[0].toString());
            stmt.setDate(4, new Date(message.getSentDate().getTime()));
            stmt.setDate(5, new Date(message.getReceivedDate().getTime()));
            stmt.executeUpdate();
            rs = stmt.getGeneratedKeys();
            rs.next();
            return rs.getInt(1);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param msgId
     * @param conn
     * @return -1 wenn nicht, sonst den primary key
     * @throws SQLException 
     * @throws MessagingException 
     */
    private int isMessageInDb(String msgId, Connection conn) throws SQLException, MessagingException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select id from `mailbox` where `msg-id`=?");
            stmt.setString(1, msgId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                return rs.getInt("id");
            }
            return -1;
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param id
     * @param recipients
     * @param conn
     * @throws SQLException 
     */
    private void storeRecipients(int id, Address[] recipients, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        try
        {
            stmt = conn.prepareStatement("insert into mailbox_recipients set `ref_id`=?, `to`=?");
            for (Address to : recipients)
            {
                stmt.setInt(1, id);
                stmt.setString(2, to.toString());
                stmt.executeUpdate();
            }
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
        }
    }
}
