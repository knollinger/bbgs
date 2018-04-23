package de.bbgs.mail;

import javax.xml.bind.annotation.XmlElement;

public class MailMember
{
    @XmlElement(name = "id")
    public int id = 0;

    @XmlElement(name = "zname")
    public String zname = "";

    @XmlElement(name = "vname")
    public String vname = "";

    @XmlElement(name = "email")
    public String email = "";

    @XmlElement(name = "mobile")
    public String mobile = "";
}
