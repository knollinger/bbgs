package de.bbgs.mail;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;

import javax.mail.internet.ContentType;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import de.bbgs.rendering.ContentRendererFactory;
import de.bbgs.rendering.IContentRenderer;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.utils.IOUtils;

/**
 * liefert den Content einer Email als HTML
 */
public class GetMailContentHandler implements IGetDocServiceHandler
{

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "mail-content";
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, de.bbgs.session.SessionWrapper)
     */
    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {
        int blobId = Integer.parseInt(req.getParameter("blob-id"));
        
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Writer w = null;
        try
        {            
            conn = ConnectionPool.getConnection();

            stmt = conn.prepareStatement("select file, mimetype from attachments where domain='EMAIL' and id=?");
            stmt.setInt(1, blobId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                ContentType type = new ContentType(rs.getString("mimetype"));
                ByteArrayInputStream content = new ByteArrayInputStream(this.readContent(rs.getBlob("file")));

                Document doc = new Document("");
                Element html = doc.appendElement("html");
                html.appendElement("head");
                html.appendElement("body");
                IContentRenderer r = ContentRendererFactory.getInstance().getRenderer(type);
                r.renderContent(doc, new HashMap<String, String>(), type, content);
                
                rsp.setStatus(HttpServletResponse.SC_OK);     
                rsp.setContentType("text/html");
                w = new OutputStreamWriter(rsp.getOutputStream());
                w.write(doc.html());
            }
        }
        finally
        {
            IOUtils.closeQuitly(w);
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }

    }

    /**
     * @param blob
     * @return
     * @throws SQLException 
     * @throws IOException 
     */
    private byte[] readContent(Blob blob) throws SQLException, IOException
    {
        InputStream in = null;
        ByteArrayOutputStream result = new ByteArrayOutputStream();

        try
        {
            in = blob.getBinaryStream();
            IOUtils.transferUntilEOF(in, result);
            return result.toByteArray();
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }
}
