/**
 * 
 */
var PartnerOverview = function() {

    WorkSpaceFrame.call(this);

    var self = this;
    this.load("gui/partner/partner_overview.html", function() {

	self.actionEdit = self.createEditAction();
	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();
	self.loadModel(function() {

	    self.model.addChangeListener("//get-partner-overview-ok-response/partners", function() {
		self.fillTable();
	    });
	    self.fillTable();
	});
    });
}
PartnerOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
PartnerOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/partner-add.svg", "Partner anlegen", function() {
	self.close();
	new PartnerEditor(0);
    });
    this.addAction(action);
    return action;
}

/**
 * 
 */
PartnerOverview.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/partner-edit.svg", "Partner bearbeiten", function() {
	self.close();
	new PartnerEditor(self.model.getValue(self.currPartner + "/id"));
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
PartnerOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/partner-remove.svg", "Partner löschen", function() {

	var name = self.model.getValue(self.currPartner + "/name");
	var title = MessageCatalog.getMessage("PARTNER_QUERY_REMOVE_TITLE");
	var messg = MessageCatalog.getMessage("PARTNER_QUERY_REMOVE", name);
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    self.removeCurrentPartner(function() {
		self.actionEdit.hide();
		self.actionRemove.hide();
	    });
	});
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
PartnerOverview.prototype.removeCurrentPartner = function(onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "remove-partner-ok-rsp":
	    self.model.removeElement(self.currPartner);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("REMOVE_PARTNER_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("REMOVE_PARTNER_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("REMOVE_PARTNER_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_PARTNER_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("remove-partner-req");
    XmlUtils.setNode(req, "id", this.model.getValue(this.currPartner + "/id"));
    caller.invokeService(req);
}

/**
 * 
 */
PartnerOverview.prototype.loadModel = function(onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-partner-overview-ok-response":
	    self.model = new Model(rsp);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("PARTNER_OVERVIEW_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("PARTNER_OVERVIEW_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("PARTNER_OVERVIEW_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("PARTNER_OVERVIEW_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-partner-overview-request");
    caller.invokeService(req);
}

/**
 * 
 */
PartnerOverview.prototype.fillTable = function() {

    var self = this;

    new TableDecorator("partner_overview");

    // gelöschte Kontakte werden nicht angezeigt
    var filter = function(partner) {
	return partner.getElementsByTagName("action")[0].textContent != "REMOVE";
    }

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, partner) {

	self.currPartner = XmlUtils.getXPathTo(partner);
	self.actionEdit.show();
	self.actionRemove.show();
    }

    var allPartners = "//get-partner-overview-ok-response/partners/partner";
    var fields = this.getColumnDescriptor();
    this.model.createTableBinding("partner_overview", fields, allPartners, onclick, filter);

    self.actionEdit.hide();
    self.actionRemove.hide();
}

/**
 * Der Descriptor für die Befüllung der Tabelle. Folgende Spalten werden
 * angelegt:
 * <ul>
 * <li>radioBtn zur selection</li>
 * <li>typ </li>
 * <li>name </li>
 * <li>beschreibung</li>
 * </ul>
 */
PartnerOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, partner) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "partner_overview";
	radio.value = partner.getElementsByTagName("id")[0].textContent;
	return radio;
    });


    fields.push("name");
    fields.push(function(td, partner) {
	return PartnerTypeTranslator[partner.getElementsByTagName("type")[0].textContent];
    });
    return fields;
}

