package de.bbgs.notes;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;

/**
 * Beschreibt eine Notiz innerhalb von BBGS. Notizen werden vielseitig 
 * eingesetzt. Bei Mitgliedern, bei Kursen, bei Partnern...
 * <br>
 * Sie folgen aber immer dem selben Schema. Es gibt einen Typ und eine
 * eigentliche Beschreibung.
 */
public class Note
{
    @XmlElement(name="id")
    public int id;

    @XmlElement(name = "type", defaultValue="UNKNOWN")
    public ENoteType type;

    @XmlElement(name = "description", defaultValue="")
    public String description;

    @XmlElement(name="action", defaultValue="NONE")
    public EAction action;
}
