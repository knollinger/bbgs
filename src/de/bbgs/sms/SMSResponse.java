package de.bbgs.sms;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import de.bbgs.utils.IOUtils;

public class SMSResponse
{
    private static Map<Integer, String> Explanations = new HashMap<Integer, String>();

    private int rspCode;
    private Properties props;

    static
    {
        Explanations.put(Integer.valueOf(100), "SMS wurde erfolgreich verschickt");
        Explanations.put(Integer.valueOf(101), "Versand an mindestens einen Empfänger fehlgeschlagen");
        Explanations.put(Integer.valueOf(201),
            "Absender ungültig. Erlaubt sind max 1 alphanumerische oder 16 numerische Zeichen.");
        Explanations.put(Integer.valueOf(202), "Empfängernummer ungültig");
        Explanations.put(Integer.valueOf(300), "Variable u und/oder p sind nicht angeben");
        Explanations.put(Integer.valueOf(301), "Variable to nicht gesetzt");
        Explanations.put(Integer.valueOf(304), "Variable type nicht gesetzt");
        Explanations.put(Integer.valueOf(305), "Variable text nicht gesetzt");
        Explanations.put(Integer.valueOf(400), "type ungültig. Siehe erlaubte Werte oben.");
        Explanations.put(Integer.valueOf(401), "Variable text ist zu lang");
        Explanations.put(Integer.valueOf(402),
            "Reloadsperre – diese SMS wurde bereits innerhalb der letzten 180 Sekunden verschickt");
        Explanations.put(Integer.valueOf(500), "Zu wenig Guthaben vorhanden.");
        Explanations.put(Integer.valueOf(600), "Carrier Zustellung misslungen");
        Explanations.put(Integer.valueOf(700), "Unbekannter Fehler");
        Explanations.put(Integer.valueOf(900),
            "Authentifizierung ist fehlgeschlagen. Bitte Benutzer und Api Key prüfen");
        Explanations.put(Integer.valueOf(902), "http API für diesen Account deaktiviert");
        Explanations.put(Integer.valueOf(903), "Server IP ist falsch");
        Explanations.put(Integer.valueOf(11), "SMS Carrier temporär nicht verfügbar");
    }

    /**
     * 
     */
    private SMSResponse()
    {

    }

    /**
     * @param in
     * @return
     * @throws IOException
     */
    public static SMSResponse readResponse(InputStream in) throws IOException
    {

        BufferedReader reader = null;
        try
        {
            SMSResponse rsp = new SMSResponse();
            reader = new BufferedReader(new InputStreamReader(in));
            rsp.readResponse(reader);
            return rsp;
        }
        finally
        {
            IOUtils.closeQuitly(reader);
        }
    }

    /**
     * @return
     */
    public boolean isError()
    {
        return this.rspCode != 100;
    }

    /**
     * 
     * @return
     */
    public int getResponseCode()
    {
        return this.rspCode;
    }

    /**
     * @param resultCode
     * @return
     */
    public String getExplanation()
    {
        return SMSResponse.Explanations.get(Integer.valueOf(this.rspCode));
    }

    /**
     * @return die Properties
     * 
     */
    public Properties getProperties()
    {
        return this.props;
    }

    /* (non-Javadoc)
     * @see java.lang.Object#toString()
     */
    public String toString()
    {
        return String.format("rspCode: %1$d, explanation: %2$s, props: %3$s", Integer.valueOf(this.rspCode), this.getExplanation(), this.props.toString());
    }

    /**
     * 
     * @param reader
     * @throws IOException
     */
    private void readResponse(BufferedReader reader) throws IOException
    {
        String line = reader.readLine();
        this.rspCode = Integer.parseInt(line);

        this.props = new Properties();
        this.props.load(reader);

    }
}
