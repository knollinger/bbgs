/*---------------------------------------------------------------------------*/
/**
 * 
 */
var AccountNumberUtil = (function() {

    var accountsToText = [];
    accountsToText.push({
	id : 5730,
	text : "Stiftungs-Mittel"
    });
    accountsToText.push({
	id : 5731,
	text : "Co-Mittel"
    });
    accountsToText.push({
	id : 5732,
	text : "Teilnehmer-Beiträge"
    });
    accountsToText.push({
	id : 5733,
	text : "Spenden"
    });
    accountsToText.push({
	id : 5734,
	text : "Verleih-Pauschalen"
    });
    accountsToText.push({
	id : 5735,
	text : "Mitglieds-Beiträge"
    });

    accountsToText.push({
	id : 5800,
	text : "Gehälter"
    });
    accountsToText.push({
	id : 5801,
	text : "Soz. Abgaben"
    });
    accountsToText.push({
	id : 5802,
	text : "Trainer"
    });
    accountsToText.push({
	id : 5803,
	text : "Sachkosten"
    });

    return {

	/**
	 * Definiert ein Eingangs-Konto
	 */
	INCOME : 1,

	/**
	 * Definiert ein Ausgangs-Konto
	 */
	OUTGO : 2,

	/**
	 * Definiert ein Projekt-Konto
	 */
	PROJECT : 3,

	/**
	 * Unbekannter Konto-Typ
	 */
	UNKNOWN : 4,

	/**
	 * Liefert den Typ des Kontos
	 * 
	 * @return AccountNumberUtil.UNKNOWN wenn der Typ nicht ermittelt werden
	 *         konnte
	 */
	getType : function(accountId) {

	    if (typeof accountId == "string") {
		accountId = parseInt(accountId);
	    }

	    var result = AccountNumberUtil.UNKNOWN;

	    switch (accountId) {
	    case 5730:
	    case 5731:
	    case 5732:
	    case 5733:
	    case 5734:
	    case 5735:
		result = AccountNumberUtil.INCOME;
		break;

	    case 5800:
	    case 5801:
	    case 5802:
	    case 5803:
		result = AccountNumberUtil.OUTGO;
		break;

	    case 0:
		result = AccountNumberUtil.PLANNING;
		break;

	    default:
		AccountNumberUtil.UNKNOWN
		break;
	    }
	    return result;
	},

	/**
	 * Übersetze eine Kontonummer in den Menschenlesbaren Text
	 * 
	 * @return null, wenn die Konto-Nummer nicht bekannt ist
	 */
	translate : function(accountId) {

	    for (var i = 0; i < accountsToText.length; i++) {

		if (accountsToText[i].id == accountId) {
		    return accountsToText[i].text;
		}
	    }
	    return null;
	},

	/**
	 * liefere alle Zuordnungen von Konto-Nummern zu Texten
	 */
	getAccountIds : function() {
	    return accountsToText;
	}
    }
})();

/*---------------------------------------------------------------------------*/
/**
 * Das Navigation-Menu der Buchhalterei
 */
var AccountingNavigation = function() {

    Navigation.call(this);
    this.setTitle("Buchhaltung");

    this.addNavigationButton("gui/images/money-add.svg", "Einnahmen verwalten", function() {
	new IncommingsOverview();
    });

    this.addNavigationButton("gui/images/folder.svg", "Projekte verwalten", function() {
	new ProjectsOverview();
    });

    this.addNavigationButton("gui/images/planning-item.svg", "Buchungsposten verwalten", function() {
	new InvoiceItemsOverview();
    });

}
AccountingNavigation.prototype = Object.create(Navigation.prototype);

/*---------------------------------------------------------------------------*/
/**
 * Die Übersicht über alle Buchungs-Posten
 */
var InvoiceItemsOverview = function() {

    WorkSpaceFrame.call(this);

    this.currAccountId = null;
    this.currAccountRow = null;

    this.currDataXPath = null;
    this.currDataRow = null;

    var self = this;
    this.load("gui/accounting/invoice_items_overview.html", function() {

	new TableDecorator("invoice_items_overview");
	self.loadModel(function() {

	    self.fillTable();
	    self.actionAdd = self.createAddAction();
	    self.actionRemove = self.createRemoveAction();
	    self.model.addChangeListener("//invoice-items-model", function() {
		self.enableSaveButton(true);
	    });
	});
    });
}
InvoiceItemsOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * lade das Model
 */
InvoiceItemsOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "invoice-items-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("GET_INVOICE_ITEMS_TITLE");
	    var messg = MessageCatalog.getMessage("GET_INVOICE_ITEMS_ERROR", rsp.getElemetsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("GET_INVOICE_ITEMS_TITLE");
	var messg = MessageCatalog.getMessage("GET_INVOICE_ITEMS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-invoice-items-req");
    caller.invokeService(req);
}

/**
 * befülle die Tabelle
 */
InvoiceItemsOverview.prototype.fillTable = function() {

    var tbody = UIUtils.getElement("invoice_items_overview_body");
    var idsAndText = AccountNumberUtil.getAccountIds();
    for (var i = 0; i < idsAndText.length; i++) {

	var id = idsAndText[i].id;
	var text = idsAndText[i].text
	var row = this.renderOneCategoryRow(id, text);
	tbody.appendChild(row);

	var xpath = "//invoice-items-model/item[account='" + id + "']";
	var allRows = this.model.evaluateXPath(xpath);
	for (var j = 0; j < allRows.length; j++) {
	    row = this.renderOneDataRow(XmlUtils.getXPathTo(allRows[j]));
	    UIUtils.addClass(row, "hidden");
	    tbody.appendChild(row);
	}
    }
}

/**
 * Erzeuge eine Katorie-Zeile
 * 
 * @param id
 * @param text
 */
InvoiceItemsOverview.prototype.renderOneCategoryRow = function(id, text) {

    var row = document.createElement("tr");

    var cell = document.createElement("td");
    var radio = this.createRadioButton();
    cell.appendChild(radio);
    row.appendChild(cell);

    cell = document.createElement("td");
    var exp = this.createExpandButton();
    cell.appendChild(exp);
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.colSpan = "2";
    cell.textContent = id + " - " + text;
    row.appendChild(cell);

    var self = this;
    row.addEventListener("click", function(evt) {
	radio.click();
	exp.click();
	self.actionAdd.show();
	self.actionRemove.hide();
    });

    exp.addEventListener("click", function(evt) {
	evt.stopPropagation();
	self.currAccountId = id;
	self.currAccountRow = row;
	self.expand(self.currAccountRow, exp.checked);
    });
    radio.addEventListener("click", function(evt) {
	evt.stopPropagation();
	self.currAccountId = id;
	self.currAccountRow = row;
    });
    return row;
}

/**
 * Erzeuge einen ExpandButton
 * 
 */
InvoiceItemsOverview.prototype.createExpandButton = function() {

    var btn = document.createElement("input");
    btn.type = "checkbox";
    btn.name = "invoice_items_overview";
    btn.className = "expand-button";
    return btn;
}

/**
 * Erzeuge einen ExpandButton
 * 
 */
InvoiceItemsOverview.prototype.createRadioButton = function() {

    var btn = document.createElement("input");
    btn.type = "radio";
    btn.name = "invoice_items_overview_row";
    return btn;
}

/**
 * Erzeuge einen ExpandButton
 * 
 */
