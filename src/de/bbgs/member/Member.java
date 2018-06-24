package de.bbgs.member;

import java.sql.Date;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import de.bbgs.dsgvo.EDSEState;
import de.bbgs.service.EAction;
import de.bbgs.xml.EmptyIntegerXmlAdapter;
import de.bbgs.xml.IJAXBObject;

/**
 * 
 *
 */
public class Member implements IJAXBObject
{

    @XmlElement(name = "action")
    public EAction action = EAction.NONE;

    @XmlElement(name = "id")
    public int id;

    @XmlElement(name = "zname")
    public String zname = "";

    @XmlElement(name = "vname")
    public String vname = "";

    @XmlElement(name = "vname2")
    public String vname2 = "";

    @XmlElement(name = "title")
    public String title = "";

    @XmlElement(name = "birth_date")
    public String birthDate = "";

    @XmlElement(name = "sex")
    @XmlJavaTypeAdapter(value = ESex.XMLAdapter.class)
    public ESex sex = ESex.U;

    @XmlElement(name = "zip_code")
    @XmlJavaTypeAdapter(value = EmptyIntegerXmlAdapter.class)
    public Integer zipCode = new Integer(0);

    @XmlElement(name = "city")
    public String city = "";

    @XmlElement(name = "street")
    public String street = "";

    @XmlElement(name = "photoagreement")
    public EPhotoAgreement fotoAgreement = EPhotoAgreement.NONE;

    @XmlElement(name = "phone")
    public String phone = "";

    @XmlElement(name = "phone2")
    public String phone2 = "";

    @XmlElement(name = "mobile")
    public String mobile = "";

    @XmlElement(name = "mobile2")
    public String mobile2 = "";

    @XmlElement(name = "email")
    public String email = "";

    @XmlElement(name = "email2")
    public String email2 = "";

    @XmlElement(name = "member_since")
    public String memberSince = "";

    @XmlElement(name = "member_until")
    public String memberUntil = "";

    @XmlElement(name = "school")
    @XmlJavaTypeAdapter(value = EmptyIntegerXmlAdapter.class)
    public Integer school = new Integer(0);

    @XmlElement(name = "type")
    @XmlJavaTypeAdapter(value = EMemberType.XMLAdapter.class)
    public EMemberType memberType = EMemberType.UNKNOWN;

    @XmlElement(name = "image")
    public byte[] image = new byte[0];

    @XmlElement(name = "image-mimetype")
    public String imageMimeType = "";

    @XmlElement(name = "mailsig")
    public byte[] mailsig = new byte[0];

    @XmlElement(name = "mailsig-mimetype")
    public String mailsigMimetype = "";
    
    @XmlElement(name="dse-state")
    public EDSEState dseState;
    
    @XmlElement(name="dse-date")
    public String dseDate;
    
    /* (non-Javadoc)
     * @see java.lang.Object#equals(java.lang.Object)
     */
    public boolean equals(Object ref)
    {
        if (ref instanceof Member)
        {
            return this.id == ((Member) ref).id;
        }
        return false;
    }

    /* (non-Javadoc)
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public int hashCode()
    {
        return this.id;
    }
}
