package de.bbgs.accounting;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name="invoice-items-model")
@XmlType(name="InvoiceItemsModel")
public class InvoiceItemsModel implements IJAXBObject
{
    @XmlElement(name="item")
    public Collection<InvoiceItem> items = new ArrayList<>();
}
