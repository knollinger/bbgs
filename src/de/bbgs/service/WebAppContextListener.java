package de.bbgs.service;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

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
        ThreadPool.getInstance().startup();
    }

    /**
     * @see ServletContextListener#contextDestroyed(ServletContextEvent)
     */
    public void contextDestroyed(ServletContextEvent arg0)
    {
        ThreadPool.getInstance().shutdown();
    }
}
