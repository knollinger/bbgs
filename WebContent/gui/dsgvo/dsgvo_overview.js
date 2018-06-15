/**
 * 
 */
var DSGVOOverview = function() {

    WorkSpaceTabbedFrame.call(this, "dsgvo");

    var self = this;
    this.setTitle("DSGVO-Übersicht");
    this.loadModel(function() {

	self.prepareSections();
    });
}
DSGVOOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
DSGVOOverview.prototype.prepareSections = function() {

    this.panels = {};

    var tab = this.addTab("gui/images/certificate.svg", "DSGVO noch nicht verschickt");
    var panel = new DSGVOSubPanelNone(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["NONE"] = panel;
    tab.select();

    var tab = this.addTab("gui/images/certificate.svg", "Noch nicht reagiert");
    panel = new DSGVOSubPanelPending(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["PENDING"] = panel;

    var tab = this.addTab("gui/images/certificate.svg", "DSGVO abgelehnt");
    panel = new DSGVOSubPanelRejected(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["REJECTED"] = panel;

    var tab = this.addTab("gui/images/certificate.svg", "DSGVO zugestimmt");
    panel = new DSGVOSubPanelAccepted(this, tab.contentPane, this.model);
    tab.associateTabPane(panel);
    this.panels["ACCEPTED"] = panel;
}

/**
 * 
 */
DSGVOOverview.prototype.loadModel = function(onsuccess) {

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
    this.fillTable();
}
DSGVOSubPanelNone.prototype = Object.create(DSGVOSubPanel.prototype);

/**
 * 
 */
DSGVOSubPanelNone.prototype.fillTable = function() {
    
    var fields = [];
    fields.push(function(td, item) {
	var cb = document.createElement("input");
	cb.type="checkbox";
	cb.name="dsgvo_sel_none";
	return cb;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("email");
    
    var onclick = function(tr, item) {
	
    }
    
    var xpath="/get-dsgvo-overview-ok-rsp/dsgvo-item[state='NONE']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}

/*---------------------------------------------------------------------------*/
var DSGVOSubPanelPending = function(parentFrame, targetCnr, model) {

    DSGVOSubPanel.call(this, parentFrame, targetCnr, [ "", "Name", "Vorname", "zugesendet am", "Email" ]);
    this.model = model;
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
	cb.type="radio";
	cb.name="dsgvo_sel_pending";
	return cb;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("date");
    fields.push("email");
    
    var onclick = function(tr, item) {
	
    }
    
    
    var xpath="/get-dsgvo-overview-ok-rsp/dsgvo-item[state='PENDING']";
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
	cb.type="radio";
	cb.name="dsgvo_sel_rejected";
	return cb;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("date");    
    fields.push("email");
    
    var onclick = function(tr, item) {
	
    }
    
    
    var xpath="/get-dsgvo-overview-ok-rsp/dsgvo-item[state='REJECTED']";
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
	cb.type="radio";
	cb.name="dsgvo_sel_accepted";
	return cb;
    });
    fields.push("zname");
    fields.push("vname");
    fields.push("date");
    fields.push("email");
    
    var onclick = function(tr, item) {
	
    }
        
    var xpath="/get-dsgvo-overview-ok-rsp/dsgvo-item[state='ACCEPTED']";
    this.model.createTableBinding(this.table, fields, xpath, onclick);
}