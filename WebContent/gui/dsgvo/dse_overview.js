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

    var tab = this.addTab("gui/images/certificate.svg", "Datenschutz-Erklärung noch nicht verschickt");
    var panel = new DSGVOSubPanelNone(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["NONE"] = panel;
    tab.select();

    tab = this.addTab("gui/images/certificate.svg", "Noch nicht reagiert");
    panel = new DSGVOSubPanelPending(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["PENDING"] = panel;

    tab = this.addTab("gui/images/certificate.svg", "Datenschutz-Erklärung zugestimmt");
    panel = new DSGVOSubPanelAccepted(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["ACCEPTED"] = panel;

    tab = this.addTab("gui/images/certificate.svg", "Datenschutz-Erklärung abgelehnt");
    panel = new DSGVOSubPanelRejected(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["REJECTED"] = panel;

    tab = this.addTab("gui/images/certificate.svg", "Datenschutz-Erklärung  nicht zustellbar");
    panel = new DSGVOSubPanelNotDeliverable(this, tab.contentPane, this.model);
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
	    var title = MessageCatalog.getMessage("TITLE_GET_DSGVO_OVERVIEW");
	    var messg = MessageCatalog.getMessage("GET_DSGVO_OVERVIEW_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("TITLE_GET_DSGVO_OVERVIEW");
	var messg = MessageCatalog.getMessage("GET_DSGVO_OVERVIEW_TECHERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-dsgvo-overview-req");
    caller.invokeService(req);
}

/*---------------------------------------------------------------------------*/
/**
 * die Basis der DSGVO-Subpanele. Alle Panele bestehen im wesentlichen nur aus
 * einer Tabelle, sie unterscheiden sich lediglich in bezug auf die Aktions
 */
var DSGVOSubPanel = function(parentFrame, targetCnr, header) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    targetCnr.appendChild(this.createTable(header));
}
DSGVOSubPanel.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
DSGVOSubPanel.prototype.createTable = function(header) {

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

    var body = document.createElement("tbody");
    this.table.appendChild(body);
    new TableDecorator(this.table);
    return this.table;
}

/*---------------------------------------------------------------------------*/
var DSGVOSubPanelNone = function(parentFrame, targetCnr, model) {

    DSGVOSubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "Email" ]);
    this.model = model;
    this.selected = [];

    this.actionSend = this.createSendAction();
    this.addAction(this.actionSend);
    this.actionSend.hide();

    var self = this;
    this.model.addChangeListener("//get-dsgvo-overview-ok-rsp", function() {
	self.fillTable();
    });
    this.fillTable();
}
DSGVOSubPanelNone.prototype = Object.create(DSGVOSubPanel.prototype);

/**
 * 
 */
DSGVOSubPanelNone.prototype.createSendAction = function() {

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
DSGVOSubPanelNone.prototype.fillTable = function() {

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
DSGVOSubPanelNone.prototype.sendDSEMails = function() {

    if (this.selected.length) {
	var id = this.selected[0];
	this.selected.splice(0, 1);

	var self = this;
	this.sendOneDSEMail(id, function() {
	    self.sendDSEMails();
	});
    }
    // var self = this;
    // var caller = new ServiceCaller();
    // caller.onSuccess = function(rsp) {
    // switch (rsp.documentElement.nodeName) {
    // case "send-dse-mail-ok-rsp":
    // var title = MessageCatalog.getMessage("SEND_DSEMAIL_OK_TITLE");
    // var messg = MessageCatalog.getMessage("SEND_DSEMAIL_SUCCESS");
    // new MessageBox(MessageBox.INFO, title, messg);
    // break;
    //
    // case "error-response":
    // var title = MessageCatalog.getMessage("SEND_DSEMAIL_ERR_TITLE");
    // var messg = MessageCatalog.getMessage("SEND_DSEMAIL_ERR",
    // rsp.getElementsByTagName("msg")[0].textContent);
    // new MessageBox(MessageBox.ERROR, title, messg);
    // break;
    // }
    // self.close();
    // }
    // caller.onError = function(req, status) {
    // var title = MessageCatalog.getMessage("SEND_DSEMAIL_ERR_TITLE");
    // var messg = MessageCatalog.getMessage("SEND_DSEMAIL_TECHERR", status);
    // new MessageBox(MessageBox.ERROR, title, messg, function() {
    // self.close();
    // });
    // }
    //
    // var req = XmlUtils.createDocument("send-dse-mail-req");
    // for (var i = 0; i < this.selected.length; i++) {
    // XmlUtils.addNode(req, "//send-dse-mail-req", "send-to",
    // this.selected[i]);
    // }
    // caller.invokeService(req);

}

/**
 * 
 */
DSGVOSubPanelNone.prototype.sendOneDSEMail = function(id, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "send-dse-mail-ok-rsp":
	    // var title = MessageCatalog.getMessage("SEND_DSEMAIL_OK_TITLE");
	    // var messg = MessageCatalog.getMessage("SEND_DSEMAIL_SUCCESS");
	    // new MessageBox(MessageBox.INFO, title, messg);
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
	self.close();
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SEND_DSEMAIL_ERR_TITLE");
	var messg = MessageCatalog.getMessage("SEND_DSEMAIL_TECHERR", status);
	new MessageBox(MessageBox.ERROR, title, messg, function() {
	    self.close();
	});
    }

    var req = XmlUtils.createDocument("send-dse-mail-req");
    XmlUtils.setNode(req, "send-to", id);
    caller.invokeService(req);
}


/*---------------------------------------------------------------------------*/
var DSGVOSubPanelPending = function(parentFrame, targetCnr, model) {

    DSGVOSubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "zugesendet am", "Email" ]);
    this.model = model;
    
    var self = this;
    this.model.addChangeListener("//get-dsgvo-overview-ok-rsp", function() {
	self.fillTable();
    });

    this.fillTable();
}
DSGVOSubPanelPending.prototype = Object.create(DSGVOSubPanel.prototype);

