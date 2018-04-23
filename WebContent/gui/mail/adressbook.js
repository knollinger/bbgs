/**
 * 
 */
var Adressbook = function(model, xpath, mode) {

    WorkSpaceTabbedFrame.call(this, "member_edit_tabbed_dlg");

    var self = this;
    this.result = new ModelWorkingCopy(model, xpath);
    this.result.addChangeListener("/", function() {
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
    var subFrame = new MailMembersView(this, this.membersTab.contentPane, this.model, this.result, mode);
    this.membersTab.associateTabPane(subFrame);
    this.membersTab.select();
}

/**
 * 
 */
Adressbook.prototype.setupMemberTypesView = function() {

    var self = this;
    this.memberTypesTab = this.addTab("gui/images/person-group.svg", "Mitglieds-Arten");
    var subFrame = new MailMemberTypesView(this, this.memberTypesTab.contentPane, this.model, this.result);
    this.memberTypesTab.associateTabPane(subFrame);
}

/**
 * 
 */
Adressbook.prototype.setupPartnerView = function() {

    var self = this;
    this.partnerTab = this.addTab("gui/images/partner.svg", "Partner");
    var subFrame = new MailPartnerView(this, this.partnerTab.contentPane, this.model, this.result);
    this.partnerTab.associateTabPane(subFrame);
}

/**
 * 
 */
Adressbook.prototype.setupCoursesView = function() {

    var self = this;
    this.coursesTab = this.addTab("gui/images/course.svg", "Kurse");
    var subFrame = new MailCoursesView(this, this.coursesTab.contentPane, this.model, this.result);
    this.coursesTab.associateTabPane(subFrame);
}

/**
 * 
 */
Adressbook.prototype.setupCustomGroupsView = function() {

    var self = this;
    this.customGroupsTab = this.addTab("gui/images/person-group.svg", "Eigene Mailverteiler");
    var subFrame = new MailCustomView(this, this.customGroupsTab.contentPane, this.model, this.result);
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
MailSubView = function(parentFrame, targetCnr, model, result) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.model = model;
    this.result = result;
}
MailSubView.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * Erzeuge eine Checkbox, welche im Context einer abgeleiteten Klasse in eine TD
 * eingebunden wird. Wenn die CB angeklickt wird, so werden alle mit Ihr über
 * den xpath referenzierten IDs entweder in die Selektion aufgenommen
 * (checked-state) oder aus der Selektion entfernt (unchecked-State)
 */
MailSubView.prototype.createCheckbox = function(name, node, parentXPath, elemXPath) {

    var self = this;
    var check = document.createElement("input");
    check.type = "checkbox";
    check.name = name;

    if (self.result.containsElement(elemXPath)) {
	check.checked = true;
    }

    check.addEventListener("click", function(evt) {
	evt.stopPropagation();
	if (check.checked) {
	    self.result.addElement(parentXPath, node);
	} else {
	    self.result.removeElement(elemXPath);
	}
    })

    return check;
}

/**
 * 
 */
MailSubView.prototype.handleTableRowClick = function(tr) {

    var cb = tr.getElementsByTagName("input")[0];
    if (cb) {
	cb.click();
    }
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
MailMembersView = function(parentFrame, targetCnr, model, result, mode) {

    MailSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/member_view.html", function() {

	self.fillTable(model, mode);
	self.setupAtAllCheckbox();
    });
}
MailMembersView.prototype = Object.create(MailSubView.prototype);

/**
 * 
 */
MailMembersView.prototype.setupAtAllCheckbox = function() {

    var self = this;
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
MailMembersView.prototype.fillTable = function(model, mode) {

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
	self.handleTableRowClick(tr);
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
MailMembersView.prototype.getColumnDescriptor = function() {

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
MailMemberTypesView = function(parentFrame, targetCnr, model, result) {

    MailSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/membertype_view.html", function() {

	self.fillTable(model);
    });
}

MailMemberTypesView.prototype = Object.create(MailSubView.prototype);

/**
 * 
 */
MailMemberTypesView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_membertypesview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, member) {
	self.handleTableRowClick(tr);
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
MailMemberTypesView.prototype.getColumnDescriptor = function() {

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
MailCoursesView = function(parentFrame, targetCnr, model, result) {

    MailSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/courses_view.html", function() {

	self.fillTable(model);
    });
}

MailCoursesView.prototype = Object.create(MailSubView.prototype);

/**
 * 
 */
MailCoursesView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_coursesview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, course) {
	self.handleTableRowClick(tr);
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
MailCoursesView.prototype.getColumnDescriptor = function() {

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
MailPartnerView = function(parentFrame, targetCnr, model, result) {

    MailSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/partner_view.html", function() {

	self.fillTable(model);
    });
}
MailPartnerView.prototype = Object.create(MailSubView.prototype);

/**
 * 
 */
MailPartnerView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_partnerview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, partner) {
	self.handleTableRowClick(tr);
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
MailPartnerView.prototype.getColumnDescriptor = function() {

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
	return partner.getElementsByTagName("mobile")[0].textContent;
    });

    fields.push(function(td, partner) {
	return partner.getElementsByTagName("email")[0].textContent;
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
MailCustomView = function(parentFrame, targetCnr, model, result) {

    MailSubView.call(this, parentFrame, targetCnr, model, result);
    this.model = model;

    var self = this;
    this.load("gui/mail/custom_view.html", function() {

	self.fillTable(model);
    });
}
MailCustomView.prototype = Object.create(MailSubView.prototype);

/**
 * 
 */
MailCustomView.prototype.fillTable = function(model) {

    new TableDecorator("edit_mail_customview");
    var self = this;

    // was passiert beim Tabellen-Klick?
    var onclick = function(tr, course) {
	self.handleTableRowClick(tr);
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
MailCustomView.prototype.getColumnDescriptor = function() {

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
