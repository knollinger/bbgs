package de.bbgs.attachments;

public enum EAttachmentDomain
{
    /**
     * Attachments fuer Member, die id ist die MemberId
     */
    MEMBER,
    
    /**
     * Anhänge für die Partner
     */
    PARTNER,
        
    /**
     * Wird für internes Attachment für das Thumbnail verwendet
     */
    THUMBNAIL,
    
    /**
     * Wird für internes Attachment für die Mailsignatur verwendet
     */
    MAILSIG,
    
    /**
     * In zu sendenden Mails werden die DATA-URLs durch referenzen auf getDocument ersetzt, 
     * die Images landen in der Datenbank
     */
    MAILCONTENT,
    
    /**
     * Attachments an Kursen, die id ist die CourseId
     */
    COURSE,
    
    /**
     * Anhang an Kurs-Lokationen
     */
    COURSELOC,
    
    /**
     * Datenschutzerklärung
     */
    DSE
}
