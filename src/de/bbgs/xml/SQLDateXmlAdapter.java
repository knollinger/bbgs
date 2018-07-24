package de.bbgs.xml;

import java.sql.Date;

import javax.xml.bind.annotation.adapters.XmlAdapter;

/**
 * @author anderl
 *
 */
public class SQLDateXmlAdapter extends XmlAdapter<String, Date>
{

    /* (non-Javadoc)
     * @see javax.xml.bind.annotation.adapters.XmlAdapter#marshal(java.lang.Object)
     */
    @Override
    public String marshal(Date date) throws Exception
    {
        
        long millies = date.getTime();
        return Long.toString(millies);
    }

    /* (non-Javadoc)
     * @see javax.xml.bind.annotation.adapters.XmlAdapter#unmarshal(java.lang.Object)
     */
    @Override
    public Date unmarshal(String date) throws Exception
    {
        long millies = Long.parseLong(date);
        return new Date(millies);
    }

}