/*---------------------------------------------------------------------------*/
var PartnerEditor = function(id) {

    WorkSpaceTabbedFrame.call(this, "partner_editor");

    var self = this;
    this.loadModel(id, function() {

	self.setupModelListener();
	self.setupTitlebarListener();
	self.setupCoreDataEditor();
	self.setupContactsOverview();
	self.setupAttachmentsOverview();
	self.setupNotesOverview();
    });
}
PartnerEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
PartnerEditor.prototype.loadModel = function(id, onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "partner-model":
	    self.model = new Model(rsp);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("PARTNER_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("PARTNER_LOAD_ERROR_MESSAGE", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("PARTNER_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("PARTNER_LOAD_TECHERROR_MESSAGE", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-partner-model-request");
    XmlUtils.setNode(req, "id", id);
    caller.invokeService(req);
}

/**
 * 
 */
PartnerEditor.prototype.setupTitlebarListener = function() {
    var self = this;
    this.model.addChangeListener("/partner-model/core-data", function() {
	self.updateTitlebar();
    });
    this.updateTitlebar();
}

/**
 * 
 */
PartnerEditor.prototype.setupModelListener = function() {

    var self = this;
    this.model.addChangeListener("/partner-model", function() {
	self.enableSaveButton(true);
    });
}
/**
 * Bei änderungen im Namen oder Vornamen wird die Titelzeile angepasst
 */
PartnerEditor.prototype.updateTitlebar = function() {

    var title = "Partner bearbeiten";
    var name = this.model.getValue("/partner-model/core-data/name");
    if (name) {
	title += " [" + name + "]";
    }
    this.setTitle(title);
}

/**
 * 
 */
PartnerEditor.prototype.setupCoreDataEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/partner-edit.svg", "Stamm-Daten");
    var subFrame = new PartnerCoreDataEditor(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
    tabBinder.select();
}

/**
 * 
 */
PartnerEditor.prototype.setupContactsOverview = function() {

    var tabBinder = this.addTab("gui/images/person-group.svg", "Kontakt-Personen");
    var subFrame = new ContactOverview(this, tabBinder.contentPane, this.model, "/partner-model/contacts", null, false);
    tabBinder.associateTabPane(subFrame);
}

PartnerEditor.prototype.setupAttachmentsOverview = function() {

    var tabBinder = this.addTab("gui/images/document.svg", "Anhänge bearbeiten");
    var subFrame = new AttachmentsOverview(this, tabBinder.contentPane, this.model, "/partner-model/attachments");
    tabBinder.associateTabPane(subFrame);
}

PartnerEditor.prototype.setupNotesOverview = function() {

    var tabBinder = this.addTab("gui/images/notes.svg", "Notizen bearbeiten");
    var subFrame = new NotesOverview(this, tabBinder.contentPane, this.model, "/partner-model/notes");
    tabBinder.associateTabPane(subFrame);
}

/**
 * beim klick auf Save...
 */
PartnerEditor.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-partnermodel-ok-rsp":
	    self.close();
	    break;

	case "error-response":
	    var messg = MessageCatalog.getMessage("SAVE_PARTNER_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    var title = MessageCatalog.getMessage("SAVE_PARTNER_ERROR_TITLE");
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var messg = MessageCatalog.getMessage("SAVE_PARTNER_TECH_ERROR", status);
	var title = MessageCatalog.getMessage("SAVE_PARTNER_ERROR_TITLE");
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());

}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var PartnerCoreDataEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/partner/partner_editor_core.html", function() {

	self.model.createValueBinding("edit_partner_type", "/partner-model/core-data/type");
	self.model.createValueBinding("edit_partner_since", "/partner-model/core-data/partner-since");
	self.model.createValueBinding("edit_partner_until", "/partner-model/core-data/partner-until");
	self.model.createValueBinding("edit_partner_name", "/partner-model/core-data/name")
	self.model.createValueBinding("edit_partner_desc", "/partner-model/core-data/description")
	self.model.createValueBinding("edit_partner_zipcode", "/partner-model/core-data/zip-code");
	self.model.createValueBinding("edit_partner_city", "/partner-model/core-data/city");
	self.model.createValueBinding("edit_partner_street", "/partner-model/core-data/street");

	// setup all DatePickers
	new DatePicker("edit_partner_since", "Partner seit");
	new DatePicker("edit_partner_until", "Partner bis");
    });
}

PartnerCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/*---------------------------------------------------------------------------*/
var PartnerTypeTranslator = (function() {

    return {
	COOP : "Kooperations-Partner",
	SPONSOR : "Sponsoren"
    }
})();