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
    this.targetCnr.focus();
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
	
	var row = self.renderOneNote(self.model.evaluateXPath(self.currNote)[0]);
	row.querySelector(".mandatory").focus();
    });
    this.addAction(action);
    action.hide();
    
    this.keyMap[187] = function() {
	action.invoke();
    }
    return action;
}
NotesOverview.EMPTY_NOTE = "<note><action>CREATE</action><id/><type></type><description/></note>";

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
    
    this.keyMap[46] = function() {
	action.invoke();
    }

    return action;
}

/**
 * 
 */
NotesOverview.prototype.fillTable = function() {

    var tbody = UIUtils.getElement("edit_notes_overview_body");
    UIUtils.clearChilds(tbody);
    
    var allNotes = this.model.evaluateXPath(this.xPath + "/note[action != 'REMOVE']");
    for(var i = 0; i < allNotes.length; i++) {
	var row = this.renderOneNote(allNotes[i]);
    }
}

/**
 * 
 */
NotesOverview.prototype.renderOneNote = function(note) {

    var self = this;
    var onclick = function(tr, note) {

	self.currRow = tr;
	self.currNote = XmlUtils.getXPathTo(note);
	self.actionRemove.show();
    }

    var row = this.model.createTableRow(note, this.getColumnDescriptor(), onclick);
    UIUtils.getElement("edit_notes_overview_body").appendChild(row);
    return row;
}

/**
 * 
 */
NotesOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    
    if(!NotesOverview.COL_DESC) {
	
	NotesOverview.COL_DESC = [];
	NotesOverview.COL_DESC.push(function(td, note) {
	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "notes_overview";
	    radio.value = note.getElementsByTagName("id")[0].textContent;
	    return radio;
	});
	
	NotesOverview.COL_DESC.push(function(td, note) {
	    return self.createTypeSelector(note);
	});
	
	NotesOverview.COL_DESC.push(function(td, note) {
	    return self.createDescriptionEdit(note);
	});
    }
    return NotesOverview.COL_DESC;
}

/**
 * 
 */
NotesOverview.prototype.createTypeSelector = function(note) {

    var selector = document.createElement("select");
    selector.className = "inplace-select mandatory";

    for (var i = 0; i < NotesOverview.TYPE_MAP.length; i++) {
	var opt = document.createElement("option");
	opt.value = NotesOverview.TYPE_MAP[i].name;
	opt.textContent = NotesOverview.TYPE_MAP[i].value;
	if (i == 0) {
	    opt.disabled = "disabled";
	    opt.selected = "selected";
	}
	selector.add(opt);
    }

    this.model.createValueBinding(selector, XmlUtils.getXPathTo(note) + "/type", "change");
    return selector;
}

/**
 * 
 */
NotesOverview.TYPE_MAP = [ {
    name : "",
    value : "Art der Notiz"
}, {
    name : "COMMON",
    value : "Allgemeiner Hinweis"
}, {
    name : "DIET",
    value : "Ernährung"
}, {
    name : "MEDICAL",
    value : "Medizinischer Hinweis"
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
