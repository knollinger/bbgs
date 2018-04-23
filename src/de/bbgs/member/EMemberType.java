package de.bbgs.member;

import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.annotation.adapters.XmlAdapter;

public enum EMemberType
{
    UNKNOWN, TEACHER, SCOUT, EXSCOUT, PRAKTIKANT, EHRENAMT, FEST, STUDENT, REFUGEE, SHORT, REG_COURSE, REG_EVENT;

    private static Map<EMemberType, String> enumToHumanReadable;

    static
    {
        EMemberType.enumToHumanReadable = new HashMap<EMemberType, String>();
        EMemberType.enumToHumanReadable.put(TEACHER, "Trainer");
        EMemberType.enumToHumanReadable.put(SCOUT, "Scout");
        EMemberType.enumToHumanReadable.put(EXSCOUT, "Ex-Scout");
        EMemberType.enumToHumanReadable.put(PRAKTIKANT, "Praktikant");
        EMemberType.enumToHumanReadable.put(EHRENAMT, "Ehrenamtlicher Mitarbeiter");
        EMemberType.enumToHumanReadable.put(FEST, "Festangestellt");
        EMemberType.enumToHumanReadable.put(STUDENT, "Kurs-Teilnehmer");
        EMemberType.enumToHumanReadable.put(REFUGEE, "Geflüchtete");
        EMemberType.enumToHumanReadable.put(SHORT, "Kurz-Mitgliedschafft");
        EMemberType.enumToHumanReadable.put(REG_COURSE, "Online-Anmeldung Regelkurs");
        EMemberType.enumToHumanReadable.put(REG_EVENT, "Online-Anmeldung Veranstaltung");
    }

    /**
     * @return
     */
    public String toHumanReadable()
    {
        return EMemberType.enumToHumanReadable.get(this);
    }
    
    public static class XMLAdapter extends XmlAdapter<String, EMemberType> {

        @Override
        public String marshal(EMemberType type) throws Exception
        {
            if(type.equals(EMemberType.UNKNOWN)) {
                return "";
            }
            return type.name();
        }

        @Override
        public EMemberType unmarshal(String name) throws Exception
        {
            if(name.equals("")) {
                return EMemberType.UNKNOWN;
            }
            return EMemberType.valueOf(name);
        }
        
    }
}