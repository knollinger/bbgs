/**
 * 
 */
var Adressbook = function(model, xpath, mode) {

    WorkSpaceTabbedFrame.call(this, "member_edit_tabbed_dlg");

    var self = this;
    this.result = new ModelWorkingCopy(model, xpath);
    this.result.addChangeListener("//send-to", function() {
	self.enableSaveButton(true);
    });
    this.setTitle("Adressbuch");
    this.loadModel(function() {

	self.setupMembersView(mode || Adressbook.ALL);
	self.setupMemberTypesView();
	self.setupCoursesView();
	self.setupPartnerView();
	self.setupCustomGroupsView();
    });
}
Adressbook.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
Adressbook.ALL = 0;
Adressbook.MAIL = 1;
Adressbook.SMS = 2;

/**
 * 
 */
Adressbook.prototype.loadModel = function(onSuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-adressbook-ok-response":
	    self.model = new Model(rsp);
	    onSuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("ADDRBOOK_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("ADDRBOOK_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("ADDRBOOK_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("ADDRBOOK_LOAD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-adressbook-request");
    caller.invokeService(req);
}

/**
 * 
 */
Adressbook.prototype.setupMembersView = function(mode) {

    var self = this;
    this.membersTab = this.addTab("gui/images/person.svg", "Mitglieder");
    var subFrame = new AdressbookMembersView(this, this.membersTab.contentPane, this.model, this.result, mode);
    this.membersTab.associateTabPane(subFrame);
    this.membersTab.select();
}

/**
 * 
 */
Adressbook.prototype.setupMemberTypesView = function() {

    var self = this;
    this.memberTypesTab = this.addTab("gui/images/person-group.svg", "Mitglieds-Arten");
    var subFrame = new AdressbookMemberTypesView(this, this.memberTypesTab.contentPane, this.model, this.result);
    this.memberTypesTab.associateTabPane(subFrame);
}

/**
 * 
 */
Adressbook.prototype.setupPartnerView = function() {

    var self = this;
    this.partnerTab = this.addTab("gui/images/partner.svg", "Partner");
    var subFrame = new AdressbookPartnerView(this, this.partnerTab.contentPane, this.model, this.result);
    this.partnerTab.associateTabPane(subFrame);
}

/**
 * 
 */
Adressbook.prototype.setupCoursesView = function() {

    var self = this;
    this.coursesTab = this.addTab("gui/images/course.svg", "Kurse");
    var subFrame = new AdressbookCoursesView(this, this.coursesTab.contentPane, this.model, this.result);
    this.coursesTab.associateTabPane(subFrame);
}

/**
 * 
 */
Adressbook.prototype.setupCustomGroupsView = function() {

    var self = this;
    this.customGroupsTab = this.addTab("gui/images/person-group.svg", "Eigene Mailverteiler");
    var subFrame = new AdressbookCustomView(this, this.customGroupsTab.contentPane, this.model, this.result);
    this.customGroupsTab.associateTabPane(subFrame);
}

/**
 * 
 */
Adressbook.prototype.onSave = function() {
    this.result.commit();
}

/*---------------------------------------------------------------------------*/
/**
 * Basis-Klasse für die SubView. Alle SubViews haben die selben Probleme:
 */
AdressbookSubView = function(parentFrame, targetCnr, model, result) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.model = model;
    this.result = result;
}
AdressbookSubView.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
AdressbookSubView.prototype.createCheckbox = function(name, node, parentXPath, elemXPath) {

    var self = this;
    var check = document.createElement("input");
    check.type = "checkbox";
    check.name = name;

    if (self.result.containsElement(elemXPath)) {
	check.checked = true;
    }
    return check;
}

/**
 * behandle den Click auf eine TableRow. Die Selection/Deselection der
 * radiobuttons/checkboxen übernimmt hier das TableBinding des Models.
 * 
 * Wenn nun die checkbox/der Radiobutton selektiert wurde, dann wird eine Kopie
 * der Node in den angegebenen parentXPath transferiert.
 * 
 * Wenn die Checkbox/der Radiobutton delektiert wurde, dann wird diese Kopie
 * wieder aus dem parentXPath entfernt. Dummerweise können wir da nicht mit der
 * NodeReferenz arbeiten, es wurde ja eine Kopie transferiert. wir arbeiten also
 * mit dem ID-Attribut und basteln daraus einen xpath.
 */
AdressbookSubView.prototype.handleTableRowClick = function(tr, parentXPath, node) {

    var check = tr.querySelector("input");
    if (check.checked) {
	this.result.addElement(parentXPath, node);
    } else {

	console.log(this.result.stringify());
	var id = node.getElementsByTagName("id")[0].textContent;
	var nodeName = node.nodeName;
	var xpath = parentXPath + "/" + nodeName + "[id='" + id + "']";
	console.log(xpath);
	this.result.removeElement(xpath);
	console.log(this.result.stringify());
    }
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
AdressbookMembersView = function(parentFrame, targetCnr, model, result, mode) {

    AdressbookSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/member_view.html", function() {

	self.fillTable(model, mode);
	self.setupAtAllCheckbox(mode);
    });
}
AdressbookMembersView.prototype = Object.create(AdressbookSubView.prototype);

