/**
 * 
 */
var CourseCalendar = function(mode, date) {

    WorkSpaceFrame.call(this);

    this.mode = mode || CourseCalendar.WEEKLY;
    this.currentDate = date || new Date();
    this.currSelection = null;

    var self = this;
    this.load("gui/courses/course_calendar.html", function() {
	self.setupUI();
	self.update();
	new TouchGesturesObserver(self.frame, self);
    });
}

/**
 * 
 */
CourseCalendar.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
CourseCalendar.WEEKLY = 1;
CourseCalendar.MONTHLY = 2;

/**
 * 
 */
CourseCalendar.prototype.setupUI = function() {

    var self = this;

    this.createEditAction();
    this.createRemoveAction();
    this.createShowWeeklyAction();
    this.createShowMonthlyAction();
    this.createPrintAction();

    // GoBack
    document.getElementById("course_calendar_goback").addEventListener("click", function() {
	switch (self.mode) {
	case CourseCalendar.WEEKLY:
	    self.currentDate.setDate(self.currentDate.getDate() - 7);
	    break;

	case CourseCalendar.MONTHLY:
	    self.currentDate.setMonth(self.currentDate.getMonth() - 1);
	    break;

	default:
	    break;
	}
	self.update();
    });

    // TODAY
    document.getElementById("course_calendar_go_today").addEventListener("click", function() {
	self.currentDate = new Date();
	self.update();
    });

    // GoFore
    document.getElementById("course_calendar_gofore").addEventListener("click", function() {
	switch (self.mode) {
	case CourseCalendar.WEEKLY:
	    self.currentDate.setDate(self.currentDate.getDate() + 7);
	    break;

	case CourseCalendar.MONTHLY:
	    self.currentDate.setMonth(self.currentDate.getMonth() + 1);
	    break;

	default:
	    break;
	}
	self.update();
    });    
}

/**
 * 
 */
CourseCalendar.prototype.createShowWeeklyAction = function() {

    var self = this;
    this.actionShowWeekly = new WorkSpaceFrameAction("gui/images/view-calendar-week.svg", "Wochen-Ansicht", function() {
	self.mode = CourseCalendar.WEEKLY;
	self.actionShowWeekly.hide();
	self.actionShowMonthly.show();
	self.currSelection = null;
	self.update();
    });
    this.addAction(this.actionShowWeekly);
    this.actionShowWeekly.hide();
}

/**
 * 
 */
CourseCalendar.prototype.createShowMonthlyAction = function() {

    var self = this;
    this.actionShowMonthly = new WorkSpaceFrameAction("gui/images/view-calendar-month.svg", "Monats-Ansicht", function() {
	self.mode = CourseCalendar.MONTHLY;
	self.actionShowWeekly.show();
	self.actionShowMonthly.hide();
	self.currSelection = null;
	self.update();
    });
    this.addAction(this.actionShowMonthly);
    this.actionShowMonthly.show();
}

/**
 * 
 */
CourseCalendar.prototype.createEditAction = function() {

    var self = this;
    this.actionEdit = new WorkSpaceFrameAction("gui/images/course-edit.svg", "Kurs-Termin bearbeiten", function() {

	var courseId = self.model.getValue(self.currSelection + "/course-id");
	var terminId = self.model.getValue(self.currSelection + "/id");
	new CourseEditor(courseId, terminId, function() {
	    self.update();
	});
    });
    this.addAction(this.actionEdit);
    this.actionEdit.hide();
    
    this.keyMap[13] = function(table, evt) {
	self.actionEdit.invoke();
    }
}

/**
 * 
 */
