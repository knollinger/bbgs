package de.bbgs.contacts;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;

/**
 * 
 *
 */
public class Contact
{
    @XmlElement(name = "id")
    public int id;

    @XmlElement(name = "action")
    public EAction action;

    @XmlElement(name = "zname")
    public String zname;

    @XmlElement(name = "vname")
    public String vname;

    @XmlElement(name = "vname2")
    public String vname2;

    @XmlElement(name = "title")
    public String title;

    @XmlElement(name = "phone")
    public String phone;

    @XmlElement(name = "mobile")
    public String mobile;

    @XmlElement(name = "email")
    public String email;

    @XmlElement(name = "phone2")
    public String phone2;

    @XmlElement(name = "mobile2")
    public String mobile2;

    @XmlElement(name = "email2")
    public String email2;
    
    @XmlElement(name = "relation", defaultValue="OTHER")
    public ERelation relation;
    
}
