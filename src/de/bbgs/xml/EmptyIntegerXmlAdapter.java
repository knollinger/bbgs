package de.bbgs.xml;

import javax.xml.bind.annotation.adapters.XmlAdapter;

/**
 * @author anderl
 *
 */
public class EmptyIntegerXmlAdapter extends XmlAdapter<String, Integer>
{
    @Override
    public String marshal(Integer val) throws Exception
    {
        return (val == null || val.intValue() == 0) ? "" : Integer.toString(val.intValue());
    }

    @Override
    public Integer unmarshal(String val) throws Exception
    {
        return Integer.valueOf(val);
    }
}
