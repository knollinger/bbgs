package de.bbgs.courses;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.member.EMemberType;
import de.bbgs.pdf.DocBuilder;
import de.bbgs.pdf.DocBuilder.DocPart;
import de.bbgs.pdf.PDFCreator;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;

public class GetCourseOverviewDocumentHandler implements IGetDocServiceHandler
{
    // @formatter:off
    private static final String SQL = "select distinct c.name, t.date, t.start, t.end, l.name, m.zname, m.vname, m.type from courses c\n"
        + "        left join course_termins t on t.ref_id = c.id\n"
        + "        left join course_locations l on t.location_id = l.id\n"
        + "        left join course_member cm on cm.course_id = c.id\n"
        + "        left join members m on m.id = cm.member_id where t.date between ? and ?\n"
        + "        order by t.date, t.start, m.zname;";
    // @formatter:on

    @Override
    public String getResponsibleFor()
    {
        return "course_overview.pdf";
    }

    @Override
    public boolean needsSession()
    {
        return true;
    }

    @Override
    public void handleRequest(HttpServletRequest req, HttpServletResponse rsp, SessionWrapper session) throws Exception
    {
        SimpleDateFormat sdf = new SimpleDateFormat("dd.MM.yyyy");
        Date startDate = new Date(sdf.parse(req.getParameter("from")).getTime());
        Date endDate = new Date(sdf.parse(req.getParameter("until")).getTime());

        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        String currCourse = "";
        Date currDate = new Date(0);
        try
        {
            DocBuilder db = new DocBuilder(this.getClass().getResourceAsStream("course_overview.adoc"));
            DocPart part = db.duplicateSection("HEADER");
            part.replaceTag("$FROM$", startDate);
            part.replaceTag("$UNTIL$", endDate);
            part.commit();
            db.removeSection("HEADER");

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement(SQL);
            stmt.setDate(1, startDate);
            stmt.setDate(2, endDate);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                String courseName = rs.getString("c.name");
                Date courseDate = rs.getDate("t.date");
                if (!courseName.equals(currCourse) || !courseDate.equals(currDate))
                {
                    if (!currCourse.equals(""))
                    {
                        db.removeSection("ROW");
                    }
                    part = db.duplicateSection("TABLE");
                    part.replaceTag("$COURSE_NAME$", courseName);
                    part.replaceTag("$DATE$", rs.getDate("t.date"));
                    part.replaceTag("$BEGIN$", rs.getTime("t.start"));
                    part.replaceTag("$END$", rs.getTime("t.end"));
                    part.replaceTag("$LOCATION$", rs.getString("l.name"));
                    part.commit();
                    currCourse = courseName;
                    currDate = courseDate;
                }

                String zName = rs.getString("m.zname");
                String vName = rs.getString("m.vname");
                String type = rs.getString("m.type");
                if (zName != null && vName != null && type != null)
                {
                    EMemberType mType = EMemberType.valueOf(type);
                    type = mType.toHumanReadable();
                    part = db.duplicateSection("ROW");
                    part.replaceTag("$ZNAME$", zName);
                    part.replaceTag("$VNAME$", vName);
                    part.replaceTag("$TYPE$", type);
                    part.commit();
                }
            }

            db.removeSection("TABLE");
            db.removeSection("ROW");

            byte[] result = PDFCreator.transform(db.getDocument());
            rsp.setContentLength(result.length);
            rsp.setContentType("application/pdf");
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.getOutputStream().write(result);
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
    }
}