InvoiceItemsOverview.prototype.renderOneDataRow = function(xpath) {

    var row = document.createElement("tr");
    row.className = "expandable";

    var cell = document.createElement("td");
    row.appendChild(cell);

    cell = document.createElement("td");
    var radio = this.createRadioButton();
    cell.appendChild(radio);
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(this.createNameEntry(xpath));
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(this.createDescriptionEntry(xpath));
    row.appendChild(cell);

    var self = this;
    row.addEventListener("click", function() {
	radio.click();
	self.currDataXPath = xpath;
	self.currDataRow = row;
	self.actionRemove.show();
    });

    this.model.addChangeListener(xpath, function() {

	var action = self.model.evaluateXPath(xpath + "/action")[0];
	if (action.textContent != "CREATE" && action.textContent != "REMOVE") {
	    action.textContent = "MODIFY";
	}
    });
    return row;
}

/**
 * Erzeuge das Eingabe-Feld für den Namen
 * 
 * @param xpath
 */
InvoiceItemsOverview.prototype.createNameEntry = function(xpath) {

    var entry = document.createElement("input");
    entry.type = "text";
    // entry.style.width = "6em";
    entry.className = "inplace-edit mandatory";
    entry.placeholder = "Name";
    this.model.createValueBinding(entry, xpath + "/name", "input");
    return entry;
}

/**
 * Erzeuge das Eingabe-Feld für die Beschreibung
 * 
 * @param xpath
 */
InvoiceItemsOverview.prototype.createDescriptionEntry = function(xpath) {

    var entry = document.createElement("textarea");
    entry.className = "inplace-textarea mandatory";
    entry.placeholder = "Beschreibung";
    this.model.createValueBinding(entry, xpath + "/description", "input");
    return entry;
}

/**
 * Expandiere eine Category-Row
 * 
 * @param row
 * @param expand
 */
InvoiceItemsOverview.prototype.expand = function(row, expand) {

    row = row.nextSibling;
    while (row && UIUtils.hasClass(row, "expandable")) {

	if (expand) {
	    UIUtils.removeClass(row, "hidden");
	} else {
	    UIUtils.addClass(row, "hidden");
	}
	row = row.nextSibling;
    }
}

/**
 * Erzeuge die ADD-Action
 */
InvoiceItemsOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-add.svg", "Buchungsposten anlegen", function() {
	self.createNewEntry();
    });

    this.addAction(action);
    action.hide();
    return action;
}

/**
 * Erzeuge die REMOVE-Action
 */
InvoiceItemsOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-remove.svg", "Buchungsposten anlegen", function() {
	self.removeEntry();
    });

    this.addAction(action);
    action.hide();
    return action;
}

/**
 * Erzeuge einen neuen Eintrag
 */
InvoiceItemsOverview.prototype.createNewEntry = function() {

    var doc = XmlUtils.parse(InvoiceItemsOverview.EMPTY_ITEM);
    XmlUtils.setNode(doc, "account", this.currAccountId);

    var xpath = this.model.addElement("//invoice-items-model", doc.documentElement);
    var row = this.renderOneDataRow(xpath);
    this.currAccountRow.parentNode.insertBefore(row, this.currAccountRow.nextSibling);

    row.querySelector("input[type='radio']").click();
    row.querySelector("input[type='text']").focus();
}
InvoiceItemsOverview.EMPTY_ITEM = "<item><id/><action>CREATE</action><ref-id>0</ref-id><account>0</account><name/><description/></item>";

/**
 * Lösche einen Eintrag
 */
InvoiceItemsOverview.prototype.removeEntry = function() {

    var self = this;

    var title = MessageCatalog.getMessage("REMOVE_INVOICE_ITEM_TITLE");
    var messg = MessageCatalog.getMessage("REMOVE_INVOICE_ITEM_MESSG");
    new MessageBox(MessageBox.QUERY, title, messg, function() {

	if (self.model.getValue(self.currDataXPath + "/action") == "CREATE") {
	    self.model.removeElement(self.currDataXPath);
	} else {
	    self.model.setValue(self.currDataXPath + "/action", "REMOVE");
	}
	UIUtils.removeElement(self.currDataRow);
	self.currDataXPath = null;
	self.currDataRow = null;
    });
}

/**
 * Lösche einen Eintrag
 */
InvoiceItemsOverview.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-invoive-items-model-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_INVOICE_ITEMS_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_INVOICE_ITEMS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_INVOICE_ITEMS_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_INVOICE_ITEMS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());
}

/*---------------------------------------------------------------------------*/
/**
 * Die Übersicht aller Einnahmen
 */
var IncommingsOverview = function() {

    WorkSpaceTabbedFrame.call(this, "incommings_overview");
    this.setTitle("Einnahmen verwalten");

    this.tables = [];
    var self = this;
    this.loadModel(function() {

	// stelle sicher, dass wenigstens der Tab für das aktuelle Projektjahr existiert
	self.getSubPaneForYear(new Date);
	
	self.model.addChangeListener("//invoice-records-model/records", function() {
	    self.enableSaveButton(true);
	});
	self.fillContent();
    });
}
IncommingsOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * Lade das Model
 */
IncommingsOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "invoice-records-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("GET_INCOMMINGS_TITLE");
	    var messg = MessageCatalog.getMessage("GET_INCOMMINGS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("GET_INCOMMINGS_TITLE");
	var messg = MessageCatalog.getMessage("GET_INCOMMINGS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-all-incommings-request");
    caller.invokeService(req);
}

/**
 * befülle den Inhalt
 */
IncommingsOverview.prototype.fillContent = function() {

    var allRecs = this.model.evaluateXPath("//invoice-records-model/records/record");
    for (var i = 0; i < allRecs.length; i++) {

	this.renderOneRecord(allRecs[i]);
    }
}

/**
 * Rendere einen Record
 */
IncommingsOverview.prototype.renderOneRecord = function(node) {

    var date = new Date(parseInt(node.getElementsByTagName("date")[0].textContent));
    var subPane = this.getSubPaneForYear(date);
    subPane.addRow(node);
}

/**
 * liefere den Tab für ein gegebenes Datum
 * 
 * @param date
 */
IncommingsOverview.prototype.getSubPaneForYear = function(date) {

    var year = DateTimeUtils.getProjectYear(date);
    if (!this.tables[year]) {

	var title = year + ". Projektjahr";
	var tab = this.addTab("gui/images/money-add.svg", title);
	var subPane = new IncommingsSubView(this, tab.contentPane, this.model, year);
	tab.associateTabPane(subPane);
	this.tables[year] = subPane;

	if (DateTimeUtils.getProjectYear(new Date()) == year) {
	    tab.select();
	}
    }
    return this.tables[year];
}

/**
 * Speichere die Änderungen
 */
