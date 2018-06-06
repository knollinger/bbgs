/**
 * Das HauptMenu des Accountings
 */
var AccountingNavigation = function() {

    Navigation.call(this);

    var self = this;

    // Konten-Übersicht
    this.addNavigationButton("gui/images/money-overview.svg", "Konten-Übersicht", function() {
	alert("comming soon");
    });

    // Übersicht der Einnahmen
    this.addNavigationButton("gui/images/money-add.svg", "Einnahmen verwalten", function() {
	new InvoiceRecordsOverview();
    });

    // Übersicht der Projekte
    this.addNavigationButton("gui/images/folder.svg", "Projekte verwalten", function() {
	new ProjectsOverview();
    });

    // Übersicht der Buchungsposten
    this.addNavigationButton("gui/images/planning-item.svg", "Buchungs-Posten administrieren", function() {
	new InvoiceItemsOverview();
    });

    this.setTitle("Rechnungswesen");
}
AccountingNavigation.prototype = Object.create(Navigation.prototype);

/*---------------------------------------------------------------------------*/
/**
 * die Übersicht der Buchungsposten. Diese View teilt eingehende (Incomming) und
 * ausgehende Posten auf, verwendet aber die selbe Klasse zur darstellung
 */
var InvoiceItemsOverview = function() {

    WorkSpaceTabbedFrame.call(this, "invoice_items_overview");

    var self = this;
    this.setTitle("Rechnungs-Posten verwalten");
    this.loadModel(function() {
	self.setupIncommingEditor();
	self.setupOutgoingEditor();
	self.model.addChangeListener("//invoice-item-model/items", function() {
	    self.enableSaveButton(true);
	});
    });
}
InvoiceItemsOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */

InvoiceItemsOverview.prototype.loadModel = function(onsuccess) {
    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "invoice-item-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_INVOICE_ITEMS_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_INVOICE_ITEMS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_INVOICE_ITEMS_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_INVOICE_ITEMS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-invoice-item-model-req");
    caller.invokeService(req);
}

/**
 * 
 */
InvoiceItemsOverview.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-invoice-items-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_INVOICE_ITEM_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_INVOICE_ITEM_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_INVOICE_ITEM_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_INVOICE_ITEM_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);

    }

    caller.invokeService(this.model.getDocument());
}

/**
 * 
 */
InvoiceItemsOverview.prototype.setupIncommingEditor = function() {

    var accountsAndNames = [ {
	kto : 0,
	name : ""
    }, {
	kto : "5730",
	name : "Stiftungs-Mittel"
    }, {
	kto : "5731",
	name : "Co-Mittel"
    }, {
	kto : "5732",
	name : "Teilnehmerbeiträge"
    }, {
	kto : "5733",
	name : "Spenden"
    }, {
	kto : "5734",
	name : "Verleih-Pauschalen"
    }, {
	kto : "5735",
	name : "Mitglieds-Beiträge"
    } ];

    this.incommingTab = this.addTab("gui/images/planning-item-add.svg", "Eingehende Rechnungs-Posten");
    var subFrame = new InvoiceItemsEditor(this, this.incommingTab.contentPane, this.model, accountsAndNames);
    this.incommingTab.associateTabPane(subFrame);
    this.incommingTab.select();
}

/**
 * 
 */
InvoiceItemsOverview.prototype.setupOutgoingEditor = function() {

    var accountsAndNames = [ {
	    kto : 0,
	    name : ""
	}, {
	    kto : "5800",
	    name : "Gehälter"
	}, {
	    kto : "5801",
	    name : "Soz.Abgaben"
	}, {
	    kto : "5802",
	    name : "Trainer"
	}, {
	    kto : "5803",
	    name : "Sachkosten"
	} ];

    this.outgoingTab = this.addTab("gui/images/planning-item-remove.svg", "Ausgehende Rechnungs-Posten");
    var subFrame = new InvoiceItemsEditor(this, this.outgoingTab.contentPane, this.model, accountsAndNames);
    this.outgoingTab.associateTabPane(subFrame);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var InvoiceItemsEditor = function(parentFrame, targetCnr, model, accountsAndNames) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    this.actionAdd = this.createAddAction();
    this.actionRemove = this.createRemoveAction();

    this.createContent();
    this.fillTable(accountsAndNames);
}
InvoiceItemsEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
InvoiceItemsEditor.prototype.createContent = function() {

    // create the table header
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    thead.appendChild(tr);
    
    var th = document.createElement("th");
    th.colSpan = "2";
    tr.appendChild(th);
    
    th = document.createElement("th");
    th.textContent = "Buchungs-Posten";
    tr.appendChild(th);
    
    th = document.createElement("th");
    th.textContent = "Beschreibung";
    tr.appendChild(th);
    
    // create the table body
    this.tbody = document.createElement("tbody");
    
    // create the table
    var table = document.createElement("table");
    table.appendChild(thead);
    table.appendChild(this.tbody);
    
    // put them all into the div
    var div = document.createElement("div");
    div.appendChild(table);
    
    this.targetCnr.appendChild(div);
}

