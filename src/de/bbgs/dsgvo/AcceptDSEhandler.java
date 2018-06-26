package de.bbgs.dsgvo;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.utils.IOUtils;

/**
 * @author anderl
 *
 */
public class AcceptDSEhandler implements IGetDocServiceHandler
{

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "accept_dse.html";
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return false;
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#handleRequest(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse, de.bbgs.session.SessionWrapper)
     */
    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {
        Connection conn = null;
        PreparedStatement stmt = null;

        try
        {
            int id = this.extractMemberId(req);
            EDSEState state = this.extractState(req);

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement("update members set dse_state=?, dse_date=? where id=?");
            stmt.setString(1, state.name());
            stmt.setDate(2, new Date(System.currentTimeMillis()));
            stmt.setInt(3, id);
            stmt.executeUpdate();

            String file;
            switch (state)
            {
                case ACCEPTED :
                    file = "dse_accepted_response.html";
                    break;

                case REJECTED :
                    file = "dse_rejected_response.html";
                    break;

                default :
                    file = "dse_error_response.html";
                    break;
            }
            this.sendResponse(file, rsp);
        }
        finally
        {
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     * @param file
     * @param rsp
     * @throws IOException 
     */
    private void sendResponse(String file, HttpServletResponse rsp) throws IOException
    {
        InputStream in = null;
        try
        {
            String path = "/" + this.getClass().getPackage().getName().replaceAll("\\.", "/") + "/" + file;
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.setContentType("text/html");
            
            in = this.getClass().getResourceAsStream(path);
            IOUtils.transferUntilEOF(in, rsp.getOutputStream());
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }

    }

    /**
     * @param req
     * @return
     */
    private EDSEState extractState(HttpServletRequest req)
    {
        return EDSEState.valueOf(req.getParameter("action"));
    }

    /**
     * @param req
     * @return
     */
    private int extractMemberId(HttpServletRequest req)
    {
        return Integer.parseInt(req.getParameter("id"));
    }
}
