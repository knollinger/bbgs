/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MemberNavigation = function() {

    Navigation.call(this);

    this.addNavigationButton("gui/images/person-edit.svg", "Mitglieder bearbeiten", function() {
	new MemberEditor(0);
    });

    this.addNavigationButton("gui/images/person-group.svg", "Alle Mitglieder anzeigen", function() {
	new MemberOverview();
    });
    this.setTitle("Mitglieder-Verwaltung");
}
MemberNavigation.prototype = Object.create(Navigation.prototype);

/*---------------------------------------------------------------------------*/
/**
 * Der MemberEditor besteht aus mehreren SubEditoren. Die Hauptseite lädt das
 * Model und zeigt die Navigation zu den SubEditoren an. Jeder SubEditor
 * wiederum ist ein eigener WorkSpaceFrame.
 * 
 * Die SubEditoren arbeiten ausschliesslich auf dem Model, sie interagieren
 * niemals mit dem Server. Erst wenn in der HauptSeite die saveAction ausgelöst
 * wird, wird das Model an den Server zurück geschrieben.
 */
var MemberEditor = function(id) {

    WorkSpaceTabbedFrame.call(this, "member_edit_tabbed_dlg");

    var self = this;
    this.loadModel(id, function() {

	self.setupModelListener();
	self.setupTitlebarListener();
	self.setupCoreDataEditor(id == 0);
	self.setupCommDataEditor();
	self.setupContactsOverview();
	self.setupAttachmentsOverview();
	self.setupNotesOverview();
	self.setupCoursesOverview();
    });
}
MemberEditor.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
MemberEditor.prototype.loadModel = function(id, onSuccess) {

    var self = this;

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {

	switch (rsp.documentElement.nodeName) {
	case "member-model":
	    self.model = new Model(rsp);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("MEMBER_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("MEMBER_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {

	var title = MessageCatalog.getMessage("MEMBER_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("MEMBER_LOAD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-member-model-request");
    XmlUtils.setNode(req, "id", id);
    caller.invokeService(req);
}

/**
 * Wenn es irgend einen Change am Model gegeben hat, aktiviere die Save-Action!
 */
MemberEditor.prototype.setupModelListener = function() {

    var self = this;
    this.model.addChangeListener("/member-model", function() {

	if (self.model.getValue("/member-model/core-data/action") == "NONE") {
	    if (self.model.getValue("/member-model/core-data/id") == "0") {
		self.model.setValue("/member-model/core-data/action", "CREATE");
	    } else {
		self.model.setValue("/member-model/core-data/action", "MODIFY");
	    }
	}
	self.enableSaveButton(true);
    });
}

/**
 * 
 */
MemberEditor.prototype.setupTitlebarListener = function() {

    var self = this;
    this.model.addChangeListener("/member-model/core-data", function() {
	self.updateTitlebar();
    });
    this.updateTitlebar();
}

/**
 * 
 */
MemberEditor.prototype.setupCoreDataEditor = function(enableSearchMode) {

    this.coreDataTab = this.addTab("gui/images/person.svg", "Stamm-Daten");
    var subFrame = new MemberCoreDataEditor(this, this.coreDataTab.contentPane, this.model, enableSearchMode);
    this.coreDataTab.associateTabPane(subFrame);
    this.coreDataTab.select();
}

/**
 * 
 */
MemberEditor.prototype.setupDSGVODataEditor = function() {

    this.coreDataTab = this.addTab("gui/images/certificate.svg", "Datenschutz-relevante Angaben");
    var subFrame = new MemberDSGVODataEditor(this, this.coreDataTab.contentPane, this.model);
    this.coreDataTab.associateTabPane(subFrame);
}

/**
 * 
 */
MemberEditor.prototype.setupCommDataEditor = function() {

    this.commDataTab = this.addTab("gui/images/phone.svg", "Kommunikations-Daten");
    var subFrame = new MemberCommDataEditor(this, this.commDataTab.contentPane, this.model);
    this.commDataTab.associateTabPane(subFrame);
}

/**
 * 
 */
MemberEditor.prototype.setupContactsOverview = function() {

    this.contactsDataTab = this.addTab("gui/images/person-group.svg", "Kontakt-Personen");
    var subFrame = new ContactOverview(this, this.contactsDataTab.contentPane, this.model, "/member-model/contacts", "/member-model/core-data", true);
    this.contactsDataTab.associateTabPane(subFrame);
}

/**
 * 
 */
MemberEditor.prototype.setupAttachmentsOverview = function() {

    this.attachmentsTab = this.addTab("gui/images/document.svg", "Anhänge bearbeiten");
    var subFrame = new AttachmentsOverview(this, this.attachmentsTab.contentPane, this.model, "/member-model/attachments");
    this.attachmentsTab.associateTabPane(subFrame);
}

/**
 * 
 */
MemberEditor.prototype.setupNotesOverview = function() {

    this.notesTab = this.addTab("gui/images/notes.svg", "Notizen bearbeiten");
    var subFrame = new NotesOverview(this, this.notesTab.contentPane, this.model, "/member-model/notes");
    this.notesTab.associateTabPane(subFrame);
}

/**
 * 
 */
MemberEditor.prototype.setupCoursesOverview = function() {

    this.coursesTab = this.addTab("gui/images/course.svg", "Kurse bearbeiten");
    var subFrame = new MemberCourseOverview(this, this.coursesTab.contentPane, this.model, "/member-model/courses");
    this.coursesTab.associateTabPane(subFrame);
}

/**
 * Bei änderungen im Namen oder Vornamen wird die Titelzeile angepasst
 */
MemberEditor.prototype.updateTitlebar = function() {

    var title = "Mitglied bearbeiten";
    var vname = this.model.getValue("/member-model/core-data/vname");
    var zname = this.model.getValue("/member-model/core-data/zname");
    if (vname != "" || zname != "") {
	title += " [" + zname + ", " + vname + "]";
    }
    this.setTitle(title);
}

/**
 * beim klick auf Save...
 */
MemberEditor.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-member-model-ok-response":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("MEMBER_SAVE_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("MEMBER_SAVE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    };
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("MEMBER_SAVE_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("MEMBER_SAVE_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    caller.invokeService(this.model.getDocument());

}

/*---------------------------------------------------------------------------*/
/**
 * Der SubEditor für die Stammdaten
 */

var MemberCoreDataEditor = function(parentFrame, targetCnr, model, enableSearchMode) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/member/member_editor_core.html", function() {

	UIUtils.getElement("edit_member_zname").focus();
	self.fillCoopPartners();

	self.model.createValueBinding("edit_member_type", "//member-model/core-data/type");
	self.model.createValueBinding("edit_member_since", "//member-model/core-data/member_since");
	self.model.createValueBinding("edit_member_until", "//member-model/core-data/member_until");
	self.model.createValueBinding("edit_member_zname", "//member-model/core-data/zname")
	self.model.createValueBinding("edit_member_vname", "//member-model/core-data/vname")
	self.model.createValueBinding("edit_member_vname2", "//member-model/core-data/vname2")
	self.model.createValueBinding("edit_member_title", "//member-model/core-data/title")
	self.model.createValueBinding("edit_member_birthdate", "//member-model/core-data/birth_date")
	self.model.createValueBinding("edit_member_sex", "//member-model/core-data/sex")
	self.model.createValueBinding("edit_member_zipcode", "//member-model/core-data/zip_code");
	self.model.createValueBinding("edit_member_city", "//member-model/core-data/city");
	self.model.createValueBinding("edit_member_street", "//member-model/core-data/street");
	self.model.createValueBinding("edit_member_school", "//member-model/core-data/school");
	self.model.createValueBinding("edit_member_photoagreement", "//member-model/core-data/photoagreement");
	self.adjustDSEState();

	// instantiate the image picker
	var thumb = document.getElementById("edit_member_image");
	new FilePicker(thumb, function(name, type, data) {
	    self.model.setValue("/member-model/core-data/image", data);
	    self.model.setValue("/member-model/core-data/image-mimetype", type);
	    thumb.src = UIUtils.createDataUrl(type, data);
	});

	// handle sex changes
	self.model.addChangeListener("/member-model/core-data/sex", function() {
	    self.onSexChange();
	});
	self.onSexChange();

	// handle membertype-changes
	self.model.addChangeListener("/member-model/core-data/type", function() {
	    self.onMemberTypeChange();
	});
	self.onMemberTypeChange();

	// setup all DatePickers
	new DatePicker("edit_member_since", "Mitglied seit");
	new DatePicker("edit_member_until", "Mitglied bis");
	new DatePicker("edit_member_birthdate", "Geburts-Datum");

	// instantiate the multiselect for the project year
	var projYear = document.getElementById("edit_member_projyear");
	projYear = new MultiSelectDropdown(projYear);

	// fill projectYear
	self.adjustProjYear();

	// setup ProjYear-ChangeListener
	projYear.addEventListener("change", function() {
	    self.onProjYearChange();
	});

	if (enableSearchMode) {
	    self.setupSearchPreviewListener();
	}
    });
}
MemberCoreDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
MemberCoreDataEditor.prototype.setupSearchPreviewListener = function() {

    var self = this;

    var zname = UIUtils.getElement("edit_member_zname");
    UIUtils.addClass(zname, "search-input");
    zname.addEventListener("input", function() {
	self.startSearchPreviewTimer(zname);
    });

    var vname = UIUtils.getElement("edit_member_vname");
    UIUtils.addClass(vname, "search-input");
    vname.addEventListener("input", function() {
	self.startSearchPreviewTimer(vname);
    });
}

/**
 * 
 */
MemberCoreDataEditor.prototype.startSearchPreviewTimer = function(anchor) {

    if (anchor.value != "") {
	var self = this;
	this.stopSearchPreviewTimer();
	this.timer = window.setTimeout(function() {
	    self.loadSearchPreview(anchor);
	}, 400);
    }
}

/**
 * 
 */
MemberCoreDataEditor.prototype.stopSearchPreviewTimer = function() {

    if (this.timer) {
	window.clearTimeout(this.timer);
	this.timer = null;
    }
}

/**
 * 
 */
MemberCoreDataEditor.prototype.loadSearchPreview = function(anchor) {

    var znameSearch = UIUtils.getElement("edit_member_zname").value;
    var vnameSearch = UIUtils.getElement("edit_member_vname").value

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "search-member-ok-rsp":
	    self.showSearchPreview(anchor, new Model(rsp), znameSearch, vnameSearch);
	    break;

	case "error-response":
	    console.log(rsp.getElementsByTagName("msg")[0].textContent);
	    break;
	}
    }
    caller.onError = function(req, status) {
	console.log(status);
    }

    var req = XmlUtils.createDocument("search-member-req");
    XmlUtils.setNode(req, "zname", znameSearch);
    XmlUtils.setNode(req, "vname", vnameSearch);
    caller.invokeService(req.documentElement);

}

/**
 * 
 */
MemberCoreDataEditor.prototype.showSearchPreview = function(anchor, model, znameSearch, vnameSearch) {

    var allMembers = model.evaluateXPath("//search-member-ok-rsp/members/member");
    if (allMembers.length) {

	var preview = new PopupMenu(anchor);
	for (var i = 0; i < allMembers.length; i++) {

	    var xpath = XmlUtils.getXPathTo(allMembers[i]);
	    this.makeSearchPreviewItem(preview, model, xpath, znameSearch, vnameSearch);
	}
    }
}

/**
 * 
 */
MemberCoreDataEditor.prototype.makeSearchPreviewItem = function(preview, model, xpath, znameSearch, vnameSearch) {

    var self = this;
    var text = model.getValue(xpath + "/zname") + ", ";
    text += model.getValue(xpath + "/vname") + ", ";
    text += model.getValue(xpath + "/zip_code") + ", ";
    text += model.getValue(xpath + "/city") + ", ";
    text += model.getValue(xpath + "/street");
    preview.makeMenuItem(text, function() {
	self.parentFrame.close();
	var id = model.getValue(xpath + "/id");
	new MemberEditor(id);
    });
}

/**
 * Befülle die select-box mit den Kooperations-Partnern
 */
MemberCoreDataEditor.prototype.fillCoopPartners = function(model) {

    var select = document.getElementById("edit_member_school");
    var allPartners = this.model.evaluateXPath("/member-model/partners/partner");
    for (var i = 0; i < allPartners.length; i++) {

	var partner = allPartners[i];
	var opt = document.createElement("option");
	opt.value = partner.getElementsByTagName("id")[0].textContent;
	opt.appendChild(document.createTextNode(partner.getElementsByTagName("name")[0].textContent));
	select.appendChild(opt);
    }
}

/**
 * Je nach Mitgliedsart werden verschiedene Felder ausgeblendet
 */
MemberCoreDataEditor.prototype.hiddenFieldsByType = {
    "" : [ "edit_member_projyear", "edit_member_since", "edit_member_until", "edit_member_school", "edit_member_dse_state" ],
    "TEACHER" : [ "edit_member_projyear", "edit_member_school" ],
    "SCOUT" : [ "edit_member_since", "edit_member_until", "edit_member_school" ],
    "EXSCOUT" : [ "edit_member_since", "edit_member_until", "edit_member_school" ],
    "PRAKTIKANT" : [ "edit_member_since", "edit_member_until", "edit_member_school" ],
    "EHRENAMT" : [ "edit_member_projyear", "edit_member_school" ],
    "FEST" : [ "edit_member_projyear", "edit_member_school" ],
    "STUDENT" : [ "edit_member_since", "edit_member_until" ],
    "REFUGEE" : [ "edit_member_since", "edit_member_until" ],
    "SHORT" : [ "edit_member_projyear", "edit_member_school" ],
    "REG_COURSE" : [ "edit_member_projyear", "edit_member_school" ],
    "REG_EVENT" : [ "edit_member_projyear", "edit_member_school" ]
}

/**
 * Je nach Mitglieds-Art sind verschiedene Felder verpflichtend
 */
MemberCoreDataEditor.prototype.mandatoryFieldsByType = {
    "" : [ "edit_member_zname", "edit_member_vname", "edit_member_type" ],
    "TEACHER" : [ "edit_member_type", "edit_member_zname", "edit_member_vname", "edit_member_since", "edit_member_birthdate", "edit_member_sex", "edit_member_zipcode", "edit_member_city", "edit_member_street" ],
    "SCOUT" : [ "edit_member_type", "edit_member_projyear", "edit_member_zname", "edit_member_vname", "edit_member_birthdate", "edit_member_sex", "edit_member_zipcode", "edit_member_city", "edit_member_street" ],
    "EXSCOUT" : [ "edit_member_type", "edit_member_projyear", "edit_member_zname", "edit_member_vname", "edit_member_birthdate", "edit_member_sex", "edit_member_zipcode", "edit_member_city", "edit_member_street" ],
    "PRAKTIKANT" : [ "edit_member_type", "edit_member_projyear", "edit_member_zname", "edit_member_vname", "edit_member_birthdate", "edit_member_sex", "edit_member_zipcode", "edit_member_city", "edit_member_street" ],
    "EHRENAMT" : [ "edit_member_type", "edit_member_zname", "edit_member_vname", "edit_member_since", "edit_member_birthdate", "edit_member_sex", "edit_member_zipcode", "edit_member_city", "edit_member_street" ],
    "FEST" : [ "edit_member_type", "edit_member_zname", "edit_member_vname", "edit_member_since", "edit_member_birthdate", "edit_member_sex", "edit_member_zipcode", "edit_member_city", "edit_member_street" ],
    "SHORT" : [ "edit_member_type", "edit_member_since", "edit_member_until", , "edit_member_zname", "edit_member_vname" ],
    "STUDENT" : [ "edit_member_type", "edit_member_projyear", "edit_member_zname", "edit_member_vname" ],
    "REFUGEE" : [ "edit_member_type", "edit_member_projyear", "edit_member_zname", "edit_member_vname" ],
    "REG_COURSE" : [ "edit_member_type", "edit_member_projyear", "edit_member_zname", "edit_member_vname" ],
    "REG_EVENT" : [ "edit_member_type", "edit_member_projyear", "edit_member_zname", "edit_member_vname" ]
}

/**
 * Beim ändern des MemberTypes müssen verschiedene Felder ein/aus-geblendet
 * werden. Zudem sind in abhängigkeit des MemberTypes unterschiedliche Felder
 * verpflichtend
 */
MemberCoreDataEditor.prototype.onMemberTypeChange = function() {

    var type = document.getElementById("edit_member_type").value;
    UIUtils.adjustChildClass(this.targetCnr, this.hiddenFieldsByType[type], "hidden");
    UIUtils.adjustChildClass(this.targetCnr, this.mandatoryFieldsByType[type], "mandatory");
    this.adjustProjYear();
}

/**
 * Das Projektjahr ist eine MultiSelectBox. Der kleinste Wert der Selection wird
 * als member_since, der größte Wert der Selection als MemberUntil verwendet
 */
MemberCoreDataEditor.prototype.onProjYearChange = function() {

    var projYear = document.getElementById("edit_member_projyear");
    var years = projYear.value;
    var minYear = "";
    var maxYear = "";
    if (years && years.length) {

	var year = Math.min.apply(null, years);
	minYear = DateTimeUtils.formatDate(this.getStartOfProjectYear(year), "{dd}.{mm}.{yyyy}");

	year = Math.max.apply(null, years);
	maxYear = DateTimeUtils.formatDate(this.getEndOfProjectYear(year), "{dd}.{mm}.{yyyy}");
    }
    this.model.setValue("/member-model/core-data/member_since", minYear);
    this.model.setValue("/member-model/core-data/member_until", maxYear);
}

/**
 * stelle das Projekt-Jahr ein
 */
MemberCoreDataEditor.prototype.adjustProjYear = function() {

    var projYear = UIUtils.getElement("edit_member_projyear");
    var min = this.getProjYearFromDate(this.model.getValue("/member-model/core-data/member_since"));
    var max = this.getProjYearFromDate(this.model.getValue("/member-model/core-data/member_until"))

    var values = [];
    for (var i = min; i <= max; i++) {
	values.push(i);
    }

    projYear.value = values;
}

/**
 * berechne das Projekt-Jahr für ein gegebenes Datum.
 * 
 * Projektjahre starten immer am 1 Oktober. Das erste ProjektJahr war 2014. Die
 * Zählung beginnt bei 1.
 */
MemberCoreDataEditor.prototype.getProjYearFromDate = function(date) {

    var result = "";
    if (DateTimeUtils.isDate(date)) {
	date = DateTimeUtils.parseDate(date, "dd.mm.yyyy");
	result = date.getFullYear() - 2014;
	if (date.getMonth() > 8) {
	    result++;
	}
    }
    return (result < 0) ? "" : result;
}

/**
 * berechne den Anfang eines gegebenen Projekt-Jahres
 */
MemberCoreDataEditor.prototype.getStartOfProjectYear = function(projYear) {

    var result = new Date(2014, 9, 1, 0, 0, 0, 0);
    result.setFullYear(result.getFullYear() + projYear - 1);
    return result;
}

/**
 * berechne das Ende eines gegebenen Projekt-Jahres
 */
MemberCoreDataEditor.prototype.getEndOfProjectYear = function(projYear) {

    var result = new Date(2014, 6, 31, 0, 0, 0, 0);
    result.setFullYear(result.getFullYear() + projYear);
    return result;
}

/**
 * 
 */
MemberCoreDataEditor.prototype.onSexChange = function() {

    var thumb = document.getElementById("edit_member_image");
    if (!thumb.src.startsWith("data:")) {
	var id = this.model.getValue("/member-model/core-data/id");
	var sex = this.model.getValue("/member-model/core-data/sex");
	var url = "getDocument/memberImage?id=" + id + "&sex=" + sex + "&domain=THUMBNAIL";
	thumb.src = url;
    }
}

/**
 * 
 */
MemberCoreDataEditor.prototype.adjustDSEState = function() {

    var state = this.model.getValue("//member-model/core-data/dse-state");
    var result = " Die Datenschutz-Erklärung wurde ";
    switch (state) {
    case "NONE":
	result += "noch nicht zugestellt";
	break;

    case "PENDING":
	result += "am " + this.model.getValue("//member-model/core-data/dse-date") + " zugestellt, die Antwort steht noch aus";
	break;

    case "ACCEPTED":
	result += "am " + this.model.getValue("//member-model/core-data/dse-date") + " akzeptiert";
	break;

    case "REJECTED":
	result += "am " + this.model.getValue("//member-model/core-data/dse-date") + " abgelehnt";
	break;
    }
    UIUtils.getElement("edit_member_dse_state").textContent = result;
}

/**
 * 
 */
MemberCoreDataEditor.prototype.activate = function() {

    var elem = UIUtils.getElement("edit_member_zname");
    if (elem) {
	elem.focus();
    }
}

/*---------------------------------------------------------------------------*/
/**
 * Der SubEditor für die Kommunikations-Daten
 */

var MemberCommDataEditor = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);
    this.model = model;

    var self = this;
    this.load("gui/member/member_editor_comm.html", function() {

	self.model.createValueBinding("edit_member_phone", "/member-model/core-data/phone");
	self.model.createValueBinding("edit_member_phone2", "/member-model/core-data/phone2");
	self.model.createValueBinding("edit_member_mobile", "/member-model/core-data/mobile");
	self.model.createValueBinding("edit_member_mobile2", "/member-model/core-data/mobile2");
	self.model.createValueBinding("edit_member_email", "/member-model/core-data/email");
	self.model.createValueBinding("edit_member_email2", "/member-model/core-data/email2");

	new PhoneInputField("edit_member_phone");
	new PhoneInputField("edit_member_mobile");
	new PhoneInputField("edit_member_phone2");
	new PhoneInputField("edit_member_mobile2");

	// instantiate the image picker
	var sign = document.getElementById("edit_member_signature");
	var id = self.model.getValue("/member-model/core-data/id");
	var url = "getDocument/memberImage?id=" + id + "&domain=MAILSIG";
	sign.src = url;
	new FilePicker(sign, function(name, type, data) {
	    self.model.setValue("/member-model/core-data/mailsig", data);
	    self.model.setValue("/member-model/core-data/mailsig-mimetype", type);
	    sign.src = UIUtils.createDataUrl(type, data);
	});

	self.model.addChangeListener("//member-model/core-data/type", function() {
	    self.onMemberTypeChange();
	});
	self.onMemberTypeChange();
    });
}
MemberCommDataEditor.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
MemberCommDataEditor.prototype.onMemberTypeChange = function() {

    switch (this.model.getValue("//member-model/core-data/type")) {
    case "FEST":
    case "PRAKTIKANT":
	UIUtils.removeClass("edit_member_signature", "hidden");
	break;

    default:
	UIUtils.addClass("edit_member_signature", "hidden");
	break;
    }
}