CourseCalendar.prototype.createRemoveAction = function() {

    var self = this;
    this.actionRemove = new WorkSpaceFrameAction("gui/images/course-remove.svg", "Kurs-Termin löschen", function() {

	var name = self.model.getValue(self.currSelection + "/name");
	var date = self.model.getValue(self.currSelection + "/date");

	var title = MessageCatalog.getMessage("COURSETERMIN_QUERY_REMOVE_TITLE");
	var messg = MessageCatalog.getMessage("COURSETERMIN_QUERY_REMOVE", date, name);
	new MessageBox(MessageBox.QUERY, title, messg, function() {

	    var caller = new ServiceCaller();
	    caller.onSuccess = function(rsp) {
		switch (rsp.documentElement.nodeName) {
		case "remove-course-termin-ok-response":
		    self.update();
		    break;

		case "error-response":
		    var title = MessageCatalog.getMessage("COURSETERMIN_REMOVE_ERROR_TITLE");
		    var messg = MessageCatalog.getMessage("COURSETERMIN_REMOVE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
		    new MessageBox(MessageBox.ERROR, title, messg);
		    break;
		}
	    }

	    caller.onError = function(req, status) {
		var title = MessageCatalog.getMessage("COURSETERMIN_REMOVE_ERROR_TITLE");
		var messg = MessageCatalog.getMessage("COURSETERMIN_REMOVE_TECH_ERROR", status);
		new MessageBox(MessageBox.ERROR, title, messg);
	    }
	    var req = XmlUtils.createDocument("remove-course-termin-request");
	    XmlUtils.setNode(req, "id", self.model.getValue(self.currSelection + "/id"));
	    caller.invokeService(req);
	});
    });
    this.addAction(this.actionRemove);
    this.actionRemove.hide();

    this.keyMap[46] = function(table, evt) {
	self.actionRemove.invoke();
    }
}

/**
 * Die PrintAction ist ein wenig spezieller.
 * 
 * Wenn nichts im Kalender ausgewählt ist, dann wird direkt der aktuelle
 * Kalender gedruckt. Liegt eine AUswahl vor, so wird ein Menu angezeigt. Dieses
 * liefert die AUswahl, den aktuellen Kalender oder nur den aktuell ausgewählten
 * Termin zu drucken.
 * 
 * "Drucken" meint hier aber, dass ein PDF mit dem gewünschten Kontent erzeugt
 * wird. Im Dock-Viewer kann dann DOwnload oder Druck veranlasst werden.
 */
CourseCalendar.prototype.createPrintAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/print.svg", "Kurs-Kalender drucken", function() {

	if (!self.currSelection) {
	    self.printCurrentCalendar();
	} else {

	    var menu = new PopupMenu(action.btn);
	    menu.makeMenuItem("aktuellen Kurs-Kalender drucken", function() {
		self.printCurrentCalendar();
	    });

	    menu.makeSeparator();
	    menu.makeMenuItem("ausgewählten Kurs drucken", function() {
		self.printCurrentCourse();
	    });
	}

    });
    this.addAction(action);
    
    
    return action;
}

/**
 * Drucke den aktuell angezeigten Kurs-Kalender
 */
CourseCalendar.prototype.printCurrentCalendar = function() {

    var startDate = DateTimeUtils.formatDate(this.findStartDate(), "{dd}.{mm}.{yyyy}");
    var endDate = DateTimeUtils.formatDate(this.findLastDate(), "{dd}.{mm}.{yyyy}");
    var url = "getDocument/course_overview.pdf?from=" + startDate + "&until=" + endDate;
    var title = "Kurs-Übersicht " + startDate + " - " + endDate;
    new DocumentViewer(url, title);
}

/**
 * Drucke den aktuell angezeigten Kurs-Kalender
 */
CourseCalendar.prototype.printCurrentCourse = function() {

    var courseId = this.model.getValue(this.currSelection + "/course-id");
    var title = "Details für den Kurs " + this.model.getValue(this.currSelection + "/name");
    var url = "getDocument/course_details.pdf?id=" + courseId;
    new DocumentViewer(url, title);
}

/**
 * von rechts nach links wischen
 */
CourseCalendar.prototype.swipeToLeft = function() {

    document.getElementById("course_calendar_gofore").click();
}

/**
 * von links nach rechts wischen
 */
CourseCalendar.prototype.swipeToRight = function() {

    document.getElementById("course_calendar_goback").click();
}

/**
 * von unten nach oben wischen
 */
CourseCalendar.prototype.swipeUp = function() {

    document.getElementById("course_calendar_gofore").click();
}

/**
 * von oben nach unten wischen
 */
CourseCalendar.prototype.swipeDown = function() {

    document.getElementById("course_calendar_goback").click();
}

/**
 * 
 */
CourseCalendar.prototype.update = function() {

    this.updateHeader();
    var startDate = this.findStartDate();
    var endDate = this.findLastDate();

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	self.updateBody(startDate, endDate, rsp);
    };
    caller.onError = function(req, status) {
	// TODO
    };

    var req = XmlUtils.createDocument("get-course-termins-between-req");
    XmlUtils.setNode(req, "from", DateTimeUtils.formatDate(startDate, "{dd}.{mm}.{yyyy}"));
    XmlUtils.setNode(req, "until", DateTimeUtils.formatDate(endDate, "{dd}.{mm}.{yyyy}"));
    caller.invokeService(req);
}

/**
 * 
 */
