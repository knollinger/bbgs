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