/**
 * 
 */
MemberCommDataEditor.prototype.activate = function() {

    UIUtils.getElement("edit_member_phone").focus();
}

/*---------------------------------------------------------------------------*/
/**
 * Der SubEditor für die Kurs-Daten
 */
var MemberCourseOverview = function(parentFrame, targetCnr, model) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.model = model;
    this.currSelection = null;
    this.currRow = null;

    var self = this;
    this.load("gui/member/member_editor_courses.html", function() {

	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();
	self.fillTable();

	self.setupModelListener();
    });
}
MemberCourseOverview.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
MemberCourseOverview.prototype.setupModelListener = function() {

    var self = this;
    this.model.addChangeListener("/member-model/courses", function() {
	self.fillTable();
    });
}
/**
 * 
 */
MemberCourseOverview.prototype.activate = function() {

    this.targetCnr.focus();
    this.actionAdd.show();
    if (this.currSelection != null) {
	this.actionRemove.show();
    } else {
	this.actionRemove.hide();
    }
}

/**
 * 
 * @param xPathDefNode
 * @param useRelationType
 * @returns
 */
MemberCourseOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/course-add.svg", "Einen Kurs hinzu fügen", function() {

	new NewCourseOverview(false, function(newCourses) {

	    for (var i = 0; i < newCourses.length; i++) {
		var xPath = self.model.addElement("/member-model/courses", newCourses[i]);
		self.model.setValue(xPath + "/action", "CREATE");
	    }
	});
    });

    this.addAction(action);
    action.hide();

    this.keyMap[187] = function() {
	action.invoke();
    }
    return action;
}

