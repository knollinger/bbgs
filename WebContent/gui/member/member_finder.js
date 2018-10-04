/**
 * Der MemberFinder
 */
var MemberFinder = function(multiSelect, onSubmit) {

    WorkSpaceFrame.call(this);

    this.multSel = multiSelect;
    this.onsubmit = onSubmit;
    this.selection = [];
    this.timer = undefined;

    this.model = new Model(XmlUtils.createDocument("members"));

    var self = this;
    this.load("gui/member/member_finder.html", function() {

	self.setupUI();

	// self.model.addChangeListener("//members", function() {
	// self.reloadTable();
	// });
    });
}
MemberFinder.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberFinder.prototype.setupUI = function() {

    var self = this;

    var search = UIUtils.getElement("member_finder_search");
    search.focus();
    search.addEventListener("input", function() {
	self.onSearchInput();
    });

    var showAll = UIUtils.getElement("member_finder_show_all");
    showAll.addEventListener("click", function() {
	self.onShowAll();
    });
}

/**
 * 
 */
MemberFinder.prototype.onSearchInput = function() {

    var search = UIUtils.getElement("member_finder_search");
    var showAll = UIUtils.getElement("member_finder_show_all");
    var resultset = UIUtils.getElement("member_finder_resultset");

    this.stopTimer();
    showAll.checked = false;
    if (search.value) {
	this.startTimer();
    } else {
	UIUtils.clearChilds("member_finder_body");
    }
}

/**
 * 
 */
MemberFinder.prototype.onShowAll = function() {

    var search = UIUtils.getElement("member_finder_search");
    var showAll = UIUtils.getElement("member_finder_show_all");

    this.stopTimer();
    search.value = "";
    if (showAll.checked) {
	this.invokeService(true);
    } else {
	this.selection = [];
	this.onSelectionChange();
	UIUtils.clearChilds("member_finder_body");
    }
}

/**
 * 
 */
MemberFinder.prototype.stopTimer = function() {

    if (this.timer) {
	window.clearTimeout(this.timer);
	this.timer = undefined;
    }
}

/**
 * 
 */
MemberFinder.prototype.startTimer = function() {

    var self = this;
    this.timer = window.setTimeout(function() {
	self.invokeService(false);
    }, 500);
}

/**
 * 
 */
MemberFinder.prototype.invokeService = function(showAll) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "member-finder-ok-rsp":
	    self.model.removeChilds("//members");
	    self.model.addElements("//members", XmlUtils.evaluateXPath(rsp, "//member-finder-ok-rsp/members/member"));
	    self.reloadTable(showAll);
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("MEMBER_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("MEMBER_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.WARNING, title, messg);
	    break;
	}
    };

    caller.onError = function(response, status) {
	var title = MessageCatalog.getMessage("MEMBER_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("MEMBER_LOAD_TECH_ERROR", status);
	new MessageBox(MessageBox.WARNING, title, messg);
    };

    var req = XmlUtils.createDocument("member-finder-req");
    if (showAll) {
	XmlUtils.setNode(req, "show-all", "true");
    } else {
	XmlUtils.setNode(req, "query", UIUtils.getElement("member_finder_search").value);
    }
    caller.invokeService(req);
}

/**
 * 
 */
MemberFinder.prototype.reloadTable = function(showAll) {

    var self = this;

    var fields = this.getColumnDescriptor();
    var onclick = function(tr, member) {
	self.onResultSetSelection(tr, member);
    }

    UIUtils.clearChilds("member_finder_body");
    if (showAll) {
	this.fillByFoundLocation(null, fields, onclick);

    } else {
	this.fillByFoundLocation("MEMBER", fields, onclick);
	this.fillByFoundLocation("COMMDATA", fields, onclick);
	this.fillByFoundLocation("CONTACTS", fields, onclick);
	this.fillByFoundLocation("COURSES", fields, onclick);
	this.fillByFoundLocation("NOTES", fields, onclick);
    }
}

/**
 * 
 */
MemberFinder.prototype.fillByFoundLocation = function(location, fields, onclick) {

    var xpath = "//members/member";
    if (location) {
	xpath += "/locations[location='" + location + "']";
    }
    var allFound = this.model.evaluateXPath(xpath);

    if (allFound.length) {

	var tbody = this.makeTable(location);
	for (var i = 0; i < allFound.length; i++) {

	    var member = allFound[i]; // .parentElement;
	    if (location) {
		member = member.parentElement;
	    }
	    var row = this.model.createTableRow(member, fields, onclick);
	    tbody.appendChild(row);

	}
    }
}

/**
 * 
 */
MemberFinder.prototype.makeTable = function(location) {

    var thead = document.createElement("thead");
    var row = document.createElement("tr");
    thead.appendChild(row);
    row.appendChild(document.createElement("th"));

    var span = document.createElement("th");
    span.textContent = this.getFoundLocationHeader(location);
    row.appendChild(span);

    var tbody = document.createElement("tbody");    
    var table = document.createElement("table");
    table.appendChild(thead);
    table.appendChild(tbody);
    table.style.marginBottom = "10px";

    new TableDecorator(table);
    UIUtils.getElement("member_finder_body").appendChild(table);
    
    return tbody;
}

