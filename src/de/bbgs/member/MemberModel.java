package de.bbgs.member;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.Attachment;
import de.bbgs.contacts.Contact;
import de.bbgs.notes.Note;
import de.bbgs.partner.Partner;
import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name="member-model")
public class MemberModel implements IJAXBObject
{
    @XmlElement(name="force")
    public boolean force = false;
    
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
    
    @XmlType(name="MemberModel.Course")
    public static class Course {
        
        @XmlElement(name="id")
        public int courseId = 0;
        
        @XmlElement(name="action")
        public EAction action = EAction.NONE;
        
        @XmlElement(name="name")
        public String name = "";
        
        @XmlElement(name="photo_agreement")
        public EPhotoAgreement photoAgreement = EPhotoAgreement.NONE;
        
    }
}
