package de.bbgs.mail;

import java.io.UnsupportedEncodingException;

import javax.mail.internet.InternetAddress;

/**
 * 
 * @author anderl
 *
 */
class MailSenderInfo
{
    private String zname;
    private String vname;
    private String email;
    private byte[] signature;
    private String sigMimeType;

    /**
     * @return
     */
    public String getZName()
    {
        return this.zname;
    }

    /**
     * @param name
     */
    public void setZName(String name)
    {
        this.zname = name;
    }

    /**
     * @return
     */
    public String getVName()
    {
        return this.vname;
    }

    /**
     * @param name
     */
    public void setVName(String name)
    {
        this.vname = name;
    }

    /**
     * @return
     */
    public String getEmail()
    {
        return email;
    }

    /**
     * @param email
     */
    public void setEmail(String email)
    {
        this.email = email;
    }
    
    /**
     * @return
     */
    public String getSigMimeType()
    {
        return this.sigMimeType;
    }

    /**
     * 
     * @param sigMimeType
     */
    public void setSigMimeType(String sigMimeType)
    {
        this.sigMimeType = sigMimeType;
    }

    /**
     * @return
     */
    public byte[] getSignature()
    {
        return signature;
    }

    /**
     * @param signature
     */
    public void setSignature(byte[] signature)
    {
        this.signature = signature;
    }
    
    /**
     * @return
     */
    public InternetAddress getInternetAddress() {

        InternetAddress result = null;
        try
        {
            String name = String.format("%1$s, %2$s", this.zname, this.vname);
            result = new InternetAddress(this.email, name, "UTF-8");
        }
        catch (UnsupportedEncodingException e)
        {
            // can't occur on our platform
        }
        return result;
    }
    
    /**
     * @return
     */
    public boolean hasSignature() {
        
        return this.sigMimeType != null && this.sigMimeType != "" && this.signature != null && this.signature.length != 0;
    }
}
