package de.bbgs.logging;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

import org.apache.tomcat.util.http.fileupload.IOUtils;

/**
 * Lädt alle MessageCataloge
 *
 */
class CatalogLoader
{
    /**
     * @return
     * @throws IOException 
     */
    public static Map<String, ResourceBundle> loadAllCatalogs() throws IOException
    {
        Map<String, ResourceBundle> result = new HashMap<>();

        BufferedReader r = null;
        try
        {
            InputStream in = CatalogLoader.class.getResourceAsStream("/META-INF/message-catalogs");
            r = new BufferedReader(new InputStreamReader(in));

            String line = r.readLine();
            while (line != null)
            {
                CatalogLoader.processLine(line, result);
                line = r.readLine();
            }
            return result;
        }
        finally
        {
            IOUtils.closeQuietly(r);
        }
    }

    /**
     * @param in
     * @param result
     */
    private static void processLine(String in, Map<String, ResourceBundle> result)
    {
        String line = CatalogLoader.strip(in);
        if (line.length() != 0)
        {
            ResourceBundle b = CatalogLoader.loadOneCatalog(line);
            if (b != null)
            {
                result.put(line, b);
            }
        }
    }

    /**
     * @param line
     * @return
     */
    private static ResourceBundle loadOneCatalog(String line)
    {
        try
        {
            String path = "/" + line + "/messagecatalog";
            path = path.replace('.', '/');
            return ResourceBundle.getBundle(path);
        }
        catch (MissingResourceException e)
        {
            System.err.format("unable to load messagecatalog from package '%1$s'\n", line);
        }
        return null;
    }

    /**
     * @param in
     * @return
     */
    private static String strip(String in)
    {
        int idx = in.indexOf('#');
        String line = (idx == -1) ? in : in.substring(0, idx);
        return line.trim();
    }
}