IncommingsOverview.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-incommings-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_INCOMMINGS_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_INCOMMINGS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    }
    caller.onError = function(req, status) {

	var title = MessageCatalog.getMessage("SAVE_INCOMMINGS_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_INCOMMINGS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());

}

/*---------------------------------------------------------------------------*/
/**
 * Der SubView für ein Jahr des IncommingsOverview
 * 
 * @param parentFrame
 * @param targetContainer
 * @param model
 */
var IncommingsSubView = function(parentFrame, targetContainer, model, projYear) {

    WorkSpaceTabPane.call(this, parentFrame, targetContainer);
    this.model = model;
    this.projYear = projYear;

    var content = document.createElement("div");
    content.className = "scrollable";
    targetContainer.appendChild(content);
    content.appendChild(this.createTable());

    this.actionAdd = this.createAddAction();
    this.actionRemove = this.createRemoveAction();
    this.actionPrint = this.createPrintAction();
}
IncommingsSubView.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * erzeuge die add-Action
 */
IncommingsSubView.prototype.activate = function() {

    this.actionAdd.show();
    this.actionPrint.show();
    if (this.currRow && this.currXPath) {
	this.actionRemove.show();
    }
}

/**
 * erzeuge die add-Action
 */
IncommingsSubView.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-add.svg", "Einzahlung anlegen", function() {

	var entry = XmlUtils.parse(IncommingsSubView.EMPTY_RECORD);
	XmlUtils.setNode(entry, "date", new Date().getTime());
	var xpath = self.model.addElement("//invoice-records-model/records", entry.documentElement);
	var node = self.model.evaluateXPath(xpath)[0];
	var row = self.addRow(node);

	row.querySelector("input[type='radio']").click();
	row.querySelector("select").focus();
    });

    this.addAction(action);
    action.hide();
    return action;
}
IncommingsSubView.EMPTY_RECORD = "<record><id/><action>CREATE</action><source>0</source><target/><amount>0.0</amount><description/><date/></record>";

/**
 * erzeuge die remove-Action
 */
IncommingsSubView.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-remove.svg", "Einzahlung löschen", function() {

	var title = MessageCatalog.getMessage("REMOVE_INCOMMING_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_INCOMMING_MESSG");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var action = self.model.getValue(self.currXPath + "/action");
	    if (action == "CREATE") {
		self.model.removeElement(self.currXPath);
	    } else {
		self.model.setValue(self.currXPath + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currRow);
	    self.currRow = self.currXPath = null;
	    self.actionRemove.hide();
	});
    });

    this.addAction(action);
    action.hide();
    return action;
}

/**
 * erzeuge die printAction
 */
IncommingsSubView.prototype.createPrintAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/print.svg", "Drucken", function() {

	var menu = new PopupMenu(action.btn);
	menu.makeMenuItem("Einnamen aus diesem Projekt-Jahr drucken", function() {
	    self.printIncommings(self.projYear);
	});

	menu.makeSeparator();
	menu.makeMenuItem("alle Einnahmen drucken", function() {
	    self.printIncommings();
	});
    });

    this.addAction(action);
    action.hide();
    return action;
}

/**
 * erzeuge die Tabelle eines SubViews
 */
IncommingsSubView.prototype.createTable = function() {

    var row = document.createElement("tr");

    var cell = document.createElement("th");
    row.appendChild(cell);

    cell = document.createElement("th");
    cell.textContent = "Eingangs-Konto";
    row.appendChild(cell);

    cell = document.createElement("th");
    cell.className = "currency-input";
    cell.textContent = "Betrag";
    row.appendChild(cell);

    cell = document.createElement("th");
    cell.textContent = "Datum";
    row.appendChild(cell);

    cell = document.createElement("th");
    cell.textContent = "Beschreibung";
    row.appendChild(cell);

    var head = document.createElement("thead");
    head.appendChild(row);

    var table = document.createElement("table");
    table.appendChild(head);

    this.tbody = document.createElement("tbody");
    table.appendChild(this.tbody);

    new TableDecorator(table);
    return table;
}

/**
 * Füge eine Zeile in die Tabelle ein
 * 
 * @param node
 */
IncommingsSubView.prototype.addRow = function(node) {

    var self = this;
    var fields = this.getColumnDescriptor();
    var onclick = function(row, node) {
	self.currRow = row;
	self.currXPath = XmlUtils.getXPathTo(node);
	self.actionRemove.show();
    }

    var row = this.model.createTableRow(node, fields, onclick);
    this.tbody.appendChild(row);

    this.model.addChangeListener(XmlUtils.getXPathTo(node), function() {
	var action = node.getElementsByTagName("action")[0];
	if (action.textContent != "CREATE" && action.textContent != "REMOVE") {
	    action.textContent = "MODIFY";
	}
    });
    return row;
}

/**
 * liefere den ColumnDescriptor
 */
IncommingsSubView.prototype.getColumnDescriptor = function() {

    if (!this.COL_DESC) {

	var self = this;
	this.COL_DESC = [];
	this.COL_DESC.push(function(td, node) {
	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "incomming";
	    return radio;
	});

	this.COL_DESC.push(function(td, node) {
	    if (node.getElementsByTagName("action")[0].textContent == "CREATE") {
		return self.createKontoDropdown(node);
	    }
	    return self.createKontoSpan(node);
	});

	this.COL_DESC.push(function(td, node) {
	    return self.createAmountEntry(node);
	});

	this.COL_DESC.push(function(td, node) {
	    return self.createDateEntry(node);
	});

	this.COL_DESC.push(function(td, node) {
	    return self.createDescriptionEntry(node);
	});
    }
    return this.COL_DESC;
}

/**
 * Erzeuge das Dropdown für die Konto-Auswahl
 */
IncommingsSubView.prototype.createKontoSpan = function(node) {

    var xpath = XmlUtils.getXPathTo(node);
    var targetId = this.model.getValue(xpath + "/target");

    xpath = "//invoice-records-model/items/item[id='" + targetId + "']";
    var account = this.model.getValue(xpath + "/account");
    var name = this.model.getValue(xpath + "/name");

    var span = document.createElement("span");
    span.textContent = account + " - " + name;

    return span;
}

/**
 * Erzeuge das Dropdown für die Konto-Auswahl
 */
IncommingsSubView.prototype.createKontoDropdown = function(node) {

    var select = document.createElement("select");
    select.className = "inplace-select mandatory";

    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Eingangs-Konto";
    opt.disabled = opt.selected = true;
    select.appendChild(opt);

    var baseXPath = "//invoice-records-model/items/item";
    var allItems = this.model.evaluateXPath(baseXPath);

    for (var i = 0; i < allItems.length; i++) {

	var xpath = XmlUtils.getXPathTo(allItems[i]);
	var account = this.model.getValue(xpath + "/account");
	if (AccountNumberUtil.getType(account) == AccountNumberUtil.INCOME) {
	    var name = this.model.getValue(xpath + "/name");

	    opt = document.createElement("option");
	    opt.textContent = account + " - " + name;
	    opt.value = this.model.getValue(xpath + "/id");
	    select.appendChild(opt);
	}
    }

    var xpath = XmlUtils.getXPathTo(node) + "/target";
    this.model.createValueBinding(select, xpath);
    return select;
}

/**
 * Erzeuge den Amount-Entry
 */
IncommingsSubView.prototype.createAmountEntry = function(node) {

    var input = document.createElement("input");
    input.className = "inplace-edit currency-input mandatory";

    var xpath = XmlUtils.getXPathTo(node) + "/amount";
    this.model.createCurrencyValueBinding(input, xpath, "change");

    new NumericInputField(input);
    return input;
}

/**
 * Erzeuge den Date-Entry
 */
IncommingsSubView.prototype.createDateEntry = function(node) {

    var input = document.createElement("input");
    input.className = "inplace-edit mandatory";

    var xpath = XmlUtils.getXPathTo(node) + "/date";
    this.model.createDateValueBinding(input, xpath, "change");

    new DatePicker(input);
    return input;
}

/**
 * Erzeuge den Description-Entry
 */
