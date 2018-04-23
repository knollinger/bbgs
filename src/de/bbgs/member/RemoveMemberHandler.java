package de.bbgs.member;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
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
public class RemoveMemberHandler implements IXmlServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getResponsibleFor()
     */
    @Override
    public Class<? extends IJAXBObject> getResponsibleFor()
    {
        return Request.class;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#getUsedJaxbClasses()
     */
    @Override
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses()
    {
        List<Class<? extends IJAXBObject>> result = new ArrayList<Class<? extends IJAXBObject>>();
        result.add(Request.class);
        result.add(Response.class);
        return result;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IXmlServiceHandler#handleRequest(de.bbgs.io.IJAXBObject, de.bbgs.session.Session)
     */
    @Override
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session)
    {
        Connection conn = null;
        try
        {
            conn = ConnectionPool.getConnection();
            conn.setAutoCommit(false);
            Request req = (Request) request;
            MemberDBUtil.deleteMember(req.id, conn);
            conn.commit();
            return new Response();
        }
        catch (SQLException e)
        {
            return new ErrorResponse(e.getMessage());
        }
        finally
        {
            DBUtils.closeQuitly(conn);
        }
    }

    /**
    *
    */
   @XmlRootElement(name = "delete-member-req")
   @XmlType(name = "RemoveMemberHandler.Request")
   public static class Request implements IJAXBObject
   {
       @XmlElement(name = "id")
       public int id;
   }

   /**
   *
   */
  @XmlRootElement(name = "delete-member-ok-rsp")
  @XmlType(name = "RemoveMemberHandler.Response")
  public static class Response implements IJAXBObject
  {
  }
}
