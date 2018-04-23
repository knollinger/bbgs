package de.bbgs.accounting;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;

/**
 *
 */
public class PlanningItem
{
    @XmlElement(name="id")
    public int id = -1;
    
    @XmlElement(name="proj-ref")
    public int projRef = -1;
    
    @XmlElement(name="item-ref")
    public int itemRef = -1;
    
    @XmlElement(name="konto-nr")
    public int kontoNr = -1;
    
    @XmlElement(name="action")
    public EAction action = EAction.NONE;
    
    @XmlElement(name="amount")    
    public double amount = 0.0f;    
}
