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

	new TableDecorator("member_finder_resultset");
	self.setupUI();

	self.model.addChangeListener("//members", function() {
	    self.reloadTable();
	});
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
	UIUtils.addClass(resultset, "hidden");
    }
}

/**
 * 
 */
MemberFinder.prototype.onShowAll = function() {

    var search = UIUtils.getElement("member_finder_search");
    var showAll = UIUtils.getElement("member_finder_show_all");
    var resultset = UIUtils.getElement("member_finder_resultset");

    this.stopTimer();
    search.value = "";
    if (showAll.checked) {
	this.invokeService();
    } else {
	this.selection = [];
	this.onSelectionChange();
	UIUtils.addClass(resultset, "hidden");
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
	self.invokeService();
    }, 500);
}

/**
 * 
 */
MemberFinder.prototype.invokeService = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "member-finder-ok-rsp":
	    self.model.removeChilds("//members");
	    self.model.addElements("//members", XmlUtils.evaluateXPath(rsp, "//member-finder-ok-rsp/members/member"));
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
    if (UIUtils.getElement("member_finder_show_all").checked) {
	XmlUtils.setNode(req, "show-all", "true");
    } else {
	XmlUtils.setNode(req, "query", UIUtils.getElement("member_finder_search").value);
    }
    caller.invokeService(req);
}

/**
 * 
 */
MemberFinder.prototype.reloadTable = function() {

    var self = this;

    var fields = this.getColumnDescriptor();
    var onclick = function(tr, member) {
	self.onResultSetSelection(tr, member);
    }

    if (this.model.evaluateXPath("//members/member").length == 0) {
	UIUtils.addClass("member_finder_resultset", "hidden");
    } else {

	self.model.createTableBinding("member_finder_resultset", fields, "//members/member", onclick);
	UIUtils.removeClass("member_finder_resultset", "hidden");
	
	// Beim "showAll" verstecken wir die "found at"-Spalte
	if(UIUtils.getElement("member_finder_show_all").checked) {
	    UIUtils.addClass("member_finder_resultset_found_at", "hidden");
	}
	else {
	    UIUtils.removeClass("member_finder_resultset_found_at", "hidden");	    
	}
    }
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
	ui.id = "member_finder_radio_" + member.getElementsByTagName("id")[0].textContent;
	return ui;
    });

    fields.push("zname");
    fields.push("vname");
    fields.push(function(td, member) {
	return MemberTypeTranslator[member.getElementsByTagName("type")[0].textContent];
    });

    // Beim showAll verstecken wir die "Gefunden in"-Spalte
    if (!UIUtils.getElement("member_finder_show_all").checked) {
	fields.push(function(td, member) {
	    return self.createFoundLocationTags(member.getElementsByTagName("location"));
	});
    }
    return fields;
}

/**
 * 
 */
MemberFinder.prototype.createFoundLocationTags = function(locations) {

    var cnr = document.createElement("div");
    cnr.className = "found-locations-cnr";

    for (var i = 0; i < locations.length; i++) {

	var tag = document.createElement("div");
	tag.className = "found-location-tag";
	var img = document.createElement("img");
	var text = document.createTextNode("");

	switch (locations[i].textContent) {
	case "MEMBER":
	    img.src = "gui/images/person.svg";
	    text.textContent = "Mitglieds-Daten";
	    break;

	case "COURSES":
	    img.src = "gui/images/course.svg";
	    text.textContent = "Kursbeschreibungen";
	    break;

	case "NOTES":
	    img.src = "gui/images/notes.svg";
	    text.textContent = "Notizen";
	    break;

	case "CONTACTS":
	    img.src = "gui/images/person-group.svg";
	    text.textContent = "Kontakte";
	    break;
	}
	tag.appendChild(img)
	tag.appendChild(text);
	cnr.appendChild(tag);
    }

    return cnr;
}

/**
 * 
 */
MemberFinder.prototype.onResultSetSelection = function(tr, member) {

    var radio = "member_finder_radio_" + member.getElementsByTagName("id")[0].textContent;
    radio = document.getElementById(radio);

    if (this.multSel) {
	if (radio.checked) {
	    this.selection.remove(member);
	} else {
	    this.selection.push(member);
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