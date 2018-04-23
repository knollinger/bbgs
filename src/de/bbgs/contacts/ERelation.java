package de.bbgs.contacts;

import java.util.HashMap;
import java.util.Map;

public enum ERelation
{
    FATHER, MOTHER, PARENTS, BROTHER, SISTER, UNCLE, AUNT, GFATHER, GMOTHER, TUTOR, OTHER;
    
    private static Map<ERelation, String> enumToHumanReadable;

    static
    {
        ERelation.enumToHumanReadable = new HashMap<ERelation, String>();
        ERelation.enumToHumanReadable.put(ERelation.FATHER, "Vater");
        ERelation.enumToHumanReadable.put(ERelation.MOTHER, "Mutter");
        ERelation.enumToHumanReadable.put(ERelation.PARENTS, "Eltern");
        ERelation.enumToHumanReadable.put(ERelation.BROTHER, "Bruder");
        ERelation.enumToHumanReadable.put(ERelation.SISTER, "Schwester");
        ERelation.enumToHumanReadable.put(ERelation.UNCLE, "Onkel");
        ERelation.enumToHumanReadable.put(ERelation.AUNT, "Tante");
        ERelation.enumToHumanReadable.put(ERelation.GFATHER, "Großvater");
        ERelation.enumToHumanReadable.put(ERelation.GMOTHER, "Großmutter");
        ERelation.enumToHumanReadable.put(ERelation.TUTOR, "Betreuer");
        ERelation.enumToHumanReadable.put(ERelation.OTHER, "Sonstiges");
    }

    /**
     * @return
     */
    public String toHumanReadable()
    {
        return ERelation.enumToHumanReadable.get(this);
    }
}