/**
 * 
 */
AdressbookMembersView.prototype.setupAtAllCheckbox = function(mode) {

    var self = this;

    // setup the Label
    var label = UIUtils.getElement("adressbook_at_all_label");
    label.textContent = (mode == Adressbook.SMS) ? "SMS an alle" : "Mail an alle";

    var atAll = UIUtils.getElement("adressbook_at_all");
    atAll.addEventListener("click", function() {

	allCheckBoxes = UIUtils.getElement("edit_mail_memberview_body").getElementsByTagName("input");
	for (var i = 0; i < allCheckBoxes.length; i++) {

	    var cb = allCheckBoxes[i];
	    if (cb.checked != atAll.checked) {
		cb.click();
	    }
	}
    });
    atAll.focus();
}

/**
 * 
 */
AdressbookMembersView.prototype.fillTable = function(model, mode) {

    new TableDecorator("edit_mail_memberview");
    var self = this;

    var filter = function(member) {
	var result = true;
	switch (mode) {
	case Adressbook.MAIL:
	    var node = member.getElementsByTagName("email")[0];
	    result = node && node.textContent;
	    break;

	case Adressbook.SMS:
	    var node = member.getElementsByTagName("mobile")[0];
	    result = node && node.textContent;
	    break;

	default:
	    break;
	}
	return result;
    }

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, member) {
	self.handleTableRowClick(tr, "/send-to/members", member);
    }

    var allMembers = "/get-adressbook-ok-response/members/member";
    var fields = this.getColumnDescriptor();
    model.createTableBinding("edit_mail_memberview", fields, allMembers, onclick, filter);
}

/**
 * Der Descriptor für die Befüllung der Tabelle. Folgende Spalten werden
 * angelegt:
 * <ul>
 * <li>radioBtn zur model</li>
 * <li>name </li>
 * <li>description </li>
 * </ul>
 */
AdressbookMembersView.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, member) {

	var id = member.getElementsByTagName("id")[0].textContent;
	var parentXPath = "/send-to/members";
	var elemXPath = parentXPath + "/member[id='" + id + "']";
	return self.createCheckbox("edit_mail_memberview_check", member, parentXPath, elemXPath);
    });

    fields.push("zname");
    fields.push(function(td, member) {
	return member.getElementsByTagName("vname")[0].textContent;
    });

    fields.push(function(td, member) {
	return member.getElementsByTagName("mobile")[0].textContent;
    });
    fields.push(function(td, member) {
	return member.getElementsByTagName("email")[0].textContent;
    });
    return fields;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
AdressbookMemberTypesView = function(parentFrame, targetCnr, model, result) {

    AdressbookSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/membertype_view.html", function() {

	self.fillTable(model);
    });
}

AdressbookMemberTypesView.prototype = Object.create(AdressbookSubView.prototype);

/**
 * 
 */
AdressbookMemberTypesView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_membertypesview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, member) {
	self.handleTableRowClick(tr, "/send-to/types", member);
    }

    var allMembers = "/get-adressbook-ok-response/member-types/member-type";
    var fields = this.getColumnDescriptor();
    model.createTableBinding("edit_mail_membertypesview", fields, allMembers, onclick);
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
AdressbookMemberTypesView.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, memberType) {

	var type = memberType.textContent;
	var parentXPath = "/send-to/types";
	var elemXPath = parentXPath + "[member-type='" + type + "']";
	return self.createCheckbox("edit_mail_membertypesview_check", memberType, parentXPath, elemXPath);
    });

    fields.push(function(td, memberType) {

	var type = memberType.textContent;
	return MemberTypeTranslator[type];
    });
    return fields;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
