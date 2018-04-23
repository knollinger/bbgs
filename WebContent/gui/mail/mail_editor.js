/**
 * 
 */
var MailEditor = function() {

    WorkSpaceFrame.call(this);
    this.model = new Model(XmlUtils.parse(MailEditor.EMPTY_MODEL));

    var self = this;
    this.load("gui/mail/mail_editor.html", function() {

	self.setupCKEditor();
	self.actionAddPerson = self.createAddPersonAction();
	self.actionAddAttachment = self.createAddAttachmentAction();
	self.actionSendMail = self.createSendMailAction();
	
	self.model.createValueBinding("edit_email_subject", "/send-mail-req/subject");
	
	self.model.addChangeListener("/send-mail-req/send-to", function() {
	    self.fillSendTo();
	});

	self.model.addChangeListener("/send-mail-req/attachments", function() {
	    self.fillAttachments();
	});

	self.model.addChangeListener("/send-mail-req", function() {
	    self.adjustSendMailAction();
	});
    });
}
MailEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MailEditor.EMPTY_MODEL = "<send-mail-req><subject/><send-to><members/><types/><courses/><partners/><custom-groups/></send-to><title/><body/><attachments/></send-mail-req>";

/**
 * Bsserl Gfreddel....was solls
 */
MailEditor.prototype.setupCKEditor = function() {

    var self = this;
    CKEDITOR.replace("edit_email_content", {
	on : {
	    instanceReady : function(evt) {
		UIUtils.addClass("cke_edit_email_content", "grid-row-1");
		UIUtils.addClass("cke_edit_email_content", "grid-col-2");

	    },
	    change : function() {
		self.model.setValue("/send-mail-req/body", CKEDITOR.instances.edit_email_content.getData());
	    }
	}
    });
}

/**
 * 
 */
MailEditor.prototype.createAddPersonAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-add.svg", "Einen Adressaten hinzu fügen", function() {
	new Adressbook(self.model, "/send-mail-req/send-to", Adressbook.MAIL);
    });
    this.addAction(action);
    return action;
}

/**
 * 
 */
MailEditor.prototype.createAddAttachmentAction = function() {

    var self = this;

    var action = new WorkSpaceFrameAction("gui/images/document-add.svg", "Einen Anhang hinzu fügen");
    this.addAction(action);
    new FilePicker(action.btn, function(name, type, data) {

	var doc = XmlUtils.createDocument("attachment");
	var attachment = doc.documentElement;

	var node = doc.createElement("name");
	node.textContent = name;
	attachment.appendChild(node);

	node = doc.createElement("mime-type");
	node.textContent = type;
	attachment.appendChild(node);

	node = doc.createElement("content");
	node.textContent = data;
	attachment.appendChild(node);

	self.model.addElement("/send-mail-req/attachments", attachment);
    });

    return action;
}

/**
 * 
 */
MailEditor.prototype.createSendMailAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/mail-send.svg", "Mail senden", function() {
	self.sendMail();
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
MailEditor.prototype.fillSendTo = function() {

    var cnr = UIUtils.getElement("edit_email_sendto");
    UIUtils.removeChildsWithClass(cnr, "send-to-tag");

    this.fillSendToMembers(cnr);
    this.fillSendToMemberTypes(cnr);
    this.fillSendToCourses(cnr);
    this.fillSendToPartners(cnr);
    this.fillSendToCustomGroups(cnr);
}

/**
 * 
 */
MailEditor.prototype.fillSendToMembers = function(cnr) {

    var allMembers = this.model.evaluateXPath("/send-mail-req/send-to/members/member");
    for (var i = 0; i < allMembers.length; i++) {

	var member = allMembers[i];
	var xPath = XmlUtils.getXPathTo(member);
	var text = this.model.getValue(xPath + "/zname") + ", " + this.model.getValue(xPath + "/vname");
	var title = this.model.getValue(xPath + "/email");
	cnr.appendChild(this.createAdressTag("gui/images/person.svg", text, xPath, title));
    }
}

/**
 * 
 */
MailEditor.prototype.fillSendToCourses = function(cnr) {

    var allCourses = this.model.evaluateXPath("/send-mail-req/send-to/courses/course");
    for (var i = 0; i < allCourses.length; i++) {

	var course = allCourses[i];
	var xPath = XmlUtils.getXPathTo(course);
	var title = this.model.getValue(xPath + "/name");
	cnr.appendChild(this.createAdressTag("gui/images/course.svg", title, xPath));
    }
}

/**
 * 
 */
