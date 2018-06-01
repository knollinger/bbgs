package de.bbgs.filesystem;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.xml.IJAXBObject;

/**
 *
 */
public class FileSystemObject implements IJAXBObject
{
    @XmlElement(name="id")
    public int id;
    
    @XmlElement(name="parent-id")
    public int parentId;
    
    @XmlElement(name="blob-id")
    public int blobId;

    @XmlElement(name="created")
    public String created;

    @XmlElement(name="accessed")
    public String accessed;
    
    @XmlElement(name="name")
    public String name;
}
