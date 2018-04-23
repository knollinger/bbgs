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

	var radio = "edit_partner_radio_" + partner.getElementsByTagName("id")[0].textContent;
	radio = document.getElementById(radio);
	radio.click();

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
	radio.id = "edit_partner_radio_" + partner.getElementsByTagName("id")[0].textContent;
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
	self.setupTasksOverview();
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

PartnerEditor.prototype.setupTasksOverview = function() {

    var tabBinder = this.addTab("gui/images/calendar.svg", "Termine bearbeiten");
    var subFrame = new PartnerTerminOverview(this, tabBinder.contentPane, this.model, "/partner-model/todo-tasks");
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
/**
 * 
 */
var PartnerTerminOverview = function(parentFrame, targetCnr, model, xPath) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;
    this.xPath = xPath;
    this.currTermin = null;
    this.currRow = null;

    var self = this;
    this.load("gui/partner/partner_termin_overview.html", function() {

	self.actionEdit = self.createEditAction();
	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();

	new TableDecorator("edit_partnertermin_overview");
	self.model.addChangeListener("//partner-model/todo-tasks", function() {
	    self.fillTable();
	});
	self.fillTable();
    });
}
PartnerTerminOverview.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
PartnerTerminOverview.prototype.activate = function() {

    this.actionAdd.show();
    if (this.currTermin != null) {
	this.actionEdit.show();
	this.actionRemove.show();
    } else {
	this.actionEdit.hide();
	this.actionRemove.hide();
    }
}

/**
 * Erzeugt die Aktion, um Anhänge anzuzeigen
 */
PartnerTerminOverview.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/termin-edit.svg", "Termin anzeigen", function() {
	new PartnerTerminEditor(self.model, self.currTermin);
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * Erzeugt die Action, um einen neuen Anhang hinzu zu fügen
 */
PartnerTerminOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/termin-add.svg", "Termin hinzufügen", function() {

	new PartnerTerminPlanner(self.model, "//partner-model/todo-tasks");
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * erzeugt die action, um einen Termin zu löschen
 */
PartnerTerminOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/termin-remove.svg", "Termin löschen", function() {

	var messg = MessageCatalog.getMessage("PARTNER_TERMIN_QUERY_REMOVE");
	var title = MessageCatalog.getMessage("PARTNER_TERMIN_QUERY_REMOVE_TITLE");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currTermin + "/action") == "CREATE") {
		self.model.removeElement(self.currTermin);
	    } else {
		self.model.setValue(self.currTermin + "/action", "REMOVE");
	    }
	    self.currRow = self.currTermin = null;
	    self.actionEdit.hide();
	    self.actionRemove.hide();
	});
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
PartnerTerminOverview.prototype.fillTable = function() {

    var self = this;

    // gelöschte termine werden nicht angezeigt
    var filter = function(termin) {
	return termin.getElementsByTagName("action")[0].textContent != "REMOVE";
    }

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, termin) {

	var radio = "edit_partnertermin_radio_" + termin.getElementsByTagName("id")[0].textContent;
	radio = document.getElementById(radio);
	radio.click();

	self.currRow = tr;
	self.currTermin = XmlUtils.getXPathTo(termin);
	self.actionEdit.show();
	self.actionRemove.show();
    }

    var allTermins = this.xPath + "/todo-task";
    var fields = this.getColumnDescriptor();
    this.model.createTableBinding("edit_partnertermin_overview", fields, allTermins, onclick, filter);
    this.currRow = this.currTask = null;
    self.actionEdit.hide();
    self.actionRemove.hide();
}

/**
 * 
 */
PartnerTerminOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, termin) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "partnertermin_overview";
	radio.id = "edit_partnertermin_radio_" + termin.getElementsByTagName("id")[0].textContent;
	radio.value = termin.getElementsByTagName("id")[0].textContent;
	return radio;
    });

    fields.push("todo_date");
    fields.push("title");
    fields.push("description");
    return fields;
}