IncommingsSubView.prototype.createDescriptionEntry = function(node) {

    var input = document.createElement("textarea");
    input.className = "inplace-textarea mandatory";
    input.placeholder = "Beschreibung";

    var xpath = XmlUtils.getXPathTo(node) + "/description";
    this.model.createValueBinding(input, xpath, "change");

    return input;
}

/**
 * Erzeuge den Description-Entry
 * 
 * @param projYear
 *                wenn nicht angegeben, so werden alle Einnahmen gedruckt,
 *                anderenfalls nur solche aus dem Projekt-Jahr
 */
IncommingsSubView.prototype.printIncommings = function(projYear) {

    var url = "getDocument/incommings_overview.pdf";
    var title = "Übersicht der Einnahmen";
    if (projYear) {
	url += "?proj-year=" + projYear;
	title += " (Projekt-Jahr " + projYear + ")";
    }
    new DocumentViewer(url, title);
}

/*---------------------------------------------------------------------------*/
/**
 * ProjectOverview
 */
var ProjectsOverview = function() {

    WorkSpaceTabbedFrame.call(this, "projects_overview");
    this.setTitle("Projekte verwalten");

    var self = this;
    this.subPanels = [];
    this.loadModel(function() {

	self.fillContent();
    });
}
ProjectsOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * lade das Model
 * 
 * @param onsuccess
 *                wird aufgerufen, wenn das Model erfolgreich geladen wurde
 */
ProjectsOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "projects-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_PROJECTS_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_PROJECTS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_PROJECTS_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_PROJECTS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-all-projects-req");
    caller.invokeService(req);

}

/**
 * befülle den Content
 * 
 */
ProjectsOverview.prototype.fillContent = function() {

    var allProjects = this.model.evaluateXPath("//projects-model/project");
    for (var i = 0; i < allProjects.length; i++) {

	this.renderOneProject(allProjects[i]);
    }
}

/**
 * rendere einen Record
 * 
 */
ProjectsOverview.prototype.renderOneProject = function(project) {

    var start = new Date(parseInt(project.getElementsByTagName("from")[0].textContent));
    var projYear = DateTimeUtils.getProjectYear(start);
    var subPanel = this.getSubPanelFor(projYear);
    subPanel.addRow(project);
}

/**
 * rendere einen Record
 * 
 */
ProjectsOverview.prototype.getSubPanelFor = function(projYear) {

    if (!this.subPanels[projYear]) {

	var title = projYear + ". Projektjahr";
	var tab = this.addTab("gui/images/folder.svg", title);

	var subPane = new ProjectsOverviewSubView(this, tab.contentPane, this.model);
	tab.associateTabPane(subPane);

	var currProjYear = DateTimeUtils.getProjectYear(new Date());
	if (currProjYear == projYear) {
	    tab.select();
	}
	this.subPanels[projYear] = subPane;
    }
    return this.subPanels[projYear];
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var ProjectsOverviewSubView = function(parentFrame, targetContainer, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetContainer);
    this.model = model;

    this.createTable(targetContainer);
    this.actionEdit = this.createEditAction();
    this.actionPrint = this.createPrintAction();
}
ProjectsOverviewSubView.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectsOverviewSubView.prototype.createTable = function(targetContainer) {

    var row = document.createElement("tr");

    var cell = document.createElement("th");
    row.appendChild(cell);

    cell = document.createElement("th");
    cell.textContent = "Name"
    row.appendChild(cell);

    cell = document.createElement("th");
    cell.textContent = "von-bis"
    row.appendChild(cell);

    var head = document.createElement("thead");
    head.appendChild(row);

    this.tbody = document.createElement("tbody");

    var table = document.createElement("table");
    table.appendChild(head);
    table.appendChild(this.tbody);
    new TableDecorator(table);

    targetContainer.appendChild(table);
}

/**
 * 
 */
ProjectsOverviewSubView.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/folder-edit.svg", "Projekt bearbeiten", function() {

	var id = self.currProj.getElementsByTagName("id")[0].textContent;
	new ProjectEditor(id);
    });

    this.addAction(action);
    action.hide();
    return action;
}
/**
 * 
 */
ProjectsOverviewSubView.prototype.createPrintAction = function() {
    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/folder-print.svg", "Drucken", function() {

	var id = self.currProj.getElementsByTagName("id")[0].textContent;
	var title = self.currProj.getElementsByTagName("name")[0].textContent;
	var url = "getDocument/projectDocument?id=" + id;
	new DocumentViewer(url, title);
    });

    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
ProjectsOverviewSubView.prototype.addRow = function(project) {

    var self = this;
    var onclick = function(tr, xmlNode) {

	self.currProj = xmlNode;
	self.actionEdit.show();
	self.actionPrint.show();
    }
    var row = this.model.createTableRow(project, this.getColumnDescriptor(), onclick);
    this.tbody.appendChild(row);
}

/**
 * 
 */
ProjectsOverviewSubView.prototype.getColumnDescriptor = function() {

    if (!this.COL_DESC) {

	this.COL_DESC = [];
	this.COL_DESC.push(function(td, xmlNode) {

	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "proj_overview_sel";
	    return radio;
	});
	this.COL_DESC.push("name");
	this.COL_DESC.push(function(td, xmlNode) {

	    var from = new Date(parseInt(xmlNode.getElementsByTagName("from")[0].textContent));
	    from = DateTimeUtils.formatDate(from, "{dd}.{mm}.{yyyy}");

	    var until = new Date(parseInt(xmlNode.getElementsByTagName("until")[0].textContent));
	    until = DateTimeUtils.formatDate(until, "{dd}.{mm}.{yyyy}");

	    return from + "-" + until;
	});
    }
    return this.COL_DESC;
}

/**
 * 
 */
ProjectsOverviewSubView.prototype.activate = function() {

    if (this.currProj) {
	this.actionEdit.show();
	this.actionPrint.show();
    }
}

/*---------------------------------------------------------------------------*/
/**
 * ProjectEditor
 */
var ProjectEditor = function(id) {

    WorkSpaceTabbedFrame.call(this, "project_editor");
    this.setTitle("Projekt bearbeiten");

    var self = this;
    this.loadModel(id, function() {

	self.createCoreEditor();
	self.createPlanningEditor();
	self.createPaymentEditor();
	self.createOutgoingsEditor();

	self.model.addChangeListener("//project-model/core-data/name", function() {
	    self.setupTitlebar();
	});
	self.setupTitlebar();

	self.model.addChangeListener("//project-model", function() {
	    self.enableSaveButton(true);
	});
    });
}
ProjectEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
ProjectEditor.prototype.setupTitlebar = function() {

    var name = this.model.getValue("//project-model/core-data/name");

    var from = new Date(parseInt(this.model.getValue("//project-model/core-data/from")));
    from = DateTimeUtils.formatDate(from, "{dd}.{mm}.{yyyy}");

    var until = new Date(parseInt(this.model.getValue("//project-model/core-data/until")));
    until = DateTimeUtils.formatDate(until, "{dd}.{mm}.{yyyy}");

    var title = "Projekt bearbeiten [" + name + " " + from + "-" + until + "]";
    this.setTitle(title);
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
	    var title = MessageCatalog.getMessage("LOAD_PROJ_MODEL_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_PROJ_MODEL_ERROR", rsp.getElemetsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_PROJ_MODEL_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_PROJ_MODEL_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-project-model-req");
    XmlUtils.setNode(req, "id", id);
    caller.invokeService(req);
}

/**
 * 
 */
ProjectEditor.prototype.createCoreEditor = function() {

    var tab = this.addTab("gui/images/info.svg", "Projekt-Beschreibung");
    var subPane = new ProjectCoreDataEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subPane);
    tab.select();

}

