package de.bbgs.rendering;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.ServiceLoader;

import javax.mail.internet.ContentType;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import de.bbgs.utils.IOUtils;

/**
 *
 */
public class ContentRendererFactory
{
    private static ContentRendererFactory INSTANCE = new ContentRendererFactory();
    private List<IContentRenderer> renderer = new ArrayList<>();

   
    /**
     * 
     */
    private ContentRendererFactory()
    {
        this.loadRenderer();
    }

    /**
     * 
     */
    private void loadRenderer()
    {
        ServiceLoader<IContentRenderer> loader = ServiceLoader.load(IContentRenderer.class);
        for (IContentRenderer renderer : loader)
        {
            this.renderer.add(renderer);
        }
    }

    /**
     * @return
     */
    public static ContentRendererFactory getInstance()
    {
        return ContentRendererFactory.INSTANCE;
    }

    /**
     * @param type
     * @return
     */
    public IContentRenderer getRenderer(ContentType type)
    {
        for (IContentRenderer r : this.renderer)
        {
            String respFor = r.getResponsibleFor();
            if (type.match(respFor))
            {
                return r;
            }
        }
        return new DefaultRenderer();
    }
}
