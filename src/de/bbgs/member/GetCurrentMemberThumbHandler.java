package de.bbgs.member;

import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.attachments.EAttachmentDomain;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;

/**
 * Ein {@link IGetDocServiceHandler}, welcher Attachments aus der 
 * Datenbank liefert
 * 
 */
public class GetCurrentMemberThumbHandler implements IGetDocServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "currentMemberThumb";
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
     */
    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session)
    {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            int memberId = session.getAccountId();
            EAttachmentDomain domain = EAttachmentDomain.THUMBNAIL;

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("select mimetype, file from attachments where ref_id=? and domain=?");
            stmt.setInt(1, memberId);
            stmt.setString(2, domain.name());
            rs = stmt.executeQuery();
            if (rs.next())
            {

                String mimeType = rs.getString("mimetype");
                Blob blob = rs.getBlob("file");
                byte[] content = blob.getBytes(1, (int) blob.length());

                rsp.setStatus(HttpServletResponse.SC_OK);
                rsp.setContentType(mimeType);
                rsp.setContentLength(content.length);
                OutputStream out = rsp.getOutputStream();
                out.write(content);
            }
            else
            {
                rsp.setHeader("Location", "../images/user_128x128.png");
                rsp.setStatus(HttpServletResponse.SC_FOUND);
            }
        }
        catch (Exception e)
        {
            rsp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