/**
 * 
 */
ProjectEditor.prototype.createPlanningEditor = function() {

    var tab = this.addTab("gui/images/money.svg", "Kosten planen");
    var subPane = new ProjectPlanningEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subPane);
}

/**
 * 
 */
ProjectEditor.prototype.createPaymentEditor = function() {

    var tab = this.addTab("gui/images/money-add.svg", "Finanzierung planen");
    var subPane = new ProjectPaymentEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subPane);
}

/**
 * 
 */
ProjectEditor.prototype.createOutgoingsEditor = function() {

    var tab = this.addTab("gui/images/money-remove.svg", "Ausgaben erfassen");
    var subPane = new ProjectOutgoingEditor(this, tab.contentPane, this.model);
    tab.associateTabPane(subPane);
}

/**
 * 
 */
ProjectEditor.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-incommings-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_PROJ_MODEL_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_PROJ_MODEL_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;

	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_PROJ_MODEL_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_PROJ_MODEL_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());
}

/*---------------------------------------------------------------------------*/
/**
 * SubEditor zur Darstellung der Core-Daten
 */
ProjectCoreDataEditor = function(parentFrame, targetContainer, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetContainer);
    this.model = model;

    var self = this;
    this.load("gui/accounting/project_core_editor.html", function() {

	UIUtils.getElement("edit_project_name").focus();

	self.model.createValueBinding("edit_project_name", "//project-model/core-data/name");
	self.model.createValueBinding("edit_project_description", "//project-model/core-data/description");

	var from = new Date(parseInt(self.model.getValue("//project-model/core-data/from")));
	from = DateTimeUtils.formatDate(from, "{dd}.{mm}.{yyyy}");

	var until = new Date(parseInt(self.model.getValue("//project-model/core-data/until")));
	until = DateTimeUtils.formatDate(until, "{dd}.{mm}.{yyyy}");

	UIUtils.getElement("edit_project_from_until").textContent = from + "-" + until;

	self.model.addChangeListener("//project-model/core-data", function() {

	    var action = self.model.getValue("//project-model/core-data/action");
	    if (action != "CREATE" && action != "MODIFY") {
		self.model.setValue("//project-model/core-data/action", "MODIFY");
	    }
	});
    });
}
ProjectCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectCoreDataEditor.prototype.activate = function() {

    var elem = UIUtils.getElement("edit_project_name");
    if (elem) {
	elem.focus();
    }
}

/*---------------------------------------------------------------------------*/
/**
 * SubEditor zur Planung der Projekt-Kosten
 */
ProjectPlanningEditor = function(parentFrame, targetContainer, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetContainer);
    this.model = model;

    this.actionAdd = this.createAddAction();
    this.actionRemove = this.createRemoveAction();

    var self = this;
    this.load("gui/accounting/project_planning_editor.html", function() {

	var allAccounts = AccountNumberUtil.getAccountIds();
	for (var i = 0; i < allAccounts.length; i++) {

	    var accId = allAccounts[i].id;
	    if (AccountNumberUtil.getType(accId) == AccountNumberUtil.OUTGO) {
		self.renderOneCategory(accId);
	    }
	}

	self.model.addChangeListener("//project-model/planning-items", function() {
	    self.updateTotal();
	});
	self.updateTotal();
    });
}
ProjectPlanningEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * Die AddAction wird nur angezeigt, wenn eine Category-Row selectiert ist. Ggf.
 * ist die Row collapsed, stelle also zuerst sicher das die Row expanded ist.
 * Erzeuge dann das neue Item aus dem XML-Template, rendere die Row und füge sie
 * ein.
 * 
 * Der XPath auf die neue Node wird als Member "currItemRow" im
 * ProjectPlanningEditor vermerkt, die neue Row als currItemRow.
 * 
 * Damit es normal ausschaut wird der RadioButton der Row selektiert und der
 * Focus auf die SelectBox der Row gestellt.
 * 
 * 
 */
ProjectPlanningEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-add.svg", "Planungs-Posten anlegen", function() {

	self.expand(self.currCategoryRow, true);
	var template = XmlUtils.parse(ProjectPlanningEditor.EMPTY_PLANNING_ITEM);

	self.currPlanningItem = self.model.addElement("//project-model/planning-items", template.documentElement);
	self.currItemRow = self.renderOneDataRow(self.currAccId, self.currPlanningItem);

	var body = UIUtils.getElement("project_planning_tbody");
	body.insertBefore(self.currItemRow, self.currCategoryRow.nextSibling);

	self.currItemRow.querySelector("input[type='radio']").checked = true;
	self.currItemRow.querySelector("select").focus();

	self.actionAdd.hide();
	self.actionRemove.show();

    });

    this.addAction(action);
    action.hide();
    return action;

}
ProjectPlanningEditor.EMPTY_PLANNING_ITEM = "<planning-item><id/><action>CREATE</action><proj-id/><inv-item-id>0</inv-item-id><amount>0</amount><description/></planning-item>";

/**
 * 
 */
ProjectPlanningEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-remove.svg", "Planungs-Posten löschen", function() {

	var title = MessageCatalog.getMessage("REMOVE_PLANNING_ITEM_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_PLANNING_ITEM_MESSG");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currPlanningItem + "/action") == "CREATE") {
		self.model.removeElement(self.currPlanningItem);

	    } else {
		self.model.setValue(self.currPlanningItem + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currItemRow);
	    self.currItemRow = self.currPlanningItem = null;
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
ProjectPlanningEditor.prototype.renderOneCategory = function(accId) {

    var body = UIUtils.getElement("project_planning_tbody");
    var catHeader = this.renderCategoryHeader(accId);
    body.appendChild(catHeader);

    var allItems = this.getPlanningItemsFor(accId);
    for (var i = 0; i < allItems.length; i++) {
	var row = this.renderOneDataRow(accId, allItems[i]);
	UIUtils.addClass(row, "hidden");
	body.appendChild(row);
    }
}

/**
 * liefere alle Planning-Items, welche auf ein Outgo-InvoiceItem mit der
 * angegebenen Kontonummer referenzieren
 */
ProjectPlanningEditor.prototype.getPlanningItemsFor = function(accId) {

    var result = [];

    var allItems = this.model.evaluateXPath("//project-model/planning-items/planning-item");
    for (var i = 0; i < allItems.length; i++) {

	var invItemId = allItems[i].getElementsByTagName("inv-item-id")[0].textContent;
	var invItemXPath = "//project-model/inout-items/inout-item[id='" + invItemId + "']/account";
	if (this.model.getValue(invItemXPath) == accId) {

	    result.push(XmlUtils.getXPathTo(allItems[i]));
	}
    }
    return result;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.renderCategoryHeader = function(accId) {

    var row = document.createElement("tr");

    var cell = document.createElement("td");
    var radio = this.createRadio();
    cell.appendChild(radio);
    row.appendChild(cell);

    cell = document.createElement("td");
    var exp = this.createExpander();
    cell.appendChild(exp);
    row.appendChild(cell);

    var cell = document.createElement("td");
    cell.textContent = this.createCategoryName(accId);
    row.appendChild(cell);

    var cell = document.createElement("td");
    cell.appendChild(this.createCategoryAmount(accId));
    row.appendChild(cell);

    var cell = document.createElement("td");
    row.appendChild(cell);

    var self = this;
    row.addEventListener("click", function(evt) {

	self.currAccId = accId;
	self.currCategoryRow = row;
	radio.checked = true;
	if (evt.target != exp) {
	    exp.click();
	    self.expand(row, exp.checked);
	}
	self.actionAdd.show();
	self.actionRemove.hide();
	self.currRow = row;
    });
    return row;
}

/*
 * Expandiere eine Category-Row
 * 
 * @param row @param expand
 */
ProjectPlanningEditor.prototype.expand = function(row, expand) {

    var btn = row.querySelector(".expand-button");
    btn.checked = expand;

    row = row.nextSibling;
    while (row && UIUtils.hasClass(row, "expandable")) {

	if (expand) {
	    UIUtils.removeClass(row, "hidden");
	} else {
	    UIUtils.addClass(row, "hidden");
	}
	row = row.nextSibling;
    }
}

/**
 * erzeuge eine Zeile, welche ein PlanningItem representiert.
 */
ProjectPlanningEditor.prototype.renderOneDataRow = function(accId, xpath) {

    var row = document.createElement("tr");
    row.className = "expandable";
    row.appendChild(document.createElement("td"));

    var cell = document.createElement("td");
    var radio = this.createRadio();
    cell.appendChild(radio);
    row.appendChild(cell);

    cell = document.createElement("td");
    var sel = this.createOutgoingSelector(accId, xpath);
    cell.appendChild(sel);
    row.appendChild(cell);

    cell = document.createElement("td");
    var amount = this.createAmountEntry(xpath);
    cell.appendChild(amount);
    row.appendChild(cell);

    cell = document.createElement("td");
    var desc = this.createDescriptionEntry(xpath);
    cell.appendChild(desc);
    row.appendChild(cell);

    var self = this;
    row.addEventListener("click", function() {
	radio.click();
	self.currAccId = accId;
	self.currPlanningItem = xpath;
	self.currItemRow = row;

	self.actionAdd.hide();
	self.actionRemove.show();
    });

    this.model.addChangeListener(xpath, function() {

	var action = self.model.getValue(xpath + "/action");
	if (action != "CREATE" && action != "MODIFY" && action != "REMOVE") {
	    self.model.setValue(xpath + "/action", "MODIFY");
	    console.log(self.model.stringify());
	}
    });

    return row;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createRadio = function() {

    var input = document.createElement("input");
    input.type = "radio";
    input.name = "project_planning_sel";
    return input;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createExpander = function() {

    var input = document.createElement("input");
    input.type = "checkbox";
    input.className = "expand-button";
    return input;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createCategoryName = function(accId) {

    var text = accId + " - " + AccountNumberUtil.translate(accId);
    return text;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createCategoryAmount = function(accId) {

    var amount = document.createElement("div");
    amount.className = "currency-input";

    var self = this;
    var updateCategoryTotal = function() {

	var total = 0;
	var allItems = self.getPlanningItemsFor(accId);
	for (var i = 0; i < allItems.length; i++) {
	    total += parseFloat(self.model.getValue(allItems[i] + "/amount"));
	}
	amount.textContent = CurrencyUtils.formatCurrency(total);
    }
    this.model.addChangeListener("//project-model/planning-items", function() {
	updateCategoryTotal();
    });
    updateCategoryTotal();
    return amount;
}

/**
 * Erzeuge die SELECT-box mit der Liste aller für die accId vorhandenen
 * INOUT-Items
 */
ProjectPlanningEditor.prototype.createOutgoingSelector = function(accId, xpath) {

    var sel = document.createElement("select");
    sel.className = "inplace-select mandatory";

    var opt = document.createElement("option");
    opt.textContent = "Buchungs-Posten";
    opt.select = opt.disabled = true;
    opt.value = "0";
    sel.appendChild(opt);

    var allItems = this.model.evaluateXPath("//project-model/inout-items/inout-item[account='" + accId + "']");
    for (var i = 0; i < allItems.length; i++) {

	opt = document.createElement("option");
	opt.textContent = accId + " - " + allItems[i].getElementsByTagName("name")[0].textContent;
	opt.value = allItems[i].getElementsByTagName("id")[0].textContent;
	sel.appendChild(opt);
    }
    this.model.createValueBinding(sel, xpath + "/inv-item-id");
    return sel;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createAmountEntry = function(xpath) {

    var input = document.createElement("input");
    input.className = "inplace-edit currency-input mandatory";

    this.model.createCurrencyValueBinding(input, xpath + "/amount");
    new NumericInputField(input);
    return input;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.createDescriptionEntry = function(xpath) {

    var input = document.createElement("textarea");
    input.className = "inplace-textarea mandatory";

    this.model.createValueBinding(input, xpath + "/description");

    return input;
}

/**
 * 
 */
ProjectPlanningEditor.prototype.updateTotal = function() {

    var total = 0;
    var allAmounts = this.model.evaluateXPath("//project-model/planning-items/planning-item/amount");
    for (var i = 0; i < allAmounts.length; i++) {
	total += parseFloat(allAmounts[i].textContent);
    }
    UIUtils.getElement("project_planning_total").textContent = CurrencyUtils.formatCurrency(total);
}

/*---------------------------------------------------------------------------*/
/**
 * Plane die Finazierung eines Projektes
 */
ProjectPaymentEditor = function(parentFrame, targetContainer, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetContainer);
    this.model = model;
    this.currSel = null;
    this.currRow = null;

    this.actionAdd = this.createAddAction();
    this.actionRemove = this.createRemoveAction();

    var self = this;
    this.load("gui/accounting/project_payment_editor.html", function() {
	self.fillContent();

	self.model.addChangeListener("//project-model", function() {
	    self.updateTotal();
	});
	self.updateTotal();
    });
}
ProjectPaymentEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectPaymentEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-add.svg", "Finanzierung anlegen", function() {

	var doc = XmlUtils.parse(ProjectPaymentEditor.EMPTY_RECORD);
	XmlUtils.setNode(doc, "target", self.getProjItemId());
	XmlUtils.setNode(doc, "date", new Date().getTime());
	var xpath = self.model.addElement("//project-model/invoice-records", doc.documentElement);
	var row = self.renderOneRecord(xpath);

	UIUtils.getElement("project_payment_tbody").appendChild(row);
	row.click();
	row.querySelector("input[type='radio']").checked = true;
	row.querySelector("select").focus();
    });

    this.addAction(action);
    action.hide();
    return action;
}
ProjectPaymentEditor.EMPTY_RECORD = "<invoice-record><id/><action>CREATE</action><source/><target/><amount>0</amount><description/><date/></invoice-record>";

/**
 * 
 */
ProjectPaymentEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/planning-item-remove.svg", "Finanzierung löschen", function() {

	var title = MessageCatalog.getMessage("REMOVE_PAYMENT_ITEM_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_PAYMENT_ITEM_MESSG");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var action = self.model.getValue(self.currSel + "/action");
	    if (action == "CREATE") {
		self.model.removeElement(self.currSel);
	    } else {
		self.model.setValue(self.currSel + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currRow);
	    self.currRow = self.currSel = null;
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
    if (this.currSel) {
	this.actionRemove.show();
    }
}

/**
 * 
 */
ProjectPaymentEditor.prototype.getProjItemId = function() {

    return this.model.getValue("//project-model/project-item/id");
}

/**
 * 
 */
ProjectPaymentEditor.prototype.fillContent = function() {

    var tbody = UIUtils.getElement("project_payment_tbody");

    var projItemId = this.getProjItemId();
    var allRecords = this.model.evaluateXPath("//project-model/invoice-records/invoice-record[target='" + projItemId + "']");
    for (var i = 0; i < allRecords.length; i++) {

	var xpath = XmlUtils.getXPathTo(allRecords[i]);
	var row = this.renderOneRecord(xpath);
	tbody.appendChild(row);
    }
}

/**
 * 
 */
ProjectPaymentEditor.prototype.renderOneRecord = function(xpath) {

    var row = document.createElement("tr");

    var cell = document.createElement("td");
    var radio = this.createRadio();
    cell.appendChild(radio);
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(this.createItemSelector(xpath));
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(this.createAmountItem(xpath));
    row.appendChild(cell);

    cell = document.createElement("td");
    cell.appendChild(this.createDescription(xpath));
    row.appendChild(cell);

    var self = this;
    row.addEventListener("click", function() {
	radio.checked = true;
	self.currSel = xpath;
	self.currRow = row;
	self.actionRemove.show();
    });

    this.model.addChangeListener(xpath, function() {

	var action = self.model.getValue(xpath + "/action");
	if (action == "NONE") {
	    self.model.setValue(xpath + "/action", "MODIFY");
	}
    });
    return row;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.createRadio = function() {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "project_payment_editor_sel";
    return radio;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.createItemSelector = function(xpath) {

    var sel = document.createElement("select");
    sel.className = "inplace-select mandatory";

    var opt = document.createElement("option");
    opt.disabled = opt.selected = true;
    opt.textContent = "Eingangs-Konto";
    opt.value = "";
    sel.appendChild(opt);

    var allInvItems = this.model.evaluateXPath("//project-model/inout-items/inout-item");
    for (var i = 0; i < allInvItems.length; i++) {

	var account = allInvItems[i].getElementsByTagName("account")[0].textContent;
	if (AccountNumberUtil.getType(account) == AccountNumberUtil.INCOME) {

	    var name = allInvItems[i].getElementsByTagName("name")[0].textContent;
	    var id = allInvItems[i].getElementsByTagName("id")[0].textContent;
	    opt = document.createElement("option");
	    opt.textContent = account + " - " + name;
	    opt.value = id;
	    sel.appendChild(opt);
	}
    }
    this.model.createValueBinding(sel, xpath + "/source");
    return sel;

}

/**
 * 
 */
ProjectPaymentEditor.prototype.createAmountItem = function(xpath) {

    var input = document.createElement("input");
    input.className = "inplace-edit currency-input mandatory";

    this.model.createCurrencyValueBinding(input, xpath + "/amount");
    new NumericInputField(input);

    return input;

}

/**
 * 
 */
ProjectPaymentEditor.prototype.createDescription = function(xpath) {

    var input = document.createElement("textarea");
    input.className = "inplace-textarea mandatory";

    this.model.createValueBinding(input, xpath + "/description");

    return input;
}

/**
 * 
 */
ProjectPaymentEditor.prototype.updateTotal = function() {

    var projItemId = this.getProjItemId();
    var payed = 0;
    var allPayed = this.model.evaluateXPath("//project-model/invoice-records/invoice-record[target='" + projItemId + "']/amount");
    for (var i = 0; i < allPayed.length; i++) {
	payed += parseFloat(allPayed[i].textContent);
    }

    var planned = 0;
    var allPlanned = this.model.evaluateXPath("//project-model/planning-items/planning-item/amount");
    for (var i = 0; i < allPlanned.length; i++) {
	planned += parseFloat(allPlanned[i].textContent);
    }

    UIUtils.getElement("project_payment_total").textContent = CurrencyUtils.formatCurrency(planned - payed);

}

/*---------------------------------------------------------------------------*/
/**
 * Plane die Finazierung eines Projektes
 */
ProjectOutgoingEditor = function(parentFrame, targetContainer, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetContainer);
    this.model = model;
    this.currSel = null;
    this.currRow = null;
    this.currCat = null;

    this.actionAdd = this.createAddAction();
    this.actionRemove = this.createRemoveAction();

    var self = this;
    this.load("gui/accounting/project_outgoing_editor.html", function() {

	self.model.addChangeListener("//project-model/planning-items", function() {
	    self.fillContent();
	});
	self.fillContent();

	self.model.addChangeListener("//project-model/planning-items", function() {
	    self.updatePlannedTotal();
	});
	self.updatePlannedTotal();

	self.model.addChangeListener("//project-model/invoice-records", function() {
	    self.updatePayedTotal();
	});
	self.updatePayedTotal();
    });
}
ProjectOutgoingEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ProjectOutgoingEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-add.svg", "Ausgabe anlegen", function() {

	var doc = XmlUtils.parse(ProjectOutgoingEditor.EMPTY_RECORD);
	XmlUtils.setNode(doc, "target", self.model.getValue(self.currCat + "/inv-item-id"));
	XmlUtils.setNode(doc, "source", self.getProjItemId());
	XmlUtils.setNode(doc, "date", new Date().getTime());

	self.currSel = self.model.addElement("//project-model/invoice-records", doc.documentElement);
	var record = self.model.evaluateXPath(self.currSel)[0];
	self.currRow = self.createInvRecordRow(record);
	self.currCatRow.parentNode.insertBefore(self.currRow, self.currCatRow.nextSibling);
	self.currRow.querySelector("input[type='radio'").checked = true;
	self.currRow.querySelector(".inplace-edit").focus();

	self.actionAdd.hide();
	self.actionRemove.show();

    });

    this.addAction(action);
    action.hide();
    return action;
}
ProjectOutgoingEditor.EMPTY_RECORD = "<invoice-record><id/><action>CREATE</action><source/><target/><amount>0</amount><description/><date/></invoice-record>";

/**
 * 
 */
ProjectOutgoingEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/money-remove.svg", "Ausgabe löschen", function() {

	var title = MessageCatalog.getMessage("REMOVE_OUTGOING_ITEM_TITLE");
	var messg = MessageCatalog.getMessage("REMOVE_OUTGOING_ITEM_MESSG");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var action = self.model.getValue(self.currSel + "/action");
	    if (action == "CREATE") {
		self.model.removeElement(self.currSel);
	    } else {
		self.model.setValue(self.currSel + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currRow);
	    self.currRow = self.currSel = null;
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
ProjectOutgoingEditor.prototype.activate = function() {

    if (self.currCat) {
	this.actionAdd.show();
    }
    if (this.currSel) {
	this.actionRemove.show();
    }
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.fillContent = function() {

    var body = UIUtils.getElement("project_outgoing_tbody");
    UIUtils.clearChilds(body);
    this.CAT_COL_DESC = null; // avoid Closure-Probs

    var allItems = this.model.evaluateXPath("//project-model/planning-items/planning-item");
    for (var i = 0; i < allItems.length; i++) {

	this.handleOneCategory(allItems[i]);
    }
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.getProjItemId = function() {

    return this.model.getValue("//project-model/project-item/id");
}

/**
 * Behandle eine Kategory (also eigentlich ein PlanningItem). Es wird die CatRow
 * generiert und darunter alle passenden InvoiceRecords.
 * 
 * "Passend" ist ein Invoice-Record, wenn folgende Bedingunen zutreffen:
 * <ul>
 * <li>der InvoiceRecord hat als Source die ItemId des ProjectinvoiceItems</li>
 * <li>der InvoiceRecord hat als Target die ItemId des mit dem PlanningItem
 * assozierten InvoiceItems</li>
 * </ul>
 */
ProjectOutgoingEditor.prototype.handleOneCategory = function(item) {

    var body = UIUtils.getElement("project_outgoing_tbody");

    var row = this.createCategoryRow(item);
    body.appendChild(row);

    var invItemId = item.getElementsByTagName("inv-item-id")[0].textContent;
    var allRecs = this.model.evaluateXPath(this.createInvoiceRecordsXPath(invItemId));
    for (var i = 0; i < allRecs.length; i++) {

	row = this.createInvRecordRow(allRecs[i]);
	UIUtils.addClass(row, "hidden");
	body.appendChild(row);
    }
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createCategoryRow = function(item) {

    var self = this;
    var onclick = function(row, item) {

	var expand = row.querySelector(".expand-button").checked;
	var node = row.nextSibling;
	while (node && UIUtils.hasClass(node, "expandable")) {

	    if (expand) {
		UIUtils.removeClass(node, "hidden");
	    } else {
		UIUtils.addClass(node, "hidden");
	    }
	    node = node.nextSibling;
	}
	self.currCat = XmlUtils.getXPathTo(item);
	self.currCatRow = row;
	self.actionAdd.show();
	self.actionRemove.hide();

    }

    return this.model.createTableRow(item, this.getCategoryColDesc(), onclick);
}

/**
 * Liefere den ColumnDescriptor für eine Kategorie-Zeile. Um diesen nicht immer
 * wieder aufbauen zu müssen, wird er lazy erzeugt und an die aktuelle Instanz
 * des ProjectOutgoingEditor gehängt.
 */
ProjectOutgoingEditor.prototype.getCategoryColDesc = function() {

    var self = this;
    if (!this.CAT_COL_DESC) {

	this.CAT_COL_DESC = [];
	this.CAT_COL_DESC.push(function(td, item) {

	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "project_outgoing_editor_sel";
	    return radio;
	});

	this.CAT_COL_DESC.push(function(td, item) {

	    var exp = document.createElement("input");
	    exp.type = "checkbox";
	    exp.className = "expand-button";
	    return exp;
	});

	this.CAT_COL_DESC.push(function(td, item) {

	    var invItemId = item.getElementsByTagName("inv-item-id")[0].textContent;
	    var xpath = "//project-model/inout-items/inout-item[id='" + invItemId + "']";
	    return self.model.getValue(xpath + "/account") + " - " + self.model.getValue(xpath + "/name");
	});

	this.CAT_COL_DESC.push(function(td, item) {

	    UIUtils.addClass(td, "currency-input");
	    var amount = item.getElementsByTagName("amount")[0].textContent;
	    return CurrencyUtils.formatCurrency(amount);
	});

	this.CAT_COL_DESC.push(function(td, item) {

	    UIUtils.addClass(td, "currency-input");

	    var invItemId = item.getElementsByTagName("inv-item-id")[0].textContent;

	    self.model.addChangeListener("//project-model/invoice-records", function() {
		td.textContent = self.calculateCategoryTotal(invItemId);
	    });
	    return self.calculateCategoryTotal(invItemId);
	});

	this.CAT_COL_DESC.push("");
    }
    return this.CAT_COL_DESC;
}

/**
 * Eine Kategorie-Zeile aktualisieren
 */
ProjectOutgoingEditor.prototype.calculateCategoryTotal = function(invItemId) {

    var total = 0;
    var xpath = this.createInvoiceRecordsXPath(invItemId) + "/amount";
    var allRecs = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allRecs.length; i++) {

	total += parseFloat(allRecs[i].textContent);
    }

    return CurrencyUtils.formatCurrency(total);
}

/**
 * Erzeuge den XPATH, welcher alle InvoiceRecords referenziert, welche das
 * ProjectItem als Quelle und das InvoiceItem mit der angegegeben ID als Target
 * haben
 */
ProjectOutgoingEditor.prototype.createInvoiceRecordsXPath = function(invItemId) {

    return "//project-model/invoice-records/invoice-record[source='" + this.getProjItemId() + "'][target='" + invItemId + "']";
}

/**
 * 
 */
ProjectOutgoingEditor.prototype.createInvRecordRow = function(record) {

    var xpath = XmlUtils.getXPathTo(record);
    var self = this;
    var onclick = function(row, record) {

	self.currRow = row;
	self.currSel = xpath;
	self.actionAdd.hide();
	self.actionRemove.show();
    }

    var row = this.model.createTableRow(record, this.getRecordColDesc(), onclick);
    UIUtils.addClass(row, "expandable");

    var self = this;
    self.model.addChangeListener(xpath, function() {
	var action = self.model.getValue(xpath + "/action");
	if (action == "NONE") {
	    self.model.setValue(xpath + "/action", "MODIFY");
	}
    });
    return row;

}

/**
 * Liefere den ColumnDescriptor für eine Record-Zeile. Um diesen nicht immer
 * wieder aufbauen zu müssen, wird er lazy erzeugt und an die aktuelle Instanz
 * des ProjectOutgoingEditor gehängt.
 */
ProjectOutgoingEditor.prototype.getRecordColDesc = function() {

    var self = this;
    if (!this.REC_COL_DESC) {

	this.REC_COL_DESC = [];

	this.REC_COL_DESC.push("");

	this.REC_COL_DESC.push(function(td, record) {
	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "project_outgoing_editor_sel";
	    return radio;
	});

	this.REC_COL_DESC.push(function(td, record) {
	    td.colSpan = "2";
	    return "";
	});

	this.REC_COL_DESC.push(function(td, record) {

	    var input = document.createElement("input");
	    input.className = "currency-input inplace-edit mandatory";

	    self.model.createCurrencyValueBinding(input, XmlUtils.getXPathTo(record) + "/amount");
	    new NumericInputField(input);
	    return input;
	});

	this.REC_COL_DESC.push(function(td, record) {

	    var input = document.createElement("textarea");
	    input.className = "inplace-textarea mandatory";

	    self.model.createValueBinding(input, XmlUtils.getXPathTo(record) + "/description");
	    return input;

	});
    }
    return this.REC_COL_DESC;
}

/**
 * berechne die summe aller geplanten Items
 */
ProjectOutgoingEditor.prototype.updatePlannedTotal = function() {

    var total = 0;

    var allPlannings = this.model.evaluateXPath("//project-model/planning-items/planning-item/amount");
    for (var i = 0; i < allPlannings.length; i++) {

	total += parseFloat(allPlannings[i].textContent);
    }
    UIUtils.getElement("project_outgoing_planned_total").textContent = CurrencyUtils.formatCurrency(total);
}

/**
 * berechne die summe aller gezahlten Items
 */
ProjectOutgoingEditor.prototype.updatePayedTotal = function() {

    var total = 0;

    var projItemId = this.getProjItemId();
    var allPlannings = this.model.evaluateXPath("//project-model/invoice-records/invoice-record[source='" + projItemId + "']/amount");
    for (var i = 0; i < allPlannings.length; i++) {

	total += parseFloat(allPlannings[i].textContent);
    }
    UIUtils.getElement("project_outgoing_payed_total").textContent = CurrencyUtils.formatCurrency(total);
}