/**
 * 
 */
MemberFinder.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, member) {

	var ui = document.createElement("input");
	ui.type = (self.multSel) ? "checkbox" : "radio";
	ui.name = "member_finder_selected";
	return ui;
    });

    fields.push(function(tr, member) {
	return member.getElementsByTagName("zname")[0].textContent + ", " + member.getElementsByTagName("vname")[0].textContent;
    });
    return fields;
}

/**
 * 
 */
MemberFinder.prototype.getFoundLocationHeader = function(location) {

    var result;
    switch (location) {
    case null:
	result = "Alle Mitglieder";
	break;

    case "MEMBER":
	result = "Gefunden in den Mitglieds-Daten von:";
	break;

    case "COURSES":
	result = "Gefunden in den Kursen von:";
	break;

    case "NOTES":
	result = "Gefunden in den Notizen von:";
	break;

    case "CONTACTS":
	result = "Gefunden in den Kontakten von:";

	break;
    }
    return result;
}

/**
 * 
 */
MemberFinder.prototype.onResultSetSelection = function(tr, member) {

    var radio = tr.querySelector("input");

    if (this.multSel) {
	if (radio.checked) {
	    this.selection.push(member);
	} else {
	    this.selection.remove(member);
	}
    } else {
	this.selection = [].concat(member);
    }
    this.onSelectionChange(this.selection);
}

/**
 * callback für die DialogMethode save()
 */
MemberFinder.prototype.onSave = function() {

    if (this.onsubmit) {
	this.onsubmit(this.selection);
    }
}

/**
 * 
 */
MemberFinder.prototype.onSelectionChange = function(selection) {

    this.enableSaveButton(selection && selection.length);
}

/*---------------------------------------------------------------------------*/
/**
 * MemberOverview
 * 
 * Eine spezialisierung des MemberFinders, welche noch die Actions AddMember,
 * EditMember und RemoveMember einbringt
 */
var MemberOverview = function() {

    MemberFinder.call(this, false, null);
    this.createActions();
}
MemberOverview.prototype = Object.create(MemberFinder.prototype);

/**
 * 
 */
MemberOverview.prototype.createActions = function() {

    var self = this;
    this.actionEdit = new WorkSpaceFrameAction("gui/images/person-edit.svg", "Ein Mitglied bearbeiten", function() {
	self.close();
	new MemberEditor(self.selection[0].getElementsByTagName("id")[0].textContent);
    });
    this.addAction(this.actionEdit);

    this.actionAdd = new WorkSpaceFrameAction("gui/images/person-add.svg", "Ein Mitglied hinzu fügen", function() {
	self.close();
	new MemberEditor(0);
    });
    this.addAction(this.actionAdd);

    this.actionRemove = new WorkSpaceFrameAction("gui/images/person-remove.svg", "Ein Mitglied löschen", function() {
	self.removeMember();
    });
    this.addAction(this.actionRemove);

    this.onSelectionChange();
}

/**
 * 
 */
MemberOverview.prototype.onSelectionChange = function(selection) {

    if (selection && selection.length) {
	this.actionEdit.show();
	this.actionRemove.show();
    } else {
	this.actionEdit.hide();
	this.actionRemove.hide();
    }
}

/**
 * 
 */
MemberOverview.prototype.removeMember = function() {

    var self = this;
    var xpath = XmlUtils.getXPathTo(this.selection[0]);
    var zname = this.model.getValue(xpath + "/zname");
    var vname = this.model.getValue(xpath + "/vname");
    var messg = MessageCatalog.getMessage("QUERY_REMOVE_MEMBER", zname, vname);
    var title = MessageCatalog.getMessage("QUERY_REMOVE_MEMBER_TITLE");
    new MessageBox(MessageBox.QUERY, title, messg, function() {

	var caller = new ServiceCaller();
	caller.onSuccess = function(rsp) {
	    switch (rsp.documentElement.nodeName) {
	    case "delete-member-ok-rsp":
		self.model.removeElement(xpath);
		self.selection = [];
		break;

	    case "error-response":
		var messg = MessageCatalog.getMessage("MEMBER_REMOVE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
		var title = MessageCatalog.getMessage("MEMBER_REMOVE_ERROR_TITLE");
		new MessageBox(MessageBox.ERROR, title, messg);
		break;
	    }
	}
	caller.onError = function(req, status) {
	    var messg = MessageCatalog.getMessage("MEMBER_REMOVE_TECH_ERROR", status);
	    var title = MessageCatalog.getMessage("MEMBER_REMOVE_ERROR_TITLE");
	    new MessageBox(MessageBox.ERROR, title, messg);
	}

	var req = XmlUtils.createDocument("delete-member-req");
	XmlUtils.setNode(req, "id", self.selection[0].getElementsByTagName("id")[0].textContent);
	caller.invokeService(req);
    });
}