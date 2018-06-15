package de.bbgs.mail;

import java.io.IOException;
import java.util.Properties;

import javax.mail.Address;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.NoSuchProviderException;
import javax.mail.Session;
import javax.mail.Store;

public class TestCheckMails
{

    public static void check(String user, String password)
    {
        try
        {
            Properties props = System.getProperties();
            props.setProperty("mail.store.protocol", "imaps");
            Session session = Session.getDefaultInstance(props, null);
            Store store = session.getStore("imaps");
            store.connect("imap.gmail.com", user, password);
            System.out.println(store);
            enumFolder(store.getDefaultFolder());

            store.close();

        }
        catch (NoSuchProviderException e)
        {
            e.printStackTrace();
        }
        catch (MessagingException e)
        {
            e.printStackTrace();
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
    }

    public static void enumFolder(Folder folder) throws MessagingException, IOException
    {
        for (Folder f : folder.list("*"))
        {
            System.out.println(f.getFullName());
            System.out.println(f.getType());
            //            System.out.println(f.getUnreadMessageCount());

            //create the folder object and open it

            //            f.open(Folder.READ_ONLY);

            // retrieve the messages from the folder in an array and print it
            //            Message[] messages = f.getMessages();
            //            for (int i = 0, n = messages.length; i < n; i++)
            //            {
            //                Message message = messages[i];
            //                System.out.println("---------------------------------");
            //                System.out.println("Email Number " + (i + 1));
            //                System.out.println("Subject: " + message.getSubject());
            //                System.out.println("Recipients: " + dumpAllRecipients(message));
            //                System.out.println("From: " + message.getFrom()[0]);
            //                System.out.println("Text: " + message.getContent().toString());
            //
            //            }

            //close the store and folder objects
            //            f.close(false);

            if ((f.getType() & Folder.HOLDS_MESSAGES) == Folder.HOLDS_MESSAGES)
            {
//                dumpAllMessages(f);
            }

            if ((f.getType() & Folder.HOLDS_FOLDERS) == Folder.HOLDS_FOLDERS)
            {
                enumFolder(f);
            }
        }
    }

    private static void dumpAllMessages(Folder f) throws MessagingException, IOException
    {
        System.out.println(f.getUnreadMessageCount());
        f.open(Folder.READ_ONLY);

        //         retrieve the messages from the folder in an array and print it       
        Message[] messages = f.getMessages();
        for (int i = 0, n = messages.length; i < n; i++)
        {
            Message message = messages[i];
            System.out.println("---------------------------------");
            System.out.println("Email Number " + (i + 1));
            System.out.println("Subject: " + message.getSubject());
            System.out.println("Subject: " + message.getSentDate());
            System.out.println("Subject: " + message.getReceivedDate());
            //            System.out.println("Recipients: " + dumpAllRecipients(message));
            //            System.out.println("From: " + message.getFrom()[0]);
            //            System.out.println("Text: " + message.getContent().toString());

        }

        //close the store and folder objects
        //            f.close(false);

    }

    private static String dumpAllRecipients(Message message) throws MessagingException
    {
        StringBuilder b = new StringBuilder();
        Address[] allRecipients = message.getAllRecipients();
        for (Address address : allRecipients)
        {
            b.append(address.toString());
            b.append(", ");
        }
        return b.toString();
    }

    public static void main(String[] args)
    {

        String host = "pop.gmail.com";// change accordingly
        String mailStoreType = "pop3";
        String username = "bbgs.verwaltung@gmail.com";// change accordingly
        String password = "Sun12shine";// change accordingly

        check(username, password);

    }

}