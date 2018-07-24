package de.bbgs.rendering;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.Iterator;
import java.util.Map;

import javax.mail.internet.ContentType;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import de.bbgs.utils.IOUtils;

public class ImageRenderer implements IContentRenderer
{
    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#responsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "image/*";
    }

    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#renderContent(org.w3c.dom.Document, javax.mail.internet.ContentType, byte[])
     */
    @Override
    public void renderContent(Document doc, Map<String, String> headers, ContentType type, InputStream content) throws Exception
    {
        String dataURL = this.createDataURL(type, content);


        String srcKey = String.format("cid:%1$s", this.extractContentId(headers));
        Elements elems = doc.select("img[src='" + srcKey + "']");
        Iterator<Element> itor = elems.iterator();
        while (itor.hasNext())
        {
            Element elem = itor.next();
            elem.attr("src", dataURL);
        }
    }

    /**
     * extrahiere die ContentId. Aus irgend einem Grund wird selbige im MimeHeader 
     * immer in <> gesetzt, diese Klammern entfernen wir auch
     */
    private String extractContentId(Map<String, String> headers) {
    
        String cid = headers.get("Content-ID");
        if(cid != null) {
            
            if(cid.startsWith("<")) {
                cid = cid.substring(1);
            }
            if(cid.endsWith(">")) {
                cid = cid.substring(0, cid.length() - 1);
            }
        }
        return cid;
    }
    
    /**
     * Erzeuge die DATA-URL für das Image. Der AUfbau der DATA-URL folgt
     * der Definition auf {@link https://en.wikipedia.org/wiki/Data_URI_scheme}
     * @param type
     * @param content
     * @return
     * @throws IOException 
     */
    private String createDataURL(ContentType type, InputStream content) throws IOException
    {

        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        IOUtils.transferUntilEOF(content, buf);
        String encoded = Base64.getEncoder().encodeToString(buf.toByteArray());
        return String.format("data:%1$s;base64,%2$s", type.getBaseType(), encoded);
    }
}
