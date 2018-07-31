package de.bbgs.xml;

import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;

import javax.xml.bind.annotation.adapters.XmlAdapter;

/**
 * @author anderl
 *
 */
public class CurrencyXmlAdapter extends XmlAdapter<String, Double>
{
    private static NumberFormat currencyFmt;

    static
    {
        CurrencyXmlAdapter.currencyFmt = NumberFormat.getNumberInstance(Locale.GERMANY);
        CurrencyXmlAdapter.currencyFmt.setMinimumFractionDigits(2);
        CurrencyXmlAdapter.currencyFmt.setMaximumFractionDigits(2);
        CurrencyXmlAdapter.currencyFmt.setGroupingUsed(true);
        CurrencyXmlAdapter.currencyFmt.setRoundingMode(RoundingMode.HALF_EVEN);
    }
    
    @Override
    public String marshal(Double val) throws Exception
    {
        return CurrencyXmlAdapter.currencyFmt.format(val.doubleValue());
    }

    @Override
    public Double unmarshal(String val) throws Exception
    {
        return Double.valueOf(CurrencyXmlAdapter.currencyFmt.parse(val).doubleValue());
    }
}
