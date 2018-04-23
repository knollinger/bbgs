package de.bbgs.courses;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.Attachment;
import de.bbgs.member.Member;
import de.bbgs.notes.Note;
import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name = "course-termin-model")
@XmlType(name = "CourseTerminModel")
public class CourseTerminModel implements IJAXBObject
{
    @XmlElement(name = "course-id")
    public int courseId = 0;

    @XmlElement(name = "course-name")
    public String name = "";

    @XmlElement(name = "course-description")
    public String description = "";

    @XmlElement(name = "termin")
    public Termin termin = new Termin();

    @XmlElementWrapper(name = "members")
    @XmlElement(name = "member")
    public List<Member> member = new ArrayList<Member>();

    @XmlElementWrapper(name = "attachments")
    @XmlElement(name = "attachment")
    public List<Attachment> attachments = new ArrayList<Attachment>();

    @XmlElementWrapper(name = "notes")
    @XmlElement(name = "note")
    public List<Note> notes = new ArrayList<Note>();

    @XmlElementWrapper(name = "locations")
    @XmlElement(name = "location")
    public List<Location> locations = new ArrayList<Location>();
}
