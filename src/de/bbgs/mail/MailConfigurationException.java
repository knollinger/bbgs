package de.bbgs.mail;

/**
 * 
 * @author anderl
 *
 */
@SuppressWarnings("serial")
public class MailConfigurationException extends Exception
{
    /**
     * @param msg
     */
    public MailConfigurationException(String msg)
    {
        super(msg);
    }

    /**
     * @param exc
     */
    public MailConfigurationException(Throwable exc)
    {
        super(exc);
    }

    /**
     * @param msg
     * @param exc
     */
    public MailConfigurationException(String msg, Throwable exc)
    {
        super(msg, exc);
    }
}
