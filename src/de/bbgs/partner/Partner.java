package de.bbgs.partner;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;

/**
 * 
 * @author anderl
 *
 */
public class Partner
{
    @XmlElement(name="id")
    public int id = 0;
    
    @XmlElement(name = "type")
    public EPartnerType type = EPartnerType.UNKNOWN;

    @XmlElement(name = "name")
    public String name = "";
    
    @XmlElement(name = "description")
    public String desc = "";
    
    @XmlElement(name="partner-since")
    public String partnerSince = "";

    @XmlElement(name="partner-until")
    public String partnerUntil = "";
    
    @XmlElement(name="zip-code")
    public int zipCode = 0;

    @XmlElement(name = "city")
    public String city = "";
    
    @XmlElement(name = "street")
    public String street= "";
    
    @XmlElement(name = "homepage")
    public String homepage= "";
    
    @XmlElement(name="action")
    public EAction action = EAction.NONE;
}
