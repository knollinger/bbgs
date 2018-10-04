package de.bbgs.member;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.bbgs.service.EAction;

public class FoundMember
{
    @XmlElement(name = "id")
    public int id;

    @XmlElement(name = "action")
    public EAction action = EAction.NONE;

    @XmlElement(name = "zname")
    public String zname = "";

    @XmlElement(name = "vname")
    public String vname = "";

    @XmlElement(name = "type")
    @XmlJavaTypeAdapter(value = EMemberType.XMLAdapter.class)
    public EMemberType memberType = EMemberType.UNKNOWN;

    @XmlElement(name = "photo_agreement")
    public EPhotoAgreement photoAgreement = EPhotoAgreement.NONE;

    @XmlElement(name = "location")
    @XmlElementWrapper(name = "locations")
    public Collection<EFoundLocation> locations = new ArrayList<>();

    @Override
    public boolean equals(Object o)
    {
        boolean result = false;

        if (o instanceof FoundMember)
        {
            result = this.id == ((FoundMember) o).id;
        }
        return result;
    }
    
    public int hashcode()
    {
        return this.id;
    }

}
