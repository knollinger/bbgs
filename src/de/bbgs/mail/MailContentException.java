package de.bbgs.mail;

@SuppressWarnings("serial")
public class MailContentException extends Exception
{
    /**
     * @param arg0
     */
    public MailContentException(String arg0)
    {
        super(arg0);
    }

    /**
     * @param arg0
     */
    public MailContentException(Throwable arg0)
    {
        super(arg0);
    }

    /**
     * @param arg0
     * @param arg1
     */
    public MailContentException(String arg0, Throwable arg1)
    {
        super(arg0, arg1);
    }
}
