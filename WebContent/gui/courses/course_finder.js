/*---------------------------------------------------------------------------*/
/**
 *
 */

/**
 * @param showActions
 * @param onsubmit
 */
var CourseOverview = function(showActions, onsubmit) {

    WorkSpaceTabbedFrame.call(this, "course_overview");
    this.setTitle("Kurs-Übersicht");
    this.showActions = showActions;
    this.onSubmit = onsubmit;

    this.result = [];
    this.subPanes = {};
    var self = this;
    this.loadModel(function() {

	self.fillContent();
    });
}
CourseOverview.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * Lade das KursModel
 */
CourseOverview.prototype.loadModel = function(onSuccess) {

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
 * 
 */
CourseOverview.prototype.fillContent = function() {

    var allCourses = this.model.evaluateXPath("//get-all-courses-ok-response/courses/course[action != 'REMOVE']");
    for (var i = 0; i < allCourses.length; i++) {
	this.renderOneCourse(allCourses[i]);
    }
}

/**
 * 
 */
CourseOverview.prototype.renderOneCourse = function(course) {

    var start = course.getElementsByTagName("start")[0].textContent;

    var projYear = 0;
    if (DateTimeUtils.isDate(start)) {
	projYear = DateTimeUtils.getProjectYear(course.getElementsByTagName("start")[0].textContent);
    }
    var subPane = this.getSubPaneFor(projYear);
    subPane.addEntry(course);
}

/**
 * 
 */
CourseOverview.prototype.getSubPaneFor = function(projYear) {

    if (!this.subPanes[projYear]) {

	var title = projYear + ". Projektjahr";
	var tab = this.addTab("gui/images/course.svg", title);
	var subPane = new CourseOverviewSubPane(this, tab.contentPane, this.model, this.showActions);
	tab.associateTabPane(subPane);
	this.subPanes[projYear] = subPane;

	if (DateTimeUtils.getProjectYear(new Date()) == projYear) {
	    tab.select();
	}

    }
    return this.subPanes[projYear];
}

/**
 * 
 */
CourseOverview.prototype.selectionChanged = function(xpath) {

    this.result = xpath;
    if (this.onSubmit) {
	this.enableSaveButton(true);
    }
}

/**
 * 
 */
CourseOverview.prototype.onSave = function() {

    this.onSubmit(this.model.evaluateXPath(this.result));
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseOverviewSubPane = function(parentFrame, targetContainer, model, showActions) {

    WorkSpaceTabPane.call(this, parentFrame, targetContainer);
    this.model = model;
    this.showActions = showActions;

    var content = document.createElement("div");
    content.className = "scrollable";
    targetContainer.appendChild(content);

    this.table = this.createTable();
    content.appendChild(this.table);

    if (showActions) {
	this.actionEdit = this.createEditAction();
	this.actionAdd = this.createAddAction();
	this.actionRemove = this.createRemoveAction();
	this.actionCopy = this.createCopyAction();
	this.actionPrint = this.createPrintAction();
    }
}
CourseOverviewSubPane.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
CourseOverviewSubPane.prototype.createTable = function() {

    var table = document.createElement("table");

    var thead = document.createElement("thead");
    table.appendChild(thead);

    var row = document.createElement("tr");
    thead.appendChild(row);

    var cell = document.createElement("th")
    row.appendChild(cell);

    cell = document.createElement("th")
    cell.textContent = "Name";
    cell.className = "sortable"
    row.appendChild(cell);

    cell = document.createElement("th")
    cell.textContent = "Kurs-Art";
    cell.className = "sortable"
    row.appendChild(cell);

    cell = document.createElement("th")
    cell.textContent = "von";
    row.appendChild(cell);

    cell = document.createElement("th")
    cell.textContent = "bis";
    row.appendChild(cell);

    table.appendChild(document.createElement("tbody"));

    new TableDecorator(table);
    return table;
}

/**
 * 
 */
CourseOverviewSubPane.prototype.addEntry = function(course) {

    var self = this;
    var fields = this.getColumnDescriptor();
    var onclick = function(tr, node) {

	if (self.showActions) {
	    self.actionEdit.show();
	    self.actionRemove.show();
	    self.actionCopy.show();
	    self.actionPrint.show();
	}
	self.currCourse = XmlUtils.getXPathTo(node);
	self.currRow = tr;
	self.parentFrame.selectionChanged(self.currCourse);
    }
    var row = this.model.createTableRow(course, fields, onclick);
    this.table.getElementsByTagName("tbody")[0].appendChild(row);
}

/**
 * 
 */
CourseOverviewSubPane.prototype.getColumnDescriptor = function() {

    if (!CourseOverviewSubPane.COL_DESC) {

	CourseOverviewSubPane.COL_DESC = [];
	CourseOverviewSubPane.COL_DESC.push(function(td, course) {
	    var radio = document.createElement("input");
	    radio.type = "radio";
	    radio.name = "course_overview_sel";
	    return radio;
	});

	CourseOverviewSubPane.COL_DESC.push("name");
	CourseOverviewSubPane.COL_DESC.push(function(td, course) {
	    var type = course.getElementsByTagName("type")[0].textContent;
	    return CourseTypeTranslator[type];
	});
	CourseOverviewSubPane.COL_DESC.push("start");
	CourseOverviewSubPane.COL_DESC.push("end");
    }
    return CourseOverviewSubPane.COL_DESC;
}

/**
 * 
 */
CourseOverviewSubPane.prototype.activate = function() {

    if (this.showActions) {
	this.actionAdd.show();
    }
}

/**
 * 
 */
CourseOverviewSubPane.prototype.createEditAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/course-edit.svg", "Einen Kurs bearbeiten (Alt + Enter)", function() {
	self.parentFrame.close();
	new CourseEditor(self.model.getValue(self.currCourse + "/id"));
    });
    this.addAction(action);

    this.keyMap[13] = function(tbody, evt) {
	action.invoke();
    }
    action.hide();
    return action;
}

