package de.bbgs.accounting;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.bbgs.attachments.Attachment;
import de.bbgs.service.EAction;
import de.bbgs.xml.CurrencyXmlAdapter;
import de.bbgs.xml.IJAXBObject;

/**
 *
 */
@XmlType(name = "InvoiceRecord")
public class InvoiceRecord implements IJAXBObject
{
    @XmlElement(name = "id")
    public int id = -1;

    @XmlElement(name = "action")
    public EAction action = EAction.NONE;

    @XmlElement(name = "from-invoice")
    int from = -1;

    @XmlElement(name = "to-invoice")
    int to = -1;

    @XmlElement(name = "amount")
    Double amount = new Double(0.0f);

    @XmlElement(name = "description")
    public String description = "";

    @XmlElement(name = "date")
    public String date = "";
    
    @XmlElementWrapper(name = "attachments")
    @XmlElement(name = "attachment")
    public Collection<Attachment> attachments = new ArrayList<>();
}
