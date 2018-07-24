package de.bbgs.rendering;

import java.io.InputStream;
import java.util.Map;

import javax.mail.internet.ContentType;

import org.jsoup.nodes.Document;

/**
 * Rendere einen Content nach HTML
 */
public interface IContentRenderer
{
    /**
     * @return
     */
    public String getResponsibleFor();
    
    /**
     * @param doc
     * @param headers
     * @param type
     * @param content
     * @return
     * @throws Exception
     */
    public void renderContent(Document doc, Map<String, String> headers, ContentType type, InputStream content) throws Exception;
}
