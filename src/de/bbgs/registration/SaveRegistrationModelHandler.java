package de.bbgs.registration;

import java.util.ArrayList;
import java.util.Collection;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.xml.IJAXBObject;

/**
 * 
 * @author anderl
 *
 */
public class SaveRegistrationModelHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
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

    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        // TODO Auto-generated method stub
        return null;
    }

    @XmlRootElement(name="save-registration-req")
    @XmlType(name="SaveRegistrationModelHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    @XmlRootElement(name="save-registration-model-ok-rsp")
    @XmlType(name="SaveRegistrationModelHandler.Response")
    public static class Response implements IJAXBObject
    {

    }

}
