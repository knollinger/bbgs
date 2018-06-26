package de.bbgs.session;

import java.net.MalformedURLException;
import java.net.URL;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * Der SessionWrapper verpackt eine HttpSession und liefert Convinience-Methoden, 
 * um auf die mit der Session assozierten Daten zugreifen zu können.
 */
public class SessionWrapper
{
    private HttpSession httpSession = null;
    private URL baseUrl = null;

    /**
     * @param httpSession
     * @throws MalformedURLException 
     */
    public SessionWrapper(HttpServletRequest req) throws MalformedURLException
    {
        this.httpSession = req.getSession();

        // create the complete base-URL
        URL reqUrl = new URL(req.getRequestURL().toString());
        String ctxPath = req.getContextPath();

        this.baseUrl = new URL(reqUrl.getProtocol(), reqUrl.getHost(), reqUrl.getPort(), ctxPath);
    }

    /**
     * Die eigentliche "isValid"-Steuerung liegt bei der Servlet-Engine. Aus Sicht des 
     * SessionWrappers ist die Session gültig, wenn ein AccountName gesetzt ist.
     * 
     * @return
     */
    public boolean isValid()
    {
        return this.getAccountName() != null;
    }

    /**
     * Invalidiere die Session
     */
    public void invalidate()
    {
        this.httpSession.invalidate();
    }

    /**
     * @return die mit der Session assozierte AccountID
     */
    public int getAccountId()
    {
        Integer result = (Integer) this.httpSession.getAttribute("bbgs.accountid");
        return result.intValue();
    }

    /**
     * @param name
     */
    public void setAccountId(int accountId)
    {
        this.httpSession.setAttribute("bbgs.accountid", Integer.valueOf(accountId));
    }

    /**
     * @return den mit der Session assozierten AccountName
     */
    public String getAccountName()
    {
        return (String) this.httpSession.getAttribute("bbgs.accountname");
    }

    /**
     * @param name
     */
    public void setAccountName(String name)
    {
        this.httpSession.setAttribute("bbgs.accountname", name);
    }

    /**
     * @param mail
     */
    public void setEmail(String mail)
    {
        this.httpSession.setAttribute("bbgs.mail", mail);
    }

    /**
     * @return
     */
    public String getEmail()
    {
        return (String) this.httpSession.getAttribute("bbgs.mail");
    }

    /**
     * @return
     */
    public byte[] getMailSignature()
    {
        return (byte[]) this.httpSession.getAttribute("bbgs.mailSignature.data");
    }

    /**
     * @return
     */
    public String getMailSignatureType()
    {
        return (String) this.httpSession.getAttribute("bbgs.mailSignature.type");
    }

    /**
     * @param signature
     * @param type
     */
    public void setMailSignature(byte[] signature, String type)
    {
        this.httpSession.setAttribute("bbgs.mailSignature.data", signature);
        this.httpSession.setAttribute("bbgs.mailSignature.type", type);
    }

    /**
     * @return die jsessionId
     */
    public String getSessionId()
    {
        return this.httpSession.getId();
    }

    /**
     * @return
     */
    public URL getBaseURL()
    {
        return this.baseUrl;
    }
}
