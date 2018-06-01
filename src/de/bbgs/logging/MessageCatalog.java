package de.bbgs.logging;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.ResourceBundle;

/**
 * @author anderl
 *
 */
public class MessageCatalog
{
    private static Map<String, ResourceBundle> catalog = null;

    /**
     * @param callee
     * @param msgId
     * @param params
     * @return
     */
    public static Message getMessage(Object callee, String msgId, Object... params)
    {
        ResourceBundle b = MessageCatalog.getCatalog(callee);

        String msg;
        if (b != null && b.containsKey(msgId))
        {
            msg = String.format(b.getString(msgId), params);
        }
        else
        {
            msg = String.format("%1$s - %2$s", msgId, Arrays.toString(params));
        }
        return new Message(msg);
    }

    /**
     * @return
     * @throws IOException 
     */
    private static ResourceBundle getCatalog(Object callee)
    {
        MessageCatalog.ensureCatalogsAreLoaded();

        String key;
        if (callee instanceof Class)
        {
            key = ((Class<?>)callee).getPackage().getName();
        }
        else
        {
            key = callee.getClass().getPackage().getName();
        }
        return MessageCatalog.catalog.get(key);
    }

    /**
     * Stelle sicher, dass alle Cataloge geladen sind
     */
    private static void ensureCatalogsAreLoaded()
    {

        if (MessageCatalog.catalog == null)
        {
            try
            {
                MessageCatalog.catalog = CatalogLoader.loadAllCatalogs();
            }
            catch (IOException e)
            {
                MessageCatalog.catalog = new HashMap<>();
            }
        }
    }
}
