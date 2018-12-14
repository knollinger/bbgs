var DSENavigation = function() {

    Navigation.call(this, "gui/images/header5.jpg");

    this.addNavigationButton("gui/images/dse-edit.svg", "Datenschutzerklärung bearbeiten", function() {
	new DSEEditor();
    });

    this.addNavigationButton("gui/images/dse-person.svg", "Datenschutz-Erklärung pro Mitglied", function() {
	new DSEOverview();
    });
    this.setTitle("Mitglieder-Verwaltung");
}
DSENavigation.prototype = Object.create(Navigation.prototype);

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var DSEEditor = function() {

    WorkSpaceFrame.call(this);

    var self = this;
    this.load("gui/dsgvo/dse_editor.html", function() {
	self.actionShow = self.createShowAction();
	self.actionAdd = self.createAddAction();
	self.setupFilePicker();
	self.setupDropZone();
	self.loadModel();
    });
}
DSEEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
DSEEditor.prototype.loadModel = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-dse-versions-ok-rsp":
	    self.model = new Model(rsp);
	    self.fillTable();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_DSE_VERSIONS_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_DSE_VERSIONS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_DSE_VERSIONS_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_DSE_VERSIONS_TECHERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-dse-versions-req");
    caller.invokeService(req);
}

/**
 * 
 */
DSEEditor.prototype.fillTable = function() {

    UIUtils.clearChilds("dse-editor-table-body");
    var xpath = "//get-dse-versions-ok-rsp/versions/version";
    var allVersions = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allVersions.length; i++) {
	this.renderOneVersionEntry(allVersions[i]);
    }

}

DSEEditor.prototype.renderOneVersionEntry = function(version) {

    var self = this;
    var onclick = function() {
	self.currVersionId = version.getElementsByTagName("id")[0].textContent;
	self.actionShow.show();
    }

    var tbody = UIUtils.getElement("dse-editor-table-body");
    var row = this.model.createTableRow(version, this.getColumnDesc(), onclick);
    tbody.appendChild(row);
}
/**
 * 
 */
DSEEditor.prototype.getColumnDesc = function() {

    var cols = [];
    cols.push(function(td, version) {
	var result = document.createElement("input");
	result.type = "radio";
	result.name = "dsgvo_version_sel";
	return result;
    });
    cols.push("file-name");
    cols.push("date");
    cols.push("account");
    return cols;
}

/**
 * 
 */
DSEEditor.prototype.createAddAction = function() {

    var self = this;
    var title = "Neue Version der Datenschutz-Erklärug hoch laden";
    var action = new WorkSpaceFrameAction("gui/images/document-add.svg", title, function() {
	UIUtils.getElement("dse-editor-filepicker").click();
    });
    this.addAction(action);
    return action;
}
/**
 * 
 */
