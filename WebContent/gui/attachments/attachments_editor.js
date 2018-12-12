/**
 * Die Übersicht über alle Anhänge
 */
var AttachmentsOverview = function(parentFrame, targetCnr, model, xPath) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;
    this.xPath = xPath;
    this.currAttachment = null;
    this.currRow = null;

    var self = this;
    this.load("gui/attachments/attachments_overview.html", function() {

	self.setupDropZone();
	self.actionEdit = self.createEditAction();
	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();

	new TableDecorator("edit_attachments_overview");
	self.fillTable();

    });
}

/**
 * Wir erben von WorkSpaceFrame
 */
AttachmentsOverview.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
AttachmentsOverview.prototype.activate = function() {

    this.targetCnr.focus();
    this.actionAdd.show();
    if (this.currAttachment != null) {
	this.actionEdit.show();
	this.actionRemove.show();
    } else {
	this.actionEdit.hide();
	this.actionRemove.hide();
    }
}

/**
 * 
 */
AttachmentsOverview.prototype.setupDropZone = function() {

    var dropZone = this.targetCnr;

    var self = this;
    dropZone.addEventListener('dragover', function(evt) {
	self.handleDragOver(evt);
    });
    dropZone.addEventListener('drop', function(evt) {
	self.handleDrop(evt);
    });
}

/**
 * 
 */
AttachmentsOverview.prototype.handleDragOver = function(evt) {

    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

/**
 * 
 */
AttachmentsOverview.prototype.handleDrop = function(evt) {

    evt.stopPropagation();
    evt.preventDefault();

    var file = evt.dataTransfer.files[0];
    this.readFile(file);
}

/**
 * 
 */
AttachmentsOverview.prototype.readFile = function(file) {

    var size = parseInt(file.size / (1024 * 1024));
    if (size > 16) {

	var title = MessageCatalog.getMessage("UPLOD_TOO_BIG_TITLE");
	var messg = MessageCatalog.getMessage("UPLOD_TOO_BIG", file.name, size, 16);
	new MessageBox(MessageBox.ERROR, title, messg);
    } else {

	var reader = new FileReader();
	var self = this;

	reader.onloadstart = function() {
	    BusyIndicator.show();
	}
	reader.onload = function(evt) {

	    BusyIndicator.hide();

	    var binary = "";
	    var bytes = new Uint8Array(reader.result);
	    var length = bytes.byteLength;
	    for (var i = 0; i < length; i++) {
		binary += String.fromCharCode(bytes[i]);
	    }
	    var data = btoa(binary);
	    self.uploadFile(file.name, file.type, data);
	};

	reader.onerror = function() {
	    BusyIndicator.hide();
	}

	reader.readAsArrayBuffer(file);
    }
}

/**
 * 
 */
AttachmentsOverview.prototype.uploadFile = function(name, type, data) {

    var node = XmlUtils.createDocument("attachment");
    XmlUtils.setNode(node, "id", new Date().getTime());
    XmlUtils.setNode(node, "action", "CREATE");
    XmlUtils.setNode(node, "name", name);
    XmlUtils.setNode(node, "mime-type", type);
    XmlUtils.setNode(node, "content", data);

    this.model.addElement(self.xPath, node.documentElement);
    this.fillTable();
}

/**
 * Erzeigt die Aktion, um Anhänge anzuzeigen
 */
AttachmentsOverview.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/document-edit.svg", "Anhang anzeigen", function() {

	var url;
	if (self.model.getValue(self.currAttachment + "/action") == "CREATE") {
	    url = UIUtils.createDataUrl(self.model.getValue(self.currAttachment + "/mime-type"), self.model.getValue(self.currAttachment + "/content"));
	} else {
	    url = "getDocument/attachment?id=" + self.model.getValue(self.currAttachment + "/id");
	}
	var title = self.model.getValue(self.currAttachment + "/name");
	new DocumentViewer(url, title);
    });
    this.addAction(action);
    action.hide();

    this.keyMap[13] = function() {
	action.invoke();
    }
    return action;
}

/**
 * Erzeugt die Action, um einen neuen Anhang hinzu zu fügen
 */
AttachmentsOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/document-add.svg", "Anhang hinzufügen", null);
    this.addAction(action);

    new FilePicker(action.btn, function(name, type, data) {

	self.uploadFile(name, type, data);
    });

    action.hide();

    this.keyMap[187] = function() {
	action.btn.click();
    }

    return action;
}

/**
 * erzeugt die action, um einen Anhang zu löschen
 */
AttachmentsOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/document-remove.svg", "Anhang löschen", function() {

	var name = self.model.getValue(self.currAttachment + "/name");
	var messg = MessageCatalog.getMessage("ATTACHMENT_QUERY_REMOVE", name);
	var title = MessageCatalog.getMessage("ATTACHMENT_QUERY_REMOVE_TITLE");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currAttachment + "/action") == "CREATE") {
		self.model.removeElement(self.currAttachment);
	    } else {
		self.model.setValue(self.currAttachment + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currRow);
	    self.currRow = self.currAttachment = null;
	    self.actionEdit.hide();
	    self.actionRemove.hide();
	});
    });
    this.addAction(action);
    action.hide();

    this.keyMap[46] = function() {
	action.invoke();
    }

    return action;
}

/**
 * 
 */
AttachmentsOverview.prototype.fillTable = function() {

    var self = this;

    // gelöschte Attachments werden nicht angezeigt
    var filter = function(attachment) {
	return attachment.getElementsByTagName("action")[0].textContent != "REMOVE";
    }

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, attachment) {

	tr.querySelector("input[type=radio]").click();
	self.currRow = tr;
	self.currAttachment = XmlUtils.getXPathTo(attachment);
	self.actionEdit.show();
	self.actionRemove.show();
    }

    var allAttachments = this.xPath + "/attachment";
    var fields = this.getColumnDescriptor();
    this.model.createTableBinding("edit_attachments_overview", fields, allAttachments, onclick, filter);
    this.currRow = this.currAttachment = null;
}

/**
 * 
 */
AttachmentsOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, attachment) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "attachments_overview";
	return radio;
    });

    fields.push("name");
    return fields;
}