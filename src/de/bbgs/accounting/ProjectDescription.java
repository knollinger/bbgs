package de.bbgs.accounting;

import java.sql.Date;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;
import de.bbgs.xml.SQLDateXmlAdapter;

@XmlType(name = "ProjectDescription")
public class ProjectDescription implements IJAXBObject
{
    @XmlElement(name = "id")
    public int id;

    @XmlElement(name="action")
    public EAction action = EAction.NONE;
    
    @XmlElement(name = "name")
    public String name;

    @XmlElement(name = "description")
    public String description;

    @XmlElement(name = "from")
    @XmlJavaTypeAdapter(value = SQLDateXmlAdapter.class)
    public Date from;

    @XmlElement(name = "until")
    @XmlJavaTypeAdapter(value = SQLDateXmlAdapter.class)
    public Date until;
}
