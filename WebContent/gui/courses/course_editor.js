/**
 * @param courseId
 * @param terminId
 *                optional. wenn angegeben wird der TerminTab geöffnet und der
 *                angegebene termin selektiert
 * @param onSaveCB
 *                optional, wird nach einem erfolgreichen Speichern aufgerufen
 * 
 */
var CourseEditor = function(courseId, terminId, onSaveCB) {

    WorkSpaceTabbedFrame.call(this, "course_edit_tabbed_dlg");

    this.onSaveCB = onSaveCB;
    var self = this;
    this.loadModel(courseId, function() {

	self.adjustTitle();
	self.setupModelListener();
	self.setupCoreDataEditor();
	self.setupTerminOverview(terminId);
	self.setupMembersOverview();
	self.setupNotesOverview();
	self.setupAttachmentsOverview();
    });
}
CourseEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
CourseEditor.NEW_TERMIN = -1;

/**
 * 
 */
CourseEditor.prototype.loadModel = function(id, onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "course-model":
	    self.model = new Model(rsp);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("COURSE_GET_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("COURSE_GET_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("COURSE_GET_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("COURSE_GET_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-course-request");
    XmlUtils.setNode(req, "id", id)
    caller.invokeService(req);
}

/**
 * 
 */
CourseEditor.prototype.setupModelListener = function() {

    var self = this;
    this.model.addChangeListener("//course-model", function() {
	self.enableSaveButton(true);

	var title = "Einen Kurs bearbeiten [" + self.model.getValue("/course-model/name") + "]";
	self.setTitle(title);
    });
}

CourseEditor.prototype.adjustTitle = function() {

    var title = "Einen Kurs bearbeiten";
    var name = this.model.getValue("/course-model/name");
    if (name) {
	title += " [" + name + "]";
    }
    this.setTitle(title);
}
/**
 * 
 */
CourseEditor.prototype.setupCoreDataEditor = function() {

    var tabBinder = this.addTab("gui/images/course-edit.svg", "Details");
    var subFrame = new CourseCoreDataEditor(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
    tabBinder.select();
}

/**
 * 
 */
CourseEditor.prototype.setupTerminOverview = function(terminId) {

    var id = terminId || null;

    var self = this;
    var tabBinder = this.addTab("gui/images/course-edit.svg", "Termine");
    var subFrame = new CourseTerminAndLocationOverview(this, tabBinder.contentPane, this.model, id);
    tabBinder.associateTabPane(subFrame);
    if (id) {
	tabBinder.select();
    }
}

/**
 * 
 */
CourseEditor.prototype.setupMembersOverview = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/person-edit.svg", "Teilnehmer");
    var subFrame = new CourseMembersOverview(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
CourseEditor.prototype.setupNotesOverview = function() {

    var tabBinder = this.addTab("gui/images/notes.svg", "Notizen bearbeiten");
    var subFrame = new NotesOverview(this, tabBinder.contentPane, this.model, "/course-model/notes");
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
CourseEditor.prototype.setupAttachmentsOverview = function() {

    var tabBinder = this.addTab("gui/images/document.svg", "Anhänge");
    var subFrame = new AttachmentsOverview(this, tabBinder.contentPane, this.model, "/course-model/attachments");
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
CourseEditor.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-course-ok-response":
	    if (self.onSaveCB) {
		self.onSaveCB();
	    }
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("COURSE_GET_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("COURSE_GET_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("COURSE_GET_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("COURSE_GET_TECH_ERROR_TITLE", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseCoreDataEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;
    var self = this;
    this.load("gui/courses/course_editor_core.html", function() {

	self.fillColors();
	self.model.createValueBinding("edit_course_name", "//course-model/name");
	self.model.createValueBinding("edit_course_description", "//course-model/description");
	self.model.createValueBinding("edit_course_type", "//course-model/type");
	self.model.createValueBinding("edit_course_color", "//course-model/color-id");
    });
}
CourseCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
CourseCoreDataEditor.prototype.fillColors = function() {

    var sel = new ColorSelector("edit_course_color");
    var allColors = this.model.evaluateXPath("//course-model/colors/color");
    for (var i = 0; i < allColors.length; i++) {

	var id = allColors[i].getElementsByTagName("id")[0].textContent;
	var color = allColors[i].getElementsByTagName("value")[0].textContent;
	var name = allColors[i].getElementsByTagName("name")[0].textContent;
	sel.addColorItem(id, color, name);
    }
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseTerminAndLocationOverview = function(parentFrame, targetCnr, model, terminId) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;
    var self = this;
    this.load("gui/courses/course_termin_overview.html", function() {

	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();

	new TableDecorator("edit_termin_overview");

	self.model.addChangeListener("//course-model/termine", function() {
	    self.fillTable();
	});
	self.fillTable(terminId);

	if (terminId == CourseEditor.NEW_TERMIN) {
	    self.activate();
	    self.actionAdd.btn.click();
	}
    });
}
CourseTerminAndLocationOverview.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.fillTable = function(terminId) {

    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, termin) {

	tr.querySelector("input[type=radio]").click();
	self.currRow = tr;
	self.currTermin = XmlUtils.getXPathTo(termin);
	self.actionRemove.show();
    }

    var tbody = UIUtils.getElement("edit_termin_overview_body");
    UIUtils.clearChilds(tbody);

    var allTermins = this.model.evaluateXPath("/course-model/termine/termin");
    for (var i = 0; i < allTermins.length; i++) {

	var termin = allTermins[i];
	if (termin.getElementsByTagName("action")[0].textContent != "REMOVE") {
	    var row = this.renderOneRow(tbody, termin, onclick);
	    if (termin.getElementsByTagName("id")[0].textContent == terminId) {
		row.click();
		row.querySelector("input[type='radio']").checked = true;
		row.querySelector(".inplace-edit").focus();
	    }
	}
    }
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.renderOneRow = function(tbody, termin, onclick) {

    var fields = this.getColumnDescriptor();

    var row = this.model.createTableRow(termin, fields, onclick);
    tbody.appendChild(row);

    termin.addEventListener("change", function() {

	var action = termin.getElementsByTagName("action")[0];
	if (action.textContent != "CREATE" && action.textContent != "REMOVE") {
	    action.textContent = "MODIFY";
	}
    });
    return row;
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.getColumnDescriptor = function() {

    if (!this.fields) {

	this.fields = [];
	var self = this;
	this.fields.push(function(td, termin) {
	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "edit_termin_radio";
	    return radio;
	});

	this.fields.push(function(td, termin) {
	    return self.createDateEdit(termin);
	});

	this.fields.push(function(td, termin) {
	    return self.createFromEdit(termin);
	});

	this.fields.push(function(td, termin) {
	    return self.createUntilEdit(termin);
	});

	this.fields.push(function(td, termin) {
	    return self.createLocationSelector(termin);
	});
    }
    return this.fields;
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.createDateEdit = function(termin) {

    var edit = document.createElement("input");
    edit.className = "inplace-edit mandatory";
    edit.dataset.type = "date";
    edit.size = "10";
    this.model.createValueBinding(edit, XmlUtils.getXPathTo(termin) + "/date", "change");
    new DatePicker(edit, "Kurs-Datum");
    return edit;
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.createFromEdit = function(termin) {

    var edit = document.createElement("input");
    edit.className = "inplace-edit mandatory";
    edit.dataset.type = "time";
    edit.size = "6";
    this.model.createValueBinding(edit, XmlUtils.getXPathTo(termin) + "/begin", "change");
    return edit;
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.createUntilEdit = function(termin) {

    var edit = document.createElement("input");
    edit.className = "inplace-edit mandatory";
    edit.dataset.type = "time";
    edit.size = "6";
    this.model.createValueBinding(edit, XmlUtils.getXPathTo(termin) + "/end", "change");
    return edit;
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.createLocationSelector = function(termin) {

    var selector = document.createElement("select");
    selector.className = "inplace-select mandatory";
    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Lokation";
    opt.selected = opt.disabled = true;
    selector.appendChild(opt);

    var locations = this.model.evaluateXPath("//course-model/locations/location");
    for (var i = 0; i < locations.length; i++) {

	opt = document.createElement("option");
	opt.value = locations[i].getElementsByTagName("id")[0].textContent;
	opt.textContent = locations[i].getElementsByTagName("name")[0].textContent;
	selector.appendChild(opt);
    }

    this.model.createValueBinding(selector, XmlUtils.getXPathTo(termin) + "/location-id", "change");
    return selector;
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/course-add.svg", "Kurstermin(e) hinzu fügen", function() {
	new CourseTerminAndLocationPlanner(function(termine) {

	    for (var i = 0; i < termine.length; i++) {
		self.model.addElement("/course-model/termine", termine[i]);
	    }
	});
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
CourseTerminAndLocationOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/course-remove.svg", "Kurstermin löschen", function() {

	var date = self.model.getValue(self.currTermin + "/date");
	var begin = self.model.getValue(self.currTermin + "/begin");
	var end = self.model.getValue(self.currTermin + "/end");
	var title = MessageCatalog.getMessage("COURSETERMIN_QUERY_REMOVE_TITLE");
	var messg = MessageCatalog.getMessage("COURSETERMIN_QUERY_REMOVE", date, begin, end);
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var action
	    if (self.model.getValue(self.currTermin + "/action") == "CREATE") {
		self.model.removeElement(self.currTermin);
	    } else {
		self.model.setValue(self.currTermin + "/action", "REMOVE");
	    }
	    self.currRow.parentElement.removeChild(self.currRow);
	    self.currTermin = self.currRow = null;
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
CourseTerminAndLocationOverview.prototype.activate = function() {

    this.actionAdd.show();
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseMembersOverview = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;
    var self = this;
    this.load("gui/courses/coursetermin_editor_members.html", function() {

	new TableDecorator("edit_coursetermin_members");
	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();

	self.model.addChangeListener("/course-model/members", function() {
	    self.fillTable();
	});
	self.fillTable();
    });
}
CourseMembersOverview.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
CourseMembersOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-add.svg", "Mitglied hinzu fügen", function() {

	new MemberSelector(true, function(member) {
	    for (var i = 0; i < member.length; i++) {
		member[i].getElementsByTagName("action")[0].textContent = "CREATE";
		self.model.addElement("/course-model/members", member[i]);
	    }
	});
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
CourseMembersOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-remove.svg", "Mitglied löschen", function() {

	var title = "echt?";
	var messg = "wirklich?";
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var xpath = self.currMember + "/action";
	    if (self.model.getValue(xpath) == "CREATE") {
		self.model.removeElement(self.currMember);
	    } else {
		self.model.setValue(xpath, "REMOVE");
	    }
	});
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
CourseMembersOverview.prototype.fillTable = function() {

    var self = this;
    this.actionRemove.hide();

    var body = UIUtils.getElement("edit_coursetermin_members").getElementsByTagName("tbody")[0];
    UIUtils.clearChilds(body);
    
    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, member) {

	self.currRow = tr;
	self.currMember = XmlUtils.getXPathTo(member);
	self.actionRemove.show();
    }
    var fields = this.getColumnDescriptor();

    var allMembers = this.model.evaluateXPath("//course-model/members/member[action != 'REMOVE']");
    for(var i = 0; i < allMembers.length; i++) {
	
	body.appendChild(this.renderOneMember(allMembers[i], fields, onclick));
    }
}

/**
 * 
 */
CourseMembersOverview.prototype.renderOneMember = function(member, fields, onclick) {

    var self = this;
    xpath = XmlUtils.getXPathTo(member);
    this.model.addChangeListener(xpath, function() {
	
	var action = self.model.getValue(xpath + "/action");
	if(action == "NONE") {
	    self.model.setValue(xpath + "/action", "MODIFY");
	}
    });
    return this.model.createTableRow(member, fields, onclick);
}

/**
 * Der Descriptor für die Befüllung der Tabelle. Folgende Spalten werden
 * angelegt:
 * <ul>
 * <li>radioBtn zur selection</li>
 * <li>name</li>
 * <li>vorname</li>
 * <li>Art der Mitgliedschafft</li>
 * </ul>
 */
CourseMembersOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, member) {
	td.setAttribute("valign", "middle");
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "edit_coursemember_radio";
	return radio;
    });

    fields.push(function(td, member) {
	td.setAttribute("valign", "middle");
	return member.getElementsByTagName("zname")[0].textContent
    });
    
    fields.push(function(td, member) {
	td.setAttribute("valign", "middle");
	return member.getElementsByTagName("vname")[0].textContent
    });
    
    fields.push(function(td, member) {
	td.setAttribute("valign", "middle");
	return MemberTypeTranslator[member.getElementsByTagName("type")[0].textContent];
    });
    fields.push(function(td, member) {

	td.setAttribute("valign", "middle");
	var select = document.createElement("select");
	select.className = "inplace-select mandatory";

	var opt = document.createElement("option");
	opt.disabled = opt.selected = true;
	opt.value = "";
	opt.textContent = "Foto-Einverständnis";
	select.appendChild(opt);

	var values = [ "NONE", "INTERN", "PRINT_ONLY", "FULL" ];
	for (var i = 0; i < values.length; i++) {

	    opt = document.createElement("option");
	    opt.value = values[i];
	    opt.textContent = PhotoAgreementTranslator.translate(values[i]);
	    select.appendChild(opt);
	}
	var xpath = XmlUtils.getXPathTo(member);
	self.model.createValueBinding(select, xpath + "/photoagreement");

	return select;
    });
    return fields;
}

/**
 * 
 */
CourseMembersOverview.prototype.activate = function() {

    this.actionAdd.show();
    if (this.currRow && this.currMember) {
	this.actionRemove.show();

    }
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseTypeTranslator = {
    REGULAR : "Regel-Kurs",
    ONETIME : "Veranstaltung/Ausfahrt"
};
