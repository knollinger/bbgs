package de.bbgs.mail;

/**
 * @author anderl
 *
 */
@SuppressWarnings("serial")
public class MailAddressException extends Exception
{
    private static final String MSG = "Die Mail-Addresse '%1$s' ist ung\u00fcltig.";

    /**
     * @param address
     */
    public MailAddressException(String address)
    {
        super(String.format(MSG, address));
    }

    /**
     * @param address
     */
    public MailAddressException(String address, Throwable t)
    {
        super(String.format(MSG, address), t);
    }
}
