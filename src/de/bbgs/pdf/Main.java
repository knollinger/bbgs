package de.bbgs.pdf;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

import de.bbgs.pdf.DocBuilder.DocPart;

public class Main
{
    private static String template = "= ASCIIDOC is writing ZEN\n" + "DocWriter <doc.writer@example.com>\n" + "\n"
        + "_Zen_ is the \"art\" of writing `plain text` with\n" + "http://asciidoc.org[AsciiDoc]\n" + "\n" + "[TIP]\n"
        + "Use http://asciidoctor.org[AsciiDoctor] for the best AsciiDoc\n"
        + "experience. footnote:[Not to mention for the best looking output!]\n" + "\n" + "== Sample Section\n" + "\n"
        + "[square]\n" + "* item 1\n" + "* item 2\n" + "\n" + "[width=\"100%\", cols=\"1,1,1,1,2\", options=\"header\"]\n"
        + "|==================================================\n" + "| Name | Vorname | Telefon | Mobil | EMail\n"
        + "{ROW}\n" + "| $ZNAME$ | $VNAME$ | $PHONE$ | $MOBILE$ | $EMAIL$ \n" + "{/ROW}\n"
        + "|==================================================\n";


    public static void main(String[] args) throws Exception
    {
        ByteArrayInputStream in = new ByteArrayInputStream(template.getBytes());
        DocBuilder db = new DocBuilder(in);

        for (int i = 0; i < 50; i++)
        {
            DocPart p = db.duplicateSection("ROW");
            p.replaceTag("$ZNAME$", "Zname_" + i);
            p.replaceTag("$VNAME$", "Vname_" + i);
            p.replaceTag("$PHONE$", "Phone_" + i);
            p.replaceTag("$MOBILE$", "Mobile_" + i);
            p.replaceTag("$EMAIL", "Email_" + i);
            p.commit();
        }
        db.removeSection("ROW");;
        
        byte[] pdf = PDFCreator.transform(db.getDocument());
        
        OutputStream out = new FileOutputStream(new File("/tmp/hallo.pdf"));
        out.write(pdf);
        out.close();
    }
}
