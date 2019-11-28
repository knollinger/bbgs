package de.bbgs.partner;

/**
 * @author anderl
 *
 */
public enum EPartnerType
{
    /**
     * 
     */
    UNKNOWN("Unbekannt"), 
    
    /**
     * 
     */
    COOP("Kooperations-Partner"), 
    
    /**
     * 
     */
    SPONSOR("Sponsor");

    private String humanReadable;

    /**
     * @param humanReadable
     */
    private EPartnerType(String humanReadable)
    {
        this.humanReadable = humanReadable;
    }

    /**
     * @return
     */
    public String getHumandReadable()
    {
        return this.humanReadable;
    }
}
