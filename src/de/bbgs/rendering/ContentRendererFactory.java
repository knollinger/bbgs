package de.bbgs.rendering;

import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;

import javax.mail.internet.ContentType;

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
