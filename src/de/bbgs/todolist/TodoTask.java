package de.bbgs.todolist;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;

import de.bbgs.attachments.Attachment;
import de.bbgs.service.EAction;

/**
 *
 */
public class TodoTask
{
    @XmlElement(name="action")
    public EAction action = EAction.NONE;
    
    @XmlElement(name="id")
    public int id = -1;

    @XmlElement(name="title")
    public String title = "";

    @XmlElement(name="description")
    public String description = "";
    
    @XmlElement(name="todo_date")
    public String todoDate =  "";
    
    @XmlElement(name="remember_date")
    public String rememberDate =  "";
    
    @XmlElement(name="userid")
    public int userId = -1;

    @XmlElement(name="color")
    public String color = "";
    
    @XmlElementWrapper(name="attachments")
    @XmlElement(name="attachment")
    public List<Attachment> attachments = new ArrayList<Attachment>();
}