DSEEditor.prototype.createShowAction = function() {

    var self = this;
    var title = "Ausgewählte Version der Datenschutz-Erklärung anzeigen";
    var action = new WorkSpaceFrameAction("gui/images/document-edit.svg", title, function() {

	var xpath = "//get-dse-versions-ok-rsp/versions/version[id='" + self.currVersionId + "']";
	var title = self.model.getValue(xpath + "/file-name") + " - gültig ab: " + self.model.getValue(xpath + "/date");
	var url = "getDocument/attachment?id=" + self.currVersionId;	 
	new DocumentViewer(url, title);
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
DSEEditor.prototype.setupFilePicker = function() {

    var self = this;
    var picker = UIUtils.getElement("dse-editor-filepicker");
    picker.addEventListener("change", function(evt) {
	self.readFile(picker.files[0]);
    });
}

/**
 * 
 */
DSEEditor.prototype.setupDropZone = function() {

    var dropZone = this.content;

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
DSEEditor.prototype.handleDragOver = function(evt) {

    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
}

/**
 * 
 */
DSEEditor.prototype.handleDrop = function(evt) {

    evt.stopPropagation();
    evt.preventDefault();

    var file = evt.dataTransfer.files[0];
    this.readFile(file);
}

/**
 * 
 */
DSEEditor.prototype.readFile = function(file) {

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
DSEEditor.prototype.uploadFile = function(name, mimeType, data) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-dse-version-ok-rsp":
	    self.loadModel();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_DSE_VERSIONS_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_DSE_VERSIONS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    };
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_DSE_VERSIONS_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_DSE_VERSIONS_TECHERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);

    }

    var req = XmlUtils.createDocument("save-dse-version-req");
    XmlUtils.setNode(req, "name", name);
    XmlUtils.setNode(req, "type", mimeType);
    XmlUtils.setNode(req, "data", data);
    caller.invokeService(req);

}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var DSEOverview = function() {

    WorkSpaceTabbedFrame.call(this, "dse");

    var self = this;
    this.setTitle("Übersicht Datenschutz-Erklärung");
    this.loadModel(function() {

	self.prepareSections();
    });
}
DSEOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
DSEOverview.prototype.prepareSections = function() {

    this.panels = {};

    var tab = this.addTab("gui/images/dse-person.svg", "Datenschutz-Erklärung noch nicht verschickt");
    var panel = new DSESubPanelNone(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["NONE"] = panel;
    tab.select();

    tab = this.addTab("gui/images/dse-person.svg", "Noch nicht reagiert");
    panel = new DSESubPanelPending(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["PENDING"] = panel;

    tab = this.addTab("gui/images/dse-person.svg", "Datenschutz-Erklärung zugestimmt");
    panel = new DSESubPanelAccepted(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["ACCEPTED"] = panel;

    tab = this.addTab("gui/images/dse-person.svg", "Datenschutz-Erklärung abgelehnt");
    panel = new DSESubPanelRejected(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["REJECTED"] = panel;

    tab = this.addTab("gui/images/dse-person.svg", "Datenschutz-Erklärung  nicht zustellbar");
    panel = new DSESubPanelNotDeliverable(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["NOT_DELIVERABLE"] = panel;
}

/**
 * 
 */
DSEOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-dsgvo-overview-ok-rsp":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("TITLE_GET_DSE_OVERVIEW");
	    var messg = MessageCatalog.getMessage("GET_DSE_OVERVIEW_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("TITLE_GET_DSE_OVERVIEW");
	var messg = MessageCatalog.getMessage("GET_DSE_OVERVIEW_TECHERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-dsgvo-overview-req");
    caller.invokeService(req);
}

/*---------------------------------------------------------------------------*/
/**
 * die Basis der DSE-Subpanele. Alle Panele bestehen im wesentlichen nur aus
 * einer Tabelle, sie unterscheiden sich lediglich in bezug auf die Aktions
 */
var DSESubPanel = function(parentFrame, targetCnr, header) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    targetCnr.appendChild(this.createTable(header));
}
DSESubPanel.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
DSESubPanel.prototype.createTable = function(header) {

    var tr = document.createElement("tr");
    for (var i = 0; i < header.length; i++) {
	var th = document.createElement("th");
	th.textContent = header[i];
	if (i != 0) {
	    th.className = "sortable";
	}
	tr.appendChild(th);
    }
    var thead = document.createElement("thead");
    thead.appendChild(tr);

    this.table = document.createElement("table");
    this.table.appendChild(thead);
    this.tableclassName = "grid-col-1";

    var body = document.createElement("tbody");
    this.table.appendChild(body);
    new TableDecorator(this.table);
    return this.table;
}

/*---------------------------------------------------------------------------*/
var DSESubPanelNone = function(parentFrame, targetCnr, model) {

    DSESubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "Email" ]);
    this.model = model;
    this.selected = [];

    this.actionSend = this.createSendAction();
    this.addAction(this.actionSend);
    this.actionSend.hide();

    this.createSelectAll();

    var self = this;
    this.model.addChangeListener("//get-dsgvo-overview-ok-rsp", function() {
	self.fillTable();
    });
    this.fillTable();
}
DSESubPanelNone.prototype = Object.create(DSESubPanel.prototype);

/**
 * 
 */
DSESubPanelNone.prototype.createSendAction = function() {

    var self = this;
    var title = "Datenschutz-Erklärung zu senden";
    var action = new WorkSpaceFrameAction("gui/images/mail-send.svg", title, function() {
	self.sendDSEMails();
    });
    return action;
}

/**
 * 
 */
DSESubPanelNone.prototype.createSelectAll = function() {

    var selAll = document.createElement("input");
    selAll.type = "checkbox";
    selAll.name = "des_none_sel";
    selAll.id = "des_none_sel";

    var label = document.createElement("label");
    label.setAttribute("for", "des_none_sel");
    label.appendChild(selAll);
    label.appendChild(document.createTextNode("Alle auswählen"));
    label.className = "grid-col-0";

    var parent = this.table.parentElement;
    parent.insertBefore(label, this.table);

    var self = this;
    selAll.addEventListener("click", function() {
	var allCheckboxes = self.table.querySelectorAll("input[type='checkbox'");
	for (var i = 0; i < allCheckboxes.length; i++) {
	    if (allCheckboxes[i].checked != selAll.checked) {
		allCheckboxes[i].click();
	    }
	}
    });
}

/**
 * 
 */
DSESubPanelNone.prototype.fillTable = function() {

    var fields = [];
    fields.push(function(td, item) {
	result = document.createElement("input");
	result.type = "checkbox";
	result.name = "dsgvo_sel_none";
	return result;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("email");

    var self = this;
    var onclick = function(tr, item) {

	var id = item.getElementsByTagName("id")[0].textContent;
	var cb = tr.querySelector("input[type='checkbox']");
	if (cb.checked) {
	    self.selected.pushIfAbsent(id);
	} else {
	    self.selected.remove(id);
	}

	if (self.selected.length) {
	    self.actionSend.show();
	} else {
	    self.actionSend.hide();
	}
    }

    var xpath = "//get-dsgvo-overview-ok-rsp/dsgvo-item[state='NONE' and email != '']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}

/**
 * 
 */
DSESubPanelNone.prototype.sendDSEMails = function() {

    if (this.selected.length) {

	var id = this.selected[0];
	this.selected.splice(0, 1);

	var self = this;
	this.sendOneDSEMail(id, function() {
	    self.sendDSEMails();
	});
    }
}

/**
 * 
 */
DSESubPanelNone.prototype.sendOneDSEMail = function(id, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "send-dse-mail-ok-rsp":
	    self.model.setValue("//get-dsgvo-overview-ok-rsp/dsgvo-item[id='" + id + "']/state", "PENDING");
	    self.model.setValue("//get-dsgvo-overview-ok-rsp/dsgvo-item[id='" + id + "']/date", DateTimeUtils.formatDate(new Date(), "{dd}.{mm}.{yyyy}"));
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SEND_DSEMAIL_ERR_TITLE");
	    var messg = MessageCatalog.getMessage("SEND_DSEMAIL_ERR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SEND_DSEMAIL_ERR_TITLE");
	var messg = MessageCatalog.getMessage("SEND_DSEMAIL_TECHERR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("send-dse-mail-req");
    XmlUtils.setNode(req, "send-to", id);
    caller.invokeService(req);
}

/*---------------------------------------------------------------------------*/
var DSESubPanelPending = function(parentFrame, targetCnr, model) {

    DSESubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "zugesendet am", "Email" ]);
    this.model = model;

    var self = this;
    this.model.addChangeListener("//get-dsgvo-overview-ok-rsp", function() {
	self.fillTable();
    });

    this.fillTable();
}
DSESubPanelPending.prototype = Object.create(DSESubPanel.prototype);

/**
 * 
 */
DSESubPanelPending.prototype.fillTable = function() {

    var fields = [];
    fields.push(function(td, item) {
	var cb = document.createElement("input");
	cb.type = "radio";
	cb.name = "dsgvo_sel_pending";
	return cb;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("date");
    fields.push("email");

    var onclick = function(tr, item) {

    }

    var xpath = "//get-dsgvo-overview-ok-rsp/dsgvo-item[state='PENDING']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}

/*---------------------------------------------------------------------------*/
var DSESubPanelRejected = function(parentFrame, targetCnr, model) {

    DSESubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "abgelehnt am", "Email" ]);
    this.model = model;

    this.actionRemove = new WorkSpaceFrameAction("gui/images/person-remove.svg", "Ein Mitglied löschen", function() {
	self.removeMember();
    });
    this.addAction(this.actionRemove);
    this.actionRemove.hide();

    var self = this;
    this.model.addChangeListener("//get-dsgvo-overview-ok-rsp", function() {
	self.fillTable();
    });
    this.fillTable();
}
DSESubPanelRejected.prototype = Object.create(DSESubPanel.prototype);

/**
 * 
 */
DSESubPanelRejected.prototype.fillTable = function() {

    var fields = [];
    fields.push(function(td, item) {
	var cb = document.createElement("input");
	cb.type = "radio";
	cb.name = "dsgvo_sel_rejected";
	return cb;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("date");
    fields.push("email");

    var self = this;
    var onclick = function(tr, item) {
	self.selection = item;
	self.actionRemove.show();
    }

    var xpath = "/get-dsgvo-overview-ok-rsp/dsgvo-item[state='REJECTED']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}

/**
 * 
 */
DSESubPanelRejected.prototype.removeMember = function() {

    var self = this;
    var xpath = XmlUtils.getXPathTo(this.selection);
    var zname = this.model.getValue(xpath + "/zname");
    var vname = this.model.getValue(xpath + "/vname");
    var messg = MessageCatalog.getMessage("QUERY_REMOVE_MEMBER", zname, vname);
    var title = MessageCatalog.getMessage("QUERY_REMOVE_MEMBER_TITLE");
    new MessageBox(MessageBox.QUERY, title, messg, function() {

	var caller = new ServiceCaller();
	caller.onSuccess = function(rsp) {
	    switch (rsp.documentElement.nodeName) {
	    case "delete-member-ok-rsp":
		self.model.removeElement(xpath);
		self.selection = null;
		self.actionRemove.hide();
		break;

	    case "error-response":
		var messg = MessageCatalog.getMessage("MEMBER_REMOVE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
		var title = MessageCatalog.getMessage("MEMBER_REMOVE_ERROR_TITLE");
		new MessageBox(MessageBox.ERROR, title, messg);
		break;
	    }
	}
	caller.onError = function(req, status) {
	    var messg = MessageCatalog.getMessage("MEMBER_REMOVE_TECH_ERROR", status);
	    var title = MessageCatalog.getMessage("MEMBER_REMOVE_ERROR_TITLE");
	    new MessageBox(MessageBox.ERROR, title, messg);
	}

	var req = XmlUtils.createDocument("delete-member-req");
	XmlUtils.setNode(req, "id", self.selection.getElementsByTagName("id")[0].textContent);
	caller.invokeService(req);
    });
}
/*---------------------------------------------------------------------------*/
var DSESubPanelAccepted = function(parentFrame, targetCnr, model) {

    DSESubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "zugestimmt am", "Email" ]);
    this.model = model;
    this.fillTable();
}
DSESubPanelAccepted.prototype = Object.create(DSESubPanel.prototype);

/**
 * 
 */
DSESubPanelAccepted.prototype.fillTable = function() {

    var fields = [];
    fields.push("");
    fields.push("zname");
    fields.push("vname");
    fields.push("date");
    fields.push("email");

    var onclick = function(tr, item) {

    }

    var xpath = "/get-dsgvo-overview-ok-rsp/dsgvo-item[state='ACCEPTED']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}

/*---------------------------------------------------------------------------*/
var DSESubPanelNotDeliverable = function(parentFrame, targetCnr, model) {

    DSESubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "Email" ]);
    this.model = model;
    this.fillTable();
}
DSESubPanelNotDeliverable.prototype = Object.create(DSESubPanel.prototype);

/**
 * 
 */
DSESubPanelNotDeliverable.prototype.fillTable = function() {

    var fields = [];
    fields.push("");
    fields.push("zname");
    fields.push("vname");
    fields.push(function() {
	return "(keine Mail-Addresse vorhanden)";
    });

    var xpath = "/get-dsgvo-overview-ok-rsp/dsgvo-item[email = '']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}
