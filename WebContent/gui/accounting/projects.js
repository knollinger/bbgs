/**
 * 
 */
var ProjectsOverview = function() {

    WorkSpaceTabbedFrame.call(this, "projects_overview");

    var self = this;
    this.tables = {};
    this.loadModel(function() {

	self.fillTables();

	self.actionEdit = self.createEditAction();
	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();
	self.actionPrint = self.createPrintAction();
    });
    this.setTitle("Projekte verwalten");
}
ProjectsOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
ProjectsOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-projects-ok-response":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("GET_PROJECTS_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("GET_PROJECTS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {

	var title = MessageCatalog.getMessage("GET_PROJECTS_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("GET_PROJECTS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-projects-request");
    caller.invokeService(req);
}

/**
 * 
 */
ProjectsOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/folder-add.svg", "Ein neues Projekt anlegen", function() {
	new ProjectEditor(0);
    });
    this.addAction(action);
    return action;
}

/**
 * 
 */
ProjectsOverview.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/folder-edit.svg", "Projekt bearbeiten", function() {

	new ProjectEditor(self.model.getValue(self.currProject + "/id"));
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
ProjectsOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/folder-remove.svg", "Projekt löschen", function() {
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
ProjectsOverview.prototype.createPrintAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/folder-print.svg", "Projekt drucken", function() {
	var projId = self.model.getValue(self.currProject + "/id");
	var title = "Projekt " + self.model.getValue(self.currProject + "/name");
	var url = "getDocument/print-project.pdf?project-id=" + projId;
	new DocumentViewer(url, title);

    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
ProjectsOverview.prototype.fillTables = function() {

    var self = this;
    var onclick = function(tr, project) {
	tr.querySelector("input[type=radio]").click();
	self.currProject = XmlUtils.getXPathTo(project);
	self.actionEdit.show();
	self.actionRemove.show();
	self.actionPrint.show();
    }

    var allProjects = this.model.evaluateXPath("//get-projects-ok-response/projects/project[action != 'REMOVE']");
    for (var i = 0; i < allProjects.length; i++) {
	this.renderOneRecord(allProjects[i], onclick);
    }
}

/**
 * 
 */
ProjectsOverview.prototype.getColumnDescriptor = function() {

    if (ProjectsOverview.collDesc == null) {
	ProjectsOverview.collDesc = [];

	ProjectsOverview.collDesc.push(function(tr, project) {

	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "projects";
	    return radio;
	});
	ProjectsOverview.collDesc.push(function(td, project) {
	    UIUtils.addClass(td, "fill-on-mobile");
	    return project.getElementsByTagName("name")[0].textContent;
	});

	ProjectsOverview.collDesc.push(function(td, project) {
	    return project.getElementsByTagName("from")[0].textContent + " - " + project.getElementsByTagName("until")[0].textContent;
	});
    }
    return ProjectsOverview.collDesc;
}
ProjectsOverview.colDec = null;

/**
 * 
 */
ProjectsOverview.prototype.renderOneRecord = function(project, onclick) {

    var year = DateTimeUtils.parseDate(project.getElementsByTagName("from")[0].textContent, "{dd}.{mm}.{yyyy}");
    year = DateTimeUtils.getProjectYear(year);

    var tab = this.getTableBodyFor(year);
    var fields = this.getColumnDescriptor();
    var row = this.model.createTableRow(project, fields, onclick);
    tab.appendChild(row);
}

/**
 * 
 */
ProjectsOverview.prototype.getTableBodyFor = function(year) {

    var sect = this.tables[year];
    if (!sect) {

	sect = this.createNewSection(year);
	this.tables[year] = sect;
    }
    return sect.getTableBody();
}

/**
 * 
 */
