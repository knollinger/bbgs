/*---------------------------------------------------------------------------*/
/**
 * Die Übersicht über alle Notizen
 */
var NotesOverview = function(parentFrame, targetCnr, model, xPath) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.model = model;
    this.xPath = xPath;
    this.currNote = null;
    this.currRow = null;

    var self = this;
    this.load("gui/notes/notes_overview.html", function() {

	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();

	new TableDecorator("edit_notes_overview");
	self.fillTable();

    });
}

/**
 * Wir erben von WorkSpaceFrame
 */
NotesOverview.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
NotesOverview.prototype.activate = function() {

    this.actionAdd.show();
    if (this.currNote) {
	this.actionRemove.show();
    } else {
	this.actionRemove.hide();
    }
}

/**
 * Erzeugt die Action, um einen neuen Anhang hinzu zu fügen
 */
NotesOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/note-add.svg", "Notiz hinzufügen", function() {

	var note = new Model(XmlUtils.parse(NotesOverview.EMPTY_NOTE));
	note.setValue("//note//id", UUID.create("notes_"));
	self.currNote = self.model.addElement(self.xPath, note.getDocument().documentElement);
	self.fillTable();
    });
    this.addAction(action);
    action.hide();
    return action;
}
NotesOverview.EMPTY_NOTE = "<note><action>CREATE</action><id/><type/><description/></note>";

/**
 * erzeugt die action, um einen Anhang zu löschen
 */
NotesOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/note-remove.svg", "Notiz löschen", function() {

	var messg = MessageCatalog.getMessage("NOTE_QUERY_REMOVE");
	var title = MessageCatalog.getMessage("NOTE_QUERY_REMOVE_TITLE");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currNote + "/action") == "CREATE") {
		self.model.removeElement(self.currNote);
	    } else {
		self.model.setValue(self.currNote + "/action", "REMOVE");
	    }
	    UIUtils.removeElement(self.currRow);
	    self.currRow = self.currNote = null;
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
NotesOverview.prototype.fillTable = function() {

    var self = this;

    // gelöschte Notes werden nicht angezeigt
    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, note) {

	var radio = "edit_notes_radio_" + note.getElementsByTagName("id")[0].textContent;
	radio = document.getElementById(radio);
	radio.click();

	self.currRow = tr;
	self.currNote = XmlUtils.getXPathTo(note);
	self.actionRemove.show();
    }

    var fields = this.getColumnDescriptor();

    var tab = UIUtils.getElement("edit_notes_overview_body");
    UIUtils.clearChilds(tab);

    var allNotes = this.model.evaluateXPath(this.xPath + "/note");
    for (var i = 0; i < allNotes.length; i++) {

	var note = allNotes[i];
	if (note.getElementsByTagName("action")[0].textContent != "REMOVE") {
	    this.renderOneRow(note, tab, fields, onclick);
	}
    }
    //
    // this.model.createTableBinding("edit_notes_overview", fields, allNotes,
    // onclick, filter);
    // this.currRow = this.currNote = null;
    self.actionRemove.hide();
}

NotesOverview.prototype.renderOneRow = function(note, tab, fields, onclick) {

    var row = this.model.createTableRow(note, fields, onclick);
    tab.appendChild(row);

    note.addEventListener("change", function() {

	var action = note.getElementsByTagName("action")[0];
	if (action.textContent != "CREATE" && action.textContent != "REMOVE") {
	    action.textContent = "MODIFY";
	}
    });
}

/**
 * 
 */
NotesOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, note) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "notes_overview";
	radio.id = "edit_notes_radio_" + note.getElementsByTagName("id")[0].textContent;
	radio.value = note.getElementsByTagName("id")[0].textContent;
	return radio;
    });

    fields.push(function(td, note) {
	return self.createTypeSelector(note);
    });

    fields.push(function(td, note) {
	return self.createDescriptionEdit(note);
    });
    return fields;
}

/**
 * 
 */
NotesOverview.prototype.createTypeSelector = function(note) {

    var selector = document.createElement("select");
    selector.className = "inplace-select mandatory";

    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Art der Notiz";
    opt.selected = opt.disabled = true;
    selector.add(opt);

    for (var i = 0; i < NotesOverview.TYPE_MAP.length; i++) {
	opt = document.createElement("option");
	opt.value = NotesOverview.TYPE_MAP[i].name;
	opt.textContent = NotesOverview.TYPE_MAP[i].value;
	selector.add(opt);
    }
    this.model.createValueBinding(selector, XmlUtils.getXPathTo(note) + "/type", "change");
    return selector;
}

/**
 * 
 */
NotesOverview.TYPE_MAP = [ {
    name : "DIET",
    value : "Ernährung"
}, {
    name : "MEDICAL",
    value : "Medizinischer Hinweis"
}, {
    name : "COMMON",
    value : "Allgemeiner Hinweis"
}, {
    name : "OTHER",
    value : "Sonstiges"
} ];

/**
 * 
 */
NotesOverview.prototype.createDescriptionEdit = function(note) {

    var edit = document.createElement("textarea");
    edit.className = "inplace-textarea mandatory";

    this.model.createValueBinding(edit, XmlUtils.getXPathTo(note) + "/description", "change");

    return edit;
}
