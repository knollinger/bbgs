package de.bbgs.accounting;

import java.sql.Date;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;
import de.bbgs.xml.SQLDateXmlAdapter;

@XmlType(name="InvoiceRecord")
public class InvoiceRecord implements IJAXBObject
{
    @XmlElement(name="id")
    public int id = 0;

    @XmlElement(name="action")
    public EAction action = EAction.NONE;

    @XmlElement(name="source")
    public int source = 0;
    
    @XmlElement(name="target")
    public int target = 0;
    
    @XmlElement(name="amount")
    public double amount = 0.0f;    
    
    @XmlElement(name="description")
    public String description = "";    
    
    @XmlElement(name="date")
    @XmlJavaTypeAdapter(value = SQLDateXmlAdapter.class)
    public Date date;    
}
