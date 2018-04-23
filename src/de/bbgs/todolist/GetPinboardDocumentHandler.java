package de.bbgs.todolist;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Time;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.pdf.DocBuilder;
import de.bbgs.pdf.DocBuilder.DocPart;
import de.bbgs.pdf.PDFCreator;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;

/**
 * @author anderl
 *
 */
public class GetPinboardDocumentHandler implements IGetDocServiceHandler
{
    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "/pinboard.pdf";
    }

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#needsSession()
     */
    @Override
    public boolean needsSession()
    {
        return true;
    }

    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            DocBuilder db = new DocBuilder(this.getClass().getResourceAsStream("pinboard.adoc"));
            DocPart part = db.duplicateSection("HEADER");
            part.replaceTag("$NOW$", new Time(System.currentTimeMillis()));
            part.replaceTag("$TODAY$", new Date(System.currentTimeMillis()));
            part.commit();
            db.removeSection("HEADER");

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement(
                "select t.title, t.description, t.todo_date, u.accountName from todolist t left join user_accounts u on u.id = t.userid order by t.todo_date;");
            rs = stmt.executeQuery();
            while (rs.next())
            {
                part = db.duplicateSection("TASK");
                part.replaceTag("$DATE$", rs.getDate("t.todo_date"));
                part.replaceTag("$USER$", rs.getString("u.accountName"));
                part.replaceTag("$TITLE$", rs.getString("t.title"));
                part.replaceTag("$DESCRIPTION$", rs.getString("t.description"));
                part.commit();

            }
            db.removeSection("TASK");
            
            byte[] result = PDFCreator.transform(db.getDocument());
            rsp.setContentLength(result.length);
            rsp.setContentType("application/pdf");
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.getOutputStream().write(result);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);

        }
    }
}