ProjectsOverview.prototype.createNewSection = function(year) {

    var tab = this.addTab("gui/images/folder.svg", year + ". Projektjahr");
    var subFrame = new ProjectsOverviewSubPanel(this, tab.contentPane, year);
    tab.associateTabPane(subFrame);

    if (year == DateTimeUtils.getProjectYear(new Date())) {
	tab.select();
    }
    return subFrame;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var ProjectsOverviewSubPanel = function(parentFrame, targetCnr, year) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    targetCnr.appendChild(this.createTable());
}
ProjectsOverviewSubPanel.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectsOverviewSubPanel.prototype.activate = function() {
    // this.printAction.show();
}

/**
 * 
 */
ProjectsOverviewSubPanel.prototype.createTable = function() {

    var tr = document.createElement("tr");
    for (var i = 0; i < ProjectsOverviewSubPanel.HEADER_COLS.length; i++) {
	var th = document.createElement("th");
	th.textContent = ProjectsOverviewSubPanel.HEADER_COLS[i];
	if (i == 1) {
	    th.className = "sortable";
	}
	tr.appendChild(th);
    }
    var thead = document.createElement("thead");
    thead.appendChild(tr);

    var table = document.createElement("table");
    table.appendChild(thead);

    this.body = document.createElement("tbody");
    table.appendChild(this.body);

    // TODO: footer für die Totale einfügen

    new TableDecorator(table);
    return table;
}

ProjectsOverviewSubPanel.HEADER_COLS = [ "", "Name", "Zeitraum" ];

/**
 * 
 */
ProjectsOverviewSubPanel.prototype.getTableBody = function() {
    return this.body;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var ProjectEditor = function(id) {

    WorkSpaceTabbedFrame.call(this, "project_editor");

    var self = this;
    this.loadModel(id, function() {

	if (id == 0) {
	    self.model.setValue("//project-model/core-data/action", "CREATE");
	}
	self.createDetailsEditor();
	self.createAttachmentsEditor();
	self.createNotesEditor();
	self.createPlanningEditor();
	self.createPaymentEditor();
	self.createOutgoingEditor();
	self.model.addChangeListener("//project-model", function() {
	    self.enableSaveButton(true);
	});
	self.model.addChangeListener("//project-model/core-data/name", function() {
	    self.adjustTitlebar();
	});
	self.adjustTitlebar();
    });

}
ProjectEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
ProjectEditor.prototype.adjustTitlebar = function() {

    var title = "Ein Projekt bearbeiten";

    var name = this.model.getValue("//project-model/core-data/name");
    if (name) {
	title = name;
    }
    this.setTitle(title);
}

/**
 * 
 */
ProjectEditor.prototype.createDetailsEditor = function() {
    var tab = this.addTab("gui/images/info.svg", "Projekt-Beschreibung");
    var subFrame = new ProjectDetailsEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subFrame);
    tab.select();
}

/**
 * 
 */
ProjectEditor.prototype.createPlanningEditor = function() {
    var tab = this.addTab("gui/images/money.svg", "Kosten planen");
    var subFrame = new ProjectPlanningEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subFrame);
}

/**
 * 
 */
ProjectEditor.prototype.createPaymentEditor = function() {
    var tab = this.addTab("gui/images/money.svg", "Finanzierung planen");
    var subFrame = new ProjectPaymentEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subFrame);
}

/**
 * 
 */
ProjectEditor.prototype.createOutgoingEditor = function() {
    var tab = this.addTab("gui/images/money-remove.svg", "Ausgaben erfassen");
    var subFrame = new ProjectOutgoingEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subFrame);
}

/**
 * 
 */
ProjectEditor.prototype.createAttachmentsEditor = function() {
    var tab = this.addTab("gui/images/document.svg", "Anhänge bearbeiten");
    var subFrame = new AttachmentsOverview(this, tab.contentPane, this.model, "//project-model/attachments");
    tab.associateTabPane(subFrame);
}

/**
 * 
 */