/*---------------------------------------------------------------------------*/
/**
 * Der PartnerTerminPlanner dient dem erzeugen eines Termins bzw. einer Serie
 * von Terminen.
 * 
 * Dazu besteht der PartnerTerminPlanner aus einem CoreData-Editor (Name,
 * Beschreibung, zu bearbeiten durch) und einem Datums-/Datumsserien-Selector
 */
var PartnerTerminPlanner = function(model, xpath) {

    WorkSpaceTabbedFrame.call(this, "partner_termin_planner");

    this.targetModel = model;
    this.targetXPath = xpath;

    this.model = new Model(XmlUtils.parse(PartnerTerminPlanner.EMPTY_WORKING_MODEL));

    var self = this;
    this.model.addChangeListener("//model", function() {
	self.enableSaveButton(true);
    });

    this.setupCoreDataEditor();
    this.setupTerminEditor();
}
PartnerTerminPlanner.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

PartnerTerminPlanner.EMPTY_WORKING_MODEL = "<model><core-data><name/><description/><userid/></core-data><termine/></model>";
/**
 * 
 */
PartnerTerminPlanner.prototype.setupCoreDataEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/partner-edit.svg", "Beschreibung");
    var subFrame = new PartnerTerminCoreDataEditor(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
    tabBinder.select();
}

/**
 * 
 */
