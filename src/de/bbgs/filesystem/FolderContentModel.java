package de.bbgs.filesystem;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;

import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name="folder-content-model")
public class FolderContentModel implements IJAXBObject
{
    @XmlElement(name="parent")
    @XmlElementWrapper(name="parents")
    public List<FileSystemObject> parents = new ArrayList<>();

    @XmlElement(name="filesys-object")
    @XmlElementWrapper(name="filesys-objects")
    public List<FileSystemObject> items = new ArrayList<>();
}