ProjectEditor.prototype.createNotesEditor = function() {
    tab = this.addTab("gui/images/notes.svg", "Notizen bearbeiten");
    var subFrame = new NotesOverview(this, tab.contentPane, this.model, "//project-model/notes");
    tab.associateTabPane(subFrame);
}

/**
 * 
 */
ProjectEditor.prototype.loadModel = function(id, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "project-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    break;
	}
    }
    caller.onError = function(req, status) {

    }

    var req = XmlUtils.createDocument("get-project-model-request");
    XmlUtils.setNode(req, "id", id);
    caller.invokeService(req);
}

/**
 * 
 */
ProjectEditor.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

    }
    caller.onError = function(req, status) {

    }

    // compress the model
    this.model.removeElement("//project-model/invoice-items")
    caller.invokeService(this.model.getDocument());
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var ProjectDetailsEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/accounting/project_editor.html", function() {

	UIUtils.getElement("edit_project_name").focus();
	new DatePicker("edit_project_from", "Projekt-Beginn");
	new DatePicker("edit_project_until", "Projekt-Ende");

	self.model.createValueBinding("edit_project_name", "//project-model/core-data/name");
	self.model.createValueBinding("edit_project_description", "//project-model/core-data/description");
	self.model.createValueBinding("edit_project_from", "//project-model/core-data/from");
	self.model.createValueBinding("edit_project_until", "//project-model/core-data/until");

	self.model.addChangeListener("//project-model/core-data", function() {

	    var action = self.model.getValue("//project-model/core-data/action");
	    if (action != "CREATE" && action != "MODIFY") {
		self.model.setValue("//project-model/core-data/action", "MODIFY");
	    }
	});
    });
}
ProjectDetailsEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectDetailsEditor.prototype.activate = function() {

    var field = UIUtils.getElement("edit_project_name");
    if (field) {
	field.focus();
    }
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
ProjectPlanningEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.model = model;
    var self = this;
    this.load("gui/accounting/planning_items_overview.html", function() {

	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();
	self.fillTable();

	self.model.addChangeListener("//project-model/planning-items", function() {
	    self.updateOverallTotal();
	});
	self.updateOverallTotal();
    });
}
ProjectPlanningEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectPlanningEditor.prototype.updateOverallTotal = function() {

    allAmounts = this.model.evaluateXPath("//project-model/planning-items/planning-item[action != 'REMOVE']/amount");
    var result = 0;
    for (var i = 0; i < allAmounts.length; i++) {
	result += parseFloat(allAmounts[i].textContent);
    }
    UIUtils.getElement("planning_items_total").textContent = CurrencyUtils.formatCurrency(result);

}

/**
 * 
 */
ProjectPlanningEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-add.svg", "Planungs-Posten hinzu fügen", function() {

	var item = XmlUtils.parse(ProjectPlanningEditor.EMPTY_ITEM).documentElement;
	self.currItem = self.model.addElement("//project-model/planning-items", item);
	self.model.setValue(self.currItem + "/id", UUID.create("planning_item_"));
	self.model.setValue(self.currItem + "/konto-nr", self.currKtoNr);

	self.currItemRow = self.renderOnePlanningItem(self.currKtoNr, self.model.evaluateXPath(self.currItem)[0]);
	self.currCategoryRow.parentNode.insertBefore(self.currItemRow, self.currCategoryRow.nextSibling);

	self.currItemRow.querySelector("input[type='radio']").click();
	self.currItemRow.querySelector("select").focus();
    });
    this.addAction(action);
    action.hide();
    return action;
}
ProjectPlanningEditor.EMPTY_ITEM = "<planning-item><id/><item-ref/><konto-nr/><action>CREATE</action><amount>0</amount></planning-item>";

/**
 * 
 */
ProjectPlanningEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-remove.svg", "Planungs-Posten hinzu entfernen", function() {

	var title = MessageCatalog.getMessage("");
	var messg = MessageCatalog.getMessage("");
	if (new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currItem + "/action") == "CREATE") {
		self.model.removeElement(self.currItem);
	    } else {
		self.model.setValue(self.currItem + "/action", "REMOVE");
		self.actionRemove.hide();
		self.actionPrint.hide();
	    }
	    self.currItemRow.parentElement.removeChild(self.currItemRow);
	    self.currItem = self.currItemRow = null;
	}));
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.fillTable = function() {

    for (var i = 0; i < ProjectPlanningEditor.categoriesByNumber.length; i++) {

	var key = ProjectPlanningEditor.categoriesByNumber[i].key;
	var val = ProjectPlanningEditor.categoriesByNumber[i].value;
	this.renderOneCategory(key, val);
	this.renderAllPlanningItemsFor(key);
    }
}

/**
 * Die Liste aller Outgoing-Invoice Kategorien
 */
ProjectPlanningEditor.categoriesByNumber = [ {
    key : 5800,
    value : "Gehälter"
}, {
    key : 5801,
    value : "Soz.Abgaben"
}, {
    key : 5802,
    value : "Trainer"
}, {
    key : 5803,
    value : "Sachkosten"
} ];

/**
 * 
 */
ProjectPlanningEditor.prototype.renderOneCategory = function(ktoNr, name) {

    var tr = document.createElement("tr");
    tr.className = "invoice-item";

    var radio = this.createRadioBtn();
    var td = document.createElement("td");
    td.appendChild(radio);
    tr.appendChild(td);

    var exp = this.createExpandBtn();
    td = document.createElement("td");
    td.appendChild(exp);
    tr.appendChild(td);

    td = document.createElement("td");
    td.textContent = ktoNr + " - " + name;
    tr.appendChild(td);

    var total = document.createElement("td");
    total.className = "currency-input";
    total.textContent = "0,00";
    tr.appendChild(total);

    // Filler
    tr.appendChild(document.createElement("td"));

    var self = this;
    this.model.addChangeListener("//project-model/planning-items", function() {
	self.updateCategoryTotal(total, ktoNr);
    });
    self.updateCategoryTotal(total, ktoNr);

    var self = this;
    tr.addEventListener("click", function(evt) {

	self.currKtoNr = ktoNr;
	self.currCategoryRow = tr;
	radio.checked = true;
	if (evt.target != exp) {
	    exp.click();
	}
	self.actionAdd.show();
	self.actionRemove.hide();
    });
    UIUtils.getElement("planning_items_overview_body").appendChild(tr);
}

/**
 * 
 */
