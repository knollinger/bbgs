package de.bbgs.mail;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name = "custom-mailgroup-model")
@XmlType(name = "CustomMailGroupModel")
public class CustomMailGroupModel implements IJAXBObject
{
    @XmlElement(name="id")
    public int id = 0;

    @XmlElement(name="name")
    public String name = "";

    @XmlElement(name="description")
    public String description = "";
    
    @XmlElement(name="member")
    @XmlElementWrapper(name="members")
    public List<GroupMember> members = new ArrayList<>();
}
