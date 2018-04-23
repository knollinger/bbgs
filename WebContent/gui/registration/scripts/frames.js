/*---------------------------------------------------------------------------*/
/**
 * 
 */
var HelloFrame = function() {

    WorkSpaceFrame.call(this);
    var self = this;
    WorkSpace.enableForeButton(false);
    this.load("gui/registration/pages/hello.html", function() {
	self.setTitle("Herzlich willkommen!");
	self.loadModel(function() {
	    WorkSpace.enableForeButton(true);
	});
    });
}
HelloFrame.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
HelloFrame.prototype.onActivation = function() {

    WorkSpace.enableBackButton(false);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
HelloFrame.prototype.onGoFore = function() {
    new CourseChooserFrame(this.model);
}

/**
 * 
 */
HelloFrame.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-registration-model-ok-rsp":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    break;
	}
    }

    caller.onError = function(req, status) {
    }

    var req = XmlUtils.createDocument("get-registration-model-req");
    caller.invokeService(req);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CourseChooserFrame = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;

    var self = this;
    this.load("gui/registration/pages/courses.html", function() {
	self.setTitle("Art der Anmeldung");
	UIUtils.getElement("course_type_regular").addEventListener("click", function() {
	    self.fillCourses("//get-registration-model-ok-rsp/courses/course[type='REGULAR']");
	});
	UIUtils.getElement("course_type_event").addEventListener("click", function() {
	    self.fillCourses("//get-registration-model-ok-rsp/courses/course[type='ONETIME']");
	});
    });
}
CourseChooserFrame.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
CourseChooserFrame.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
CourseChooserFrame.prototype.fillCourses = function(xpath) {

    UIUtils.clearChilds("course-cnr");

    var allCourses = this.model.evaluateXPath(xpath);
    for (var i = 0; i < allCourses.length; i++) {

	this.renderOneCourse(allCourses[i]);
    }
}

/**
 * 
 */
CourseChooserFrame.prototype.renderOneCourse = function(course) {

    var result = document.createElement("div");
    result.className = "course-overview-item";

    var termine = this.createTerminCnr(course);
    var radio = this.createRadioButton(course.getElementsByTagName("id")[0].textContent);
    var expand = this.createExpandButton(termine);

    var content = document.createElement("div");
    content.appendChild(this.createTitle(radio, course.getElementsByTagName("name")[0].textContent, expand));
    content.appendChild(this.createDescription(course));
    content.appendChild(termine);
    result.appendChild(content);

    result.addEventListener("click", function(evt) {
	if (evt.target == result) {
	    radio.click();
	    expand.click();
	}
    })

    UIUtils.getElement("course-cnr").appendChild(result);
}

/**
 * 
 */
CourseChooserFrame.prototype.createDescription = function(course) {

    var desc = document.createElement("div");
    desc.className = "course-overview-termin-description";
    desc.textContent = course.getElementsByTagName("description")[0].textContent;
    return desc;
}

/**
 * 
 */
CourseChooserFrame.prototype.createTitle = function(radio, text, expand) {

    var result = document.createElement("div");
    result.className = "course-overview-termin-title";

    result.appendChild(radio);
    var span = document.createElement("span");
    span.textContent = text;
    result.appendChild(span);
    result.appendChild(expand);

    result.addEventListener("click", function() {
	expand.click();
    });

    return result;
}
/**
 * 
 */
CourseChooserFrame.prototype.createTerminCnr = function(course) {

    var terminCnr = document.createElement("div");
    terminCnr.className = "course-overview-termin-cnr hidden";

    var allTermins = course.getElementsByTagName("termin");
    for (var i = 0; i < allTermins.length; i++) {

	var xpath = XmlUtils.getXPathTo(allTermins[i]);

	row = this.createRow("course-overview-termin-row");

	var col = document.createElement("div");
	col.className = "grid-col-1";
	col.textContent = this.model.getValue(xpath + "/date") + " " + this.model.getValue(xpath + "/from") + " - " + this.model.getValue(xpath + "/until");
	row.appendChild(col);

	var locId = this.model.getValue(xpath + "/location-id");
	xpath = "//get-registration-model-ok-rsp/locations/location[id='" + locId + "']";
	col = document.createElement("div");
	col.className = "grid-col-1";
	col.textContent = this.model.getValue(xpath + "/name") + " " + this.model.getValue(xpath + "/zip-code") + " " + this.model.getValue(xpath + "/city") + " " + this.model.getValue(xpath + "/street");
	row.appendChild(col);

	terminCnr.appendChild(row);
    }
    return terminCnr;
}

/**
 * 
 */
