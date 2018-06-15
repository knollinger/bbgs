package de.bbgs.dsgvo;

/**
 * 
 */
public enum EDSGVOState
{
    /**
     * noch nicht angefordert
     */
    NONE, 
    
    /**
     * Warte auf ANtwort 
     */
    PENDING, 
    
    /**
     * Angenommen
     */
    ACCEPTED, 
    
    /**
     * Abgelehnt
     */
    REJECTED
}