/**
 * 
 */
InvoiceItemsEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-add.svg", "Buchungsposten anlegen", function() {

	var tmp = new Model(XmlUtils.parse(InvoiceItemsEditor.EMPTY_ITEM));
	tmp.setValue("//item//id", UUID.create("invoice_item_"));
	tmp.setValue("//item//konto", self.currKonto);
	tmp.setValue("//item/type", self.itemTypeByAccountNumber(self.currKonto));
	var item = self.model.addElement("//invoice-item-model/items", tmp.getDocument().documentElement);

	var row = self.renderOneSubItem(item);
	self.currCatRow.parentElement.insertBefore(row, self.currCatRow.nextSibling);

	row.querySelector("input[type='radio'").click();
	row.querySelector(".inplace-edit").focus();
    });
    this.addAction(action);
    action.hide();
    return action;
}
InvoiceItemsEditor.EMPTY_ITEM = "<item><id/><ref_id/><action>CREATE</action><konto/><name/><description/><type/></item>";

/**
 * 
 */
InvoiceItemsEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-remove.svg", "Buchungsposten löschen", function() {

	var title = MessageCatalog.getMessage("QUERY_REMOVE_INVOICE_ITEM_TITLE");
	var messg = MessageCatalog.getMessage("QUERY_REMOVE_INVOICE_ITEM", self.model.getValue(self.currSubItem + "/name"));
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var action = self.model.setValue(self.currSubItem + "/action");
	    if (action != "CREATE") {
		self.model.setValue(self.currSubItem + "/action", "REMOVE");
	    } else {
		self.model.removeElement(self.currItem);
	    }
	    self.currRow.parentElement.removeChild(self.currRow);
	    self.currRecord = self.currRow = null;
	});
    });
    this.addAction(action);
    action.hide();
    return action;
}
/**
 * 
 */
InvoiceItemsEditor.prototype.fillTable = function(accountsAndNames) {

    for (var i = 1; i < accountsAndNames.length; i++) {
	this.renderOneItem(accountsAndNames[i].kto, accountsAndNames[i].name);
    }
}

/**
 * 
 */
InvoiceItemsEditor.prototype.renderOneItem = function(kto, name) {

    var cat = this.renderCategoryRow(kto, name);
    this.tbody.appendChild(cat);

    var xpath = "//invoice-item-model/items/item[konto='" + kto + "']";
    var allItems = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allItems.length; i++) {
	xpath = XmlUtils.getXPathTo(allItems[i]);
	var row = this.renderOneSubItem(xpath);
	UIUtils.addClass(row, "hidden");
	this.tbody.appendChild(row);
    }
}

/**
 * 
 */
InvoiceItemsEditor.prototype.renderCategoryRow = function(kto, name) {

    var tr = document.createElement("tr");

    var cell = document.createElement("td");
    var radio = this.createRadio();
    cell.appendChild(radio);
    tr.appendChild(cell);

    cell = document.createElement("td");
    var expander = this.createExpander();
    cell.appendChild(expander);
    tr.appendChild(cell);

    cell = document.createElement("td");
    cell.textContent = kto + " - " + name;
    tr.appendChild(cell);

    // filler
    tr.appendChild(document.createElement("td"));

    var self = this;
    tr.addEventListener("click", function(evt) {
	if (evt.target != expander) {
	    expander.click();
	}
	radio.checked = true;
	self.currKonto = kto;
	self.currCatRow = tr;
	self.actionAdd.show();
	self.actionRemove.hide();
    });

    expander.addEventListener("click", function() {

	var sibling = tr.nextSibling;
	while (UIUtils.hasClass(sibling, "sub-item")) {

	    if (expander.checked) {
		UIUtils.removeClass(sibling, "hidden");
	    } else {
		UIUtils.addClass(sibling, "hidden");
	    }
	    sibling = sibling.nextSibling;
	}
    });
    return tr;
}

