/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseLocationOverview = function() {

    WorkSpaceFrame.call(this);

    var self = this;
    this.load("gui/courses/course_location_overview.html", function() {

	self.loadModel(function() {
	    self.actionEdit = self.createEditAction();
	    self.actionAdd = self.createAddAction();
	    self.actionRemove = self.createRemoveAction();

	    self.fillTable();
	    new TableDecorator("edit_coursesloc_overview");
	});
    });
}
CourseLocationOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
CourseLocationOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-course-locations-ok-response":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("COURSELOCATION_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("COURSELOCATION_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("COURSELOCATION_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("COURSELOCATION_LOAD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(XmlUtils.createDocument("get-course-locations-req"));
}

/**
 * 
 */
CourseLocationOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/location-add.svg", "Eine neue Kurs-Lokation anlegen", function() {
	self.close();
	new CourseLocationEditor(0);
    });
    this.addAction(action);
    return action;
}

/**
 * 
 */
CourseLocationOverview.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/location-edit.svg", "Kurs-Lokation bearbeiten", function() {
	self.close();
	new CourseLocationEditor(self.model.getValue(self.currLoc + "/id"));
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
CourseLocationOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/location-remove.svg", "Kurs-Location löschen", function() {

	var title = MessageCatalog.getMessage("TITLE_REMOVE_LOCATION");
	var messg = MessageCatalog.getMessage("QUERY_REMOVE_LOCATION", self.model.getValue(self.currLoc + "/name"));
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var xpath = self.currLoc + "/action";
	    if (self.model.getValue(xpath) != "CREATE") {
		self.model.setValue(xpath, "REMOVE");
	    } else {
		self.model.removeElement(xpath);
	    }
	    self.actionEdit.hide();
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
CourseLocationOverview.prototype.fillTable = function() {

    var self = this;
    var fields = this.getColumnDescriptor();
    var onclick = function(tr, location) {

	var radio = document.getElementById("edit_location_radio_" + location.getElementsByTagName("id")[0].textContent);
	radio.click();

	self.currRow = tr;
	self.currLoc = XmlUtils.getXPathTo(location);
	self.actionEdit.show();
	self.actionRemove.show();
    }

    var filter = function(location) {
	return location.getElementsByTagName("action")[0].textContent != "REMOVE";
    }

    this.model.createTableBinding("edit_coursesloc_overview", fields, "/get-course-locations-ok-response/locations/location", onclick, filter);
    this.actionEdit.hide();
    this.actionRemove.hide();
}

/**
 * 
 */
CourseLocationOverview.prototype.getColumnDescriptor = function() {

    var fields = [];
    fields.push(function(td, location) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "edit_location_radio";
	radio.id = "edit_location_radio_" + location.getElementsByTagName("id")[0].textContent;
	radio.value = location.getElementsByTagName("id")[0].textContent;
	return radio;
    });

    fields.push(function(td, location) {
	return location.getElementsByTagName("name")[0].textContent;
    });

    fields.push(function(td, location) {
	return location.getElementsByTagName("city")[0].textContent;
    });

    return fields;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseLocationEditor = function(id) {

    var self = this;
    WorkSpaceTabbedFrame.call(this, "course-location");
    this.loadModel(id, function() {

	self.setupModelListener();
	self.setupTitlebarListener();
	self.setupCoreDataEditor();
	self.setupContactsOverview();
	self.setupAttachmentsOverview();
	self.setupNotesOverview();
    });
}
CourseLocationEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
CourseLocationEditor.prototype.loadModel = function(id, onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "course-location-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("COURSELOCATION_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("COURSELOCATION_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("COURSELOCATION_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("COURSELOCATION_LOAD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-course-locationmodel-req");
    XmlUtils.setNode(req, "id", id);
    caller.invokeService(req);
}

/**
 * 
 */
CourseLocationEditor.prototype.setupModelListener = function() {

    var self = this;
    this.model.addChangeListener("//course-location-model", function() {
	self.enableSaveButton(true);
    });
}

/**
 * 
 */
CourseLocationEditor.prototype.setupTitlebarListener = function() {

    var self = this;
    this.model.addChangeListener("//course-location-model", function() {
	self.updateTitlebar();
    });
    this.updateTitlebar();
}

/**
 * 
 */
CourseLocationEditor.prototype.updateTitlebar = function() {

    var title = "Kurs-Lokation bearbeiten";
    var name = this.model.getValue("//course-location-model/name");
    if (name != "") {
	title += " [" + name + "]";
    }
    this.setTitle(title);
}

/**
 * 
 */
CourseLocationEditor.prototype.setupCoreDataEditor = function() {

    this.coreDataTab = this.addTab("gui/images/location-edit.svg", "Stamm-Daten");
    var subFrame = new CourseLocationCoreDataEditor(this, this.coreDataTab.contentPane, this.model);
    this.coreDataTab.associateTabPane(subFrame);
    this.coreDataTab.select();
}

/**
 * 
 */
CourseLocationEditor.prototype.setupContactsOverview = function() {

    this.contactsDataTab = this.addTab("gui/images/person-group.svg", "Kontakt-Personen");
    var subFrame = new ContactOverview(this, this.contactsDataTab.contentPane, this.model, "//course-location-model/contacts");
    this.contactsDataTab.associateTabPane(subFrame);
}

/**
 * 
 */
CourseLocationEditor.prototype.setupAttachmentsOverview = function() {

    this.attachmentsTab = this.addTab("gui/images/document.svg", "Anhänge bearbeiten");
    var subFrame = new AttachmentsOverview(this, this.attachmentsTab.contentPane, this.model, "//course-location-model/attachments");
    this.attachmentsTab.associateTabPane(subFrame);
}

/**
 * 
 */
CourseLocationEditor.prototype.setupNotesOverview = function() {

    this.notesTab = this.addTab("gui/images/notes.svg", "Notizen bearbeiten");
    var subFrame = new NotesOverview(this, this.notesTab.contentPane, this.model, "//course-location-model/notes");
    this.notesTab.associateTabPane(subFrame);
}

/**
 * 
 */
CourseLocationEditor.prototype.onSave = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "save-course-location-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("COURSELOCATION_SAVE_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("COURSELOCATION_SAVE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("COURSELOCATION_SAVE_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("COURSELOCATION_SAVE_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    caller.invokeService(this.model.getDocument());
    return true;
}

/*---------------------------------------------------------------------------*/
/**
 * Der SubEditor für die Stammdaten
 */

var CourseLocationCoreDataEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/courses/course_location_core_editor.html", function() {

	self.model.createValueBinding("edit_courseloc_core_name", "/course-location-model/name");
	self.model.createValueBinding("edit_courseloc_core_zipcode", "/course-location-model/zip-code");
	self.model.createValueBinding("edit_courseloc_core_city", "/course-location-model/city");
	self.model.createValueBinding("edit_courseloc_core_street", "/course-location-model/street");
	self.model.createValueBinding("edit_courseloc_core_description", "/course-location-model/description");
	self.model.createValueBinding("edit_courseloc_core_homepage", "/course-location-model/homepage");

	new InputFieldDecorator("edit_courseloc_core_homepage", "url-input", function() {
	    window.open(UIUtils.getElement("edit_courseloc_core_homepage").value);
	});
    });
}

CourseLocationCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);