ProjectPlanningEditor.prototype.updateCategoryTotal = function(total, ktoNr) {

    var result = 0;
    var xpath = "//project-model/planning-items/planning-item[konto-nr='" + ktoNr + "' and action != 'REMOVE']/amount";
    var allAmounts = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allAmounts.length; i++) {
	result += parseFloat(allAmounts[i].textContent);
    }
    total.textContent = CurrencyUtils.formatCurrency(result);
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createRadioBtn = function() {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "project_planning";
    return radio;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createExpandBtn = function() {

    var exp = document.createElement("input");
    exp.type = "checkbox";
    exp.className = "expand-button";

    exp.addEventListener("click", function() {
	var row = exp.parentElement.parentElement.nextSibling;
	while (UIUtils.hasClass(row, "planning-item")) {

	    if (exp.checked) {
		UIUtils.removeClass(row, "hidden");
	    } else {
		UIUtils.addClass(row, "hidden");
	    }
	    row = row.nextSibling;
	}
    });
    return exp;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.renderAllPlanningItemsFor = function(ktoNr) {

    var allItems = this.model.evaluateXPath("//project-model/planning-items/planning-item[konto-nr='" + ktoNr + "']");
    for (var i = 0; i < allItems.length; i++) {

	tr = this.renderOnePlanningItem(ktoNr, allItems[i]);
	UIUtils.addClass(tr, "hidden");
	UIUtils.getElement("planning_items_overview_body").appendChild(tr);
    }
}

/**
 * 
 */
ProjectPlanningEditor.prototype.renderOnePlanningItem = function(ktoNr, item) {

    var row = document.createElement("tr");
    row.className = "planning-item";

    var td = document.createElement("td");
    row.appendChild(td);

    td = document.createElement("td");
    var radio = this.createRadioBtn();
    td.appendChild(radio);
    row.appendChild(td);

    td = document.createElement("td");
    var select = this.createKontoSelector(ktoNr, item);
    td.appendChild(select);
    row.appendChild(td);

    td = document.createElement("td");
    var edit = this.createAmountEntry(item);
    td.appendChild(edit);
    row.appendChild(td);

    // filler
    row.appendChild(document.createElement("td"));

    var self = this;
    row.addEventListener("click", function() {
	radio.click();
	self.currItemRow = row;
	self.currItem = XmlUtils.getXPathTo(item);
	self.actionRemove.show();
    });
    return row;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createKontoSelector = function(ktoNr, item) {

    var select = document.createElement("select");
    select.className = "inplace-select mandatory";

    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Planungs-Posten";
    opt.selected = opt.disabled = true;
    select.appendChild(opt);

    var allItems = this.model.evaluateXPath("//project-model/invoice-items/invoice-item[konto='" + ktoNr + "']");
    for (var i = 0; i < allItems.length; i++) {

	opt = document.createElement("option");
	opt.value = allItems[i].getElementsByTagName("id")[0].textContent;
	opt.textContent = allItems[i].getElementsByTagName("name")[0].textContent;
	select.appendChild(opt);
    }

    var xpath = XmlUtils.getXPathTo(item);
    this.model.createValueBinding(select, xpath + "/item-ref", "change");

    return select;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createAmountEntry = function(item) {

    var edit = document.createElement("input");
    edit.className = "inplace-edit currency-input mandatory";

    var xpath = XmlUtils.getXPathTo(item);
    this.model.createCurrencyValueBinding(edit, xpath + "/amount", "change");
    new NumericInputField(edit);

    return edit;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
ProjectPaymentEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.model = model;
    var self = this;
    this.load("gui/accounting/project_payment_editor.html", function() {

	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();
	self.fillTable();

	self.model.addChangeListener("//project-model/proj-item/income-records", function() {
	    self.updateOverallTotal();
	});
	self.model.addChangeListener("//project-model/planning-items", function() {
	    self.updateOverallTotal();
	});
	self.updateOverallTotal();
    });
}
ProjectPaymentEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectPaymentEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-add.svg", "Finanzierung hinzu fügen", function() {

	var record = XmlUtils.parse(ProjectPaymentEditor.EMPTY_RECORD).documentElement;
	self.currRecord = self.model.addElement("//project-model/proj-item/income-records", record);
	self.model.setValue(self.currRecord + "/id", UUID.create("invoice_record_"));
	self.model.setValue(self.currRecord + "/date", DateTimeUtils.formatDate(new Date(), "{dd}.{mm}.{yyyy}"));

	self.currRow = self.renderOnePaymentRecord(self.model.evaluateXPath(self.currRecord)[0]);
	UIUtils.getElement("project_payment_overview_body").appendChild(self.currRow);

	self.currRow.querySelector("input[type='radio']").click();
	self.currRow.querySelector("select").focus();
    });
    this.addAction(action);
    action.hide();
    return action;
}
ProjectPaymentEditor.EMPTY_RECORD = "<invoice-record><id/><from-invoice/><to-invoice/><amount>0</amount><description/><action>CREATE</action><date/></invoice-record>";

/**
 * 
 */
ProjectPaymentEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-remove.svg", "Finanzierung löschen", function() {

	var title = MessageCatalog.getMessage("TITLE_REMOVE_PAYMENT_RECORD");
	var messg = MessageCatalog.getMessage("QUERY_REMOVE_PAYMENT_RECORD");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var action = self.model.getValue(self.currRecord + "/action");
	    if (action == "CREATE") {
		self.model.removeElement(self.currRecord);
	    } else {
		self.model.setValue(self.currRecord + "/action", "REMOVE");
	    }
	    self.currRow.parentElement.removeChild(self.currRow);
	    self.currRow = self.currRecord = null;
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
ProjectPaymentEditor.prototype.activate = function() {

    this.actionAdd.show();
}

/**
 * 
 */
ProjectPaymentEditor.prototype.fillTable = function() {

    var xpath = "//project-model/proj-item/income-records/invoice-record";
    var allRecs = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allRecs.length; i++) {

	var row = this.renderOnePaymentRecord(allRecs[i]);
	UIUtils.getElement("project_payment_overview_body").appendChild(row);
    }
}

