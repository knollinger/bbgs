package de.bbgs.logging;

import java.sql.Timestamp;

/**
 * @author anderl
 *
 */
public class Message
{
    private String msg;
    private Timestamp timestamp;

    /**
     * @param message
     */
    public Message(String message)
    {
        this.msg = message;
        this.timestamp = new Timestamp(System.currentTimeMillis());
    }
    
    /**
     * @return die Formatierte Message
     */
    public String getMsg()
    {
        return msg;
    }

    /**
     * @return den Timestamp der Message-Erstellung
     */
    public Timestamp getTimestamp()
    {
        return timestamp;
    }

}
