/**
 * 
 */
var CourseCalendar = function(mode, date) {

    WorkSpaceFrame.call(this);

    this.mode = mode || CourseCalendar.WEEKLY;
    this.currentDate = date || new Date();
    this.selectedTermin = -1;

    var self = this;
    this.load("gui/courses/course_calendar.html", function() {
	self.setupUI();
	self.update();
	self.createPrintAction();
	// new TouchGesturesObserver(self.frame, self);
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

CourseCalendar.prototype.createEditAction = function() {

    var self = this;
    this.actionEdit = new WorkSpaceFrameAction("gui/images/course-edit.svg", "Kurs-Termin bearbeiten", function() {
	new CourseTerminEditor(self.selectedTermin);
    });
    this.addAction(this.actionEdit);
    this.actionEdit.hide();
}

CourseCalendar.prototype.createRemoveAction = function() {

    this.actionRemove = new WorkSpaceFrameAction("gui/images/course-remove.svg", "Kurs-Termin löschen", function() {

    });
    this.addAction(this.actionRemove);
    this.actionRemove.hide();
}

/**
 * 
 */
CourseCalendar.prototype.setupUI = function() {

    var self = this;

    this.createEditAction();
    this.createRemoveAction();

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
    document.getElementById("course_calendar_today").addEventListener("click", function() {
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

    // mode
    document.getElementById("course_calendar_mode").addEventListener("change", function() {
	self.mode = parseInt(document.getElementById("course_calendar_mode").value);
	self.update();
    });
}

/**
 * 
 */
CourseCalendar.prototype.createPrintAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/print.svg", "Kurs-Kalender drucken", function() {
	var startDate = DateTimeUtils.formatDate(self.findStartDate(), "{dd}.{mm}.{yyyy}");
	var endDate = DateTimeUtils.formatDate(self.findLastDate(), "{dd}.{mm}.{yyyy}");
	var url = "getDocument/course_overview.pdf?from=" + startDate + "&until=" + endDate;

	var title = "Kurs-Übersicht " + startDate + " - " + endDate;
	new DocumentViewer(url, title);

    });
    this.addAction(action);
    return action;
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
	title = DateTimeUtils.formatDate(this.currentDate, "KW {w}-{yyyy}");
	break;

    case CourseCalendar.MONTHLY:
	title = DateTimeUtils.formatDate(this.currentDate, "{M} {yyyy}");
	break;

    default:
	break;
    }
    document.getElementById("course_calendar_title").textContent = title;
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

    this.actionEdit.hide();
    this.actionRemove.hide();

    var model = new Model(rsp);
    switch (this.mode) {
    case CourseCalendar.WEEKLY:
	this.updateWeeklyBody(body, startDate, endDate, model);
	break;

    case CourseCalendar.MONTHLY:
	this.updateMonthlyBody(body, startDate, endDate, model);
	break;

    default:
	break;
    }
}

CourseCalendar.prototype.updateWeeklyBody = function(body, startDate, endDate, model) {

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
	var termins = model.evaluateXPath(xpath);

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

    var t = document.createElement("div");
    t.className = "calendar-termin-weekly";
    t.style.backgroundColor = termin.getElementsByTagName("color")[0].textContent;
    t.appendChild(document.createTextNode(termin.getElementsByTagName("name")[0].textContent));

    // selectable machen um das aktivieren per click zu visualisieren
    t.tabIndex = "0";
    t.addEventListener("click", function() {
	self.selectedTermin = parseInt(termin.getElementsByTagName("id")[0].textContent);
	self.actionEdit.show();
	self.actionRemove.show();
	self.showInfoPopup(t, termin);
    });

    var start = termin.getElementsByTagName("begin")[0].textContent;
    var end = termin.getElementsByTagName("end")[0].textContent;
    start = DateTimeUtils.parseTime(start, "{hh}:{mm}");
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

    return t;
}

/**
 * 
 */
CourseCalendar.prototype.showInfoPopup = function(cnr, termin) {

    var start = termin.getElementsByTagName("begin")[0].textContent;
    var end = termin.getElementsByTagName("end")[0].textContent;
    var location = termin.getElementsByTagName("location")[0].textContent;
    var cat = termin.getElementsByTagName("category")[0].textContent;

    var msg = MessageCatalog.getMessage("COURSE_TERMIN_TOOLTIP", location, start, end, cat, this.makeTeacherList(termin));
    new ToolTip(cnr, null, msg, ToolTip.INFINITE);
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
CourseCalendar.prototype.updateMonthlyBody = function(body, startDate, endDate, model) {

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
	    var termins = model.evaluateXPath(xpath);

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

    var t = document.createElement("div");
    t.className = "calendar-termin-monthly";
    t.style.backgroundColor = termin.getElementsByTagName("color")[0].textContent;
    t.appendChild(this.makeInfoIcon(t, termin));
    t.appendChild(document.createTextNode(termin.getElementsByTagName("name")[0].textContent));

    // selectable machen um das aktivieren per click zu visualisieren
    t.tabIndex = "0";
    t.addEventListener("click", function() {
	self.selectedTermin = parseInt(termin.getElementsByTagName("id")[0].textContent);
	self.actionEdit.show();
	self.actionRemove.show();
    });
    return t;
}
