package de.bbgs.todolist;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.session.AccountInfo;
import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name = "todolist-model")
@XmlType(name = "TodoListModel")
public class TodoListModel implements IJAXBObject
{
    @XmlElementWrapper(name = "tasks")
    @XmlElement(name = "task")
    public Collection<TodoTask> tasks = new ArrayList<>();
    
    @XmlElementWrapper(name = "accounts")
    @XmlElement(name = "account")
    public Collection<AccountInfo> accounts = new ArrayList<>();
}
