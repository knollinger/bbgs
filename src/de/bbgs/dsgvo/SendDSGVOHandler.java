package de.bbgs.dsgvo;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.xml.IJAXBObject;

/**
 * @author anderl
 *
 */
public class SendDSGVOHandler implements IXmlServiceHandler
{

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#handleRequest(de.bbgs.xml.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        return null;
    }

    /**
     *
     */
    @XmlRootElement(name = "send-dsgvo-mail-req")
    @XmlType(name = "SendDSGVOHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "send-to")
        public Collection<Integer> sendTo = new ArrayList<>();
    }

    /**
     *
     */
    @XmlRootElement(name = "send-dsgvo-mail-ok-rsp")
    @XmlType(name = "SendDSGVOHandler.Response")
    public static class Response implements IJAXBObject
    {
    }
}
