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
import de.bbgs.utils.BBGSLog;
import de.bbgs.utils.ConnectionPool;

/**
 * Ein {@link IGetDocServiceHandler}, welcher Attachments aus der 
 * Datenbank liefert
 * 
 */
public class GetMemberImageHandler implements IGetDocServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "memberImage";
    }

    /* (non-Javadoc)
     * @see de.bbgs.services.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
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
            int memberId = this.extractMemberId(req);
            EAttachmentDomain domain = EAttachmentDomain.valueOf(req.getParameter("domain"));

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
                ESex sex = this.extractSex(req);
                this.tryDefaultImage(domain, sex, rsp);
            }
        }
        catch (Exception e)
        {
            BBGSLog.logError(e.getStackTrace().toString());
            rsp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 
     * @param req
     * @return
     */
    private int extractMemberId(HttpServletRequest req)
    {
        int id = -1;

        try
        {
            id = Integer.parseInt(req.getParameter("id"));
        }
        catch (Exception e)
        {

        }
        return id;
    }

    /**
     * 
     * @param req
     * @return
     */
    private ESex extractSex(HttpServletRequest req)
    {
        ESex result = ESex.U;

        try
        {
            result = ESex.valueOf(req.getParameter("sex"));
        }
        catch (Exception e)
        {

        }
        return result;
    }

    /**
     * @param domain
     * @param sex
     * @param rsp
     */
    private void tryDefaultImage(EAttachmentDomain domain, ESex sex, HttpServletResponse rsp)
    {
        switch (domain)
        {
            case THUMBNAIL :
                this.getDefaultThumbNail(sex, rsp);
                break;

            case MAILSIG :
                rsp.setHeader("Location", "../gui/images/default-signature.svg");
                rsp.setStatus(HttpServletResponse.SC_FOUND);
                break;

            default :
                rsp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                break;
        }
    }

    /**
     * @param sex
     * @param rsp
     */
    private void getDefaultThumbNail(ESex sex, HttpServletResponse rsp)
    {
        switch (sex)
        {
            case W :
                rsp.setHeader("Location", "../gui/images/avatar-female.svg");
                break;

            case M :
                rsp.setHeader("Location", "../gui/images/avatar-male.svg");
                break;
                
            default :
                rsp.setHeader("Location", "../gui/images/avatar-undef-sex.svg");
                break;
        }
        rsp.setStatus(HttpServletResponse.SC_FOUND);
    }
}
