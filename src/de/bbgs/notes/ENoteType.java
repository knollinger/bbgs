package de.bbgs.notes;

/**
 * Beschreibt den Typ einer Notiz innerhalb von BBGS. Notizen werden 
 * vielseitig  eingesetzt. Bei Mitgliedern, bei Kursen, bei Partnern...
 * <br>
 * Der Enum beschreibt erst mal nur den Typ einer Notiz
 *
 */
public enum ENoteType
{
    /**
     * 
     */
    UNKNOWN,

    /**
     * Ernährungs-Hinweise
     */
    DIET,
    
    /**
     * Medizinischer Hinweis
     */
    MEDICAL,
    
    /**
     * allgemeiner Hinweis
     */
    COMMON,
    
    /**
     * Sonstiges
     */
    OTHER;
    
    
    /**
     * Übersetze in die Menschenlesbare Form
     * 
     * @return
     */
    public String toHumanReadable() {
        
        String result = null;
        
        switch(this) {
            case UNKNOWN:
                result = "???";
                break;
                
            case DIET:
                result = "Ernährung";
                break;
                
            case MEDICAL:
                result = "Medizinischer Hinweis";
                break;
                
            case COMMON:
                result = "Allgemeiner Hinweis";
                break;
                
            case OTHER:
                result = "Sonstiges";
                break;
        }
        return result;
    }
}