AdressbookCoursesView = function(parentFrame, targetCnr, model, result) {

    AdressbookSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/courses_view.html", function() {

	self.fillTable(model);
    });
}

AdressbookCoursesView.prototype = Object.create(AdressbookSubView.prototype);

/**
 * 
 */
AdressbookCoursesView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_coursesview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, course) {
	self.handleTableRowClick(tr, "/send-to/courses", course);
    }

    var allCourses = "/get-adressbook-ok-response/courses/course";
    var fields = this.getColumnDescriptor();
    model.createTableBinding("edit_mail_coursesview", fields, allCourses, onclick);
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
AdressbookCoursesView.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, course) {

	var id = course.getElementsByTagName("id")[0].textContent;
	var parentXPath = "/send-to/courses";
	var elemXPath = parentXPath + "/course[id='" + id + "']";
	return self.createCheckbox("edit_mail_courseview_check", course, parentXPath, elemXPath);
    });

    fields.push(function(td, course) {
	return course.getElementsByTagName("name")[0].textContent;
    });

    fields.push(function(td, course) {
	return course.getElementsByTagName("description")[0].textContent;
    });
    return fields;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
AdressbookPartnerView = function(parentFrame, targetCnr, model, result) {

    AdressbookSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/partner_view.html", function() {

	self.fillTable(model);
    });
}
AdressbookPartnerView.prototype = Object.create(AdressbookSubView.prototype);

/**
 * 
 */
AdressbookPartnerView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_partnerview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, partner) {
	self.handleTableRowClick(tr, "/send-to/partners", partner);
    }

    var allGroups = "/get-adressbook-ok-response/partners/partner";
    var fields = this.getColumnDescriptor();
    model.createTableBinding("edit_mail_partnerview", fields, allGroups, onclick);
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
AdressbookPartnerView.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, partner) {

	var id = partner.getElementsByTagName("id")[0].textContent;
	var parentXPath = "/send-to/partners";
	var elemXPath = parentXPath + "/partner[id='" + id + "']";
	return self.createCheckbox("edit_mail_partnerview_check", partner, parentXPath, elemXPath);
    });

    fields.push("name");
    fields.push(function(td, partner) {
	UIUtils.addClass(td, "fill-on-mobile");
	return partner.getElementsByTagName("zname")[0].textContent;
    });

    fields.push(function(td, partner) {
	return partner.getElementsByTagName("vname")[0].textContent;
    });

    fields.push(function(td, partner) {
	var type = partner.getElementsByTagName("type")[0].textContent;
	return PartnerTypeTranslator[type];
    });
    return fields;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
AdressbookCustomView = function(parentFrame, targetCnr, model, result) {

    AdressbookSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/custom_view.html", function() {

	self.fillTable(model);
    });
}
AdressbookCustomView.prototype = Object.create(AdressbookSubView.prototype);

/**
 * 
 */
AdressbookCustomView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_customview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, customGroup) {
	self.handleTableRowClick(tr, "/send-to/custom-groups", customGroup);
    }

    var allGroups = "/get-adressbook-ok-response/custom-groups/custom-group";
    var fields = this.getColumnDescriptor();
    model.createTableBinding("edit_mail_customview", fields, allGroups, onclick);
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
AdressbookCustomView.prototype.getColumnDescriptor = function() {

    var self = this;
    var fields = [];
    fields.push(function(td, custom) {

	var id = custom.getElementsByTagName("id")[0].textContent;
	var parentXPath = "/send-to/custom-groups";
	var elemXPath = parentXPath + "/custom-group[id='" + id + "']";
	return self.createCheckbox("edit_mail_customview_check", custom, parentXPath, elemXPath);
    });

    fields.push(function(td, custom) {
	return custom.getElementsByTagName("name")[0].textContent;
    });

    fields.push(function(td, custom) {
	return custom.getElementsByTagName("description")[0].textContent;
    });

    return fields;
}
