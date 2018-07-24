package de.bbgs.rendering;


import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Comparator;
import java.util.Enumeration;
import java.util.Map;
import java.util.TreeMap;

import javax.activation.DataSource;
import javax.mail.BodyPart;
import javax.mail.Header;
import javax.mail.MessagingException;
import javax.mail.internet.ContentType;
import javax.mail.internet.MimeMultipart;

import org.jsoup.nodes.Document;

/**
 * Multipart/mixed-Renderer. 
 * 
 * Der Content besteht aus n Elementen mit der seleben Boundary. Diese Elemente 
 * werden von einander unabhängig betrachtet und einfach hontereinander gerendered.
 * 
 * Gleichzeitig ist multiPart/mixed der Default-Type für alle nicht direkt renderbaren
 * Multipart-Types.
 * 
 */
public class MultiPartRenderer implements IContentRenderer
{
    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#responsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "multipart/*";
    }    

    /* (non-Javadoc)
     * @see de.bbgs.rendering.IContentRenderer#renderContent(org.w3c.dom.Document, javax.mail.internet.ContentType, byte[])
     */    
    @Override
    public void renderContent(Document doc, Map<String, String> headers, ContentType type, InputStream content) throws Exception
    {
        MimeMultipart mmp = new MimeMultipart(new ByteArrayDataSource(content, type));
        for(int i = 0; i < mmp.getCount(); ++i) {
            this.handlePart(doc, mmp.getBodyPart(i));
        }
    }
   
    /**
     * @param doc
     * @param bodyPart
     * @throws Exception 
     */
    private void handlePart(Document doc, BodyPart bodyPart) throws Exception
    {
        Map<String, String> headers = this.extractHeaders(bodyPart);
        ContentType type = new ContentType(bodyPart.getContentType());
        InputStream content = bodyPart.getInputStream();
        
        IContentRenderer renderer = ContentRendererFactory.getInstance().getRenderer(type);
        renderer.renderContent(doc, headers, type, content);
    }
    
    /**
     * @param bodyPart
     * @return
     * @throws MessagingException 
     */
    private Map<String, String> extractHeaders(BodyPart bodyPart) throws MessagingException {
        
        Map<String, String> result = new TreeMap<>(new Comparator<String>()
        {
            @Override
            public int compare(String arg0, String arg1)
            {
                return arg0.compareToIgnoreCase(arg1);
            }
        });
        
        @SuppressWarnings("unchecked")
        Enumeration<Header> allHeaders = bodyPart.getAllHeaders();
        while(allHeaders.hasMoreElements()) {

            Header hdr = allHeaders.nextElement();
            result.put(hdr.getName(), hdr.getValue());
        }
        System.out.println(result);
        
        return result;
    }

    /**
     * @author anderl
     *
     */
    private static class ByteArrayDataSource implements DataSource
    {

        private InputStream buffer;
        private String contentType;

        /**
         * @param buffer
         * @param contentType
         * @throws UnsupportedEncodingException
         */
        public ByteArrayDataSource(InputStream buffer, ContentType contentType) throws UnsupportedEncodingException
        {
            this.buffer = buffer;
            this.contentType = contentType.toString();
        }
        
        /* (non-Javadoc)
         * @see javax.activation.DataSource#getContentType()
         */
        @Override
        public String getContentType()
        {
            return this.contentType;
        }

        /* (non-Javadoc)
         * @see javax.activation.DataSource#getInputStream()
         */
        @Override
        public InputStream getInputStream() throws IOException
        {
            return this.buffer;
        }

        /* (non-Javadoc)
         * @see javax.activation.DataSource#getName()
         */
        @Override
        public String getName()
        {
            return this.getClass().getName();
        }

        /* (non-Javadoc)
         * @see javax.activation.DataSource#getOutputStream()
         */
        @Override
        public OutputStream getOutputStream() throws IOException
        {
            throw new UnsupportedOperationException(this.getClass().getName() + " is not writeable");
        }
    }
}