/**
 * 
 */
InvoiceItemsEditor.prototype.createRadio = function() {

    var result = document.createElement("input");
    result.type = "radio";
    result.name = "incommin_items_";
    return result;
}

/**
 * 
 */
InvoiceItemsEditor.prototype.createExpander = function() {

    var result = document.createElement("input");
    result.type = "checkbox";
    result.className = "expand-button";
    return result;
}

/**
 * 
 */
InvoiceItemsEditor.prototype.renderOneSubItem = function(xpath) {

    var tr = document.createElement("tr");
    tr.className = "sub-item";

    // filler
    var cell = document.createElement("td");
    tr.appendChild(cell);

    cell = document.createElement("td");
    var radio = this.createRadio();
    cell.appendChild(radio);
    tr.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(this.createNameInput(xpath + "/name"));
    tr.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(this.createDescriptionInput(xpath + "/description"));
    tr.appendChild(cell);

    var self = this;
    tr.addEventListener("click", function() {
	radio.click();
	self.currSubItem = xpath;
	self.currRow = tr;
	self.actionRemove.show();
    });
    this.model.addChangeListener(xpath, function() {
	var action = self.model.evaluateXPath(xpath + "/action")[0];
	if (action.textContent != "REMOVE" && action.textContent != "CREATE") {
	    action.textContent = "MODIFY";
	}
    });
    return tr;
}

/**
 * 
 */
InvoiceItemsEditor.prototype.createNameInput = function(xpath) {

    var input = document.createElement("input");
    input.className = "inplace-edit mandatory";
    input.placeholder = input.title = "Buchungs-Posten";
    this.model.createValueBinding(input, xpath, "input");
    return input;
}

/**
 * 
 */
InvoiceItemsEditor.prototype.createDescriptionInput = function(xpath) {

    var input = document.createElement("textarea");
    input.className = "inplace-textarea mandatory";
    input.placeholder = input.title = "Beschreibung";
    this.model.createValueBinding(input, xpath, "input");
    return input;
}

/**
 * 
 */
 InvoiceItemsEditor.prototype.itemTypeByAccountNumber = function(accountNumber) {
 
     return (parseInt(accountNumber) < 5800) ? "INCOME" : "OUTGO";
 }
 
/*---------------------------------------------------------------------------*/
/*
 * 
 */
var InvoiceRecordsOverview = function() {

    WorkSpaceTabbedFrame.call(this, "invoice_records_overview");
    this.setTitle("Einnahmen verwalten");

    var self = this;
    this.sections = {};
    this.loadModel(function() {

	self.ensureInvoiceItemsAvailable(function() {
	    self.actionAdd = self.createAddAction();
	    self.actionRemove = self.createRemoveAction();
	    self.populateTables();
	    self.setupChangeListeners();
	});
    });
}
InvoiceRecordsOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
InvoiceRecordsOverview.prototype.ensureInvoiceItemsAvailable = function(onsuccess) {

    var allInvoiceRecords = this.model.evaluateXPath("//invoice-records-model/invoice-items/invoice-item[type='INCOME']");
    if (allInvoiceRecords.length) {
	onsuccess();
    } else {

	var self = this;
	var title = MessageCatalog.getMessage("TITLE_NO_INVOICE_ITEMS");
	var messg = MessageCatalog.getMessage("NO_INVOICE_ITEMS");
	new MessageBox(MessageBox.INFO, title, messg, function() {
	    self.close();
	    new InvoiceItemsOverview();
	});
    }
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.setupChangeListeners = function() {

    var self = this;
    this.model.addChangeListener("//invoice-records-model/records", function() {
	self.clearTables();
	self.populateTables();
	self.enableSaveButton(true);
    });

    var allRecords = this.model.evaluateXPath("//invoice-records-model/records/record");
    for (var i = 0; i < allRecords.length; i++) {
	this.setupOneChangeListener(allRecords[i]);
    }
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.setupOneChangeListener = function(record) {

    var self = this;
    record.addEventListener("change", function(evt) {

	var action = record.getElementsByTagName("action")[0];
	if (action.textContent == "NONE") {
	    action.textContent = "MODIFY";
	    self.enableSaveButton(true);
	}
	if (action.textContent != "REMOVE") {
	    evt.stopPropagation();
	}
    });
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "invoice-records-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_INVOICE_RECORDS_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_INVOICE_RECORDS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_INVOICE_RECORDS_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_INVOICE_RECORDS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-incomming-record-model-req");
    caller.invokeService(req);
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-add.svg", "Buchungsposten anlegen", function() {

	var date = new Date();
	var openSubpanel = self.getSelectedTab();
	if (openSubpanel) {
	    date.setFullYear(openSubpanel.subFrame.year);
	}
	var tmp = new Model(XmlUtils.parse(InvoiceRecordsOverview.EMPTY_RECORD));
	tmp.setValue("//record/id", UUID.create("invoice_record_"));
	tmp.setValue("//record/date", DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}"));
	self.currRecord = self.model.addElement("//invoice-records-model/records", tmp.getDocument().documentElement);
    });
    this.addAction(action);
    return action;
}
InvoiceRecordsOverview.EMPTY_RECORD = "<record><id/><action>CREATE</action><from-invoice>0</from-invoice><to-invoice/><amount>0</amount><description/><date/><attachments/></record>";

