package de.bbgs.named_colors;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;

/**
 * 
 */
public class NamedColor
{
    @XmlElement(name="id")
    public int id = 0;
    
    @XmlElement(name="action")
    public EAction action = EAction.NONE;
    
    @XmlElement(name="value")
    public String value="#ffffff";

    @XmlElement(name="name")
    public String name = "";
}
