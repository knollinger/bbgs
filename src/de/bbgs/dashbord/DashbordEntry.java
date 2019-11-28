package de.bbgs.dashbord;

import java.sql.Date;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.bbgs.xml.SQLDateXmlAdapter;

/**
 * @author anderl
 *
 */
public class DashbordEntry 
{
    @XmlElement(name = "type")
    public EDashbordEntryType type;

    @XmlElement(name = "date")
    @XmlJavaTypeAdapter(value = SQLDateXmlAdapter.class)
    public Date date;

    @XmlElement(name = "title")
    public String title;

    @XmlElement(name = "text")
    public String text;
}
