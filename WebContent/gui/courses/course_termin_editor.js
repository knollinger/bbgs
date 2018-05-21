/**
 * Der CourseTerminEditor besteht aus mehreren SubEditoren.
 * <ul>
 * <li>Details - mit Name, Beschreibung, Datum und Begin/Ende-Uhrzeit</li>
 * <li>Ort - mit Anzeige der Kontakt-Personen und der (klickbaren) Homepage-URL
 * sowie der Möglichkeit den Ort via select-box zu ändern</li>
 * <li>Teilnehmer - Anzeige aller Teilnehmer mit der Möglichkeiten einen TN aus
 * dem Kurs zu entfernen bzw. einen TN zum Kurs hinzu zu fügen</li>
 * <li>Notizen/Hinweise - Anzeige aller Notizen zum Kurs mit der Möglichkeit
 * Notizen hinzu zu fügen, zu editieren oder auch zu löschen</li>
 * <li>Anhänge - Anzeige aller Dateianhänge zum Kurs mit der Möglichkeit
 * Anhänge hinzu zu fügen, anzuzeigen oder auch zu löschen</li>
 * </ul>
 */
var CourseTerminEditor = function(terminId) {

    WorkSpaceTabbedFrame.call(this, "course_termin_editor_tabbed_dlg");

    var self = this;
    this.loadModel(terminId, function() {

	self.setupTitlebarListener();
	self.setupCoreDataEditor();
	self.setupLocationsEditor();
	self.setupMembersEditor();
	self.setupNotesEditor();
	self.setupAttachmentsEditor();

	self.model.addChangeListener("/", function() {
	    self.enableSaveButton(true);
	});
    });
}

CourseTerminEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
CourseTerminEditor.prototype.loadModel = function(id, onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "course-termin-model":
	    self.model = new Model(rsp);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("COURSETERMIN_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("COURSETERMIN_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {

	var title = MessageCatalog.getMessage("COURSETERMIN_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("COURSETERMIN_LOAD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-course-termin-request");
    XmlUtils.setNode(req, "id", id || 0);
    caller.invokeService(req);
}

/**
 * 
 */
CourseTerminEditor.prototype.setupTitlebarListener = function() {

    var self = this;
    this.model.addChangeListener("/course-termin-model/termin", function() {

	self.updateTitlebar();
    });
    this.updateTitlebar();
}

/**
 * 
 */
CourseTerminEditor.prototype.updateTitlebar = function() {

    var name = this.model.getValue("/course-termin-model/course-name") || "";
    var date = this.model.getValue("/course-termin-model/termin/date") || "";
    var begin = this.model.getValue("/course-termin-model/termin/begin") || "";
    var end = this.model.getValue("/course-termin-model/termin/end") || "";
    var title = "Bearbeite Kurstermin " + name + " [" + date + " " + begin + " - " + end + "]";
    this.setTitle(title);
}

/**
 * 
 */
CourseTerminEditor.prototype.setupCoreDataEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/course-edit.svg", "Details");
    var subFrame = new CourseTerminCoreDataEditor(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
    tabBinder.select();
}

/**
 * 
 */
CourseTerminEditor.prototype.setupLocationsEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/location.svg", "Ort");
    var subFrame = new CourseTerminLocationsEditor(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
CourseTerminEditor.prototype.setupMembersEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/person-group.svg", "Mitglieder");
    var subFrame = new CourseTerminMembersEditor(this, tabBinder.contentPane, this.model);
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
CourseTerminEditor.prototype.setupNotesEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/notes.svg", "Notizen/Hinweise");
    var subFrame = new NotesOverview(this, tabBinder.contentPane, this.model, "/course-termin-model/notes");
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
CourseTerminEditor.prototype.setupAttachmentsEditor = function() {

    var self = this;
    var tabBinder = this.addTab("gui/images/document.svg", "Anhänge bearbeiten");
    var subFrame = new AttachmentsOverview(this, tabBinder.contentPane, this.model, "/course-termin-model/attachments");
    tabBinder.associateTabPane(subFrame);
}

/**
 * 
 */
CourseTerminEditor.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

    }
    caller.onError = function(req, status) {

    }
    caller.invokeService(this.model.getDocument());
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseTerminCoreDataEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;
    var self = this;
    this.load("gui/courses/coursetermin_editor_core.html", function() {

	self.model.createValueBinding("edit_coursetermin_name", "/course-termin-model/course-name");
	self.model.createValueBinding("edit_coursetermin_description", "/course-termin-model/course-description");
	self.model.createValueBinding("edit_coursetermin_date", "/course-termin-model/termin/date");
	self.model.createValueBinding("edit_coursetermin_begin", "/course-termin-model/termin/begin");
	self.model.createValueBinding("edit_coursetermin_end", "/course-termin-model/termin/end");

	var datePickerTitle = "Kurstermin für " + self.model.getValue("/course-termin-model/course-name");
	new DatePicker("edit_coursetermin_date", datePickerTitle);
    });
}

CourseTerminCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseTerminLocationsEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;
    var self = this;
    this.load("gui/courses/coursetermin_editor_locations.html", function() {

	self.fillLocations();
	self.model.createValueBinding("edit_coursetermin_locations", "/course-termin-model/termin/location-id");

	document.getElementById("edit_coursetermin_locations").addEventListener("change", function() {
	    self.onLocationChange();
	});
	self.onLocationChange();

	new TableDecorator("edit_coursetermin_contacts");
    });
}
CourseTerminLocationsEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
CourseTerminLocationsEditor.prototype.fillLocations = function() {

    var locations = this.model.evaluateXPath("/course-termin-model/locations/location");
    for (var i = 0; i < locations.length; i++) {

	var opt = document.createElement("option");
	opt.value = locations[i].getElementsByTagName("id")[0].textContent;
	opt.textContent = locations[i].getElementsByTagName("name")[0].textContent;
	document.getElementById("edit_coursetermin_locations").appendChild(opt);
    }
}

/**
 * 
 */
CourseTerminLocationsEditor.prototype.onLocationChange = function() {

    var locId = document.getElementById("edit_coursetermin_locations").value;
    var xPath = "/course-termin-model/locations/location[id=" + locId + "]";
    var location = this.model.evaluateXPath(xPath);

    var url = location[0].getElementsByTagName("homepage")[0];
    url = url ? url.textContent : "";
    var hp = document.getElementById("edit_coursetermin_homepage");
    hp.href = url;
    hp.textContent = url;

    var fields = [ "zname", "vname", "phone", "mobile", "email" ];
    xPath += "/contacts/contact";
    this.model.createTableBinding("edit_coursetermin_contacts", fields, xPath);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseTerminMembersEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/courses/coursetermin_editor_members.html", function() {

	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();
	new TableDecorator("edit_coursetermin_members");

	self.model.addChangeListener("/course-termin-model/members", function() {
	    self.fillTable();

	});
	self.fillTable();
    });
}
CourseTerminMembersEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
CourseTerminMembersEditor.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-add.svg", "Mitglieder hinzu fügen", function() {

	new MemberFinder(true, function(selection) {

	    for (var i = 0; i < selection.length; i++) {
		var xpath = self.model.addElement("/course-termin-model/members", selection[i]);
		self.model.setValue(xpath + "/action", "CREATE");
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
CourseTerminMembersEditor.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-remove.svg", "Das Mitglied entfernen", function() {

	var zname = self.model.getValue(self.currMember + "/zname");
	var vname = self.model.getValue(self.currMember + "/vname");
	var cname = self.model.getValue("/course-termin-model/course-name");
	var date = self.model.getValue("/course-termin-model/termin/date");

	var messg = MessageCatalog.getMessage("COURSE_MEMBER_REMOVE", zname, vname, cname);
	var title = MessageCatalog.getMessage("COURSE_QUERY_REMOVE_TITLE");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currMember + "/action") == "CREATE") {
		self.model.removeElement(self.currMember);
	    } else {
		self.model.setValue(self.currMember + "/action", "REMOVE");
	    }
	    self.currRow = self.currMember = null;
	    action.hide();
	});
    });
    this.addAction(action);
    action.hide();
    return action;

}

