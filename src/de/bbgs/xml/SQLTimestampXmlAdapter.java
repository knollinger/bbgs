package de.bbgs.xml;

import java.sql.Date;
import java.sql.Timestamp;

import javax.xml.bind.annotation.adapters.XmlAdapter;

/**
 * @author anderl
 *
 */
public class SQLTimestampXmlAdapter extends XmlAdapter<String, Timestamp>
{

    /* (non-Javadoc)
     * @see javax.xml.bind.annotation.adapters.XmlAdapter#marshal(java.lang.Object)
     */
    @Override
    public String marshal(Timestamp date) throws Exception
    {
        
        long millies = date.getTime();
        return Long.toString(millies);
    }

    /* (non-Javadoc)
     * @see javax.xml.bind.annotation.adapters.XmlAdapter#unmarshal(java.lang.Object)
     */
    @Override
    public Timestamp unmarshal(String date) throws Exception
    {
        long millies = Long.parseLong(date);
        return new Timestamp(millies);
    }
}
