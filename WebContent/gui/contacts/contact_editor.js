var ContactOverview = function(parentFrame, targetCnr, model, xPath, xPathDefNode, useRelation) {

    WorkSpaceTabPane.call(this, parentFrame, targetCnr);

    this.model = model;
    this.xPath = xPath;
    this.xPathDefNode = xPathDefNode;
    this.useRelation = useRelation;
    this.keyMap = {};
    UIUtils.addKeyMap(targetCnr, this.keyMap);

    var self = this;
    this.load("gui/contacts/contact_overview.html", function() {

	self.actionAdd = self.createAddAction();
	self.actionRemove = self.createRemoveAction();
	self.fillContent();
    });
}
ContactOverview.prototype = Object.create(WorkSpaceTabPane.prototype);

/**
 * 
 */
ContactOverview.prototype.activate = function() {

    this.targetCnr.focus();
    this.actionAdd.show();
}
/**
 * Das Template zur Erstellung eines neuen Contacts
 */
ContactOverview.EMPTY_CONTACT = "<contact><action>CREATE</action><relation/><id/><zname/><vname/><vname2/><title/><phone/><mobile/><email/><phone2/><mobile2/><email2/><zip-code/><city/><street/></contact>";

/**
 * 
 * @param xPathDefNode
 * @param useRelationType
 * @returns
 */
ContactOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-add.svg", "Kontakt anlegen", function() {
	var doc = XmlUtils.parse(ContactOverview.EMPTY_CONTACT);
	self.currContact = self.model.addElement(self.xPath, doc.documentElement);
	
	var row = self.renderOneContact(self.model.evaluateXPath(self.currContact)[0]);
	UIUtils.getElement("edit_contact_overview").appendChild(row);
	row.querySelector(".mandatory").focus();
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
ContactOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/person-remove.svg", "Kontakt anlegen", function() {

	var zname = self.model.getValue(self.currContact + "/zname");
	var vname = self.model.getValue(self.currContact + "/vname");
	var messg = MessageCatalog.getMessage("CONTACT_QUERY_REMOVE", zname, vname);
	var title = MessageCatalog.getMessage("CONTACT_QUERY_REMOVE_TITLE");
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    if (self.model.getValue(self.currContact + "/action") == "CREATE") {
		self.model.removeElement(self.currContact);
	    } else {
		self.model.setValue(self.currContact + "/action", "REMOVE");
	    }

	    UIUtils.removeElement(self.currRow);
	    self.currContact = self.currRow = null;
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
ContactOverview.prototype.fillContent = function() {

    UIUtils.clearChilds("edit_contact_overview");

    var allContacts = this.model.evaluateXPath(this.xPath + "/contact[action != 'REMOVE']");
    for (var i = 0; i < allContacts.length; i++) {

	var row = this.renderOneContact(allContacts[i]);
	UIUtils.getElement("edit_contact_overview").appendChild(row);
    }
}

/**
 * 
 */
ContactOverview.prototype.renderOneContact = function(contact) {

    var item = document.createElement("div");
    item.className = "contact-overview-item";

    var radio = this.createSelector(contact, item);
    item.appendChild(radio);

    var content = document.createElement("div");
    content.className = "contact-overview-item-content";
    item.appendChild(content);

    var row = document.createElement("div");
    row.className = "grid-row-0";
    content.appendChild(row);

    if (this.useRelation) {
	row.appendChild(this.createTypeSelect(contact));
	row = document.createElement("div");
	row.className = "grid-row-0";
	content.appendChild(row);
    }

    row.appendChild(this.createEdit(contact, "zname", "Name", "Name", "mandatory"));
    row.appendChild(this.createEdit(contact, "vname", "Vorname", "Vorname", "mandatory"));

    row = document.createElement("div");
    row.className = "grid-row-0";
    content.appendChild(row);
    row.appendChild(this.createFallbackEdit(contact, "zip-code", "PLZ", "PLZ"));
    row.appendChild(this.createFallbackEdit(contact, "city", "Ort", "Ort"));
    
    row = document.createElement("div");
    row.className = "grid-row-0";
    content.appendChild(row);
    row.appendChild(this.createFallbackEdit(contact, "street", "Straße", "Straße", "grid-col-2"));
    
    
    content.appendChild(this.createFallbackRow(contact, "phone", "Festnetz", "Festnetz"));
    content.appendChild(this.createFallbackRow(contact, "mobile", "Mobil-Nummer", "Mobil-Nr"));
    content.appendChild(this.createFallbackRow(contact, "email", "EMail", "EMail"));

    contact.addEventListener("change", function() {
	var action = contact.getElementsByTagName("action")[0];
	if (action.textContent != "REMOVE" && action.textContent != "CREATE") {
	    action.textContent = "MODIFY";
	}
    });

    item.addEventListener("click", function() {
	radio.click();
    });
    return item;
}

