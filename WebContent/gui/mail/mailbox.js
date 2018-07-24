var MailBoxViewer = function() {

    WorkSpaceTabbedFrame.call(this, "mailbox");

    var self = this;

    this.setTitle("Mailbox");
    this.loadModel(function() {
	self.tables = [];
	self.update();
    });
}
MailBoxViewer.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
MailBoxViewer.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-mailbox-ok-rsp":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("GETMAILBOX_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("GETMAILBOX_ERROR_MESSAGE", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("GETMAILBOX_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("GETMAILBOX_TECHERROR_MESSAGE", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-mailbox-req");
    caller.invokeService(req);
}

/**
 * 
 */
MailBoxViewer.prototype.update = function() {

    var allMsgs = this.model.evaluateXPath("//get-mailbox-ok-rsp/msg");
    for (var i = 0; i < allMsgs.length; i++) {

	this.renderOneMsg(allMsgs[i]);
    }
}

/**
 * 
 */
MailBoxViewer.prototype.renderOneMsg = function(msg) {

    var folderName = msg.getElementsByTagName("folder")[0];
    if (folderName) {

	var panel = this.getSubPanelForFolderName(folderName.textContent);

	panel.addMessage(XmlUtils.getXPathTo(msg));
    }
}

/**
 * 
 */
MailBoxViewer.prototype.getSubPanelForFolderName = function(folderName) {

    var result = this.tables[folderName];
    if (!result) {

	result = this.createFolder(folderName);
	this.tables[folderName] = result;
    }
    return result;
}

/**
 * 
 */
MailBoxViewer.prototype.createFolder = function(folderName) {

    var tab = this.addTab("gui/images/folder.svg", folderName);
    var subFrame = new MailBoxFolderSubPanel(this, tab.contentPane, folderName, this.model);
    tab.associateTabPane(subFrame);
    return subFrame;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MailBoxFolderSubPanel = function(parentFrame, targetCnr, name, model) {

    this.model = model;
    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.content = document.createElement("div");
    this.content.className = "mail-subpanel-content";
    this.targetCnr.appendChild(this.content);

    this.actionShow = this.createShowAction();
    this.actionRemove = this.createRemoveAction();
}
MailBoxFolderSubPanel.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
MailBoxFolderSubPanel.prototype.createShowAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/mail-show.svg", "Mail anzeigen", function() {

	// var title = self.model.getValue(self.currSel + "/subject");
	var blobId = self.model.getValue(self.currSel + "/blob-id");
	// var url = "getDocument/mail-content?blob-id=" + blobId;
	// new DocumentViewer(url, title);
	new MailViewer(self.model, self.currSel);
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
MailBoxFolderSubPanel.prototype.createRemoveAction = function() {

    var action = new WorkSpaceFrameAction("gui/images/mail-remove.svg", "Mail löschen", function() {
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
MailBoxFolderSubPanel.prototype.addMessage = function(xpath) {

    var cnr = document.createElement("div");
    cnr.className = "mail-cnr";

    var radio = document.createElement("input");
    radio.type = "radio", radio.name = "mail-sel";
    radio.className = "mail-selector";
    cnr.appendChild(radio);

    var envelope = document.createElement("div");
    envelope.className = "mail-envelope";
    cnr.appendChild(envelope);

    envelope.appendChild(this.createHeaderRow(xpath));
    envelope.appendChild(this.createFromRow(xpath));
    envelope.appendChild(this.createRecipientsRow(xpath));

    var self = this;
    cnr.addEventListener("click", function() {
	radio.click();
	self.actionShow.show();
	self.actionRemove.show();
	self.currSel = xpath;
    });

    this.content.appendChild(cnr);
}

/**
 * 
 */
MailBoxFolderSubPanel.prototype.createHeaderRow = function(xpath) {

    var row = document.createElement("div");
    row.className = "mail-envelope-row";

    var subject = document.createElement("div");
    subject.className = "mail-envelope-subject";
    subject.textContent = this.model.getValue(xpath + "/subject");
    row.appendChild(subject);

    var date = document.createElement("div");
    date.className = "mail-envelope-label";
    date.textContent = this.model.getValue(xpath + "/sent");
    row.appendChild(date);

    return row;
}

/**
 * 
 */
MailBoxFolderSubPanel.prototype.createFromRow = function(xpath) {

    var row = document.createElement("div");
    row.className = "mail-envelope-row";

    var label = document.createElement("div");
    label.className = "mail-envelope-label";
    label.textContent = "Von: ";
    row.appendChild(label);

    var address = document.createElement("div");
    address.className = "mail-envelope-address";
    address.textContent = this.model.getValue(xpath + "/from");
    row.appendChild(address);

    return row;

}

/**
 * 
 */
MailBoxFolderSubPanel.prototype.createRecipientsRow = function(xpath) {

    var row = document.createElement("div");
    row.className = "mail-envelope-row";

    var label = document.createElement("div");
    label.className = "mail-envelope-label";
    label.textContent = "An: ";
    row.appendChild(label);

    var address = document.createElement("div");
    address.className = "mail-envelope-address";

    address.textContent = "";
    var allRecipients = this.model.evaluateXPath(xpath + "/recipients/to");
    for (var i = 0; i < allRecipients.length; i++) {
	if (address.textContent != "") {
	    address.textContent += ", ";
	}
	address.textContent += allRecipients[i].textContent;
    }

    row.appendChild(address);

    return row;

}

/*---------------------------------------------------------------------------*/
/**
 * MailViewer
 */
var MailViewer = function(model, xpath) {

    WorkSpaceFrame.call(this);

    this.model = model;
    this.xpath = xpath;
    var self = this;
    this.load("gui/mail/mail_viewer.html", function() {

	UIUtils.getElement("mail-viewer-subject").textContent = self.model.getValue(self.xpath + "/subject");
	UIUtils.getElement("mail-viewer-date").textContent = self.model.getValue(self.xpath + "/sent") ;
	UIUtils.getElement("mail-viewer-from").textContent = self.model.getValue(self.xpath + "/from");

	var allRecipients = self.model.evaluateXPath(self.xpath + "/recipients/to");
	var value = "";
	for (var i = 0; i < allRecipients.length; i++) {
	    value += allRecipients[i].textContent + ", ";
	}
	UIUtils.getElement("mail-viewer-to").textContent = value;

	var blobId = self.model.getValue(self.xpath + "/blob-id");
	var url = "getDocument/mail-content?blob-id=" + blobId;
	UIUtils.getElement("mail-viewer-iframe").src = url;
    });
}
MailViewer.prototype = Object.create(WorkSpaceFrame.prototype);
