package de.bbgs.sms;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.JAXBException;

import de.bbgs.setup.SMSSetup;
import de.bbgs.setup.SetupReader;
import de.bbgs.utils.IOUtils;

/**
 * 
 */
public class SMSSender
{
    /**
     * 
     * @param msg
     * @param phone
     * @return Liste mit den Addressen, welche mangels telefon-nr keine SMS erhalten konnten
     * @throws JAXBException
     * @throws IOException
     * @throws SendSMSException 
     */
    public static List<SMSAddress> sendSMS(String msg, Collection<SMSAddress> addies) throws JAXBException, IOException, SendSMSException
    {
        SMSSetup setup = SetupReader.getSetup().getSmsSetup();
        URLConnection conn = null;
        try
        {
            List<SMSAddress> undeliverable = new ArrayList<>();

            String phones = SMSSender.buildPhoneNrList(addies, undeliverable);
            if (phones.length() != 0)
            {
                StringBuilder req = new StringBuilder("https://gateway.sms77.io/api/sms?type=direct");
                req.append("&from=" + URLEncoder.encode(setup.getFrom(), "UTF-8"));
                req.append("&u=" + URLEncoder.encode(setup.getUser(), "UTF-8"));
                req.append("&p=" + URLEncoder.encode(setup.getApiKey(), "UTF-8"));
                req.append("&to=" + URLEncoder.encode(phones, "UTF-8"));
                req.append("&text=" + URLEncoder.encode(msg, "UTF-8"));
                req.append("&no_reload=1");
                req.append("&details=1");

                URL url = new URL(req.toString());
                conn = url.openConnection();
                SMSResponse rsp = SMSResponse.readResponse(conn.getInputStream());
                if (rsp.isError())
                {
                    throw new SendSMSException(rsp.getExplanation());
                }
            }
            return undeliverable;
        }
        finally
        {
            IOUtils.closeQuitly(conn);
        }
    }

    /**
     * @param undeliverable 
     * @param mobile
     * @return
     */
    private static String buildPhoneNrList(Collection<SMSAddress> addies, List<SMSAddress> undeliverable)
    {
        StringBuilder to = new StringBuilder();
        for (SMSAddress a : addies)
        {
            String phone = (a.getMobile());
            if (phone == null)
            {
                undeliverable.add(a);
            }
            else
            {
                if (to.length() != 0)
                {
                    to.append(",");
                }
                to.append(phone);
            }
        }
        return to.toString();
    }
}
