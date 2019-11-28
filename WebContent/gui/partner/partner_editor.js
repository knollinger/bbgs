var PartnerNavigation = function() {

    Navigation.call(this, "gui/images/header6.jpg");

    this.addNavigationButton("gui/images/partner-add.svg", "Einen Partner anlegen", function() {
	new PartnerEditor(0);
    });

    this.addNavigationButton("gui/images/partner-edit.svg", "Einen Partner bearbeiten", function() {
	new PartnerFinder(function(partner) {
	    new PartnerEditor(partner.getElementsByTagName("id")[0].textContent);
	});
    });

    this.addNavigationButton("gui/images/partner-group.svg", "Alle Partner anzeigen", function() {
	new PartnerOverview();
    });

}
PartnerNavigation.prototype = Object.create(Navigation.prototype);

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var PartnerFinder = function(onsubmit) {
    
    WorkSpaceFrame.call(this, "gui/images/header6.jpg");
    this.onsubmit = onsubmit;
    
    var self = this;
    this.load("gui/partner/partner_finder.html", function() {

	var input = UIUtils.getElement("partner-search-input");
	var preview = UIUtils.getElement("partner-search-preview");
	input.addEventListener("input", function() {

	    self.stopTimer();
	    if (input.value) {
		self.startTimer();
	    } else {
		self.clearPreview();
	    }
	});
	input.focus();
    });
}
PartnerFinder.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
PartnerFinder.prototype.startTimer = function() {

    var self = this;

    this.stopTimer();
    this.timer = window.setTimeout(function() {
	self.performSearch();
    }, 500);
}

/**
 * 
 */
PartnerFinder.prototype.stopTimer = function() {

    if (this.timer) {
	window.clearTimeout(this.timer);
	this.timer = null;
    }
}

/**
 * 
 */
PartnerFinder.prototype.clearPreview = function() {
    UIUtils.clearChilds("partner-search-preview");
}

/**
 * 
 */
PartnerFinder.prototype.performSearch = function() {

    var search = UIUtils.getElement("partner-search-input").value;

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "search-partner-ok-rsp":
	    self.showSearchPreview(new Model(rsp), search);
	    break;

	case "error-response":
	    console.log(rsp.getElementsByTagName("msg")[0].textContent);
	    break;
	}
    }
    caller.onError = function(req, status) {
	console.log(status);
    }

    var req = XmlUtils.createDocument("search-partner-req");
    XmlUtils.setNode(req, "search", search);
    caller.invokeService(req.documentElement);
}

/**
 * 
 */
PartnerFinder.prototype.showSearchPreview = function(model, search) {

    var preview = UIUtils.getElement("partner-search-preview")
    this.clearPreview();

    var allPartners = model.evaluateXPath("//search-partner-ok-rsp/partners/partner");
    for (var i = 0; i < allPartners.length; i++) {

	var xpath = XmlUtils.getXPathTo(allPartners[i]);
	preview.appendChild(this.renderPreviewItem(model, xpath, search));
    }
}

/**
 * 
 */
PartnerFinder.prototype.renderPreviewItem = function(model, xpath, search) {

    var result = document.createElement("div");

    var content = model.getValue(xpath + "/name");
    content += ", ";
    content += model.getValue(xpath + "/zip-code");
    content += " ";
    content += model.getValue(xpath + "/city");
    content += ", ";
    content += model.getValue(xpath + "/street");

    var replacement = "<b>" + search + "</b>";
    content = content.replace(new RegExp(search, 'gi'), replacement);
    result.innerHTML = content;

    var self = this;
    result.addEventListener("click", function() {

	self.close();
	var partner = model.evaluateXPath(xpath)[0];
	self.onsubmit(partner);
    });
    return result;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var PartnerOverview = function() {

    WorkSpaceFrame.call(this);

    var self = this;

    this.load("gui/partner/partner_overview.html", function() {

	new TableDecorator("partner_overview");

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

    this.keyMap[187] = function(tbody, evt) {
	action.invoke();
    }
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

    this.keyMap[13] = function(tbody, evt) {
	action.invoke();
    }

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

    this.keyMap[46] = function(tbody, evt) {
	action.invoke();
    }

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
    var onclick = function(tr, partner) {

	self.currPartner = XmlUtils.getXPathTo(partner);
	self.actionEdit.show();
	self.actionRemove.show();
    }

    var allPartners = "//get-partner-overview-ok-response/partners/partner[action != 'REMOVE']";
    var fields = this.getColumnDescriptor();
    this.model.createTableBinding("partner_overview", fields, allPartners, onclick);

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
    var subFrame = new ContactOverview(this, tabBinder.contentPane, this.model, "/partner-model/contacts", "/partner-model/core-data", false);
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