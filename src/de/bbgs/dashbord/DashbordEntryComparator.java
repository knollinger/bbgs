package de.bbgs.dashbord;

import java.util.Comparator;

public class DashbordEntryComparator implements Comparator<DashbordEntry>
{
    @Override
    public int compare(DashbordEntry dbe1, DashbordEntry dbe2)
    {
        return dbe1.date.compareTo(dbe2.date);
    }
}
