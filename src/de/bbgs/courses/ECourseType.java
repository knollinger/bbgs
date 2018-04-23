package de.bbgs.courses;

import java.util.HashMap;
import java.util.Map;

public enum ECourseType
{    
    NONE,
    REGULAR, 
    ONETIME;
    
    private static Map<ECourseType, String> enumToHumanReadable;

    static
    {
        ECourseType.enumToHumanReadable = new HashMap<ECourseType, String>();
        ECourseType.enumToHumanReadable.put(NONE, "Unbekannt");
        ECourseType.enumToHumanReadable.put(REGULAR, "Regel-Kurs");
        ECourseType.enumToHumanReadable.put(ONETIME, "Veranstaltung/Ausfahrt");
    }

    /**
     * @return
     */
    public String toHumanReadable()
    {
        return ECourseType.enumToHumanReadable.get(this);
    }    
}
