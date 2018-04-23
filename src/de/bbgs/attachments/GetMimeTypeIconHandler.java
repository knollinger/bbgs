package de.bbgs.attachments;

import java.io.IOException;
import java.io.InputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.IOUtils;

/**
 * Ein {@link IGetDocServiceHandler}, welcher Attachments aus der Datenbank
 * liefert
 * 
 */
public class GetMimeTypeIconHandler implements IGetDocServiceHandler
{
    /*
     * (non-Javadoc)
     * 
     * @see de.bbgs.services.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "mimeTypeIcon";
    }

    /*
     * (non-Javadoc)
     * 
     * @see de.bbgs.services.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
    }

    /*
     * (non-Javadoc)
     * 
     * @see de.bbgs.services.IGetDocServiceHandler#handleRequest(javax.servlet.http.
     * HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session)
        throws IOException
    {
        InputStream in = null;
        try
        {
            String mimeType = req.getParameter("mime-type");
            String path = "mimetypes/" + mimeType.replace('/', '-') + ".svg";
            in = this.getClass().getResourceAsStream(path);
            if (in == null)
            {
                // generisches Icon ?
                String parts[] = mimeType.split("/");
                path = "mimetypes/" + parts[0] + "-x-generic.svg";
                in = this.getClass().getResourceAsStream(path);
                if (in == null)
                {
                    in = this.getClass().getResourceAsStream("mimetypes/mime2.svg");
                }
            }
            rsp.setHeader("Content-Type", "image/svg+xml");
            rsp.setStatus(HttpServletResponse.SC_OK);

            IOUtils.transferUntilEOF(in, rsp.getOutputStream());
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }
}