CourseCalendar.prototype.findStartDate = function() {

    var result = new Date(this.currentDate);
    switch (this.mode) {
    case CourseCalendar.WEEKLY:
	result.setDate(result.getDate() - DateTimeUtils.normalizeDayOfWeek(result));
	break;

    case CourseCalendar.MONTHLY:
	result.setDate(1);
	result.setDate(result.getDate() - DateTimeUtils.normalizeDayOfWeek(result));
	break;

    default:
	break;
    }
    return result;
}

/**
 * 
 * @returns {Date}
 */
CourseCalendar.prototype.findLastDate = function() {

    var result;

    switch (this.mode) {
    case CourseCalendar.WEEKLY:
	result = new Date(this.findStartDate());
	result.setDate(result.getDate() + 6);
	break;

    case CourseCalendar.MONTHLY:
	result = new Date(this.currentDate);
	result.setMonth(result.getMonth() + 1);
	result.setDate(1);
	result.setDate(result.getDate() - DateTimeUtils.normalizeDayOfWeek(result) + 6);
	break;

    default:
	break;
    }
    return result;
}

/**
 * 
 */
CourseCalendar.prototype.updateHeader = function() {

    var title;
    switch (this.mode) {
    case CourseCalendar.WEEKLY:
	title = DateTimeUtils.formatDate(this.currentDate, "Kurs-Kalender für die KW {w}-{yyyy}");
	UIUtils.getElement("course_calendar_goback").title = "Eine Woche zurück";
	UIUtils.getElement("course_calendar_gofore").title = "Eine Woche vorwärts";
	break;

    case CourseCalendar.MONTHLY:
	title = DateTimeUtils.formatDate(this.currentDate, "Kurs-Kalender für {M} {yyyy}");
	UIUtils.getElement("course_calendar_goback").title = "Einen Monat zurück";
	UIUtils.getElement("course_calendar_gofore").title = "Einen Monat vorwärts";
	break;

    default:
	break;
    }
    this.setTitle(title);
}

/**
 * 
 * @param startDate
 * @param endDate
 * @param rsp
 */
CourseCalendar.prototype.updateBody = function(startDate, endDate, rsp) {

    var body = document.getElementById("course_calendar_body");
    UIUtils.clearChilds(body);
    this.currSelection = null;

    this.actionEdit.hide();
    this.actionRemove.hide();

    this.model = new Model(rsp);
    switch (this.mode) {
    case CourseCalendar.WEEKLY:
	this.updateWeeklyBody(body, startDate, endDate);
	break;

    case CourseCalendar.MONTHLY:
	this.updateMonthlyBody(body, startDate, endDate);
	break;

    default:
	break;
    }
}

CourseCalendar.prototype.updateWeeklyBody = function(body, startDate, endDate) {

    var currDate = new Date(startDate);
    while (currDate <= endDate) {

	var cnr = document.createElement("div");
	cnr.className = "calendar-weekly-row";

	var title = document.createElement("span");
	title.className = "calendar-weekly-row-title";
	title.textContent = DateTimeUtils.formatDate(currDate, "{D} - {dd}.{mm}.{yyyy}");
	cnr.appendChild(title);

	cnr.appendChild(this.createWeeklyRuler());

	var now = DateTimeUtils.formatDate(currDate, "{dd}.{mm}.{yyyy}");
	var xpath = "/get-course-termins-between-rsp/cal-entries/cal-entry[date='" + now + "']";
	var termins = this.model.evaluateXPath(xpath);

	for (var i = 0; i < termins.length; i++) {
	    cnr.appendChild(this.createWeeklyTermin(termins[i]));
	}

	body.appendChild(cnr);
	currDate.setDate(currDate.getDate() + 1);
    }
}

/**
 * 
 * @param cnr
 * @param termin
 */
