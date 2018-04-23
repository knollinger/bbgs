package de.bbgs.session;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

@XmlType(name="AccountInfo")
public class AccountInfo
{
    @XmlElement(name = "id")
    public int id;

    @XmlElement(name = "name")
    public String accountName;
}