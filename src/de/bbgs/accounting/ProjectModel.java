package de.bbgs.accounting;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.xml.IJAXBObject;

/**
 * @author anderl
 *
 */
@XmlRootElement(name="project-model")
@XmlType(name="ProjectModel")
public class ProjectModel implements IJAXBObject
{
    @XmlElement(name="core-data")
    public ProjectDescription coreData = new ProjectDescription();
    
    @XmlElement(name="project-item")
    public InvoiceItem projectItem = new InvoiceItem();
    
    @XmlElement(name="planning-item")
    @XmlElementWrapper(name="planning-items")
    public Collection<PlanningItem> planningItems = new ArrayList<>();

    @XmlElement(name="invoice-record")
    @XmlElementWrapper(name="invoice-records")
    public Collection<InvoiceRecord> invoiceRecords = new ArrayList<>();

    @XmlElement(name="inout-item")
    @XmlElementWrapper(name="inout-items")
    public Collection<InvoiceItem> invoiceItems = new ArrayList<>();

}
