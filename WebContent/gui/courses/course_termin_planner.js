/*---------------------------------------------------------------------------*/
/**
 * Plane Termine mit Wiederhohlungen auf Basis verschiedener Regelwerke
 * 
 * @param model
 *                das zu bearbeitende Model
 * @param xpath
 *                der xpath zum termin-container
 */
var CourseTerminAndLocationPlanner = function(onsuccess) {

    WorkSpaceFrame.call(this);

    this.onsuccess = onsuccess;
    this.model = new Model(XmlUtils.createDocument("termine"));
    var self = this;
    this.load("gui/courses/course_termin_planner.html", function() {

	self.ensureLocationsAreLoaded(function() {

	    self.model.addChangeListener("/termine", function() {
		self.fillTable();
		self.enableSaveButton(true);
	    });
	    self.fillTable();
	    self.setupUI();
	});

    });
}
CourseTerminAndLocationPlanner.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.ensureLocationsAreLoaded = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "get-course-locations-ok-response":
	    self.locations = rsp;
	    self.fillLocationsDropdown();
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.loadMessage("COURSELOCATION_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.loadMessage("COURSELOCATION_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}

    };
    caller.onError = function(req, status) {
	var title = MessageCatalog.loadMessage("COURSELOCATION_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.loadMessage("COURSELOCATION_LOAD_TECH-ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }
    var req = XmlUtils.createDocument("get-course-locations-req");
    caller.invokeService(req);
    
}
/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.fillLocationsDropdown = function() {

    var allLocations = XmlUtils.evaluateXPath(this.locations, "//get-course-locations-ok-response/locations/location");
    for (var i = 0; i < allLocations.length; i++) {

	var option = document.createElement("option");
	option.value = allLocations[i].getElementsByTagName("id")[0].textContent;
	option.textContent = allLocations[i].getElementsByTagName("name")[0].textContent;
	UIUtils.getElement("termin_planner_location").appendChild(option);
    }
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.fillTable = function() {

    var self = this;
    var fields = [ "", "date", "begin", "end", function(td, termin) {

	var result = "";
	var locId = termin.getElementsByTagName("location-id")[0].textContent;
	if (locId) {
	    var xPath = "//get-course-locations-ok-response/locations/location[id='" + locId + "']/name";
	    result = XmlUtils.evaluateXPath(self.locations, xPath)[0].textContent;
	}
	return result;
    } ];
    self.model.createTableBinding("termin_planner_preview", fields, "/termine/termin");
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.setupUI = function() {

    var self = this;
    UIUtils.getElement("termin_planner_repeatmode").addEventListener("change", function() {
	self.onRepeatModeChange();
    });
    self.onRepeatModeChange();

    new DatePicker("termin_planner_first_date", "Erster Termin");
    UIUtils.getElement("termin_planner_first_date").addEventListener("change", function() {
	self.ajustWeekdays();
    });
    new DatePicker("termin_planner_last_date", "Letzter Termin");

    UIUtils.getElement("termin_planner_repeat_weekly_weekday").addEventListener("change", function() {
	// self.adjustFirstDate();
    });

    UIUtils.getElement("termin_planner_repeat_monthly_dayofmonth").addEventListener("change", function() {
	self.adjustFirstDate();
    });

    UIUtils.getElement("termin_planner_whole_day").addEventListener("click", function() {
	self.onWholeDayChange();
    });
    this.onWholeDayChange();

    this.createUpdateResultSetListeners();
    new TableDecorator("termin_planner_preview");
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.ajustWeekdays = function() {

    var val = "";
    var date = UIUtils.getElement("termin_planner_first_date").value;
    if (DateTimeUtils.isDate(date)) {

	date = DateTimeUtils.parseDate(date, "{dd}.{mm}.{yyyy}");
	val = date.getDay();
    }
    UIUtils.getElement("termin_planner_repeat_weekly_weekday").value = val;
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.mandatoryFieldsByType = {
	
    ONCE : [ "termin_planner_first_date", "termin_planner_startTime", "termin_planner_endTime", "termin_planner_location" ],
    DAILY : [ "termin_planner_first_date", "termin_planner_last_date", "termin_planner_repeat_daily_interval", "termin_planner_startTime", "termin_planner_endTime", "termin_planner_location" ],
    WEEKLY : [ "termin_planner_first_date", "termin_planner_last_date", "termin_planner_repeat_weekly_interval", "termin_planner_repeat_weekly_weekday", "termin_planner_startTime", "termin_planner_endTime", "termin_planner_location" ],
    MONTHLY : [ "termin_planner_first_date", "termin_planner_last_date", "termin_planner_repeat_monthly_interval", "termin_planner_repeat_monthly_dayofmonth", "termin_planner_startTime", "termin_planner_endTime", "termin_planner_location" ]
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.onRepeatModeChange = function() {

    UIUtils.getElement("termin_planner_first_date").placeholder = "erster Termin";
    var mode = UIUtils.getElement("termin_planner_repeatmode").value;
    switch (mode) {
    case "ONCE":
	UIUtils.addClass("termin_planner_last_date", "hidden");
	UIUtils.addClass("termin_planner_repeat_daily_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_weekly_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_weekly_weekday", "hidden");
	UIUtils.addClass("termin_planner_repeat_monthly_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_monthly_dayofmonth", "hidden");
	UIUtils.getElement("termin_planner_first_date").placeholder = "Datum";
	break;

    case "DAILY":
	UIUtils.removeClass("termin_planner_last_date", "hidden");
	UIUtils.removeClass("termin_planner_repeat_daily_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_weekly_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_weekly_weekday", "hidden");
	UIUtils.addClass("termin_planner_repeat_monthly_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_monthly_dayofmonth", "hidden");
	break;

    case "WEEKLY":
	UIUtils.removeClass("termin_planner_last_date", "hidden");
	UIUtils.addClass("termin_planner_repeat_daily_interval", "hidden");
	UIUtils.removeClass("termin_planner_repeat_weekly_interval", "hidden");
	UIUtils.removeClass("termin_planner_repeat_weekly_weekday", "hidden");
	UIUtils.addClass("termin_planner_repeat_monthly_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_monthly_dayofmonth", "hidden");
	break;

    case "MONTHLY":
	UIUtils.removeClass("termin_planner_last_date", "hidden");
	UIUtils.addClass("termin_planner_repeat_daily_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_weekly_interval", "hidden");
	UIUtils.addClass("termin_planner_repeat_weekly_weekday", "hidden");
	UIUtils.removeClass("termin_planner_repeat_monthly_interval", "hidden");
	UIUtils.removeClass("termin_planner_repeat_monthly_dayofmonth", "hidden");
	break;
    }

    UIUtils.adjustChildClass(this.content, this.mandatoryFieldsByType[mode], "mandatory");

}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.onWholeDayChange = function() {

    if (UIUtils.getElement("termin_planner_whole_day").checked) {
	UIUtils.addClass("termin_planner_startTime", "hidden");
	UIUtils.getElement("termin_planner_startTime").value = "0:00";

	UIUtils.addClass("termin_planner_endTime", "hidden");
	UIUtils.getElement("termin_planner_endTime").value = "23:59";
    } else {
	UIUtils.removeClass("termin_planner_startTime", "hidden");
	UIUtils.getElement("termin_planner_startTime").value = "";

	UIUtils.removeClass("termin_planner_endTime", "hidden");
	UIUtils.getElement("termin_planner_endTime").value = "";
    }
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.createUpdateResultSetListeners = function() {

    var self = this;
    var fields = [ "termin_planner_repeatmode", "termin_planner_first_date", "termin_planner_whole_day", "termin_planner_startTime", "termin_planner_last_date", "termin_planner_endTime", "termin_planner_repeat_daily_interval",
	    "termin_planner_repeat_weekly_interval", "termin_planner_repeat_weekly_weekday", "termin_planner_repeat_monthly_interval", "termin_planner_repeat_monthly_dayofmonth", "termin_planner_location" ];
    for (var i = 0; i < fields.length; i++) {
	document.getElementById(fields[i]).addEventListener("change", function() {
	    self.tryTerminCreation();
	});
    }
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.tryTerminCreation = function() {

    this.model.removeChilds("/termine");
    var mode = document.getElementById("termin_planner_repeatmode").value;
    var begin = document.getElementById("termin_planner_startTime").value;
    var end = document.getElementById("termin_planner_endTime").value;
    var from = document.getElementById("termin_planner_first_date").value;
    var until = document.getElementById("termin_planner_last_date").value;
    var location = document.getElementById("termin_planner_location").value;
    if (DateTimeUtils.isDate(from) && (DateTimeUtils.isDate(until) || mode == "ONCE")) {

	from = DateTimeUtils.parseDate(from, "{dd}.{mm}.{yyyy}");
	until = (mode == "ONCE") ? new Date(from) : DateTimeUtils.parseDate(until, "{dd}.{mm}.{yyyy}");

	switch (mode) {
	case "ONCE":
	    this.createDailyBasedTermine(from, begin, end, until, 1, location);
	    break;

	case "DAILY":
	    var interval = parseInt(document.getElementById("termin_planner_repeat_daily_interval").value);
	    this.createDailyBasedTermine(from, begin, end, until, interval, location);
	    break;

	case "WEEKLY":
	    var interval = parseInt(document.getElementById("termin_planner_repeat_weekly_interval").value);
	    this.createWeeklyBasedTermine(from, begin, end, until, interval, location);
	    break;

	case "MONTHLY":
	    var interval = parseInt(document.getElementById("termin_planner_repeat_monthly_interval").value);
	    this.createMonthlyBasedTermine(from, begin, end, until, interval, location);
	    break;
	}
    }
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.createDailyBasedTermine = function(from, begin, end, until, interval, location) {

    while (from <= until) {
	this.model.addElement("/termine", this.createTermin(from, begin, end, location));
	from.setDate(from.getDate() + interval);
    }
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.createWeeklyBasedTermine = function(from, begin, end, until, interval, location) {

    while (from <= until) {
	this.model.addElement("/termine", this.createTermin(from, begin, end, location));
	from.setDate(from.getDate() + interval * 7);
    }
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.createMonthlyBasedTermine = function(from, begin, end, until, interval, location) {

    var nextDate = from;
    for (var i = 1; nextDate <= until; i++) {

	this.model.addElement("/termine", this.createTermin(nextDate, begin, end, location));
	nextDate = new Date(from.getTime());
	nextDate.setMonth(from.getMonth() + (i * interval));
    }
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.createTermin = function(date, begin, end, location) {

    var termin = this.model.createElement("termin");
    termin.appendChild(this.model.createElement("id", ""));
    termin.appendChild(this.model.createElement("action", "CREATE"));
    termin.appendChild(this.model.createElement("date", DateTimeUtils.formatDate(date, "{dd}.{mm}.{yyyy}")));
    termin.appendChild(this.model.createElement("begin", begin));
    termin.appendChild(this.model.createElement("end", end));
    termin.appendChild(this.model.createElement("location-id", location));
    return termin;
}

/**
 * 
 */
CourseTerminAndLocationPlanner.prototype.onSave = function() {

    var allTermine = this.model.evaluateXPath("/termine/termin");
    this.onsuccess(allTermine);
}
