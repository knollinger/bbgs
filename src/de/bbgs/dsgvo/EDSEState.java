package de.bbgs.dsgvo;

/**
 * 
 */
public enum EDSEState
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