/**
 * 
 */
ContactOverview.prototype.createSelector = function(contact, row) {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.className = "contact-overview-item-selector";
    radio.name = "contact_overview_radios";

    var self = this;
    radio.onclick = function() {
	self.currRow = row;
	self.currContact = XmlUtils.getXPathTo(contact);
	self.actionRemove.show();
    };
    return radio;
}

/**
 * 
 */
ContactOverview.prototype.createEdit = function(contact, nodeName, placeHolder, title, classes) {

    var input = document.createElement("input");
    input.className = "grid-col-1";
    input.placeholder = placeHolder;
    input.title = title;
    UIUtils.addClass(input, classes);

    var xpath = XmlUtils.getXPathTo(contact) + "/" + nodeName;
    this.model.createValueBinding(input, xpath);
    return input;
}

/**
 * 
 */
ContactOverview.prototype.createFallbackEdit = function(contact, nodeName, placeHolder, title, classes) {

    var xpath = this.xPathDefNode + "/" + nodeName;
    var place = this.model.getValue(xpath) || placeHolder;
    var input = this.createEdit(contact, nodeName, place, title, classes);

    var self = this;
    this.model.addChangeListener(xpath, function() {

	place = self.model.getValue(xpath)  || placeHolder;
	input.placeholder = place;
    });
    return input;
}

/**
 * 
 */
ContactOverview.prototype.createFallbackRow = function(contact, nodeName, placeHolder, title) {

    var row = document.createElement("div");
    row.className = "grid-row-0";

    row.appendChild(this.createFallbackEdit(contact, nodeName, placeHolder, title));
    row.appendChild(this.createFallbackEdit(contact, nodeName + "2", "2. " + placeHolder, "2. " + title));
    return row;
}

/**
 * 
 */
ContactOverview.prototype.createTypeSelect = function(contact) {

    var select = document.createElement("select");
    select.className = "grid-col-1 mandatory";

    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Beziehung";
    opt.disabled = opt.selected = true;
    select.appendChild(opt);

    for (var i = 0; i < ContactOverview.RELATION_MAP.length; i++) {

	opt = document.createElement("option");
	opt.value = ContactOverview.RELATION_MAP[i].key;
	opt.textContent = ContactOverview.RELATION_MAP[i].value;
	select.appendChild(opt);
    }

    var xpath = XmlUtils.getXPathTo(contact) + "/relation";
    this.model.createValueBinding(select, xpath);

    return select;
}

/**
 * 
 */
ContactOverview.RELATION_MAP = [ {
    key : "FATHER",
    value : "Vater"
}, {
    key : "MOTHER",
    value : "Mutter"
}, {
    key : "PARENTS",
    value : "Eltern"
}, {
    key : "BROTHER",
    value : "Bruder"
}, {
    key : "SISTER",
    value : "Schwester"
}, {
    key : "UNCLE",
    value : "Onkel"
}, {
    key : "AUNT",
    value : "Tante"
}, {
    key : "GFATHER",
    value : "Großvater"
}, {
    key : "GMOTHER",
    value : "Großmutter"
}, {
    key : "TUTOR",
    value : "Betreuer"
}, {
    key : "OTHER",
    value : "Sonstiges"
}

];
