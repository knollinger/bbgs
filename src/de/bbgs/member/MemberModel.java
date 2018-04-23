package de.bbgs.member;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;

import de.bbgs.attachments.Attachment;
import de.bbgs.contacts.Contact;
import de.bbgs.courses.Course;
import de.bbgs.notes.Note;
import de.bbgs.partner.Partner;
import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name="member-model")
public class MemberModel implements IJAXBObject
{
    @XmlElement(name="core-data")
    public Member coreData = new Member();
    
    @XmlElementWrapper(name = "contacts")
    @XmlElement(name = "contact")
    public Collection<Contact> contacts = new ArrayList<>();

    @XmlElementWrapper(name = "notes")
    @XmlElement(name = "note")
    public Collection<Note> notes = new ArrayList<>();
    
    @XmlElementWrapper(name = "attachments")
    @XmlElement(name = "attachment")
    public Collection<Attachment> attachments = new ArrayList<>();

    @XmlElementWrapper(name = "courses")
    @XmlElement(name = "course")
    public Collection<Course> courses = new ArrayList<>();

    @XmlElementWrapper(name = "partners")
    @XmlElement(name = "partner")
    public Collection<Partner> partner = new ArrayList<>();

}
