package de.bbgs.rendering;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import javax.mail.internet.ContentType;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import de.bbgs.utils.IOUtils;

public class PlainTextRenderer implements IContentRenderer
{    
    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#responsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "text/plain";
    }

    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#renderContent(org.w3c.dom.Document, javax.mail.internet.ContentType, byte[])
     */
    @Override
    public void renderContent(Document doc, Map<String, String> headers, ContentType type, InputStream content) throws Exception
    {

        String text = this.decodeContent(type, content);
        String[] parts = text.split("\n");
        for (String part : parts)
        {
            Element paragraph = doc.createElement("p");
            paragraph.text(part);
            doc.body().appendChild(paragraph);
        }
    }

    /**
     * @param type
     * @param content
     * @return
     * @throws IOException 
     */
    private String decodeContent(ContentType type, InputStream content) throws IOException
    {
        ByteArrayOutputStream buf = new ByteArrayOutputStream();
        IOUtils.transferUntilEOF(content, buf);
        return new String(buf.toByteArray(), type.getParameter("charset"));
    }
}
