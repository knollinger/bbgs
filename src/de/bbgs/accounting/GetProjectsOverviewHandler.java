package de.bbgs.accounting;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;

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
 *
 */
public class GetProjectsOverviewHandler implements IXmlServiceHandler
{

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#needsSession()
     */
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
        IJAXBObject rsp = null;
        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();
            Response response = new Response();
            response.projects.addAll(ProjectsDBUtils.getAllProjects(conn));
            response.invoiceItems = AccountingDBUtils.getAllInvoiceItems(conn);

            rsp = response;
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

    @XmlRootElement(name = "get-projects-request")
    @XmlType(name = "GetProjectsOverview.Request")
    public static class Request implements IJAXBObject
    {
    }

    @XmlRootElement(name = "get-projects-ok-response")
    @XmlType(name = "GetProjectsOverview.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElement(name = "project")
        @XmlElementWrapper(name = "projects")
        public Collection<Project> projects = new ArrayList<>();
        
        @XmlElementWrapper(name="invoice-items")
        @XmlElement(name="invoice-item")
        public Collection<InvoiceItem> invoiceItems = new ArrayList<>();
    }
}
