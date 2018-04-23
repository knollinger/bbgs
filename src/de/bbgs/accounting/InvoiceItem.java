package de.bbgs.accounting;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.EAction;
import de.bbgs.xml.IJAXBObject;

@XmlType(name = "InvoiceItem")
@XmlAccessorType(XmlAccessType.NONE)
public class InvoiceItem implements IJAXBObject
{
    @XmlElement(name = "id")
    public int id = -1;

    /**
     * Die ref_id ist nur im Kontext von Items relevant, welche den Typ "Planning" haben. 
     * In diesem Kontext verweis Sie auf die Project-ID.
     * 
     * Es handelt sich hierbei um Projekt-Spezifische Geld-Töpfe. In der Planungs-Phase
     * können die Mädels (nach Schätzung der benötigten Mittel) einen oder auch mehrere
     * InvoiceItems anlegen, und mit Mitteln aus den Eingangs-Geldern versehen.
     * 
     * Das System generiert dann einen InvoiceRecord, welcher eine Umbuchung zwischen den 
     * Eingangs-Konten und dem Projekt-Geld-Topf abbildet. Derart geplante Mittel stehen 
     * für weitere Plaungen nicht mehr zur Verfügung.
     * 
     * Alle erfassten Projekt-Ausgaben gehen dann gegen einen dieser Projekt-Geld-Töpfe, 
     * es enstehen also InvoiceRecords von einem dieser Geld-Töpfe zu einem Outgoing-Topf.
     */
    @XmlElement(name = "ref_id")
    public int refId = -1;

    @XmlElement(name = "action")
    public EAction action = EAction.NONE;

    @XmlElement(name = "konto")
    int kontoNr = -1;

    @XmlElement(name = "name")
    public String name = "";

    @XmlElement(name = "description")
    public String description = "";

    @XmlElement(name = "type")
    public EInvoiceItemType type = EInvoiceItemType.NONE;
    
    @XmlElement(name = "amount")
    public double amount = 0.0f;
    
    /**
     * Der Typ ist stark mit der Kontonummer verknüpft. Stelle sicher, 
     * dass Typ und Kontonummer zusammen passen
     */
    public void sanitizeType()
    {
        if (type != EInvoiceItemType.PLANNING)
        {
            this.type = (this.kontoNr < 5800) ? EInvoiceItemType.INCOME : EInvoiceItemType.OUTGO;
        }
    }
}