/**
 * 
 */
InvoiceRecordsOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-remove.svg", "Rechnungs-Satz löschen", function() {

	var amount = CurrencyUtils.formatCurrency(self.model.getValue(self.currRecord + "/amount"));
	var title = MessageCatalog.getMessage("QUERY_REMOVE_INVOICE_RECORD_TITLE");
	var messg = MessageCatalog.getMessage("QUERY_REMOVE_INVOICE_RECORD", amount);
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    self.model.setValue(self.currRecord + "/action", "REMOVE");
	});

    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * So Vogelwild mit gruppenwechsel, neue tabs erstellen und tabellen dynamisch
 * erzeugen zeilenweise binden, Übertrag aus Vorjahr, übertrag ins nächste Jahr,
 * ...
 */
InvoiceRecordsOverview.prototype.populateTables = function() {

    var allRecords = this.model.evaluateXPath("//invoice-records-model/records/record");
    for (var i = 0; i < allRecords.length; i++) {

	var record = allRecords[i];
	this.renderRecord(record);
    }
}

/**
 * Lösche alle Zeilen aller Tabellen
 */
InvoiceRecordsOverview.prototype.clearTables = function() {

    var allSectionNames = Object.getOwnPropertyNames(this.sections);
    for (var i = 0; i < allSectionNames.length; i++) {
	UIUtils.clearChilds(this.sections[allSectionNames[i]].getTableBody());
    }
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.renderRecord = function(record) {

    var self = this;
    var year = record.getElementsByTagName("date")[0].textContent;
    if (DateTimeUtils.isDate(year)) {

	year = DateTimeUtils.parseDate(year, "dd.mm.yyyy").getFullYear();
	var table = this.getTableBodyFor(year);
	var onclick = function(tr, record) {
	    tr.querySelector("input[type=radio]").click();
	    self.currRecord = XmlUtils.getXPathTo(record);
	    self.actionRemove.show();
	}

	if (record.getElementsByTagName("action")[0].textContent != "REMOVE") {
	    var row = this.model.createTableRow(record, this.getColumnDescriptor(), onclick);
	    table.appendChild(row);
	}
    }
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.getTableBodyFor = function(year) {

    if (!this.sections) {
	this.sections = {};
    }

    if (!this.sections[year]) {
	this.sections[year] = this.createNewSection(year);
    }

    return this.sections[year].getTableBody();
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.createNewSection = function(year) {

    var tab = this.addTab("gui/images/money.svg", "Einnahmen in " + year);
    var subFrame = new InvoiceRecordsSubPanel(this, tab.contentPane, year);
    tab.associateTabPane(subFrame);

    if (year == new Date().getFullYear()) {
	tab.select();
    }
    return subFrame;
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    if (!this.columnDesc) {

	this.columnDesc = [];

	// Der RadioButton zum selektieren
	this.columnDesc.push(function(td, record) {
	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "invoice_records";
	    return radio;
	});

	// Das Eingangs-Konto mit SubKontonummer und Name
	this.columnDesc.push(function(td, record) {
	    return self.createKontoSelector(record);

	});

	// Der Betrag als Währungs-Darstellung
	this.columnDesc.push(function(td, record) {
	    return self.createAmountEntry(record);
	});

	// Das Buchungs-Datum
	this.columnDesc.push(function(td, record) {
	    return self.createDateEntry(record);
	});

	// Die Beschreibung der Buchung
	this.columnDesc.push(function(td, record) {
	    return self.createDescriptionEntry(record);
	});
    }
    return this.columnDesc;
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.createAmountEntry = function(record) {

    var entry = document.createElement("input");
    entry.className = "inplace-edit currency-input mandatory";
    entry.placeholder = "Betrag";
    entry.size = "10";

    var xpath = XmlUtils.getXPathTo(record) + "/amount";
    this.model.createCurrencyValueBinding(entry, xpath, "change");
    new NumericInputField(entry);
    return entry;
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.createKontoSelector = function(record) {

    var refId = record.getElementsByTagName("to-invoice")[0].textContent;

    var selector = document.createElement("select");
    selector.className = "inplace-select mandatory";

    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Buchungs-Konto";
    opt.disabled = opt.selected = true;
    selector.appendChild(opt);

    var allItems = this.model.evaluateXPath("//invoice-records-model/invoice-items/invoice-item[type='INCOME']");
    for (var i = 0; i < allItems.length; i++) {

	var item = allItems[i];
	var id = item.getElementsByTagName("id")[0].textContent;
	var konto = item.getElementsByTagName("konto")[0].textContent;
	var name = item.getElementsByTagName("name")[0].textContent;

	var opt = document.createElement("option");
	opt.value = id;
	opt.textContent = konto + " - " + name;
	selector.appendChild(opt);

	if (refId == item.getElementsByTagName("id")[0].textContent) {
	    opt.selected = true;
	}
    }

    var xpath = XmlUtils.getXPathTo(record) + "/to-invoice";
    this.model.createValueBinding(selector, xpath, "change");
    return selector;
}

/**
 * 
 */
InvoiceRecordsOverview.prototype.createDateEntry = function(record) {

    var entry = document.createElement("input");
    entry.className = "inplace-edit datepicker-input mandatory";
    entry.placeholder = "Buchungs-Datum";
    new DatePicker(entry, "Buchungs-Datum");

    var xpath = XmlUtils.getXPathTo(record) + "/date";
    this.model.createValueBinding(entry, xpath, "change");
    return entry;

}

/**
 * 
 */
InvoiceRecordsOverview.prototype.createDescriptionEntry = function(record) {

    var entry = document.createElement("textarea");
    entry.className = "inplace-textarea mandatory";
    entry.placeholder = "Beschreibung";

    var xpath = XmlUtils.getXPathTo(record) + "/description";
    this.model.createValueBinding(entry, xpath, "change");
    return entry;

}

/**
 * 
 */
InvoiceRecordsOverview.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-invoice-record-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_INVOICE_RECORD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_INVOICE_RECORD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_INVOICE_RECORD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_INVOICE_RECORD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());

}

/*---------------------------------------------------------------------------*/
/**
 * Das InvoiceRecordsSubPanel stellt einen SubContainer des
 * InvoiceRecordsOverview dar. In einem solchen Control wird eine Tabelle
 * dargestellt, welche alle Einnahmen eines Jahres darstellt.
 */
var InvoiceRecordsSubPanel = function(parentFrame, targetCnr, year) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    targetCnr.appendChild(this.createTable());

    this.year = year;
    this.printAction = this.createPrintAction(year);
    this.addAction(this.printAction);
    this.printAction.hide();

}
InvoiceRecordsSubPanel.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
InvoiceRecordsSubPanel.prototype.activate = function() {
    this.printAction.show();
}

/**
 * 
 */
InvoiceRecordsSubPanel.prototype.createTable = function() {

    var tr = document.createElement("tr");
    for (var i = 0; i < InvoiceRecordsSubPanel.HEADER_COLS.length; i++) {
	var th = document.createElement("th");
	th.textContent = InvoiceRecordsSubPanel.HEADER_COLS[i];
	if (i != 0) {
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
    return table;
}

InvoiceRecordsSubPanel.HEADER_COLS = [ "", "Eingangs-Konto", "Betrag", "Datum", "Kommentar" ];

/**
 * 
 */
InvoiceRecordsSubPanel.prototype.getTableBody = function() {
    return this.body;
}

/**
 * 
 */
InvoiceRecordsSubPanel.prototype.createPrintAction = function(year) {

    var self = this;
    var title = "Buchungs-Sätze " + year + " drucken";
    var action = new WorkSpaceFrameAction("gui/images/money-print.svg", title, function() {

	var url = "getDocument/invoice_records_overview.pdf?year=" + year;
	var title = "Übersicht der Buchungs-Sätze " + year;
	new DocumentViewer(url, title);
    });
    return action;
}
