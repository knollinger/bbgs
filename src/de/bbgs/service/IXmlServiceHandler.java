package de.bbgs.service;

import java.util.Collection;

import de.bbgs.session.SessionWrapper;
import de.bbgs.xml.IJAXBObject;

/**
 * Das Interface, welches die Schnittstellen aller ServiceImplementierungen
 * definiert. Die Services selbst werden per ServiceLoader geladen.
 * 
 * 
 *
 */
public interface IXmlServiceHandler
{
    /**
     * @return true, wenn der Service eine Session benoetigt
     */
    public boolean needsSession();
    
    /**
     * @return die Klasse des RequestObjects, fuer welches diese 
     *         Implementierung zustaendig ist
     */
    public Class<? extends IJAXBObject> getResponsibleFor();
    
    /**
     * welche IJAXBObjekte werden in diesem Handler verwendet?
     * 
     * @return
     */
    public Collection<Class<? extends IJAXBObject>> getUsedJaxbClasses();
    
    /**
     * die eigentliche ServiceImpl
     * 
     * @param request
     * @param session
     * @return
     */
    public IJAXBObject handleRequest(IJAXBObject request, SessionWrapper session);
}
