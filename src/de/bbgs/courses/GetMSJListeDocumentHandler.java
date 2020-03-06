package de.bbgs.courses;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Iterator;
import java.util.ResourceBundle;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDDocumentCatalog;
import org.apache.pdfbox.pdmodel.encryption.InvalidPasswordException;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;

import de.bbgs.member.ESex;
import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;
import de.bbgs.utils.IOUtils;

/**
 * @author anderl
 *
 */
public class GetMSJListeDocumentHandler implements IGetDocServiceHandler
{
    private static final long MILLIES_PER_DAY = 24 * 60 * 60 * 1000;
    private static SimpleDateFormat dateFormatter = new SimpleDateFormat("dd.MM.yyyy");
    private static ResourceBundle nameMapper = ResourceBundle.getBundle(GetMSJListeDocumentHandler.class.getName());

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "msj_liste.pdf";
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
        int courseId = Integer.parseInt(req.getParameter("id"));

        PDDocument doc = null;
        Connection conn = null;
        try
        {

            doc = this.loadTemplate();
            PDDocumentCatalog cat = doc.getDocumentCatalog();
            PDAcroForm form = cat.getAcroForm();

            this.clearAllFields(form);
            this.setField(form, "VEREIN", "Bayerns beste Gipfelstürmer");
            this.setField(form, "TODAY", dateFormatter.format(new Date(System.currentTimeMillis())));

            conn = ConnectionPool.getConnection();
            this.fillProposerData(session.getAccountId(), form, conn);
            this.fillLocation(courseId, form, conn);
            Date startDate = this.fillCourseDesc(courseId, form, conn);
            this.fillInstructors(courseId, form, startDate, conn);
            this.fillMembers(courseId, form, startDate, conn);


            ByteArrayOutputStream result = new ByteArrayOutputStream();
            doc.save(result);
            rsp.setContentLength(result.size());
            rsp.setContentType("application/pdf");
            rsp.setStatus(HttpServletResponse.SC_OK);
            rsp.getOutputStream().write(result.toByteArray());
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
        finally
        {
            IOUtils.closeQuitly(doc);
            DBUtils.closeQuitly(conn);
        }
    }
    /**
     * @param accountId
     * @param form
     * @param conn
     * @throws SQLException 
     * @throws IOException 
     */
    private void fillProposerData(int accountId, PDAcroForm form, Connection conn) throws SQLException, IOException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select zname, vname, phone, mobile from members where id=?");
            stmt.setInt(1, accountId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                this.setField(form, "PROPOSER_NAME", rs.getString("vname") + " " + rs.getString("zname"));

                String tel = rs.getString("phone");
                if (tel == null || tel.isEmpty())
                {
                    tel = rs.getString("mobile");
                }

                if (tel != null && !tel.isEmpty())
                {
                    this.setField(form, "PROPOSER_TEL", tel);
                }
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param courseId
     * @param form
     * @param conn
     * @return das StartDatum
     * @throws SQLException 
     * @throws IOException 
     */
    private Date fillCourseDesc(int courseId, PDAcroForm form, Connection conn) throws SQLException, IOException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select c.*, min(t.date) as start, max(t.date) as end from courses c left join course_termins t on c.id = t.ref_id where c.id=? group by c.id");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                this.setField(form, "COURSE_NAME", rs.getString("c.name"));
                this.setField(form, "COURSE_START", dateFormatter.format(rs.getDate("start")));
                this.setField(form, "COURSE_ENDE", dateFormatter.format(rs.getDate("end")));
                this.setField(form, "COURSE_SHORTDESC", rs.getString("description"));
            }
            return rs.getDate("start");
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param courseId
     * @param form
     * @param conn
     * @throws SQLException
     * @throws IOException
     */
    private void fillLocation(int courseId, PDAcroForm form, Connection conn) throws SQLException, IOException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select * from course_locations where id in(select location_id from course_termins where ref_id=?)");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();
            if (rs.next())
            {
                String loc = rs.getString("name") + ", " + rs.getString("city");
                this.setField(form, "COURSE_LOCATION", loc);
            }
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }


    /**
     * @param courseId
     * @param form
     * @param startDate 
     * @param conn
     * @throws SQLException 
     * @throws IOException 
     */
    private void fillInstructors(int courseId, PDAcroForm form, Date startDate, Connection conn)
        throws SQLException, IOException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement("select vname, zname, street, city, zip_code, sex, birth_date\n"
                + "    from members \n"
                + "    where id in  (select member_id from course_member where course_id=?) and\n"
                + "          (type='TEACHER' or type='SCOUT' or type='EXSCOUT' or type='PRAKTIKANT' or type='EHRENAMT' or type='FEST') order by vname, zname;");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();

            int i = 0;
            int nrMale = 0;
            int nrFemale = 0;
            while (rs.next() && i < 7)
            {

                String name = rs.getString("vname") + " " + rs.getString("zname");
                this.setField(form, "TRAINER_NAME_" + i, name);

                String addr = rs.getString("street") + ", " + rs.getInt("zip_code") + " " + rs.getString("city");
                this.setField(form, "TRAINER_ADRESSE_" + i, addr);

                this.setField(form, "TRAINER_AGE_" + i, this.calcAgeAt(rs.getDate("birth_date"), startDate));
                i++;

                switch (ESex.valueOf(rs.getString("sex")))
                {
                    case M :
                        nrMale++;
                        break;

                    case W :
                        nrFemale++;

                    default :
                        break;
                }
            }
            this.setField(form, "TRAINER_MALE", "" + nrMale);
            this.setField(form, "TRAINER_FEMALE", "" + nrFemale);
            this.setField(form, "TRAINER_TOTAL", "" + (nrMale + nrFemale));

        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }

    /**
     * @param courseId
     * @param form
     * @param startDate 
     * @param conn
     * @throws SQLException
     * @throws IOException
     */
    private void fillMembers(int courseId, PDAcroForm form, Date startDate, Connection conn)
        throws SQLException, IOException
    {
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            stmt = conn.prepareStatement(
                "select vname, zname, street, city, zip_code, sex, birth_date\n" + "    from members \n"
                    + "    where id in  (select member_id from course_member where course_id=?) and\n"
                    + "          (type='STUDENT' or type='REFUGEE') order by vname, zname;");
            stmt.setInt(1, courseId);
            rs = stmt.executeQuery();

            int i = 0;
            int nrMale = 0;
            int nrFemale = 0;

            while (rs.next() && i < 26)
            {

                String name = rs.getString("vname") + " " + rs.getString("zname");
                this.setField(form, "TN_NAME_" + i, name);
                this.setField(form, "TN_STREET_" + i, rs.getString("street"));
                this.setField(form, "TN_ZIPCODE_" + i, "" + rs.getInt("zip_code"));
                this.setField(form, "TN_CITY_" + i, rs.getString("city"));
                this.setField(form, "TN_AGE_" + i, this.calcAgeAt(rs.getDate("birth_date"), startDate));
                i++;

                switch (ESex.valueOf(rs.getString("sex")))
                {
                    case M :
                        nrMale++;
                        break;

                    case W :
                        nrFemale++;

                    default :
                        break;
                }
            }

            this.setField(form, "TN_MUC_MALE", "" + nrMale);
            this.setField(form, "TN_MUC_FEMALE", "" + nrFemale);
            this.setField(form, "TN_MUC_TOTAL", "" + (nrMale + nrFemale));

        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
        }
    }
    /**
     * @param form
     * @throws IOException
     */
    private void clearAllFields(PDAcroForm form) throws IOException
    {

        Iterator<PDField> f = form.getFieldIterator();
        while (f.hasNext())
        {

            PDField pdField = f.next();
            pdField.setValue("");
        }
    }
    /**
     * 
     * @param name
     * @param val
     * @throws IOException 
     */
    private void setField(PDAcroForm form, String name, String val) throws IOException
    {

        String realName = nameMapper.getString(name);
        form.getField(realName).setValue(val);

    }

    /**
     * @return
     */
    private String calcAgeAt(Date birthDate, Date startDate)
    {
        String result = "";
        if (birthDate != null && startDate != null)
        {
            long diff = startDate.getTime() - birthDate.getTime();
            diff /= MILLIES_PER_DAY;
            diff /= 365;
            result += diff;
        }
        return result;
    }

    /**
     * @return
     * @throws InvalidPasswordException
     * @throws IOException
     */
    private PDDocument loadTemplate() throws InvalidPasswordException, IOException
    {
        InputStream in = null;
        String path = "/" + this.getClass().getPackage().getName().replaceAll("\\.", "/") + "/msj_liste.pdf";
        try
        {
            in = this.getClass().getResourceAsStream(path);
            return PDDocument.load(in);
        }
        finally
        {
            IOUtils.closeQuitly(in);
        }
    }

}