/**
 * 
 * @returns
 */
MemberCourseOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/course-remove.svg", "Kurs-Zuordnung löschen", function() {

	var name = self.model.getValue(self.currSelection + "/name");
	var messg = MessageCatalog.getMessage("COURSE_ASSIGN_QUERY_REMOVE", name);
	var title = MessageCatalog.getMessage("COURSE_ASSIGN_QUERY_REMOVE_TITLE");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currSelection + "/action") == "CREATE") {
		self.model.removeElement(self.currSelection);
	    } else {
		self.model.setValue(self.currSelection + "/action", "REMOVE");
	    }

	    UIUtils.removeElement(self.currRow);
	    self.currSelection = self.currRow = null;
	    self.actionRemove.hide();
	});
    });

    this.addAction(action);
    action.hide();

    this.keyMap[46] = function() {
	action.invoke();
    }
    return action;
}

/**
 * 
 */
MemberCourseOverview.prototype.fillTable = function() {

    new TableDecorator("edit_member_courses");
    var table = document.getElementById("edit_member_courses");
    var body = table.getElementsByTagName("tbody")[0] || table;
    UIUtils.clearChilds(body);

    this.actionRemove.hide();

    // was passiert beim Tabellen-Klick?
    var self = this;
    var onclick = function(tr, course) {
	self.currRow = tr;
	self.currSelection = XmlUtils.getXPathTo(course);
	self.actionRemove.show();
    }

    var fields = this.getColumnDescriptor();
    var allCourses = this.model.evaluateXPath("//member-model/courses/course[action !='REMOVE']");
    for (var i = 0; i < allCourses.length; i++) {
	body.appendChild(this.renderOneCourse(allCourses[i], fields, onclick));
    }
}