/**
 * enable/disable die Actions dieses SubEditors in abhängigkeit vom aktuellen
 * State
 */
CourseTerminMembersEditor.prototype.activate = function() {

    this.actionAdd.show();
    if (this.currMember) {
	this.actionRemove.show();
    } else {
	this.actionRemove.hide();
    }
}

/**
 * 
 */
CourseTerminMembersEditor.prototype.fillTable = function() {

    var self = this;

    // gelöschte Members werden nicht angezeigt
    var filter = function(member) {
	return member.getElementsByTagName("action")[0].textContent != "REMOVE";
    }

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, member) {

	self.currRow = tr;
	self.currMember = XmlUtils.getXPathTo(member);
	self.actionAdd.show();
	self.actionRemove.show();
    }

    var allMembers = "/course-termin-model/members/member";
    var fields = this.getColumnDescriptor();
    this.model.createTableBinding("edit_coursetermin_members", fields, allMembers, onclick, filter);
    this.currRow = this.currAttachment = null;
}

/**
 * liefere die Spalten-Beschreibung für die Member-Tabelle des
 * Members-SubEditors des CourseTerminEditors.
 */
CourseTerminMembersEditor.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, member) {
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "edit_coursetermin_members_radio";
	radio.id = "edit_coursetermin_members_radio_" + member.getElementsByTagName("id")[0].textContent;
	radio.value = member.getElementsByTagName("id")[0].textContent;

	radio.addEventListener("click", function() {
	    self.currentMember = XmlUtils.getXPathTo(member);
	});
	return radio;
    });

    fields.push("zname");
    fields.push("vname");

    fields.push(function(td, member) {

	var type = member.getElementsByTagName("type")[0].textContent;
	return MemberTypeTranslator[type];
    });
    return fields;
}
