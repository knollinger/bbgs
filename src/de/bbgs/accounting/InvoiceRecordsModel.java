package de.bbgs.accounting;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.session.AccountInfo;
import de.bbgs.xml.IJAXBObject;

/**
 *
 */
@XmlRootElement(name="invoice-records-model")
@XmlType(name="InvoiceRecordsModel")
public class InvoiceRecordsModel implements IJAXBObject
{
    @XmlElementWrapper(name="records")
    @XmlElement(name="record")
    public Collection<InvoiceRecord> records = new ArrayList<>();
    
    @XmlElementWrapper(name="invoice-items")
    @XmlElement(name="invoice-item")
    public Collection<InvoiceItem> items = new ArrayList<>();
    
    @XmlElementWrapper(name="user-accounts")
    @XmlElement(name="user-account")
    public Collection<AccountInfo> users = new ArrayList<>();
    
    
}