/**
 * 
 */
ProjectPaymentEditor.prototype.renderOnePaymentRecord = function(record) {

    var row = document.createElement("tr");

    td = document.createElement("td");
    var radio = this.createRadioButton();
    td.appendChild(radio);
    row.appendChild(td);

    var td = document.createElement("td");
    var select = this.createKontoSelector(record);
    td.appendChild(select);
    row.appendChild(td);

    td = document.createElement("td");
    var input = this.createAmountEntry(record);
    td.appendChild(input);
    row.appendChild(td);

    // filler
    td = document.createElement("td");
    var desc = this.createDescriptionEntry(record);
    td.appendChild(desc);
    row.appendChild(td);

    var self = this;
    radio.addEventListener("click", function() {
	self.currRecord = XmlUtils.getXPathTo(record);
	self.currRow = row;
	self.actionRemove.show();
    });

    return row;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.createRadioButton = function(record) {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "project_payment";
    return radio;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.createKontoSelector = function(record) {

    var select = document.createElement("select");
    select.className = "inplace-select mandatory";

    var opt = document.createElement("option");
    opt.textContent = "Eingangs-Konto";
    opt.value = "";
    opt.selected = opt.disabled = true;
    select.appendChild(opt);

    var allItems = this.model.evaluateXPath("//project-model/invoice-items/invoice-item[type='INCOME']");
    for (var i = 0; i < allItems.length; i++) {

	opt = document.createElement("option");
	opt.value = allItems[i].getElementsByTagName("id")[0].textContent;
	opt.textContent = allItems[i].getElementsByTagName("name")[0].textContent;
	select.appendChild(opt);
    }

    var xpath = XmlUtils.getXPathTo(record);
    this.model.createValueBinding(select, xpath + "/from-invoice", "change");

    return select;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.createAmountEntry = function(record) {

    var input = document.createElement("input");
    input.placeholder = "Betrag";
    input.className = "inplace-edit currency-input mandatory";
    input.style.width = "6em";

    var xpath = XmlUtils.getXPathTo(record);
    this.model.createCurrencyValueBinding(input, xpath + "/amount", "change");

    new NumericInputField(input);
    return input;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.createDescriptionEntry = function(record) {

    var input = document.createElement("textarea");
    input.placeholder = "Beschreibung";
    input.className = "inplace-textarea mandatory";

    var xpath = XmlUtils.getXPathTo(record);
    this.model.createValueBinding(input, xpath + "/description", "change");

    return input;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.updateOverallTotal = function() {

    // berechne die summer der benötigten finanzierung
    var demand = 0;
    var allAmounts = this.model.evaluateXPath("//project-model/planning-items/planning-item[action != 'REMOVE']/amount");
    for (var i = 0; i < allAmounts.length; i++) {
	demand += parseFloat(allAmounts[i].textContent);
    }

    // TODO: bereits finanziert ermitteln
    var coverage = 0;
    var allCovers = this.model.evaluateXPath("//project-model/proj-item/income-records/invoice-record[action != 'REMOVE']/amount");
    for (var i = 0; i < allCovers.length; i++) {
	coverage += parseFloat(allCovers[i].textContent);
    }

    var result = demand - coverage;
    UIUtils.getElement("project_payment_total").textContent = CurrencyUtils.formatCurrency(result);

}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var ProjectOutgoingEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/accounting/outgoing_overview.html", function() {

	new TableDecorator("outgoing_overview");
	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();

	self.fillTable();

	self.model.addChangeListener("//project-model/planning-items", function() {
	    self.updatePlannedTotal();
	});
	self.updatePlannedTotal();

	self.model.addChangeListener("//project-model/proj-item/outgo-records", function() {
	    self.updateOutgoingTotal();
	});
	self.updateOutgoingTotal();
    });
}
ProjectOutgoingEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectOutgoingEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-add.svg", "Ausgabe hinzu fügen", function() {

	var record = XmlUtils.parse(ProjectOutgoingEditor.EMPTY_RECORD).documentElement;
	self.currRecord = self.model.addElement("//project-model/proj-item/outgo-records", record);

	self.model.setValue(self.currRecord + "/id", UUID.create("invoice_record_"));
	self.model.setValue(self.currRecord + "/to-invoice", self.model.getValue(self.currItem + "/item-ref"));
	self.model.setValue(self.currRecord + "/date", DateTimeUtils.formatDate(new Date(), "{dd}.{mm}.{yyyy}"));

	self.currRecordRow = self.renderOneRecord(self.currRecord);
	self.currCategoryRow.parentElement.insertBefore(self.currRecordRow, self.currCategoryRow.nextSibling);

	self.currRecordRow.querySelector("input[type='radio']").click();
	self.currRecordRow.querySelector(".currency-input").focus();
    });
    this.addAction(action);
    action.hide();
    return action;
}
ProjectOutgoingEditor.EMPTY_RECORD = "<invoice-record><id/><action>CREATE</action><from-invoice/><to-invoice/><amount>0</amount><description/><date/><attachments/></invoice-record>";

