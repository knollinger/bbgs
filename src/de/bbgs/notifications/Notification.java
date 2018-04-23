package de.bbgs.notifications;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.xml.IJAXBObject;

public class Notification implements IJAXBObject
{
    @XmlElement(name="title")
    public String title = "";
    
    @XmlElement(name="message")
    public String message = "";

    @XmlElement(name="time")
    public long time = System.currentTimeMillis();
}
