package de.bbgs.member;

import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.bbgs.service.IGetDocServiceHandler;
import de.bbgs.session.SessionWrapper;
import de.bbgs.utils.ConnectionPool;
import de.bbgs.utils.DBUtils;

/**
 * Erzeugt das CSV mit der übersicht aller Member
 */
public class GetMemberListDocumentHandler implements IGetDocServiceHandler
{
    private static final String SQL = "select m.*, c.*  from members m left join contacts c on c.ref_id = m.id where c.domain='MEMBER' order by m.vname, m.zname, m.id";

    /* (non-Javadoc)
     * @see de.bbgs.service.IGetDocServiceHandler#getResponsibleFor()
     */
    @Override
    public String getResponsibleFor()
    {
        return "memberOverview.csv";
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

        int lastMemberId = -1;
        LineBuilder lineBuilder = new LineBuilder();

        try
        {
            rsp.setContentType("text/csv;charset=utf8");
            ServletOutputStream out = rsp.getOutputStream();
            this.writeHeader(out);

            conn = ConnectionPool.getConnection();
            stmt = conn.prepareStatement(SQL);
            rs = stmt.executeQuery();
            while (rs.next())
            {
                int id = rs.getInt("m.id");
                if (id != lastMemberId)
                {
                    if (lastMemberId != -1)
                    {
                        lineBuilder.writeLine(out);
                        lineBuilder.clear();
                    }
                    lastMemberId = id;
                }
                
                lineBuilder.withName(rs.getString("m.vname"), rs.getString("m.zname"));
                lineBuilder.withBirthDate(rs.getDate("birth_date"));
                lineBuilder.withMemberSince(rs.getDate("m.member_since"));
                
                lineBuilder.addMailAddress(rs.getString("m.email"));
                lineBuilder.addMailAddress(rs.getString("m.email2"));
                lineBuilder.addMailAddress(rs.getString("c.email"));
                lineBuilder.addMailAddress(rs.getString("c.email2"));

                lineBuilder.addPhone(rs.getString("m.phone"));
                lineBuilder.addPhone(rs.getString("m.mobile"));
                lineBuilder.addPhone(rs.getString("m.mobile2"));
                lineBuilder.addPhone(rs.getString("c.phone"));
                lineBuilder.addPhone(rs.getString("c.mobile"));
                lineBuilder.addPhone(rs.getString("c.mobile2"));

                lineBuilder.addContact(rs.getString("c.vname"), rs.getString("c.zname"), rs.getInt("c.zip_code"), rs.getString("c.city"), rs.getString("c.street"), rs.getInt("m.zip_code"), rs.getString("m.city"), rs.getString("m.street"));
            }
            lineBuilder.writeLine(out);
        }
        finally
        {
            DBUtils.closeQuitly(rs);
            DBUtils.closeQuitly(stmt);
            DBUtils.closeQuitly(conn);
        }
    }

    /**
     * @param out
     * @throws IOException 
     */
    private void writeHeader(ServletOutputStream out) throws IOException
    {
        out.print("\"Name\", ");
        out.print("\"Alter oder Gruppe\", ");
        out.print("\"Schuh-Größe\", ");
        out.print("\"Email\", ");
        out.print("\"Notruf-Nummern\", ");
        out.print("\"Kontakt-Personen\", ");
        out.print("\"dabei seit\", ");
        out.println();
    }


    /**
     * Erzeugt eine CSV-Linie mit allen übergebenen Werten
     *
     */
    private static class LineBuilder
    {
        private SimpleDateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy");

        private String name = null;
        private String age = null;
        private String memberSince = null;
        private Set<String> mails = new HashSet<>();
        private Set<String> phones = new HashSet<>();
        private Set<String> contacts = new HashSet<>();

        /**
         * @param givenName
         * @param surName
         * @return
         */
        public LineBuilder withName(String givenName, String surName)
        {
            this.name = String.format("%1$s %2$s", givenName, surName);
            return this;
        }

        /**
         * @param birthDate
         * @return
         */
        public LineBuilder withBirthDate(Date birthDate)
        {
            if (birthDate == null)
            {
                this.age = "";
            }
            else
            {
                long diff = System.currentTimeMillis() - birthDate.getTime();
                diff /= 1000;
                diff /= 60;
                diff /= 60;
                diff /= 24;
                diff /= 365;
                this.age = Long.toString(diff);
            }
            return this;
        }

        /**
         * @param since
         * @return
         */
        public LineBuilder withMemberSince(Date since)
        {
            if (since == null)
            {
                this.memberSince = "";
            }
            else
            {
                this.memberSince = dateFormat.format(since);
            }
            return this;
        }

        /**
         * @param address
         * @return
         */
        public LineBuilder addMailAddress(String address)
        {
            if (address != null)
            {
                this.mails.add(address);
            }
            return this;
        }

        /**
         * @param phone
         * @return
         */
        public LineBuilder addPhone(String phone)
        {
            if (phone != null)
            {
                this.phones.add(phone);
            }
            return this;
        }

        /**
         * EIgentlich brauchts hier einen eigenen Builder...
         * 
         * @param givenName
         * @param surName
         * @param contactZipCode
         * @param contactCity
         * @param contactStreet
         * @param memberZipCode
         * @param memberCity
         * @param memberStreet
         * @return
         */
        public LineBuilder addContact(String givenName, String surName, int contactZipCode, String contactCity,
            String contactStreet, int memberZipCode, String memberCity, String memberStreet)
        {
            StringBuilder result = new StringBuilder();
            result.append(String.format("%1$s %2$s", givenName, surName));
            if (contactZipCode == 0 || contactCity == null || contactStreet == null)
            {
                result.append(String.format(" (%1$d %2$s %3$s)", memberZipCode, memberCity, memberStreet));
            }
            else
            {
                result.append(String.format(" (%1$d %2$s %3$s)", contactZipCode, contactCity, contactStreet));
            }
            this.contacts.add(result.toString());
            return this;
        }

        /**
         * @param out
         * @throws IOException
         */
        public void writeLine(ServletOutputStream out) throws IOException
        {

            out.print(String.format("\"%1$s\", ", name));
            out.print(String.format("\"%1$s\", ", this.age));
            out.print("\"\",");
            this.dumpHashSet(out, mails);
            this.dumpHashSet(out, phones);
            this.dumpHashSet(out, contacts);
            out.print(String.format("\"%1$s\"", this.memberSince));
            out.println();
        }

        /**
         * 
         */
        public void clear()
        {
            this.name = null;
            this.age = null;
            this.memberSince = null;
            this.mails = new HashSet<>();
            this.phones = new HashSet<>();
            this.contacts = new HashSet<>();
        }

        /**
         * @param out
         * @param values
         * @throws IOException 
         */
        private void dumpHashSet(ServletOutputStream out, Set<String> values) throws IOException
        {
            out.print("\"");
            for (String value : values)
            {
                out.println(value);
            }
            out.print("\", ");
        }
    }
}
