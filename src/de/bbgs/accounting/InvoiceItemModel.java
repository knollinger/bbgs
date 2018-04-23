package de.bbgs.accounting;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.xml.IJAXBObject;

@XmlRootElement(name="invoice-item-model")
@XmlType(name="InvoiceItemModel")
public class InvoiceItemModel implements IJAXBObject
{
    @XmlElementWrapper(name="items")
    @XmlElement(name="item")
    public Collection<InvoiceItem> items = new ArrayList<>();
}
