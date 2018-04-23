/**
 * 
 */
var TodoTasksOverview = function() {

    WorkSpaceFrame.call(this);

    var self = this;
    this.load("gui/todolist/todolist_overview.html", function() {

	self.loadModel(function() {

	    self.createActions();
	    self.model.addChangeListener("//todolist-model", function() {
		self.refreshBody();
		self.enableSaveButton(true);
	    });
	    self.refreshBody();
	});
    });
}
TodoTasksOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
TodoTasksOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "todolist-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("LOAD_TODOLISTOVERVIEW_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("LOAD_TODOLISTOVERVIEW_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("LOAD_TODOLISTOVERVIEW_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("LOAD_TODOLISTOVERVIEW_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-todolist-model");
    caller.invokeService(req);
}

/**
 * 
 */
TodoTasksOverview.prototype.createActions = function() {

    var self = this;
    this.actionEdit = new WorkSpaceFrameAction("gui/images/note-edit.svg", "Eine Aufgabe bearbeiten", function() {
	self.editTask();
    });
    this.addAction(this.actionEdit);
    this.actionEdit.hide();

    this.actionAdd = new WorkSpaceFrameAction("gui/images/note-add.svg", "Eine Aufgabe hinzu fügen", function() {
	self.createTask();
    });
    this.addAction(this.actionAdd);

    this.actionRemove = new WorkSpaceFrameAction("gui/images/note-remove.svg", "Eine Aufgabe löschen", function() {
	self.removeTask();
    });
    this.addAction(this.actionRemove);
    this.actionRemove.hide();

    this.actionPrint = new WorkSpaceFrameAction("gui/images/note-print.svg", "Alle Aufgaben drucken", function() {
	new DocumentViewer("getDocument/pinboard.pdf", "Aufgabenliste");
    });
    this.addAction(this.actionPrint);
}

/**
 * 
 */
TodoTasksOverview.prototype.refreshBody = function() {

    UIUtils.clearChilds("todolist_body");
    var allTasks = this.model.evaluateXPath("//todolist-model/tasks/task");
    for (var i = 0; i < allTasks.length; i++) {

	var xpath = XmlUtils.getXPathTo(allTasks[i]);
	if (this.model.getValue(xpath + "/action") != "REMOVE") {
	    this.renderOneTask(xpath);
	}
    }
}

/**
 * 
 */
TodoTasksOverview.prototype.renderOneTask = function(xpath) {

    var task = document.createElement("div");
    task.className = "todolist-task";

    var title = document.createElement("div");
    title.className = "todolist-task-title";
    title.textContent = this.model.getValue(xpath + "/title");
    task.appendChild(title);

    var body = document.createElement("div");
    body.className = "todolist-task-body";
    body.textContent = this.model.getValue(xpath + "/description");
    task.appendChild(body);

    var footer = document.createElement("div");
    footer.className = "todolist-task-footer";

    var user = document.createElement("div");
    user.className = "todolist-task-footer-uid";
    var uid = this.model.getValue(xpath + "/userid");
    user.textContent = this.model.getValue("//todolist-model/accounts/account[id='" + uid + "']/name");
    footer.appendChild(user);

    var tododate = document.createElement("div");
    tododate.className = "todolist-task-footer-date";
    tododate.textContent = this.model.getValue(xpath + "/todo_date");
    footer.appendChild(tododate);

    task.appendChild(footer);

    task.tabIndex = "1";

    var self = this;
    task.addEventListener("click", function() {
	self.currentTask = xpath;
	self.actionEdit.show();
	self.actionRemove.show();
    });
    UIUtils.getElement("todolist_body").appendChild(task);
}

/**
 * 
 */
TodoTasksOverview.prototype.editTask = function() {

    new TodoTaskEditor(this.model, this.currentTask, this.model.evaluateXPath("//todolist-model/accounts/account"));
}

TodoTasksOverview.EMPTY_TASK = "<task><action/><id/><domain>COMMON</domain><title/><description/><todo_date/><remember_date/><userid/><color/><attachments/></task>";
/**
 * 
 */
TodoTasksOverview.prototype.createTask = function() {

    var task = XmlUtils.parse(TodoTasksOverview.EMPTY_TASK);
    this.currentTask = this.model.addElement("//todolist-model/tasks", task.documentElement);
    new TodoTaskEditor(this.model, this.currentTask, this.model.evaluateXPath("//todolist-model/accounts/account"));
}

