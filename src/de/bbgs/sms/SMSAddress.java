package de.bbgs.sms;

class SMSAddress
{
    private String zname = "";
    private String vname = "";
    private String mobile = "";

    /**
     * @return
     */
    public String getZname()
    {
        return this.zname;
    }

    /**
     * @param zname
     */
    public void setZname(String zname)
    {
        this.zname = zname;
    }

    /**
     * @return
     */
    public String getVname()
    {
        return this.vname;
    }

    /**
     * @param vname
     */
    public void setVname(String vname)
    {
        this.vname = vname;
    }

    /**
     * @return
     */
    public String getMobile()
    {
        return this.mobile;
    }

    /**
     * @param mobile
     */
    public void setMobile(String mobile)
    {
        this.mobile = this.normalizePhoneNr(mobile);
    }

    /* (non-Javadoc)
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString()
    {
        return String.format("%1$s, %2$s - %3$s", this.zname, this.vname, this.mobile);
    }

    /**
     * @param phone
     * @return
     */
    private String normalizePhoneNr(String phone)
    {
        if (phone != null)
        {
            phone = phone.replace("/", "");
            phone = phone.replace("-", "");
            phone = phone.replace(" ", "");
            phone = phone.replace("+", "00");
            phone = phone.trim();
            if (phone.length() == 0)
            {
                phone = null;
            }
        }
        return phone;
    }
}