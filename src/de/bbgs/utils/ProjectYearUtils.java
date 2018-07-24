package de.bbgs.utils;

import java.sql.Date;
import java.util.Calendar;

/**
 * Umrechnugs-Utilities für die Projekt-Jahre. EIn Projektjahr beginnt immer am 
 * 1.September und endet am 31.August.
 * 
 * Das erste Projekt-Jahr begann am 1.September 2014
 * 
 */
public class ProjectYearUtils
{
    /**
     * @param projYear
     * @return
     */
    public static Date getStartOfProjectYear(int projYear)
    {
        Calendar c = Calendar.getInstance();
        c.set(2014 + projYear - 1, 8, 1, 0, 0, 0);
        return new Date(c.getTimeInMillis());
    }

    /**
     * @param projYear
     * @return
     */
    public static Date getEndOfProjectYear(int projYear)
    {
        Calendar c = Calendar.getInstance();
        c.set(2014 + projYear, 7, 31, 0, 0, 0);
        return new Date(c.getTimeInMillis());
    }
}
