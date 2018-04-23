package de.bbgs.service;

import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;

import org.apache.catalina.filters.ExpiresFilter;

/**
 * Ein Servlet Filter, welcher die Browser-Caches ausschaltet. Dazu setzt der
 * Servlet-Filter die ueblichen HTTP-Header im ResponseObjekt.
 */
@WebFilter(urlPatterns = "/*", initParams= {
    @WebInitParam(name="ExpiresByType image", value="access plus 1 month"),
    @WebInitParam(name="ExpiresByType text/html", value="access plus 1 month"),    
    @WebInitParam(name="ExpiresByType text/css",  value="access plus 1 month"),    
    @WebInitParam(name="ExpiresByType application/javascript", value="access plus 1 month"),    
})
public class AvoidCacheFilter extends ExpiresFilter
{    
}
