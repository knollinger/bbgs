package de.bbgs.attachments;

import javax.xml.bind.annotation.XmlElement;

import de.bbgs.service.EAction;

public class Attachment
{
	@XmlElement(name = "id")
    public int id = -1;

	@XmlElement(name = "name")
	public String name = "";

	@XmlElement(name = "mime-type")
	public String mimeType = "";

	@XmlElement(name = "content")
	public byte[] content = {};

	@XmlElement(name = "attached-by")
	public String attachedBy = "";

	@XmlElement(name = "attached-at")
	public String attachDate = "";
    
	@XmlElement(name="domain")
	public EAttachmentDomain domain;

	@XmlElement(name = "action")
	public EAction action = EAction.NONE;
}
