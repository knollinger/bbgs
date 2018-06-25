package de.bbgs.dsgvo;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

/**
 *
 */
@XmlType(name="GetDSGVOOverviewHandler.Response.Item")
public class DSEInfoItem
{
    @XmlElement(name = "id")
    public int id;

    @XmlElement(name = "vname")
    public String vname;

    @XmlElement(name = "zname")
    public String zname;

    @XmlElement(name = "email")
    public String email;
    
    @XmlElement(name="state")
    public EDSEState state;
    
    @XmlElement(name="date")
    public String date;
}
