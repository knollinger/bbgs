package de.bbgs.mail;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.xml.IJAXBObject;

@XmlType(name = "CustomMailGroup")
public class CustomMailGroup implements IJAXBObject
{
    @XmlElement(name = "id")
    public int id = 0;

    @XmlElement(name = "name")
    public String name = "";

    @XmlElement(name = "description")
    public String description = "";
}
