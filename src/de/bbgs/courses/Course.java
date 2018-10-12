package de.bbgs.courses;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;

/**
 *
 */
public class Course
{
    @XmlElement(name = "id")
    public int id;

    @XmlElement(name = "name")
    public String name;

    @XmlElement(name = "description")
    public String description;

    @XmlElement(name = "color-id")
    public int color;

    @XmlElement(name = "type")
    public ECourseType type = ECourseType.NONE;

    @XmlElement(name = "action")
    public EAction action = EAction.NONE;
    
    @XmlElement(name="start")
    public String start = "";
    
    @XmlElement(name="end")
    public String end = "";
}