CourseCalendar.prototype.createWeeklyTermin = function(termin) {

    var self = this;

    var resultCnr = document.createElement("div");

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "calendar-termin-weekly-sel";
    radio.className = "hidden";
    resultCnr.appendChild(radio);

    var t = document.createElement("div");
    t.className = "calendar-termin-weekly";
    t.style.backgroundColor = termin.getElementsByTagName("color")[0].textContent;
    t.textContent = termin.getElementsByTagName("name")[0].textContent;

    // selectable machen um das aktivieren per click zu visualisieren
    t.addEventListener("click", function() {
	self.currSelection = XmlUtils.getXPathTo(termin);
	self.actionEdit.show();
	self.actionRemove.show();
	radio.click();
    });
    this.prepareInfoPopup(t, termin);
    
    t.addEventListener("dblclick", function() {	
	self.actionEdit.invoke();
    });
    
    var start = termin.getElementsByTagName("begin")[0].textContent;
    start = DateTimeUtils.parseTime(start, "{hh}:{mm}");
    if (start.getHours() < 9) {
	start.setHours(9);
	start.setMinutes(0);
	start.setSeconds(0);
    }
    var end = termin.getElementsByTagName("end")[0].textContent;
    end = DateTimeUtils.parseTime(end, "{hh}:{mm}");

    var len = (end - start) / 3600000;
    len = (len * 100 / 14);
    t.style.width = len + "%";

    var left = DateTimeUtils.milliesSinceMidnight(start) / 3600000;
    left = (left - 9) * 100 / 14;
    if (left < 0) {
	left = 0;
    }
    t.style.left = left + "%";

    resultCnr.appendChild(t);
    return resultCnr;
}

/**
 * 
 */
CourseCalendar.prototype.prepareInfoPopup = function(cnr, termin) {

    var start = termin.getElementsByTagName("begin")[0].textContent;
    var end = termin.getElementsByTagName("end")[0].textContent;
    var location = termin.getElementsByTagName("location")[0].textContent;
    var cat = termin.getElementsByTagName("category")[0].textContent;
    var msg = MessageCatalog.getMessage("COURSE_TERMIN_TOOLTIP", location, start, end, cat, this.makeTeacherList(termin));
    cnr.addEventListener("contextmenu", function(evt) {
	evt.preventDefault();
	evt.stopPropagation();
	new ToolTip(cnr, null, msg);
    });
}

/**
 * 
 */
CourseCalendar.prototype.makeTeacherList = function(termin) {

    var result = "";
    var teachers = termin.getElementsByTagName("teacher");

    for (var i = 0; i < teachers.length; i++) {
	if (result != "") {
	    result += ", ";
	}
	result += teachers[i].textContent;
    }
    return result;
}

/**
 * 
 */
CourseCalendar.prototype.createWeeklyRuler = function() {

    var ruler = document.createElement("div");
    ruler.className = "calendar-weekly-row-ruler";

    for (var i = 9; i < 23; i++) {
	var elem = document.createElement("div");
	elem.className = "calendar-weekly-row-ruler-elem";
	elem.textContent = i + "h";
	ruler.appendChild(elem);
    }
    return ruler;
}

/**
 * 
 */
CourseCalendar.prototype.updateMonthlyBody = function(body, startDate, endDate) {

    for (var currDate = new Date(startDate); currDate <= endDate;) {

	var row = document.createElement("div");
	row.className = "calendar-row-monthly";

	for (var i = 0; i < 7; i++) {

	    var cell = document.createElement("div");
	    cell.className = "calendar-cell-monthly";
	    row.appendChild(cell);

	    var title = document.createElement("div");
	    title.className = "calendar-weekly-row-title";
	    title.textContent = DateTimeUtils.formatDate(currDate, "{D} - {dd}.{mm}");
	    cell.appendChild(title);

	    var now = DateTimeUtils.formatDate(currDate, "{dd}.{mm}.{yyyy}");
	    var xpath = "/get-course-termins-between-rsp/cal-entries/cal-entry[date='" + now + "']";
	    var termins = this.model.evaluateXPath(xpath);

	    for (var j = 0; j < termins.length; j++) {

		var termin = this.createMonthlyTermin(termins[j]);
		cell.appendChild(termin);
	    }

	    currDate.setDate(currDate.getDate() + 1);
	}
	body.appendChild(row);
    }
}

CourseCalendar.prototype.createMonthlyTermin = function(termin) {

    var self = this;
    var resultCnr = document.createElement("div");

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "calendar-termin-monthly-sel";
    radio.className = "hidden";
    resultCnr.appendChild(radio);

    var t = document.createElement("div");
    t.className = "calendar-termin-monthly";
    t.style.backgroundColor = termin.getElementsByTagName("color")[0].textContent;
    t.appendChild(document.createTextNode(termin.getElementsByTagName("name")[0].textContent));

    // selectable machen um das aktivieren per click zu visualisieren
    t.addEventListener("click", function() {
	self.currSelection = XmlUtils.getXPathTo(termin);
	self.actionEdit.show();
	self.actionRemove.show();
	radio.click();
    });
    this.prepareInfoPopup(t, termin);

    t.addEventListener("dblclick", function() {	
	self.actionEdit.invoke();
    });

    resultCnr.appendChild(t);
    return resultCnr;
}
