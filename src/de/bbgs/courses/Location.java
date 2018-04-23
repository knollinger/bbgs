package de.bbgs.courses;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.Attachment;
import de.bbgs.contacts.Contact;
import de.bbgs.notes.Note;
import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name = "course-location-model")
@XmlType(name = "CourseLocation")
public class Location implements IJAXBObject
{
    @XmlElement(name = "action")
    public EAction action = EAction.NONE;

    @XmlElement(name = "id")
    public int id = 0;

    @XmlElement(name = "name")
    public String name = "";

    @XmlElement(name = "description")
    public String description = "";

    @XmlElement(name = "zip-code")
    public int zipCode = 0;

    @XmlElement(name = "city")
    public String city = "";

    @XmlElement(name = "street")
    public String street = "";

    @XmlElement(name = "homepage")
    public String homepage = "";

    @XmlElementWrapper(name = "contacts")
    @XmlElement(name = "contact")
    List<Contact> contacts = new ArrayList<Contact>();

    @XmlElementWrapper(name = "attachments")
    @XmlElement(name = "attachment")
    List<Attachment> attachments = new ArrayList<Attachment>();

    @XmlElementWrapper(name = "notes")
    @XmlElement(name = "note")
    List<Note> notes = new ArrayList<Note>();
}
