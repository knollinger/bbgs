package de.bbgs.notifications;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBException;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import de.bbgs.session.SessionWrapper;
import de.bbgs.xml.ErrorResponse;
import de.bbgs.xml.IJAXBObject;
import de.bbgs.xml.JAXBSerializer;

/**
 *
 */
@SuppressWarnings("serial")
@WebServlet(description = "Stellt Notifications via LongPolling zu", urlPatterns = {
    "/notifications"}, loadOnStartup = 1)
public class NotificationServlet extends HttpServlet
{
@Override
    public void init() throws ServletException
    {
        super.init();
        JAXBSerializer.registerClass(Request.class);
        JAXBSerializer.registerClass(Response.class);
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IXmlServiceHandler#handleRequest(de.bbgs.xml.IJAXBObject, de.bbgs.session.SessionWrapper)
     */
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
    {
        IJAXBObject result = null;
        try
        {
            SessionWrapper session = new SessionWrapper(request);

            Response rsp = new Response();

            Request req = (Request) JAXBSerializer.readObject(request.getInputStream());;
            int userId = session.getAccountId();
            long maxWait = req.maxWait;
            rsp.notifications = NotificationManager.getInstance().getAllNotificationsFor(userId, maxWait);
            result = rsp;
        }
        catch (InterruptedException e)
        {
            Thread.currentThread().interrupt();
        }
        catch (JAXBException e)
        {
            result = new ErrorResponse(e.getMessage());
        }

        try
        {
            response.setHeader("Content-Type", "text/xml");
            response.setStatus(HttpServletResponse.SC_OK);
            response.setHeader("Content-Encoding", "gzip");
            GZIPOutputStream zipOut = new GZIPOutputStream(response.getOutputStream());
            JAXBSerializer.writeObject(result, zipOut);
            zipOut.finish();
            zipOut.flush();
        }
        catch (JAXBException e)
        {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);            
        }
    }


    /**
     * @author anderl
     *
     */
    @XmlRootElement(name = "get-notifications-req")
    @XmlType(name = "GetNotificationsHandler.Request")
    public static class Request implements IJAXBObject
    {
        @XmlElement(name = "max-wait")
        public long maxWait = 60000;
    }

    /**
     *
     */
    @XmlRootElement(name = "get-notifications-rsp")
    @XmlType(name = "GetNotificationsHandler.Response")
    public static class Response implements IJAXBObject
    {
        @XmlElementWrapper(name = "notifications")
        @XmlElement(name = "notification")
        List<Notification> notifications = new ArrayList<>();
    }
}