/**
 * 
 */
DSGVOSubPanelPending.prototype.fillTable = function() {

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

    var xpath = "/get-dsgvo-overview-ok-rsp/dsgvo-item[state='PENDING']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}

/*---------------------------------------------------------------------------*/
var DSGVOSubPanelRejected = function(parentFrame, targetCnr, model) {

    DSGVOSubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "abgelehnt am", "Email" ]);
    this.model = model;
    this.fillTable();
}
DSGVOSubPanelRejected.prototype = Object.create(DSGVOSubPanel.prototype);

/**
 * 
 */
DSGVOSubPanelRejected.prototype.fillTable = function() {

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

    var onclick = function(tr, item) {

    }

    var xpath = "/get-dsgvo-overview-ok-rsp/dsgvo-item[state='REJECTED']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}
/*---------------------------------------------------------------------------*/
var DSGVOSubPanelAccepted = function(parentFrame, targetCnr, model) {

    DSGVOSubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "zugestimmt am", "Email" ]);
    this.model = model;
    this.fillTable();
}
DSGVOSubPanelAccepted.prototype = Object.create(DSGVOSubPanel.prototype);

/**
 * 
 */
DSGVOSubPanelAccepted.prototype.fillTable = function() {

    var fields = [];
    fields.push(function(td, item) {
	var cb = document.createElement("input");
	cb.type = "radio";
	cb.name = "dsgvo_sel_accepted";
	return cb;
    });
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
var DSGVOSubPanelNotDeliverable = function(parentFrame, targetCnr, model) {

    DSGVOSubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "Email" ]);
    this.model = model;
    this.fillTable();
}
DSGVOSubPanelNotDeliverable.prototype = Object.create(DSGVOSubPanel.prototype);

/**
 * 
 */
DSGVOSubPanelNotDeliverable.prototype.fillTable = function() {

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
