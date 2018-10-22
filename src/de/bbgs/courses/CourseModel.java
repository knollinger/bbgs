package de.bbgs.courses;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.Attachment;
import de.bbgs.member.EMemberType;
import de.bbgs.member.EPhotoAgreement;
import de.bbgs.named_colors.NamedColor;
import de.bbgs.notes.Note;
import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name = "course-model")
@XmlType(name = "course-model")
public class CourseModel implements IJAXBObject
{
    @XmlElement(name = "id")
    public int id = 0;

    @XmlElement(name = "name")
    public String name = "";

    @XmlElement(name = "description")
    public String description = "";

    @XmlElement(name = "color-id")
    public String colorId = "";

    @XmlElement(name = "color")
    public String color = "";

    @XmlElement(name = "type")
    public ECourseType type = ECourseType.NONE;

    @XmlElementWrapper(name = "termine")
    @XmlElement(name = "termin")
    public List<Termin> termine = new ArrayList<>();

    @XmlElementWrapper(name = "members")
    @XmlElement(name = "member")
    public List<Member> member = new ArrayList<>();
    
    @XmlElementWrapper(name = "attachments")
    @XmlElement(name = "attachment")
    public List<Attachment> attachments = new ArrayList<>();
    
    @XmlElementWrapper(name = "notes")
    @XmlElement(name = "note")
    public List<Note> notes = new ArrayList<Note>();

    @XmlElementWrapper(name = "locations")
    @XmlElement(name = "location")
    public List<Location> locations = new ArrayList<>();

    @XmlElementWrapper(name = "colors")
    @XmlElement(name = "color")
    public List<NamedColor> colors = new ArrayList<>();

    @XmlType(name="CourseModel.Member")
    public static class Member {
        
        @XmlElement(name = "id")
        public int id = 0;
        
        @XmlElement(name="action")
        public EAction action = EAction.NONE;
        
        @XmlElement(name="zname")
        public String zname = "";

        @XmlElement(name="vname")
        public String vname = "";

        @XmlElement(name="type")
        public EMemberType type = EMemberType.UNKNOWN;
        
        @XmlElement(name="photoagreement")
        public EPhotoAgreement photoAgreement = EPhotoAgreement.NONE;
        
    }
}
