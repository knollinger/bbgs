package de.bbgs.setup;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/*---------------------------------------------------------------------------*/
/**
 * 
 *
 */
@XmlRootElement(name = "setup")
public class Setup
{
    private DbSetup dbSetup;
    private EmailSetup emailSetup;
    private SMSSetup smsSetup;


    /**
     * 
     * @return
     */
    @XmlElement(name="database")
    public DbSetup getDbSetup()
    {
        return this.dbSetup;
    }

    /**
     * 
     * @param dbSetup
     */
    public void setDbSetup(DbSetup dbSetup)
    {
        this.dbSetup = dbSetup;
    }

    /**
     * 
     * @return
     */
    @XmlElement(name="email")
    public EmailSetup getEmailSetup()
    {
        return this.emailSetup;
    }

    /**
     * 
     * @param emailSetup
     */
    public void setEmailSetup(EmailSetup emailSetup)
    {
        this.emailSetup = emailSetup;
    }

    /**
     * 
     * @return
     */
    @XmlElement(name="sms")
    public SMSSetup getSmsSetup()
    {
        return this.smsSetup;
    }

    /**
     * 
     * @param smsSetup
     */
    public void setSmsSetup(SMSSetup smsSetup)
    {
        this.smsSetup = smsSetup;
    }
}
