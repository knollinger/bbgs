package de.bbgs.mail.addressbook;

import javax.xml.bind.annotation.XmlElement;

public class MailCourse
{
    @XmlElement(name = "id")
    public int id;

    @XmlElement(name = "name")
    public String name;

    @XmlElement(name = "description")
    public String description;
}