/**
 * 
 */
CourseOverviewSubPane.prototype.createAddAction = function() {

    var self = this;

    var action = new WorkSpaceFrameAction("gui/images/course-add.svg", "Einen Kurs hinzu fügen (Alt + +)", function() {
	self.parentFrame.close();
	new CourseEditor(0);
    });
    this.addAction(action);

    this.keyMap[187] = function(tbody, evt) {
	action.invoke();
    }
    action.hide();
    return action;
}

/**
 * 
 */
CourseOverviewSubPane.prototype.createRemoveAction = function() {

    var self = this;

    var action = new WorkSpaceFrameAction("gui/images/course-remove.svg", "Einen Kurs löschen (Alt+Entf)", function() {
	var name = self.model.getValue(self.currCourse + "/name");
	var title = MessageCatalog.getMessage("COURSE_QUERY_REMOVE_TITLE");
	var messg = MessageCatalog.getMessage("COURSE_QUERY_REMOVE", name);
	new MessageBox(MessageBox.QUERY, title, messg, function() {
	    self.removeCourse();
	});
    });
    this.addAction(action);
    this.keyMap[46] = function(tbody, evt) {
	action.invoke();
    }
    action.hide();
    return action;
}

/**
 * 
 */
CourseOverviewSubPane.prototype.createCopyAction = function() {

    var self = this;

    var action = new WorkSpaceFrameAction("gui/images/course-copy.svg", "Einen Kurs kopieren (Alt +C)", function() {
	var name = self.model.getValue(self.currCourse + "/name");
	var title = MessageCatalog.getMessage("COURSE_QUERY_COPY_TITLE");
	var messg = MessageCatalog.getMessage("COURSE_QUERY_COPY", name);
	new MessageBox(MessageBox.QUERY, title, messg, function() {
	    self.copyCourse();
	});
    });
    this.addAction(action);

    this.keyMap[67] = function(tbody, evt) {
	action.invoke();
    }
    action.hide();
    return action;
}

/**
 * 
 */
CourseOverviewSubPane.prototype.createPrintAction = function() {

    var self = this;

    var action = new WorkSpaceFrameAction("gui/images/print.svg", "Einen Kurs drucken (Alt+P)", function() {

	var menu = new PopupMenu(action.btn);
	menu.makeMenuItem("Kurs-Übersicht drucken", function() {
	    self.printCourse();
	});

	menu.makeMenuItem("MSJ-Liste drucken", function() {
	    self.printMSJListe();
	});

    });
    this.addAction(action);
    this.keyMap[80] = function(tbody, evt) { // 'P'-Taste
	action.invoke();
    }
    action.hide();
    return action;
}

/**
 * 
 */
CourseOverviewSubPane.prototype.removeCourse = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "remove-course-ok-response":
	    self.model.removeElement(self.currCourse);
	    UIUtils.removeElement(self.currRow);
	    self.currCourse = self.currRow = null;
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
    XmlUtils.setNode(req, "id", this.model.getValue(this.currCourse + "/id"));
    caller.invokeService(req);
}

/**
 * 
 */
CourseOverviewSubPane.prototype.copyCourse = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "copy-course-ok-response":
	    self.parentFrame.close();
	    new CourseEditor(rsp.getElementsByTagName("id")[0].textContent);
	    break;

	case "error-response":
	    var title = Messages.getMessage("COURSE_COPY_ERROR_TITLE");
	    var messg = Messages.getMessage("COURSE_COPY_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = Messages.getMessage("COURSE_COPY_ERROR_TITLE");
	var messg = Messages.getMessage("COURSE_COPY_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("copy-course-request");
    XmlUtils.setNode(req, "id", this.model.getValue(this.currCourse + "/id"));
    caller.invokeService(req);
}

/**
 * 
 */
CourseOverviewSubPane.prototype.printCourse = function() {

    var url = "getDocument/course_details.pdf?id=" + this.model.getValue(this.currCourse + "/id");
    var title = "Kurs-Details '" + this.model.getValue(this.currCourse + "/name") + "'";
    new DocumentViewer(url, title);
}

/**
 * 
 */
CourseOverviewSubPane.prototype.printMSJListe = function() {

    var url = "getDocument/msj_liste.pdf?id=" + this.model.getValue(this.currCourse + "/id");
    var title = "MSJ-Liste für den Kurs '" + this.model.getValue(this.currCourse + "/name") + "'";
    new DocumentViewer(url, title);
}
