package de.bbgs.member;

import javax.xml.bind.annotation.adapters.XmlAdapter;

public enum ESex
{
    M, W, U, N;

    public String toHumanReadable()
    {
        String result = "";
        switch (this)
        {
            case M :
                result = "Männlich";
                break;

            case W :
                result = "Weiblich";
                break;

            case U :
                result = "keine Angabe";
                break;

            case N:
                result = "";
                break;
        }
        return result;
    }

    public static class XMLAdapter extends XmlAdapter<String, ESex>
    {

        @Override
        public String marshal(ESex type) throws Exception
        {
            return type.name();
        }

        @Override
        public ESex unmarshal(String name) throws Exception
        {
            if (name.equals(""))
            {
                return ESex.U;
            }
            return ESex.valueOf(name);
        }

    }
}
