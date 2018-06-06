package de.bbgs.courses;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.contacts.ERelation;
import de.bbgs.member.ESex;
import de.bbgs.pdf.DocBuilder;
import de.bbgs.pdf.DocBuilder.DocPart;
import de.bbgs.pdf.PDFCreator;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;

public class GetCourseDetailsDocumentHandler implements IGetDocServiceHandler
{

    @Override
    public String getResponsibleFor()
    {
        return "course_details.pdf";
    }

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

        int courseId = Integer.parseInt(req.getParameter("id"));
        try
        {
            conn = ConnectionPool.getConnection();

            DocBuilder db = new DocBuilder(this.getClass().getResourceAsStream("course_details.adoc"));
            this.fillDocHeader(db, courseId, conn);
            this.fillNotes(db, courseId, conn);
            this.fillTermine(db, courseId, conn);
            this.fillMembers(db, courseId, conn);

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

    /**
     * @param db
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private void fillDocHeader(DocBuilder db, int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement("select name, description from courses where id=?");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                DocPart part = db.duplicateSection("HEADER");
                part.replaceTag("$COURSE_NAME$", rs.getString("name"));
                part.replaceTag("$COURSE_DESC$", rs.getString("description"));
                part.commit();
                db.removeSection("HEADER");
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param db
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private void fillNotes(DocBuilder db, int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            db.duplicateSection("N_TABLE");
            stmt = conn.prepareStatement(
                "select note from notes where domain='COURSE' and ref_id=? order by timestamp");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                DocPart part = db.duplicateSection("N_ROW");
                part.replaceTag("$N_NOTE$", rs.getString("note"));
                part.commit();
            }
            db.removeSection("N_ROW");
            db.removeSection("N_TABLE");
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param db
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private void fillTermine(DocBuilder db, int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            stmt = conn.prepareStatement(
                "    select t.date, t.start, t.end, l.name from course_termins t left join course_locations l on l.id = t.location_id where t.ref_id=? order by t.date;");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                DocPart part = db.duplicateSection("T_ROW");
                part.replaceTag("$T_DATE$", rs.getDate("t.date"));
                part.replaceTag("$T_START$", rs.getTime("t.start"));
                part.replaceTag("$T_END$", rs.getTime("t.end"));
                part.replaceTag("$T_LOCATION$", rs.getString("l.name"));
                part.commit();
            }
            db.removeSection("T_ROW");
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param db
     * @param courseId
     * @param conn
     * @throws SQLException
     */
    private void fillMembers(DocBuilder db, int courseId, Connection conn) throws SQLException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        try
        {
            int currMemberId = 0;
            stmt = conn.prepareStatement("select * from members m left join contacts c on c.ref_id = m.id and c.domain = \"MEMBER\" where m.id in(select distinct member_id from course_member where course_id = ?);");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                int id = rs.getInt("m.id");
                if (id != currMemberId)
                {
                    if (currMemberId != 0)
                    {
                        db.removeSection("C_ROW");
                    }
                    DocPart part = db.duplicateSection("M_TABLE");
                    part.replaceTag("$ZNAME$", rs.getString("m.zname"));
                    part.replaceTag("$VNAME$", rs.getString("m.vname"));
                    part.replaceTag("$M_TYPE$", rs.getString("m.type_as_text"));
                    part.replaceTag("$M_SEX$", ESex.valueOf(rs.getString("m.sex")).toHumanReadable());
                    part.replaceTag("$M_BIRTHDAY$", rs.getDate("m.birth_date"));
                    part.replaceTag("$M_ZIPCODE$", String.format("%1$04d", Integer.valueOf(rs.getInt("m.zip_code"))));
                    part.replaceTag("$M_CITY$", rs.getString("m.city"));
                    part.replaceTag("$M_STREET$", rs.getString("m.street"));
                    part.replaceTag("$M_PHONE$", rs.getString("phone"));
                    part.replaceTag("$M_MOBILE$", rs.getString("m.mobile"));
                    part.replaceTag("$M_EMAIL$", rs.getString("m.email"));
                    part.commit();
                    currMemberId = id;
                }

                String cZName = rs.getString("c.zname");
                String cVName = rs.getString("c.vname");
                if (cZName != null || cVName != null)
                {
                    String cRel = rs.getString("c.relation");
                    String cPhone = rs.getString("c.phone");
                    if (cPhone == null || cPhone.length() == 0)
                    {
                        cPhone = rs.getString("m.phone");
                    }
                    String cMobile = rs.getString("c.mobile");
                    if (cMobile == null || cMobile.length() == 0)
                    {
                        cMobile = rs.getString("m.mobile");
                    }
                    String cEmail = rs.getString("c.email");
                    if (cEmail == null || cEmail.length() == 0)
                    {
                        cEmail = rs.getString("m.email");
                    }

                    DocPart part = db.duplicateSection("C_ROW");
                    part.replaceTag("$C_ZNAME$", cZName);
                    part.replaceTag("$C_VNAME$", cVName);
                    part.replaceTag("$C_RELATION$", (cRel == null) ? "" : ERelation.valueOf(cRel).toHumanReadable());
                    part.replaceTag("$C_PHONE$", cPhone);
                    part.replaceTag("$C_MOBILE$", cMobile);
                    part.replaceTag("$C_EMAIL$", cEmail);
                    part.commit();
                }
            }
            db.removeSection("C_ROW");
            db.removeSection("M_TABLE");
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
}
