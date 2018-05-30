package de.bbgs.partner;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.service.IXmlServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;

/**
 *
 */
public class GetPartnerOverviewHandler implements IXmlServiceHandler
{
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /**
     * 
     * @return
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        Collection<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /**
     * @return
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /**
     * @param request
     * @param session
     * @return
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        IJAXBObject rsp = null;
        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();

            Response okRsp = new Response();
            okRsp.partners.addAll(PartnerDBUtil.getAllPartners(conn));
            rsp = okRsp;
        }
        catch (SQLException e)
        {
            rsp = new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
        return rsp;
    }

    /**
     * 
     */
    @XmlRootElement(name = "get-partner-overview-request")
    @XmlType(name="GetPartnerOverviewHandler.Request")
    public static class Request implements IJAXBObject
    {

    }

    /**
     * 
     */
    @XmlRootElement(name = "get-partner-overview-ok-response")
    @XmlType(name="GetPartnerOverviewHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "partner")
        @XmlElementWrapper(name = "partners")
        public List<Partner> partners = new ArrayList<Partner>();
    }
}
