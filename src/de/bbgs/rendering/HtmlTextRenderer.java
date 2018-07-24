package de.bbgs.rendering;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Map;

import javax.mail.internet.ContentType;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

/**
 * In Multipart-Messages werden auch HTML-Inhalte übertragen. Dummerweise 
 * müssen wir hier ein DOM aufbauen, somit nützt und der HTML-Käse nicht viel.
 * 
 * Also müssen wir selbigen auseinander nehmen, vulgo parsen. Und dazu benutzen 
 * wir hier Jsoup! Auf die Text-Massage habe ich selber keine Lust.
 */
public class HtmlTextRenderer implements IContentRenderer
{
    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#responsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "text/html";
    }

    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#renderContent(org.w3c.dom.Document, javax.mail.internet.ContentType, byte[])
     */
    @Override
    public void renderContent(Document targetDoc, Map<String, String> headers, ContentType type, InputStream content) throws Exception
    {
        String charset = type.getParameter("charset");
        Document srcDoc = Jsoup.parse(content, charset, "");

        this.transferStyles(srcDoc, targetDoc);
        
        Elements allBodyChilds = srcDoc.body().children();// getAllElements();
        Iterator<Element> itor = allBodyChilds.iterator();
        while (itor.hasNext())
        {

            Element elem = itor.next();
            targetDoc.body().appendChild(elem);
        }
    }

    /**
     * @param srcDoc
     * @param targetDoc
     */
    private void transferStyles(Document srcDoc, Document targetDoc)
    {
        Elements styles = srcDoc.head().getElementsByTag("style");
        Iterator<Element> itor = styles.iterator();
        while(itor.hasNext()) {
            targetDoc.head().appendChild(itor.next());
        }
    }
}