/**
 * 
 */
MemberCourseOverview.prototype.renderOneCourse = function(course, fields, onclick) {

    var row = this.model.createTableRow(course, fields, onclick);

    var xpath = XmlUtils.getXPathTo(course);
    this.model.addChangeListener(xpath, function() {

	var action = course.getElementsByTagName("action")[0];
	if (action.textContent == "NONE") {
	    action.textContent = "MODIFY";
	}
    });
    return row;
}

/**
 * Der Descriptor für die Befüllung der Tabelle. Folgende Spalten werden
 * angelegt:
 * <ul>
 * <li>radioBtn zur selection</li>
 * <li>name </li>
 * <li>description </li>
 * </ul>
 */
MemberCourseOverview.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, course) {
	td.setAttribute("valign", "middle");
	var radio = document.createElement("input");
	radio.type = "radio";
	radio.name = "edit_member_course_overview";
	radio.value = course.getElementsByTagName("id")[0].textContent;
	return radio;
    });

    fields.push(function(td, course) {
	td.setAttribute("valign", "middle");
	return course.getElementsByTagName("name")[0].textContent;
    });

    fields.push(function(td, course) {

	var select = document.createElement("select");
	select.className = "inplace-select";

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
	var xpath = XmlUtils.getXPathTo(course);
	self.model.createValueBinding(select, xpath + "/photo_agreement");

	return select;

    });
    return fields;
}

/*---------------------------------------------------------------------------*/
/**
 * Der Translator für den FotoAgreement-Enum
 */
var PhotoAgreementTranslator = (function() {

    var explanationsByEnumName = {
	NONE : "Kein Foto-Einverständnis",
	INTERN : "Nur für interne Verwendung",
	PRINT_ONLY : "Nur für Print-Medien",
	FULL : "komplettes Einverständnis"
    };
    return {

	translate : function(value) {
	    return explanationsByEnumName[value] || explanationsByEnumName["NONE"];
	}
    }

})();