CourseChooserFrame.prototype.createRadioButton = function(id) {

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "course_selection";
    radio.id = "course_selection_" + id;
    return radio;
}

/**
 * 
 */
CourseChooserFrame.prototype.createExpandButton = function(target) {

    var check = document.createElement("input");
    check.type = "checkbox";
    check.addEventListener("click", function(evt) {
	evt.stopPropagation();
	if (check.checked) {
	    UIUtils.removeClass(target, "hidden");
	} else {
	    UIUtils.addClass(target, "hidden");
	}
    });
    return check;
}
/**
 * 
 */
CourseChooserFrame.prototype.createRow = function(clazz, text) {

    var row = document.createElement("div");
    row.className = clazz;
    row.textContent = text;
    return row;
}

/**
 * 
 */
CourseChooserFrame.prototype.onGoFore = function() {

    new MemberDataEditor(this.model);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MemberDataEditor = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;
    var self = this;
    this.load("gui/registration/pages/memberdata.html", function() {
	self.setTitle("Persönliche Daten des Teilnehmenden");
	self.model.createValueBinding("zname", "//get-registration-model-ok-rsp/core-data/zname");
	self.model.createValueBinding("vname", "//get-registration-model-ok-rsp/core-data/vname");
	self.model.createValueBinding("birthday", "//get-registration-model-ok-rsp/core-data/birth_date");
	self.model.createValueBinding("sex", "//get-registration-model-ok-rsp/core-data/sex");
	self.model.createValueBinding("zipcode", "//get-registration-model-ok-rsp/core-data/zip_code");
	self.model.createValueBinding("city", "//get-registration-model-ok-rsp/core-data/city");
	self.model.createValueBinding("street", "//get-registration-model-ok-rsp/core-data/street");
	self.model.createValueBinding("phone", "//get-registration-model-ok-rsp/core-data/phone");
	self.model.createValueBinding("mobile", "//get-registration-model-ok-rsp/core-data/mobile");
	self.model.createValueBinding("email", "//get-registration-model-ok-rsp/core-data/email");

	// familyInsurance & healthInsurance fehlen noch
    });
}
MemberDataEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberDataEditor.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
MemberDataEditor.prototype.onGoFore = function() {

    new SchoolEditor(this.model);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var SchoolEditor = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;

    var self = this;
    this.load("gui/registration/pages/schools.html", function() {
	self.setTitle("Schule/Betreuung");
	self.fillSchools();
    });
}
SchoolEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
SchoolEditor.prototype.onGoFore = function() {
    new ContactEditor(this.model);
}

/**
 * 
 */
SchoolEditor.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
SchoolEditor.prototype.fillSchools = function() {

    var cnr = UIUtils.getElement("partner-cnr");
    cnr.appendChild(this.renderOneSchool(-1, "Keine unserer Partnerschulen/Einrichtungen"));

    var allSchools = this.model.evaluateXPath("//get-registration-model-ok-rsp/partners/partner");
    for (var i = 0; i < allSchools.length; i++) {
	var id = allSchools[i].getElementsByTagName("id")[0].textContent;
	var name = allSchools[i].getElementsByTagName("name")[0].textContent;
	cnr.appendChild(this.renderOneSchool(id, name));
    }
}

/**
 * 
 */
SchoolEditor.prototype.renderOneSchool = function(id, name) {

    var label = document.createElement("label");
    label.className = "grid-row-0";
    label.style.display = "block";
    label["for"] = "partner_" + id;

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.id = "partner_" + id;
    radio.name = "partners";
    label.appendChild(radio);

    var text = document.createTextNode(name);
    label.appendChild(text);

    var self = this;
    radio.addEventListener("click", function() {
	self.model.setValue("//get-registration-model-ok-rsp/core-data/school", id);
    });

    if (this.model.getValue("//get-registration-model-ok-rsp/core-data/school") == id) {
	radio.checked = true;
    }
    return label;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var ContactEditor = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;

    var self = this;
    this.load("gui/registration/pages/contacts.html", function() {

	self.setTitle("Kontakt-Personen");

	self.actionAdd = self.addAction("gui/registration/images/person-add.svg", "Kontaktperson hinzu fügen", function() {
	    self.createContact();
	});
	self.actionRemove = self.addAction("gui/registration/images/person-remove.svg", "Kontaktperson entfernen", function() {

	});
	new ToolTip(self.actionAdd, ToolTip.noIcon, "Hier klicken, um eine neue Kontaktperson anzulegen");
    });

}
ContactEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
ContactEditor.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
ContactEditor.prototype.onGoFore = function() {

    new HealthEditor(this.model);
}

/**
 * 
 */
