package de.bbgs.setup;

import javax.xml.bind.annotation.XmlElement;

/**
 * 
 *
 */
public class EmailSetup
{
    private String host;
    private Integer port;
    private String user;
    private String passwd;
    private String from;
    private boolean useStartTLS;
    
    /**
     * @return
     */
    @XmlElement(name="host")
    public String getHost()
    {
        return host;
    }

    /**
     * @param host
     */
    public void setHost(String host)
    {
        this.host = host;
    }

    /**
     * @return
     */
    @XmlElement(name="port")
    public Integer getPort()
    {
        return port;
    }

    /**
     * @param port
     */
    public void setPort(Integer port)
    {
        this.port = port;
    }

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
    @XmlElement(name="pwd")
    public String getPwd()
    {
        return passwd;
    }

    /**
     * @param pwd
     */
    public void setPwd(String pwd)
    {
        this.passwd = pwd;
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

    /**
     * @return
     */
    @XmlElement(name="use-start-tls")
    public boolean isUseStartTLS()
    {
        return useStartTLS;
    }

    /**
     * @param useStartTLS
     */
    public void setUseStartTLS(boolean useStartTLS)
    {
        this.useStartTLS = useStartTLS;
    }
}
