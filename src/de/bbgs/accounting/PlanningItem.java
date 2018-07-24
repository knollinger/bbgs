package de.bbgs.accounting;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.EAction;

@XmlType(name="PlanningItem")
public class PlanningItem
{
    @XmlElement(name="id")
    public int id = 0;
    
    @XmlElement(name="action")    
    public EAction action = EAction.NONE;
    
    @XmlElement(name="proj-id")
    public int projId = 0;
    
    @XmlElement(name="inv-item-id")
    public int invItemId = 0;
    
    @XmlElement(name="amount")
    public double amount = 0.0f;
    
    @XmlElement(name="description")
    public String description = "";
}
