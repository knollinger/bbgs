package de.bbgs.partner;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.Attachment;
import de.bbgs.contacts.Contact;
import de.bbgs.notes.Note;
import de.bbgs.todolist.TodoTask;
import de.bbgs.xml.IJAXBObject;

/**
 * @author anderl
 *
 */
@XmlRootElement(name="partner-model")
@XmlType(name="PartnerModel")
public class PartnerModel implements IJAXBObject
{
    @XmlElement(name = "core-data")
    public Partner coreData = new Partner();
    
    @XmlElement(name = "contact")
    @XmlElementWrapper(name = "contacts")
    public List<Contact> contacts = new ArrayList<Contact>();
    

    @XmlElementWrapper(name = "notes")
    @XmlElement(name = "note")
    public Collection<Note> notes = new ArrayList<Note>();
    
    @XmlElementWrapper(name = "attachments")
    @XmlElement(name = "attachment")
    public Collection<Attachment> attachments = new ArrayList<Attachment>();
}
