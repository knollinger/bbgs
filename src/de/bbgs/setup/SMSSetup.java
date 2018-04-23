package de.bbgs.setup;

import javax.xml.bind.annotation.XmlElement;

/**
 *
 */
public class SMSSetup
{
    private String user;
    private String apiKey;
    private String from;
    private int schedule;
    
    /**
     * @return
     */
    @XmlElement(name="user")
    public String getUser()
    {
        return user;
    }

    /**
     * @param user
     */
    public void setUser(String user)
    {
        this.user = user;
    }

    /**
     * @return
     */
    @XmlElement(name="api-key")
    public String getApiKey()
    {
        return apiKey;
    }

    /**
     * @param apiKey
     */
    public void setApiKey(String apiKey)
    {
        this.apiKey = apiKey;
    }
    
    /**
     * @return
     */
    @XmlElement(name="from")
    public String getFrom()
    {
        return from;
    }

    /**
     * @param from
     */
    public void setFrom(String from)
    {
        this.from = from;
    }

    @XmlElement(name="schedule")
    public int getSchedule()
    {
        return schedule;
    }

    public void setSchedule(int schedule)
    {
        this.schedule = schedule;
    }
}