/**
 * 
 */
ProjectOutgoingEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-remove.svg", "Ausgabe entfernen", function() {
	//
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.fillTable = function() {

    var tbody = UIUtils.getElement("outgoing_overview_body");
    UIUtils.clearChilds(tbody);

    var allItems = this.model.evaluateXPath("//project-model/planning-items/planning-item");
    for (var i = 0; i < allItems.length; i++) {

	this.renderOneOutgoingItem(allItems[i]);
    }
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.renderOneOutgoingItem = function(item) {

    var tbody = UIUtils.getElement("outgoing_overview_body");
    var xpath = XmlUtils.getXPathTo(item);

    // header
    tbody.appendChild(this.createItemHeaderRow(xpath));

    // records
    var id = this.model.getValue(xpath + "/item-ref");
    xpath = "//project-model/proj-item/outgo-records/invoice-record[to-invoice='" + id + "']";

    var allRecords = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allRecords.length; i++) {
	xpath = XmlUtils.getXPathTo(allRecords[i]);
	var rec = this.renderOneRecord(xpath);
	UIUtils.addClass(rec, "hidden");
	tbody.appendChild(rec);
    }
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createItemHeaderRow = function(xpath) {

    var row = document.createElement("tr");
    row.className = "planning-item";

    var td = document.createElement("td");
    var radio = this.createRadioBtn();
    td.appendChild(radio);
    row.appendChild(td);

    td = document.createElement("td");
    var exp = this.createExpandBtn();
    td.appendChild(exp);
    row.appendChild(td);

    td = document.createElement("td");
    td.textContent = this.createHeaderText(xpath);
    row.appendChild(td);

    row.appendChild(this.createPlannedHeader(xpath));
    row.appendChild(this.createTotalHeader(xpath));

    // Filler
    row.appendChild(document.createElement("td"));

    var self = this;
    row.addEventListener("click", function(evt) {

	self.currCategoryRow = row;
	self.currItem = xpath;
	radio.checked = true;
	if (evt.target != exp) {
	    exp.click();
	}
	self.actionAdd.show();
	self.actionRemove.hide();
    });
    return row;

}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createRadioBtn = function() {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "project_outgoing";
    return radio;
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createExpandBtn = function() {

    var exp = document.createElement("input");
    exp.type = "checkbox";
    exp.className = "expand-button";

    exp.addEventListener("click", function() {
	var row = exp.parentElement.parentElement.nextSibling;
	while (UIUtils.hasClass(row, "invoice-record")) {

	    if (exp.checked) {
		UIUtils.removeClass(row, "hidden");
	    } else {
		UIUtils.addClass(row, "hidden");
	    }
	    row = row.nextSibling;
	}
    });
    return exp;
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createHeaderText = function(itemXPath) {

    var id = this.model.getValue(itemXPath + "/item-ref");
    var kto = this.model.getValue("//project-model/invoice-items/invoice-item[id='" + id + "']/konto");
    var name = this.model.getValue("//project-model/invoice-items/invoice-item[id='" + id + "']/name");
    return kto + " - " + name;
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createPlannedHeader = function(itemXPath) {

    var result = document.createElement("td");
    result.className = "currency-input";
    result.textContent = CurrencyUtils.formatCurrency(this.model.getValue(itemXPath + "/amount"));
    return result;
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createTotalHeader = function(itemXPath) {

    var result = document.createElement("td");
    result.className = "currency-input";

    var self = this;
    var update = function() {

	var total = 0;

	var id = self.model.getValue(itemXPath + "/item-ref");
	var xpath = "//project-model/proj-item/outgo-records/invoice-record[to-invoice='" + id + "']/amount";
	var allAmounts = self.model.evaluateXPath(xpath);
	for (var i = 0; i < allAmounts.length; i++) {
	    total += parseFloat(allAmounts[i].textContent);
	}
	result.textContent = CurrencyUtils.formatCurrency(total);
    }

    this.model.addChangeListener("//project-model/proj-item/outgo-records", function() {
	update();
    });
    update();
    return result;
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.renderOneRecord = function(recordXPath) {

    var row = document.createElement("tr");
    row.className = "invoice-record";

    row.appendChild(document.createElement("td"));

    var td = document.createElement("td");
    var radio = this.createRadioBtn();
    td.appendChild(radio);
    row.appendChild(td);

    row.appendChild(document.createElement("td"));
    row.appendChild(document.createElement("td"));

    var td = document.createElement("td");
    td.appendChild(this.createAmountEntry(recordXPath));
    row.appendChild(td);

    row.appendChild(document.createElement("td"));

    return row;

}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createAmountEntry = function(recordXPath) {

    var edit = document.createElement("input");
    edit.className = "inplace-edit currency-input mandatory";
    edit.style.width = "6em";
    new NumericInputField(edit);
    this.model.createCurrencyValueBinding(edit, recordXPath + "/amount", "change");
    return edit;
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.updatePlannedTotal = function() {

    var total = 0;
    var allAmounts = this.model.evaluateXPath("//project-model/planning-items/planning-item/amount");
    for (var i = 0; i < allAmounts.length; i++) {

	total += parseFloat(allAmounts[i].textContent);
    }
    UIUtils.getElement("planned-total").textContent = CurrencyUtils.formatCurrency(total);
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.updateOutgoingTotal = function() {

    var total = 0;
    var allAmounts = this.model.evaluateXPath("//project-model/proj-item/outgo-records/invoice-record/amount");
    for (var i = 0; i < allAmounts.length; i++) {

	total += parseFloat(allAmounts[i].textContent);
    }
    UIUtils.getElement("outgoing-total").textContent = CurrencyUtils.formatCurrency(total);
}
