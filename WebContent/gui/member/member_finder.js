/**
 * Der MemberFinder
 */
var MemberFinder = function(multiSelect, onSubmit) {

    WorkSpaceFrame.call(this);

    this.multSel = multiSelect;
    this.onsubmit = onSubmit;
    this.selection = [];
    this.timer = undefined;

    var self = this;
    this.keyMap[13] = function(table, evt) {
	self.saveButton.click();
    }

    this.model = new Model(XmlUtils.createDocument("members"));

    var self = this;
    this.load("gui/member/member_finder.html", function() {
	self.loadModel(function() {

	    self.model.addChangeListener("//get-all-members-ok-rsp/members", function() {
		self.fillTable(multiSelect);
	    });
	    self.fillTable(multiSelect);
	});
    });
}
MemberFinder.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberFinder.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "get-all-members-ok-rsp":
	    self.model = new Model(rsp);
	    onsuccess();
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
    caller.invokeService(XmlUtils.createDocument("get-all-members-req"));
}

/**
 * 
 */
MemberFinder.prototype.fillTable = function(multiselect) {

    var fields = [];
    fields.push(function(member) {

	var check = document.createElement("input");
	check.type = multiselect ? "checkbox" : "radio";
	check.name = "member_finder_sel";
	return check;
    });
    fields.push("zname");
    fields.push("vname");

    var self = this;
    this.model.createTableBinding("member_finder_result", fields, "//get-all-members-ok-rsp/members/member[action != 'REMOVE']", function(tr, member) {
	self.onResultSetSelection(tr, member);
    });
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
    this.createEditAction();
    this.createAddAction();
    this.createRemoveAction();
    this.onSelectionChange();
}
MemberOverview.prototype = Object.create(MemberFinder.prototype);

/**
 * 
 */
MemberOverview.prototype.createEditAction = function() {

    var self = this;
    this.actionEdit = new WorkSpaceFrameAction("gui/images/person-edit.svg", "Ein Mitglied bearbeiten", function() {
	self.close();
	new MemberEditor(self.selection[0].getElementsByTagName("id")[0].textContent);
    });
    this.addAction(this.actionEdit);
    this.keyMap[13] = function() {
	self.actionEdit.invoke();
    }
}
/**
 * 
 */
MemberOverview.prototype.createAddAction = function() {

    var self = this;

    this.actionAdd = new WorkSpaceFrameAction("gui/images/person-add.svg", "Ein Mitglied hinzu fügen", function() {
	self.close();
	new MemberEditor(0);
    });
    this.addAction(this.actionAdd);
    this.keyMap[187] = function() { // +-Taste
	self.actionAdd.invoke();
    }
}

/**
 * 
 */
MemberOverview.prototype.createRemoveAction = function() {

    var self = this;
    this.actionRemove = new WorkSpaceFrameAction("gui/images/person-remove.svg", "Ein Mitglied löschen", function() {
	self.removeMember();
    });
    this.addAction(this.actionRemove);
    this.keyMap[46] = function() { // Entf-Taste
	self.actionRemove.invoke();
    }
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