ContactEditor.prototype.createContact = function() {

    var contact = document.createElement("div");
    contact.className = "contact-overview-item";
    var radio = this.createRadio();
    contact.appendChild(radio);

    var content = document.createElement("div");
    content.className = "contact-overview-item-content";
    contact.appendChild(content);

    var relation = this.createRelationSelector();
    content.appendChild(relation);
    content.appendChild(this.createZNameEntry());
    content.appendChild(this.createVNameEntry());
    content.appendChild(this.createPhoneEntry());
    content.appendChild(this.createMobileEntry());
    content.appendChild(this.createEmailEntry());

    UIUtils.getElement("contacts-cnr").appendChild(contact);
    relation.focus();

    contact.addEventListener("click", function() {
	radio.click();
    });
}

/**
 * 
 */
ContactEditor.prototype.createRadio = function() {

    var radio = document.createElement("input");
    radio.className = "contact-overview-item-selector";
    radio.type = "radio";
    radio.name = "contact";
    // radio.id = ???
    return radio;
}

/**
 * 
 */
ContactEditor.prototype.createRelationSelector = function() {

    var keysAndValues = [ {
	key : "FATHER",
	value : "Vater"
    }, {
	key : "MOTHER",
	value : "Mutter"
    }, {
	key : "GFATHER",
	value : "Großvater"
    }, {
	key : "GMOTHER",
	value : "Großmutter"
    }, {
	key : "BROTHER",
	value : "Bruder"
    }, {
	key : "SISTER",
	value : "Schwester"
    }, {
	key : "TUTOR",
	value : "Betreuer"
    }, {
	key : "OTHER",
	value : "Sonstiges"
    }, ];
    var result = document.createElement("select");
    result.className = "mandatory grid-col-2";

    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Beziehung";
    opt.selected = opt.disabled = true;
    result.appendChild(opt);

    for (var i = 0; i < keysAndValues.length; i++) {
	opt = document.createElement("option");
	opt.value = keysAndValues[i].key;
	opt.textContent = keysAndValues[i].value;
	result.appendChild(opt);
    }

    return result;
}

/**
 * 
 */
ContactEditor.prototype.createZNameEntry = function() {

    var result = document.createElement("input");
    result.className = "mandatory grid-col-1";
    result.title = "Name";
    result.placeholder = "Name";
    return result;
}

/**
 * 
 */
ContactEditor.prototype.createVNameEntry = function() {

    var result = document.createElement("input");
    result.className = "mandatory grid-col-1";
    result.title = "Vorame";
    result.placeholder = "Vorame";
    return result;
}

/**
 * 
 */
ContactEditor.prototype.createPhoneEntry = function() {

    var result = document.createElement("input");
    result.className = "mandatory grid-col-1";
    result.title = "Festnetz";
    result.placeholder = "Festnetz";
    return result;
}

/**
 * 
 */
ContactEditor.prototype.createMobileEntry = function() {

    var result = document.createElement("input");
    result.className = "mandatory grid-col-1";
    result.title = "Mobil-Nummer";
    result.placeholder = "Mobil-Nummer";
    return result;
}

/**
 * 
 */
ContactEditor.prototype.createEmailEntry = function() {

    var result = document.createElement("input");
    result.className = "mandatory grid-col-2";
    result.title = "Email";
    result.placeholder = "Email";
    return result;
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var HealthEditor = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;

    var self = this;
    this.load("gui/registration/pages/health.html", function() {

	self.setTitle("Erhebung zur körperlichen Verfassung");
    });

}
HealthEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
HealthEditor.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
HealthEditor.prototype.onGoFore = function() {

    new FoodEditor(this.model);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var FoodEditor = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;

    var self = this;
    this.load("gui/registration/pages/food.html", function() {

	self.setTitle("Ernährungs-Gewohnheiten");
    });

}
FoodEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
FoodEditor.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
FoodEditor.prototype.onGoFore = function() {

    new PhotoEditor(this.model);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var PhotoEditor = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;

    var self = this;
    this.load("gui/registration/pages/photo.html", function() {

	self.setTitle("Foto-Einverständniss");
    });

}
PhotoEditor.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
PhotoEditor.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(true);
}

/**
 * 
 */
PhotoEditor.prototype.onGoFore = function() {

    new CommitFrame();
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var CommitFrame = function(model) {

    WorkSpaceFrame.call(this);
    this.model = model;

    var self = this;
    this.load("gui/registration/pages/commit.html", function() {

	self.setTitle("Die Anmeldung abschliessen");
    });

}
CommitFrame.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
CommitFrame.prototype.onActivation = function() {

    WorkSpace.enableBackButton(true);
    WorkSpace.enableForeButton(false);
}
