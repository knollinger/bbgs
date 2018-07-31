package de.bbgs.rendering;

import java.io.InputStream;
import java.util.Map;

import javax.mail.internet.ContentType;

import org.jsoup.nodes.Document;


/**
 * Der DefaultRenderer tut einfach gar nichts. Er dient nur als Fallback, 
 * wenn ein gelieferter ContentType nicht bedient werden kann.
 */
public class DefaultRenderer implements IContentRenderer
{
    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#responsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "*/*";
    }

    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#renderContent(org.w3c.dom.Document, javax.mail.internet.ContentType, byte[])
     */
    @Override
    public void renderContent(Document doc, Map<String, String> headers, ContentType type, InputStream content)
    {
    }
}