PartnerTerminPlanner.prototype.setupTerminEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/calendar.svg", "Termine");
    var subFrame = new PartnerTerminDateSelector(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
PartnerTerminPlanner.prototype.onSave = function() {

    var name = this.model.getValue("//model/core-data/name");
    var desc = this.model.getValue("//model/core-data/description");
    var user = this.model.getValue("//model/core-data/userid");

    var termine = this.model.evaluateXPath("//model/termine/termin");
    for (var i = 0; i < termine.length; ++i) {

	var task = this.targetModel.createElement("todo-task");
	task.appendChild(this.targetModel.createElement("title", name));
	task.appendChild(this.targetModel.createElement("description", desc));
	task.appendChild(this.targetModel.createElement("userid", user));
	task.appendChild(this.targetModel.createElement("todo_date", termine[i].textContent));
	task.appendChild(this.targetModel.createElement("remember_date", ""));
	task.appendChild(this.targetModel.createElement("action", "CREATE"));
	task.appendChild(this.targetModel.createElement("domain", "PARTNERTERMIN"));
	task.appendChild(this.targetModel.createElement("id", UUID.create("partner_termin")));
	this.targetModel.addElement(this.targetXPath, task);
    }
}

/*---------------------------------------------------------------------------*Ü/
 /**
 * 
 */
PartnerTerminCoreDataEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/partner/partner_termin_editor_core.html", function() {
	self.loadUsers(function() {

	    self.model.createValueBinding("partnertermin_editor_name", "//model/core-data/name");
	    self.model.createValueBinding("partnertermin_editor_description", "//model/core-data/description");
	    self.model.createValueBinding("partnertermin_editor_user", "//model/core-data/userid");
	});
    });
}
PartnerTerminCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
PartnerTerminCoreDataEditor.prototype.loadUsers = function(onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-login-accounts-ok-response":
	    var accounts = rsp.getElementsByTagName("account");
	    for (var i = 0; i < accounts.length; i++) {
		var opt = document.createElement("option");
		opt.value = accounts[i].getElementsByTagName("id")[0].textContent;
		opt.textContent = accounts[i].getElementsByTagName("name")[0].textContent;
		UIUtils.getElement("partnertermin_editor_user").appendChild(opt);
	    }
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_USERACC_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_USERACC_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    };
    caller.onError = function(req, status) {

	var title = MessageCatalog.getMessage("LOAD_USERACC_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_USERACC_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    };

    var req = XmlUtils.createDocument("get-login-accounts-request");
    caller.invokeService(req);
}

/*---------------------------------------------------------------------------*Ü/
 /**
 * 
 */
PartnerTerminDateSelector = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/partner/partner_termin_editor_termine.html", function() {

	self.setupUI();

	self.model.addChangeListener("//model/termine", function() {

	    if (self.model.evaluateXPath("//model/termine/termin").length) {
		UIUtils.removeClass("partnertermin_editor_termin_preview", "hidden");
	    } else {
		UIUtils.addClass("partnertermin_editor_termin_preview", "hidden");
	    }
	    self.refreshTable();
	});
    });
}
PartnerTerminDateSelector.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
PartnerTerminDateSelector.prototype.activate = function() {
    UIUtils.getElement("partnertermin_editor_repeatmode").focus();
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.refreshTable = function() {

    var fields = [];
    fields.push(function(td, termin) {
	return termin.textContent;
    });
    this.model.createTableBinding("partnertermin_editor_termin_preview", fields, "//model/termine/termin");
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.setupUI = function() {

    var self = this;
    UIUtils.getElement("partnertermin_editor_repeatmode").addEventListener("change", function() {
	self.onRepeatModeChange();
    });
    this.onRepeatModeChange();

    UIUtils.getElement("partnertermin_editor_tododate").addEventListener("input", function() {
	self.onTodoDateChange();
    });

    UIUtils.getElement("partnertermin_editor_weekly_day").addEventListener("change", function() {
	self.onDayOfWeekChange();
    });

    UIUtils.getElement("partnertermin_editor_monthly_day").addEventListener("change", function() {
	self.onDayOfMonthChange();
    });

    UIUtils.getElement("partnertermin_editor_remember_me").addEventListener("change", function() {
	self.onRememberChange();
    });
    this.onRememberChange();

    new DatePicker("partnertermin_editor_tododate");
    new DatePicker("partnertermin_editor_repeat_until");

    for (var i = 0; i < PartnerTerminDateSelector.ALL_FIELDS.length; i++) {
	var field = UIUtils.getElement(PartnerTerminDateSelector.ALL_FIELDS[i]);
	field.addEventListener("change", function() {
	    self.tryTerminCreation();
	});
    }
}

/**
 * Die Liste aller Felder, welche in Anhängigkeit des RepeatModes irgendwie
 * verändert werden können
 */
PartnerTerminDateSelector.ALL_FIELDS = [ "partnertermin_editor_tododate", "partnertermin_editor_repeat_until", "partnertermin_editor_daily_interval", "partnertermin_editor_weekly_interval", "partnertermin_editor_weekly_day",
	"partnertermin_editor_monthly_interval", "partnertermin_editor_monthly_day" ];

/**
 * Die Listen (nach RepeatMode organisiert) aller Felder, welche für einen
 * bestimmten Mode verpflichtend sind
 */
PartnerTerminDateSelector.MANDATORY_BYREPEAT_MODE = {};
PartnerTerminDateSelector.MANDATORY_BYREPEAT_MODE.ONCE = [ "partnertermin_editor_tododate" ];
PartnerTerminDateSelector.MANDATORY_BYREPEAT_MODE.DAILY = [ "partnertermin_editor_tododate", "partnertermin_editor_repeat_until", "partnertermin_editor_daily_interval" ];
PartnerTerminDateSelector.MANDATORY_BYREPEAT_MODE.WEEKLY = [ "partnertermin_editor_tododate", "partnertermin_editor_repeat_until", "partnertermin_editor_weekly_interval", "partnertermin_editor_weekly_day" ];
PartnerTerminDateSelector.MANDATORY_BYREPEAT_MODE.MONTHLY = [ "partnertermin_editor_tododate", "partnertermin_editor_repeat_until", "partnertermin_editor_monthly_interval", "partnertermin_editor_monthly_day" ];
PartnerTerminDateSelector.MANDATORY_BYREPEAT_MODE.YEARLY = [ "partnertermin_editor_tododate", "partnertermin_editor_repeat_until" ];

/**
 * Die Listen (nach RepeatMode organisiert) aller Felder, welche für einen
 * bestimmten Mode sichtbar sind. MandatoryFields brauchen hier nicht aufgezählt
 * werden, diese sind per default visible
 */
PartnerTerminDateSelector.VISIBLE_BYREPEAT_MODE = {};
PartnerTerminDateSelector.VISIBLE_BYREPEAT_MODE.ONCE = [];
PartnerTerminDateSelector.VISIBLE_BYREPEAT_MODE.DAILY = [];
PartnerTerminDateSelector.VISIBLE_BYREPEAT_MODE.WEEKLY = [ "partnertermin_editor_weekly_interval", "partnertermin_editor_weekly_day" ];
PartnerTerminDateSelector.VISIBLE_BYREPEAT_MODE.MONTHLY = [ "partnertermin_editor_monthly_interval", "partnertermin_editor_monthly_day" ];
PartnerTerminDateSelector.VISIBLE_BYREPEAT_MODE.YEARLY = [];

/**
 * 
 */
PartnerTerminDateSelector.prototype.onRepeatModeChange = function() {

    var mode = UIUtils.getElement("partnertermin_editor_repeatmode").value;
    var mandatory = PartnerTerminDateSelector.MANDATORY_BYREPEAT_MODE[mode];
    var visible = PartnerTerminDateSelector.VISIBLE_BYREPEAT_MODE[mode];
    for (var i = 0; i < PartnerTerminDateSelector.ALL_FIELDS.length; i++) {

	var field = PartnerTerminDateSelector.ALL_FIELDS[i];
	if (mandatory.includes(field)) {
	    UIUtils.addClass(field, "mandatory");
	    UIUtils.removeClass(field, "hidden");
	} else {
	    UIUtils.removeClass(field, "mandatory");
	    if (visible.includes(field)) {
		UIUtils.removeClass(field, "hidden");

	    } else {
		UIUtils.addClass(field, "hidden");
	    }
	}
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.onRememberChange = function() {

    var row = UIUtils.getElement("partnertermin_editor_remember_row");
    var input = UIUtils.getElement("partnertermin_editor_remember_daysbefore");

    if (UIUtils.getElement("partnertermin_editor_remember_me").checked) {

	UIUtils.removeClass(row, "hidden");
	UIUtils.addClass(input, "mandatory");
	input.focus();
    } else {
	UIUtils.addClass(row, "hidden");
	UIUtils.removeClass(input, "mandatory");
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.onTodoDateChange = function() {

    var val = UIUtils.getElement("partnertermin_editor_tododate").value;
    if (DateTimeUtils.isDate(val)) {

	val = DateTimeUtils.parseDate(val, "{dd}.{mm}.[yyyy}");
	switch (UIUtils.getElement("partnertermin_editor_repeatmode").value) {
	case "ONCE":
	    break;

	case "DAILY":
	    break;

	case "WEEKLY":
	    UIUtils.getElement("partnertermin_editor_weekly_day").value = val.getDay();
	    break;

	case "MONTHLY":
	    UIUtils.getElement("partnertermin_editor_monthly_day").value = val.getDate();
	    break;

	case "YEARLY":
	    break;
	}
	this.tryTerminCreation();
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.onDayOfWeekChange = function() {

    var normalize = function(weekDay) {
	return (weekDay == 0) ? 7 : weekDay;
    };
    var dayOfWeek = normalize(parseInt(UIUtils.getElement("partnertermin_editor_weekly_day").value));

    var date = UIUtils.getElement("partnertermin_editor_tododate").value;
    if (DateTimeUtils.isDate(date)) {

	date = DateTimeUtils.parseDate(date, "dd.mm.yyyy");
	var delta = dayOfWeek - normalize(date.getDay());
	date.setDate(date.getDate() + delta);
	UIUtils.getElement("partnertermin_editor_tododate").value = DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}");
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.onDayOfMonthChange = function() {

    var dayOfMonth = parseInt(UIUtils.getElement("partnertermin_editor_monthly_day").value);

    var date = UIUtils.getElement("partnertermin_editor_tododate").value;
    if (DateTimeUtils.isDate(date)) {
	date = DateTimeUtils.parseDate(date, "dd.mm.yyyy");
	date.setDate(dayOfMonth);
	UIUtils.getElement("partnertermin_editor_tododate").value = DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}");
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.tryTerminCreation = function() {

    this.model.removeChilds("//model/termine");
    switch (UIUtils.getElement("partnertermin_editor_repeatmode").value) {
    case "ONCE":
	this.trySingleTerminCreation();
	break;

    case "DAILY":
	this.tryDailyBasedTerminCreation();
	break;

    case "WEEKLY":
	this.tryWeeklyBasedTerminCreation();
	break;

    case "MONTHLY":
	this.tryMonthlyBasedTerminCreation();
	break;

    case "YEARLY":
	this.tryYearlyBasedTerminCreation();
	break;
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.trySingleTerminCreation = function() {

    var date = UIUtils.getElement("partnertermin_editor_tododate").value;
    if (DateTimeUtils.isDate(date)) {
	this.createOneTermin(DateTimeUtils.parseDate(date, "dd.mm.yyyy"));
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.tryDailyBasedTerminCreation = function() {

    var curr = UIUtils.getElement("partnertermin_editor_tododate").value;
    var until = UIUtils.getElement("partnertermin_editor_repeat_until").value;
    if (DateTimeUtils.isDate(curr) && DateTimeUtils.isDate(until)) {

	var interval = parseInt(UIUtils.getElement("partnertermin_editor_daily_interval").value);
	curr = DateTimeUtils.parseDate(curr, "dd.mm.yyyy");
	until = DateTimeUtils.parseDate(until, "dd.mm.yyyy");
	while (curr <= until) {

	    this.createOneTermin(curr);
	    curr.setDate(curr.getDate() + interval);
	}
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.tryWeeklyBasedTerminCreation = function() {

    var curr = UIUtils.getElement("partnertermin_editor_tododate").value;
    var until = UIUtils.getElement("partnertermin_editor_repeat_until").value;
    if (DateTimeUtils.isDate(curr) && DateTimeUtils.isDate(until)) {

	var interval = 7 * parseInt(UIUtils.getElement("partnertermin_editor_weekly_interval").value);
	curr = DateTimeUtils.parseDate(curr, "dd.mm.yyyy");
	until = DateTimeUtils.parseDate(until, "dd.mm.yyyy");
	while (curr <= until) {

	    this.createOneTermin(curr);
	    curr.setDate(curr.getDate() + interval);
	}
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.tryMonthlyBasedTerminCreation = function() {

    var curr = UIUtils.getElement("partnertermin_editor_tododate").value;
    var until = UIUtils.getElement("partnertermin_editor_repeat_until").value;
    if (DateTimeUtils.isDate(curr) && DateTimeUtils.isDate(until)) {

	var interval = parseInt(UIUtils.getElement("partnertermin_editor_monthly_interval").value);
	curr = DateTimeUtils.parseDate(curr, "dd.mm.yyyy");
	until = DateTimeUtils.parseDate(until, "dd.mm.yyyy");
	while (curr <= until) {

	    this.createOneTermin(curr);
	    curr.setMonth(curr.getMonth() + interval);
	}
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.tryYearlyBasedTerminCreation = function() {

    var curr = UIUtils.getElement("partnertermin_editor_tododate").value;
    var until = UIUtils.getElement("partnertermin_editor_repeat_until").value;
    if (DateTimeUtils.isDate(curr) && DateTimeUtils.isDate(until)) {

	curr = DateTimeUtils.parseDate(curr, "dd.mm.yyyy");
	until = DateTimeUtils.parseDate(until, "dd.mm.yyyy");
	while (curr <= until) {

	    this.createOneTermin(curr);
	    curr.setFullYear(curr.getFullYear() + 1);
	}
    }
}

/**
 * 
 */
PartnerTerminDateSelector.prototype.createOneTermin = function(val) {

    this.model.addValue("//model/termine", "termin", DateTimeUtils.formatDate(val, "{dd}.{mm}.{yyyy}"));
}

/*---------------------------------------------------------------------------*/
var PartnerTypeTranslator = (function() {

    return {
	COOP : "Kooperations-Partner",
	SPONSOR : "Sponsoren"
    }
})();