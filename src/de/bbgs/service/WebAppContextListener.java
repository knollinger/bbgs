package de.bbgs.service;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import de.bbgs.mail.MailFetcher;
import de.bbgs.utils.ConnectionPool;

/**
 * Der {@link WebAppContextListener} stellt sicher, dass sharedResources 
 * (wie der ConnectionPool und der ThreadPool) vor dem Start der webApp
 * korrekt initialisiert werden und nach dem beenden der webApp korrekt 
 * terminiert werden.
 * 
 * @author anderl
 *
 */
@WebListener
public class WebAppContextListener implements ServletContextListener
{
    /**
     * @see ServletContextListener#contextInitialized(ServletContextEvent)
     */
    public void contextInitialized(ServletContextEvent arg0)
    { 
        try
        {
            ConnectionPool.init();
            ThreadPool.getInstance().startup();
            ThreadPool.getInstance().submit(new MailFetcher());
        }
        catch (Exception e)
        {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    /**
     * @see ServletContextListener#contextDestroyed(ServletContextEvent)
     */
    public void contextDestroyed(ServletContextEvent arg0)
    {
        ThreadPool.getInstance().shutdown();
    }
}
