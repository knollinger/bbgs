/**
 * 
 */
var MailGroupOverview = function() {

    WorkSpaceFrame.call(this);

    var self = this;
    this.load("gui/mail/custom_view.html", function() {

	self.loadModel(function() {

	    self.actionEdit = self.createEditAction();
	    self.actionAdd = self.createAddAction();
	    self.actionRemove = self.createRemoveAction();

	    new TableDecorator("edit_mail_customview");
	    self.fillTable();
	});
    });
}
MailGroupOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MailGroupOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-custom-mail-groups-ok-rsp":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_MAILGROUPS_ERROR_TITLE")
	    var messg = MessageCatalog.getMessage("LOAD_MAILGROUPS_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_MAILGROUPS_ERROR_TITLE")
	var messg = MessageCatalog.getMessage("LOAD_MAILGROUPS_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-custom-mail-groups-req");
    caller.invokeService(req);
}

/**
 * 
 */
MailGroupOverview.prototype.fillTable = function() {

    var self = this;
    var fields = this.getColumnDescriptor();
    var onclick = function(tr, group) {

	var radio = "edit_custommailgroups_" + group.getElementsByTagName("id")[0].textContent;
	document.getElementById(radio).click();
	self.currRow = tr;
	self.currGroup = XmlUtils.getXPathTo(group);
	self.actionEdit.show();
	self.actionRemove.show();
    }
    this.model.createTableBinding("edit_mail_customview", fields, "/get-custom-mail-groups-ok-rsp/groups/group", onclick);
}

/**
 * 
 */
MailGroupOverview.prototype.getColumnDescriptor = function() {

    var fields = [];
    fields.push(function(td, group) {

	var radio = document.createElement("input");
	radio.type = "radio";
	radio.id = "edit_custommailgroups_" + group.getElementsByTagName("id")[0].textContent;
	radio.name = "edit_custommailgroups";
	return radio;
    });

    fields.push("name");
    fields.push("description");
    return fields;
}

/**
 * 
 */
MailGroupOverview.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-group-edit.svg", "Mail-Verteiler bearbeiten", function() {

	self.close();
	new MailGroupEditor(self.model.getValue(self.currGroup + "/id"));
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
MailGroupOverview.prototype.createAddAction = function() {

    var self = this;
    action = new WorkSpaceFrameAction("gui/images/person-group-add.svg", "Mail-Verteiler anlegen", function() {

	self.close();
	new MailGroupEditor(0);
    });
    this.addAction(action);
    return action;

}

/**
 * 
 */
MailGroupOverview.prototype.createRemoveAction = function() {

    action = new WorkSpaceFrameAction("gui/images/person-group-remove.svg", "Mail-Verteiler löschen", function() {

    });
    this.addAction(action);
    action.hide();
    return action;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MailGroupEditor = function(id) {

    var self = this;
    WorkSpaceFrame.call(this);
    this.load("gui/mail/mail_group_editor.html", function() {

	self.loadModel(id, function() {

	    self.actionAdd = self.createAddAction();
	    self.actionRemove = self.createRemoveAction();

	    self.model.addChangeListener("/", function() {
		self.enableSaveButton(true);
	    });
	    self.model.addChangeListener("/custom-mailgroup-model/members", function() {
		self.fillTable();
	    });
	    self.fillTable();
	    self.model.createValueBinding("edit_mailgroup_name", "/custom-mailgroup-model/name");
	    self.model.createValueBinding("edit_mailgroup_description", "/custom-mailgroup-model/description");
	});
    });
}
MailGroupEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MailGroupEditor.prototype.loadModel = function(id, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "custom-mailgroup-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_MAILGROUP_ERROR_TITLE")
	    var messg = MessageCatalog.getMessage("LOAD_MAILGROUP_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_MAILGROUP_ERROR_TITLE")
	var messg = MessageCatalog.getMessage("LOAD_MAILGROUP_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-custom-mail-group-req");
    XmlUtils.setNode(req, "id", id);
    caller.invokeService(req);
}

/**
 * 
 */
MailGroupEditor.prototype.fillTable = function() {

    var self = this;
    var fields = this.getColumnDescriptor();
    var filter = function(member) {
	return member.getElementsByTagName("action")[0].textContent != "REMOVE";
    }
    var onclick = function(tr, member) {

	var radio = "edit_custommailgroupmember_" + member.getElementsByTagName("id")[0].textContent;
	document.getElementById(radio).click();
	self.currMember = XmlUtils.getXPathTo(member);
	self.actionRemove.show();
    }
    this.model.createTableBinding("edit_mailgroup_members", fields, "/custom-mailgroup-model/members/member", onclick, filter);
}

/**
 * 
 */
MailGroupEditor.prototype.getColumnDescriptor = function() {

    var fields = [];

    fields.push(function(td, member) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.id = "edit_custommailgroupmember_" + member.getElementsByTagName("id")[0].textContent;
	radio.name = "edit_custommailgroupmember";
	return radio;
    });
    fields.push("zname");
    fields.push("vname");
    
    fields.push("city");    
    fields.push("street");
    fields.push(function(td, member) {
	return MemberTypeTranslator[member.getElementsByTagName("type")[0].textContent];
    });
    return fields;
}

/**
 * 
 */
MailGroupEditor.prototype.createAddAction = function() {

    var self = this;
    action = new WorkSpaceFrameAction("gui/images/person-add.svg", "Person hinzu fügen", function() {

	new MemberFinder(true, function(member) {
	    for (var i = 0; i < member.length; i++) {
		member[i].getElementsByTagName("action")[0].textContent = "CREATE";
		self.model.addElement("/custom-mailgroup-model/members", member[i]);
	    }
	});
    });
    this.addAction(action);
    return action;

}

/**
 * 
 */
MailGroupEditor.prototype.createRemoveAction = function() {

    var self = this;
    action = new WorkSpaceFrameAction("gui/images/person-remove.svg", "Person entfernen", function() {

	var zname = self.model.getValue(self.currMember + "/zname");
	var vname = self.model.getValue(self.currMember + "/vname");
	var title = MessageCatalog.getMessage("TITLE_REMOVE_GROUPMEMBER");
	var messg = MessageCatalog.getMessage("QUERY_REMOVE_GROUPMEMBER", zname, vname);
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currMember + "/action") == "CREATE") {
		self.model.removeElement(self.currMember);
	    } else {
		self.model.setValue(self.currMember + "/action", "REMOVE");
	    }
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
MailGroupEditor.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_MAILGROUP_ERROR_TITLE")
	    var messg = MessageCatalog.getMessage("SAVE_MAILGROUP_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_MAILGROUP_ERROR_TITLE")
	var messg = MessageCatalog.getMessage("SAVE_MAILGROUP_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());
}
