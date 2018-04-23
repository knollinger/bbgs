package de.bbgs.utils;

import java.io.FilterOutputStream;
import java.io.OutputStream;

/**
 *
 */
public class CloseShieldedOutputStream extends FilterOutputStream
{
    /**
     * @param out
     */
    public CloseShieldedOutputStream(OutputStream out)
    {
        super(out);
    }

    /* (non-Javadoc)
     * @see java.io.FilterOutputStream#close()
     */
    public void close()
    {

    }
}
