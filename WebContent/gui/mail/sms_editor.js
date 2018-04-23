/**
 * 
 */
var SMSEditor = function() {

    WorkSpaceFrame.call(this);
    this.model = new Model(XmlUtils.parse(SMSEditor.EMPTY_MODEL));

    var self = this;
    this.load("gui/mail/sms_editor.html", function() {

	self.actionAddPerson = self.createAddPersonAction();
	self.actionSendSMS = self.createSendSMSAction();
	
	self.model.createValueBinding("edit_sms_content", "/send-sms-req/body");
	
	self.model.addChangeListener("/send-sms-req/send-to", function() {
	    self.fillSendTo();
	});

	self.model.addChangeListener("/send-sms-req", function() {
	    self.adjustSendSMSAction();
	});
    });
}
SMSEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
SMSEditor.EMPTY_MODEL = "<send-sms-req><subject/><send-to><members/><types/><courses/><partners/><custom-groups/></send-to><title/><body/></send-sms-req>";


/**
 * 
 */
SMSEditor.prototype.createAddPersonAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-add.svg", "Einen Adressaten hinzu fügen", function() {
	new Adressbook(self.model, "/send-sms-req/send-to", Adressbook.SMS);
    });
    this.addAction(action);
    return action;
}

/**
 * 
 */
SMSEditor.prototype.createSendSMSAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/mail-send.svg", "SMS senden", function() {
	self.sendSMS();
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
SMSEditor.prototype.fillSendTo = function() {

    var cnr = UIUtils.getElement("edit_sms_sendto");
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
SMSEditor.prototype.fillSendToMembers = function(cnr) {

    var allMembers = this.model.evaluateXPath("/send-sms-req/send-to/members/member");
    for (var i = 0; i < allMembers.length; i++) {

	var member = allMembers[i];
	var xPath = XmlUtils.getXPathTo(member);
	var text = this.model.getValue(xPath + "/zname") + ", " + this.model.getValue(xPath + "/vname");
	var title = this.model.getValue(xPath + "/mobile");
	cnr.appendChild(this.createAdressTag("gui/images/person.svg", text, xPath, title));
    }
}

/**
 * 
 */
SMSEditor.prototype.fillSendToCourses = function(cnr) {

    var allCourses = this.model.evaluateXPath("/send-sms-req/send-to/courses/course");
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
SMSEditor.prototype.fillSendToMemberTypes = function(cnr) {

    var allTypes = this.model.evaluateXPath("/send-sms-req/send-to/types/member-type");
    for (var i = 0; i < allTypes.length; i++) {

	var type = allTypes[i];
	var xPath = XmlUtils.getXPathTo(type);
	var title = MemberTypeTranslator[this.model.getValue(xPath + "/type")];
	cnr.appendChild(this.createAdressTag("gui/images/person-group.svg", title, xPath));
    }
}

/**
 * 
 */
SMSEditor.prototype.fillSendToCustomGroups = function(cnr) {

    var allGroups = this.model.evaluateXPath("/send-sms-req/send-to/custom-groups/custom-group");
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
SMSEditor.prototype.fillSendToPartners = function(cnr) {

    var allPartners = this.model.evaluateXPath("/send-sms-req/send-to/partners/partner");
    for (var i = 0; i < allPartners.length; i++) {

	var partner = allPartners[i];
	var xPath = XmlUtils.getXPathTo(partner);
	var text = this.model.getValue(xPath + "/zname") + ", " + this.model.getValue(xPath + "/vname");
	var title = this.model.getValue(xPath + "/mobile");
	cnr.appendChild(this.createAdressTag("gui/images/partner.svg", text, xPath, title));
    }
}

/**
 * 
 */
SMSEditor.prototype.createAdressTag = function(imgUrl, title, xPath, flyOver) {

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
SMSEditor.prototype.adjustSendSMSAction = function() {

    var members = this.model.evaluateXPath("/send-sms-req/send-to/members/member");
    var types = this.model.evaluateXPath("/send-sms-req/send-to/types/member-type");
    var courses = this.model.evaluateXPath("/send-sms-req/send-to/courses/course");
    var partners = this.model.evaluateXPath("/send-sms-req/send-to/partners/partner");
    var groups = this.model.evaluateXPath("/send-sms-req/send-to/custom-groups/custom-group");
    var body = this.model.getValue("/send-sms-req/body");
    
    if((members.length || types.length || courses.length || partners.length || groups.length) && body) {
	this.actionSendSMS.show();
    }
    else {
	this.actionSendSMS.hide();	
    }
}

/**
 * 
 */
SMSEditor.prototype.sendSMS = function() {
    
    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch(rsp.documentElement.nodeName) {
	case "send-sms-ok-rsp":
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