/**
 * 
 */
TodoTasksOverview.prototype.removeTask = function() {

    var name = this.model.getValue(this.currentTask + "/title");
    var messg = MessageCatalog.getMessage("QUERY_REMOVE_TASK", name);
    var title = MessageCatalog.getMessage("TITLE_REMOVE_TASK");

    var self = this;
    new MessageBox(MessageBox.QUERY, title, messg, function() {

	if (self.model.getValue(self.currentTask + "/action") == "CREATE") {
	    self.model.removeElement(self.currentTask);
	} else {
	    self.model.setValue(self.currentTask + "/action", "REMOVE");
	}
	self.currentTask = null;
	self.actionEdit.hide();
	self.actionRemove.hide();
    });
}

/**
 * 
 */
TodoTasksOverview.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-todolist-model-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("SAVE_TODOLIST_MODEL_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("SAVE_TODOLIST_MODEL_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.QUERY, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("SAVE_TODOLIST_MODEL_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("SAVE_TODOLIST_MODEL_TECH_ERROR", status);
	new MessageBox(MessageBox.QUERY, title, messg);

    }
    caller.invokeService(this.model.getDocument());
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var TodoTaskEditor = function(model, xpath, accounts) {

    WorkSpaceTabbedFrame.call(this, "todolist_editor");

    this.model = new ModelWorkingCopy(model, xpath);
    this.setupCoreDataEditor(this.model, accounts);
    this.setupAttachmentsOverview(this.model);

    var self = this;
    this.model.addChangeListener("//task", function() {
	self.enableSaveButton(true);
    });
}
TodoTaskEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
TodoTaskEditor.prototype.setupCoreDataEditor = function(model, accounts) {

    var self = this;
    this.coreDataTab = this.addTab("gui/images/note-edit.svg", "Details bearbeiten");
    var subFrame = new TodoTaskCoreDataEditor(this, this.coreDataTab.contentPane, model, accounts);
    this.coreDataTab.associateTabPane(subFrame);
    this.coreDataTab.select();
}

TodoTaskEditor.prototype.setupAttachmentsOverview = function(model) {

    this.attachmentsTab = this.addTab("gui/images/document.svg", "Anhänge bearbeiten");
    var subFrame = new AttachmentsOverview(this, this.attachmentsTab.contentPane, model, "//task/attachments");
    this.attachmentsTab.associateTabPane(subFrame);
}

/**
 * 
 */
TodoTaskEditor.prototype.onSave = function() {

    var action = this.model.getValue("//task/action");
    switch (action) {
    case "":
	this.model.setValue("//task/action", "CREATE");
	break;

    case "NONE":
	this.model.setValue("//task/action", "MODIFY");
	break;
    }
    this.model.commit();
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var TodoTaskCoreDataEditor = function(parentFrame, targetCnr, model, accounts) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/todolist/todotask_core_editor.html", function() {

	self.fillAccounts(accounts);
	self.model.createValueBinding("todotask_editor_title", "//task/title");
	self.model.createValueBinding("todotask_editor_description", "//task/description");
	self.model.createValueBinding("todotask_editor_user", "//task/userid");
	self.model.createValueBinding("todotask_editor_tododate", "//task/todo_date");
	self.model.createValueBinding("todotask_editor_rememberdate", "//task/remember_date");

	UIUtils.getElement("todotask_editor_title").focus();
	new DatePicker("todotask_editor_tododate");
	new DatePicker("todotask_editor_rememberdate");
    });
}
TodoTaskCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
TodoTaskCoreDataEditor.prototype.activate = function() {

    var elem = UIUtils.getElement("todotask_editor_title");
    if(elem) {
	elem.focus();
    }
}

/**
 * 
 */
TodoTaskCoreDataEditor.prototype.fillAccounts = function(accounts) {

    var select = UIUtils.getElement("todotask_editor_user");
    for (var i = 0; i < accounts.length; i++) {

	var acc = accounts[i];
	var opt = document.createElement("option");
	opt.value = acc.getElementsByTagName("id")[0].textContent;
	opt.textContent = acc.getElementsByTagName("name")[0].textContent;
	select.appendChild(opt);
    }
}
