package de.bbgs.accounting;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;

public class Project implements IJAXBObject
{
    @XmlElement(name = "id")
    public int id = 0;
    
    @XmlElement(name = "action")
    public EAction action = EAction.NONE;
    
    @XmlElement(name = "name")
    public String name = "";
    
    @XmlElement(name = "description")  
    public String description = "";
    
    @XmlElement(name = "from")
    public String from = "";

    @XmlElement(name = "until")
    public String until = "";
}
