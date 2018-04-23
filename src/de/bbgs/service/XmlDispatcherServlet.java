package de.bbgs.service;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.ServiceLoader;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBException;

import de.bbgs.session.SessionLostResponse;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.BBGSLog;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.xml.IJAXBObject;
import de.bbgs.xml.JAXBSerializer;

/**
 * Servlet implementation class DispatcherServlet
 */
@SuppressWarnings("serial")
@WebServlet(description = "Dispatched anhand der RequestTypen", urlPatterns = {"/xmlservice"}, loadOnStartup=1)
public class XmlDispatcherServlet extends HttpServlet
{
    private Map<Class<? extends IJAXBObject>, IXmlServiceHandler> handlers;

    /*-----------------------------------------------------------------------*/
    /**
     * @see HttpServlet#HttpServlet()
     */
    public XmlDispatcherServlet() throws Exception
    {
        this.loadAllHandlers();
        ConnectionPool.init();
    }

    /*-----------------------------------------------------------------------*/
    private void loadAllHandlers()
    {
        this.handlers = new HashMap<Class<? extends IJAXBObject>, IXmlServiceHandler>();
        ServiceLoader<IXmlServiceHandler> loader = ServiceLoader.load(IXmlServiceHandler.class);
        for (IXmlServiceHandler handler : loader)
        {
            Class<? extends IJAXBObject> clazz = handler.getResponsibleFor();
            JAXBSerializer.registerClass(clazz);

            Collection<Class<? extends IJAXBObject>> usedClasses = handler.getUsedJaxbClasses();
            for (Class<? extends IJAXBObject> usedClass : usedClasses)
            {                
                JAXBSerializer.registerClass(usedClass);
            }
            BBGSLog.logInfo("Lade den XMLHandler f\u00fcr den JAXBRequest '%1$s'", clazz.getName());
            this.handlers.put(clazz, handler);
        }
    }

    /*-----------------------------------------------------------------------*/
    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
        IOException
    {

        try
        {
            IJAXBObject reqObj = JAXBSerializer.readObject(request.getInputStream());
            SessionWrapper session = new SessionWrapper(request.getSession());
            BBGSLog.logInfo("XML_ENTER_HANDLER", session.getAccountName(), JAXBSerializer.stringify(reqObj));

            IXmlServiceHandler handler = this.handlers.get(reqObj.getClass());
            if (handler == null)
            {
                BBGSLog.logInfo("XML_NOT_FOUND", session.getAccountName(), reqObj.getClass());
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getOutputStream().write(
                    ("No service handler for '" + reqObj.getClass() + "' found").getBytes());
            }
            else
            {
                IJAXBObject rspObj = null;
                if (handler.needsSession() && !session.isValid())
                {
                    BBGSLog.logInfo("XML_SESSION_LOST", session.getAccountName());
                    rspObj = new SessionLostResponse();
                }
                else
                {
                    BBGSLog.logInfo("XML_EXECUTE", reqObj.getClass());
                    rspObj = handler.handleRequest(reqObj, session);
                }

                if (rspObj != null)
                {
                    BBGSLog.logInfo("XML_EXECUTED", JAXBSerializer.stringify(rspObj));
                    response.setHeader("Content-Encoding", "gzip");
                    GZIPOutputStream zipOut = new GZIPOutputStream(response.getOutputStream());
                    JAXBSerializer.writeObject(rspObj, zipOut);
                    zipOut.finish();
                    zipOut.flush();
                }
            }
        }
        catch (JAXBException e)
        {
            e.printStackTrace();
            BBGSLog.logInfo("XML_FAILED", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
    
    @Override
    public void init(ServletConfig cfg) {

        System.out.println(cfg);
    }
}
