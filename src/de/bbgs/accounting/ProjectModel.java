package de.bbgs.accounting;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.attachments.Attachment;
import de.bbgs.notes.Note;
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
    public Project coreData  = new Project();

    @XmlElementWrapper(name="attachments")
    @XmlElement(name="attachment")
    public Collection<Attachment> attachments = new ArrayList<>();

    @XmlElementWrapper(name="notes")
    @XmlElement(name="note")
    public Collection<Note> notes = new ArrayList<>();

    @XmlElementWrapper(name="planning-items")
    @XmlElement(name="planning-item")
    public Collection<PlanningItem> planningItems = new ArrayList<>();

    @XmlElement(name="proj-item")
    public ProjectInvoiceItem projAccount = new ProjectInvoiceItem();

    @XmlElementWrapper(name="invoice-items")
    @XmlElement(name="invoice-item")
    public Collection<InvoiceItem> invoiceItems = new ArrayList<>();
    
    /**
     * Präsentiert das InvoiceItem für das Projekt und hält alle InvoiceRecords,
     * welche auf das Projekt referenzieren
     */
    public static class ProjectInvoiceItem extends InvoiceItem
    {
        @XmlElementWrapper(name = "income-records")
        @XmlElement(name = "invoice-record")
        public Collection<InvoiceRecord> incomeRecords = new ArrayList<>();

        @XmlElementWrapper(name = "outgo-records")
        @XmlElement(name = "invoice-record")
        public Collection<InvoiceRecord> outgoRecords = new ArrayList<>();
    }

}
