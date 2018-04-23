package de.bbgs.courses;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.EAction;

/**
 * 
 *
 */
@XmlType(name="CourseTermin")
public class Termin
{
    @XmlElement(name = "action")
    public EAction action = EAction.NONE;

    @XmlElement(name = "id")
    public int id = 0;

    @XmlElement(name = "date")
    public String date = "";

    @XmlElement(name = "begin")
    public String startTime = "";

    @XmlElement(name = "end")
    public String endTime = "";

    @XmlElement(name = "location-id")
    public int locationId = 0;
}