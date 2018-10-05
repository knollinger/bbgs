/**
 * Zeige alle Kurse an
 */
var CourseFinder = function(multiSelect, onSubmit) {

    WorkSpaceFrame.call(this);
    var self = this;

    this.multSel = multiSelect;
    this.onsubmit = onSubmit;
    this.selection = [];

    this.keyMap[13] = function(tbody, evt) {
	self.saveButton.click();
    };

    this.load("gui/courses/course_overview.html", function() {

	self.loadModel(function() {

	    new TableDecorator("edit_courses_overview");
	    UIUtils.addKeyMap("edit_courses_overview_body", self.keyMap);
	    self.model.addChangeListener("//get-all-courses-ok-response/courses", function() {
		self.fillTable();
	    });
	    self.fillTable();
	});
    });
}
CourseFinder.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * Lade das KursModel
 */
CourseFinder.prototype.loadModel = function(onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-all-courses-ok-response":
	    self.model = new Model(rsp);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("COURSE_GETALL_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("COURSE_GETALL_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("COURSE_GETALL_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("COURSE_GETALL_TECH_ERROR_TITLE", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-all-courses-request");
    caller.invokeService(req);
}

/**
 * befülle die Tabelle
 */
CourseFinder.prototype.fillTable = function() {

    var self = this;

    // gelöschte Kurse werden nicht angezeigt
    var filter = function(course) {
	return course.getElementsByTagName("action")[0].textContent != "REMOVE";
    }

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, course) {
	self.onSelect(tr, XmlUtils.getXPathTo(course));
    }

    var allCourses = "/get-all-courses-ok-response/courses/course";
    var fields = this.getColumnDescriptor();
    this.model.createTableBinding("edit_courses_overview", fields, allCourses, onclick, filter);
}

/**
 * Der Descriptor für die Befüllung der Tabelle. Folgende Spalten werden
 * angelegt:
 * <ul>
 * <li>radioBtn zur selection</li>
 * <li>typ </li>
 * <li>name </li>
 * <li>beschreibung</li>
 * </ul>
 */
CourseFinder.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, course) {
	var radio = document.createElement("input");
	radio.type = (self.multSel) ? "checkbox" : "radio";
	radio.name = "edit_course_radio";
	radio.id = "edit_course_radio_" + course.getElementsByTagName("id")[0].textContent;
	radio.value = course.getElementsByTagName("id")[0].textContent;
	return radio;
    });

    fields.push("name");
    fields.push(function(td, course) {
	return CourseTypeTranslator[course.getElementsByTagName("type")[0].textContent];
    });
    fields.push(function(td, course) {
	return course.getElementsByTagName("description")[0].textContent
    });
    return fields;
}

/**
 * @param tr
 *                die selektierte Zeile
 * @param der
 *                selectierte Course
 */
CourseFinder.prototype.onSelect = function(tr, course) {

    var radio = "edit_course_radio_" + this.model.getValue(course + "/id");
    radio = document.getElementById(radio);

    if (this.multSel) {
	if (radio.checked) {
	    this.selection.push(course);
	} else {
	    this.selection.remove(course);
	}
    } else {
	this.selection = [].concat(course);
    }
    this.onSelectionChange(this.selection);
}

/**
 * callback für die DialogMethode save()
 */
CourseFinder.prototype.onSave = function() {

    if (this.onsubmit) {

	var nodes = [];
	for (var i = 0; i < this.selection.length; i++) {
	    nodes.push(this.model.evaluateXPath(this.selection[i])[0]);
	}
	this.onsubmit(nodes);
    }
}

/**
 * 
 */
CourseFinder.prototype.onSelectionChange = function(selection) {

    this.enableSaveButton(selection && selection.length);
}

/*---------------------------------------------------------------------------*/
/**
 * CourseOverview
 * 
 * Eine spezialisierung des CourseFinders, welche noch die Actions AddCourse,
 * EditCourse, RemoveCourse und PrintCourse einbringt
 */
var CourseOverview = function() {

    CourseFinder.call(this, false, null);
    this.createEditAction();
    this.createAddAction();
    this.createRemoveAction();
    this.createPrintAction();
    this.onSelectionChange();
}
CourseOverview.prototype = Object.create(CourseFinder.prototype);

/**
 * 
 */
CourseOverview.prototype.createEditAction = function() {

    var self = this;
    this.actionEdit = new WorkSpaceFrameAction("gui/images/course-edit.svg", "Einen Kurs bearbeiten", function() {
	self.close();
	new CourseEditor(self.model.getValue(self.selection[0] + "/id"));
    });
    this.addAction(this.actionEdit);
    
    this.keyMap[13] = function(tbody, evt) {
	self.actionEdit.invoke();
    }
}

/**
 * 
 */
CourseOverview.prototype.createAddAction = function() {

    var self = this;

    this.actionAdd = new WorkSpaceFrameAction("gui/images/course-add.svg", "Einen Kurs hinzu fügen", function() {
	self.close();
	new CourseEditor(0);
    });
    this.addAction(this.actionAdd);
    
    this.keyMap[187] = function(tbody, evt) {
	self.actionAdd.invoke();
    }
}

/**
 * 
 */
CourseOverview.prototype.createRemoveAction = function() {

    var self = this;

    this.actionRemove = new WorkSpaceFrameAction("gui/images/course-remove.svg", "Einen Kurs löschen", function() {
	var name = self.model.getValue(self.selection[0] + "/name");
	var title = MessageCatalog.getMessage("COURSE_QUERY_REMOVE_TITLE");
	var messg = MessageCatalog.getMessage("COURSE_QUERY_REMOVE", name);
	new MessageBox(MessageBox.QUERY, title, messg, function() {
	    self.removeCourse();
	});
    });
    this.addAction(this.actionRemove);
    this.keyMap[46] = function(tbody, evt) {
	self.actionRemove.invoke();
    }
}


/**
 * 
 */
CourseOverview.prototype.createPrintAction = function() {

    var self = this;

    this.actionPrint = new WorkSpaceFrameAction("gui/images/print.svg", "Einen Kurs drucken", function() {
	self.printCourse();
    });
    this.addAction(this.actionPrint);
    this.keyMap[80] = function(tbody, evt) { // 'P'-Taste
	self.actionPrint.invoke();
    }
}

/**
 * 
 */
CourseOverview.prototype.onSelectionChange = function(selection) {

    if (selection && selection.length) {
	this.actionEdit.show();
	this.actionRemove.show();
	this.actionPrint.show();
    } else {
	this.actionEdit.hide();
	this.actionRemove.hide();
	this.actionPrint.hide();
    }
}

/**
 * 
 */
CourseOverview.prototype.removeCourse = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "remove-course-ok-response":
	    self.model.removeElement(self.selection[0]);
	    break;

	case "error-response":
	    var title = Messages.getMessage("COURSE_REMOVE_ERROR_TITLE");
	    var messg = Messages.getMessage("COURSE_REMOVE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = Messages.getMessage("COURSE_REMOVE_ERROR_TITLE");
	var messg = Messages.getMessage("COURSE_REMOVE_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("remove-course-request");
    XmlUtils.setNode(req, "id", this.model.getValue(this.selection[0] + "/id"));
    caller.invokeService(req);
}

/**
 * 
 */
CourseOverview.prototype.printCourse = function() {

    var url = "getDocument/course_details.pdf?id=" + this.model.getValue(this.selection[0] + "/id");
    var title = "Kurs-Details '" + this.model.getValue(this.selection[0] + "/name") + "'";
    new DocumentViewer(url, title);
}