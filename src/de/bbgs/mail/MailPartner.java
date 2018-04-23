package de.bbgs.mail;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.partner.EPartnerType;

public class MailPartner
{
    @XmlElement(name="id")
    public int id = 0;
    
    @XmlElement(name="name")
    public String name = "";
    
    @XmlElement(name="zname")
    public String zname = "";
    
    @XmlElement(name="vname")
    public String vname = "";
    
    @XmlElement(name="email")
    public String email = "";
    
    @XmlElement(name="mobile")
    public String mobile = "";
    
    @XmlElement(name="type")
    public EPartnerType type = EPartnerType.UNKNOWN;
}
