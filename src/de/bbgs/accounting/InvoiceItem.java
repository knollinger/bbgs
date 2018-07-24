package de.bbgs.accounting;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;

@XmlType(name="InvoiceItem")
public class InvoiceItem implements IJAXBObject
{
    @XmlElement(name="id")
    public int id = 0;

    @XmlElement(name="action")
    public EAction action = EAction.NONE;
    
    @XmlElement(name="ref-id")
    public int refId = 0;
    
    @XmlElement(name="account")
    public int account = 0;
    
    @XmlElement(name="name")
    public String name = "";
    
    @XmlElement(name="description")
    public String description = "";
}
