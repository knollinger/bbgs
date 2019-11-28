package de.bbgs.mail.addressbook;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.member.EMemberType;
import de.bbgs.service.EAction;

@XmlType(name="GroupMember")
public class GroupMember
{
    @XmlElement(name = "action")
    public EAction action = EAction.NONE;

    @XmlElement(name = "id")
    public int id = 0;

    @XmlElement(name = "zname")
    public String zname = "";

    @XmlElement(name = "vname")
    public String vname = "";

    @XmlElement(name = "city")
    public String city = "";

    @XmlElement(name = "street")
    public String street = "";

    @XmlElement(name = "type")
    public EMemberType type = EMemberType.UNKNOWN;
}
