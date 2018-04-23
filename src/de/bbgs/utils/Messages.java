package de.bbgs.utils;

import java.util.ResourceBundle;

/**
 *
 */
public class Messages
{
    private static ResourceBundle messages = null;

    /**
     * @param msgId
     * @param obj
     * @return
     */
    public static String formatMsg(String msgId, Object... obj)
    {
        String fmt;
        try
        {
            ResourceBundle bundle = Messages.getBundle();
            fmt = bundle.getString(msgId);
        }
        catch (Exception e)
        {
            fmt = msgId;            
        }
        return String.format(fmt, obj);
    }

    /**
     * @return
     */
    private static ResourceBundle getBundle()
    {
        if (Messages.messages == null)
        {
            String path = Messages.class.getName();
            Messages.messages = ResourceBundle.getBundle(path);
        }
        return Messages.messages;
    }
}
