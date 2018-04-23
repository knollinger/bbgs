package de.bbgs.attachments;

import java.io.OutputStream;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;

/**
 * Ein {@link IGetDocServiceHandler}, welcher Attachments aus der 
 * Datenbank liefert
 * 
 */
public class GetAttachmentHandler implements IGetDocServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "attachment";
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

            int docId = Integer.parseInt(req.getParameter("id"));
            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("SELECT mimetype, file from attachments where id = ?");
            stmt.setInt(1, docId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                String mimeType = rs.getString("mimetype");
                Blob content = rs.getBlob("file");

                rsp.setStatus(HttpServletResponse.SC_OK);
                rsp.setContentType(mimeType);
                rsp.setContentLength((int) content.length());

                OutputStream out = rsp.getOutputStream();
                out.write(content.getBytes(1, (int) content.length()));
                out.flush();
            }
            else
            {
                this.sendNotFoundResponse(rsp);
            }
        }
        catch (Exception e)
        {
            this.sendBadRequestResponse(rsp);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     * @param response
     */
    private void sendNotFoundResponse(HttpServletResponse response)
    {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
    }

    /**
     * @param response
     */
    private void sendBadRequestResponse(HttpServletResponse response)
    {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
    }
}