MailEditor.prototype.fillSendToMemberTypes = function(cnr) {

    var allTypes = this.model.evaluateXPath("/send-mail-req/send-to/types/member-type");
    for (var i = 0; i < allTypes.length; i++) {

	var type = allTypes[i];
	var xPath = XmlUtils.getXPathTo(type);
	var title = MemberTypeTranslator[this.model.getValue(xPath)];
	cnr.appendChild(this.createAdressTag("gui/images/person-group.svg", title, xPath));
    }
}

/**
 * 
 */
MailEditor.prototype.fillSendToCustomGroups = function(cnr) {

    var allGroups = this.model.evaluateXPath("/send-mail-req/send-to/custom-groups/custom-group");
    for (var i = 0; i < allGroups.length; i++) {

	var group = allGroups[i];
	var xPath = XmlUtils.getXPathTo(group);
	var title = this.model.getValue(xPath + "/name");
	cnr.appendChild(this.createAdressTag("gui/images/person-group.svg", title, xPath));
    }
}

/**
 * 
 */
MailEditor.prototype.fillSendToPartners = function(cnr) {

    var allPartners = this.model.evaluateXPath("/send-mail-req/send-to/partners/partner");
    for (var i = 0; i < allPartners.length; i++) {

	var partner = allPartners[i];
	var xPath = XmlUtils.getXPathTo(partner);
	var text = this.model.getValue(xPath + "/zname") + ", " + this.model.getValue(xPath + "/vname");
	var title = this.model.getValue(xPath + "/email");
	cnr.appendChild(this.createAdressTag("gui/images/partner.svg", text, xPath, title));
    }
}

/**
 * 
 */
MailEditor.prototype.createAdressTag = function(imgUrl, title, xPath, flyOver) {

    var tag = document.createElement("div");
    tag.className = "send-to-tag";

    var img = document.createElement("img");
    img.src = imgUrl;
    tag.appendChild(img);

    var span = document.createElement("span");
    span.textContent = title;
    tag.appendChild(span);

    var close = document.createElement("img");
    close.src = "gui/images/dialog-cancel.svg";
    tag.appendChild(close);

    var self = this;
    close.addEventListener("click", function(evt) {
	evt.stopPropagation();
	self.model.removeElement(xPath);
    });

    if (flyOver) {
	tag.title = flyOver;
    }
    return tag;
}

/**
 * 
 */
MailEditor.prototype.fillAttachments = function() {

    var cnr = UIUtils.getElement("edit_email_attachments");
    UIUtils.removeChildsWithClass(cnr, "attachment-tag");

    var allAttachments = this.model.evaluateXPath("/send-mail-req/attachments/attachment");
    for (var i = 0; i < allAttachments.length; i++) {

	var attachment = allAttachments[i];
	cnr.appendChild(this.createAttachmentTag(attachment));
    }
}

/**
 * 
 */
MailEditor.prototype.createAttachmentTag = function(attachment) {

    var self = this;
    var tag = document.createElement("div");
    tag.className = "attachment-tag";

    var xpath = XmlUtils.getXPathTo(attachment);

    var mimeType = MimeTypeVisualizer.getMimeTypeIcon(this.model.getValue(xpath + "/mime-type"));
    mimeType.className = "attachment-mimetype";
    tag.appendChild(mimeType);

    var close = document.createElement("img");
    close.src = "gui/images/dialog-cancel.svg";
    close.className = "attachment-close";
    tag.appendChild(close);
    tag.appendChild(UIUtils.createClearFix());
    close.addEventListener("click", function(evt) {
	evt.stopPropagation();
	self.model.removeElement(xpath);
    });

    var title = document.createElement("div");
    title.className = "attachment-title";
    title.textContent = this.model.getValue(xpath + "/name");
    tag.appendChild(title);
    return tag;
}

/**
 * 
 */
MailEditor.prototype.adjustSendMailAction = function() {

    var members = this.model.evaluateXPath("/send-mail-req/send-to/members/member");
    var types = this.model.evaluateXPath("/send-mail-req/send-to/types/member-type");
    var courses = this.model.evaluateXPath("/send-mail-req/send-to/courses/course");
    var partners = this.model.evaluateXPath("/send-mail-req/send-to/partners/partner");
    var groups = this.model.evaluateXPath("/send-mail-req/send-to/custom-groups/custom-group");
    var subject = this.model.getValue("/send-mail-req/subject");
    
    if((members.length || types.length || courses.length || partners.length || groups.length) && subject) {
	this.actionSendMail.show();
    }
    else {
	this.actionSendMail.hide();	
    }
}

/**
 * 
 */
MailEditor.prototype.sendMail = function() {
    
    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch(rsp.documentElement.nodeName) {
	case "send-mail-ok-rsp":
	    self.close();
	    break;
	    
	case "error-response":
	    alert("error-response");
	    break;
	}
    }
    
    caller.onError = function(req, status) {
	    alert("status: " + status);
	
    }
    caller.invokeService(this.model.getDocument());
}
