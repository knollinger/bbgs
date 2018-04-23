/**
 * 
 */
var DatePicker = function(anchor, title) {

    new InputFieldDecorator(anchor, "datepicker-input", function() {
	new DatePickerEditor(anchor, title);
    });
    new DateAutoCompleter(anchor);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var DatePickerEditor = function(anchor, title) {

    WorkSpaceDialog.call(this, title);
    
    this.anchor = UIUtils.getElement(anchor);
    this.date = DateTimeUtils.isDate(this.anchor.value) ? DateTimeUtils.parseDate(this.anchor.value, "dd.mm.yyyy") : new Date();
    
    this.content = this.createBody();
    
    this.body.appendChild(this.createHeader());
    this.body.appendChild(this.content);
    
    var self = this;
    this.content.addEventListener("keydown", function(evt) {
	self.keybordHandler(evt);
    });
    this.enableCancelButton();
    this.update();
    this.content.focus();
}
DatePickerEditor.prototype = Object.create(WorkSpaceDialog.prototype);


/**
 * 
 */
// DatePickerEditor.prototype.swipeToLeft = function() {
//
// this.date.setMonth(this.date.getMonth() + 1);
// this.update();
// }
/**
 * 
 */
// DatePickerEditor.prototype.swipeToRight = function() {
//
// this.date.setMonth(this.date.getMonth() - 1);
// this.update();
// }
/**
 * 
 */
DatePickerEditor.prototype.keybordHandler = function(evt) {

    switch (evt.keyCode) {
    case 13: // enter
	this.anchor.value = DateTimeUtils.formatDate(this.date, "{dd}.{mm}.{yyyy}");
	this.close();
	break;

    case 27: // ESC
	this.close();
	break;

    case 37: // arrow left
	this.date.setDate(this.date.getDate() - 1);
	this.update();
	break;

    case 38: // arrow up
	this.date.setDate(this.date.getDate() - 7);
	this.update();
	break;

    case 39: // arrow right
	this.date.setDate(this.date.getDate() + 1);
	this.update();
	break;

    case 40: // arrow down
	this.date.setDate(this.date.getDate() + 7);
	this.update();
	break;

    case 33: // page up down
	this.date.setMonth(this.date.getMonth() - 1);
	this.update();
	break;

    case 34: // page down
	this.date.setMonth(this.date.getMonth() + 1);
	this.update();
	break;

    default:
	break;
    }
    evt.stopPropagation();
}

/**
 * 
 * @returns {___anonymous646_650}
 */
DatePickerEditor.prototype.update = function() {

    this.updateTitlebar();
    this.updateBody();
}

/**
 * 
 */
DatePickerEditor.prototype.createHeader = function() {

    var title = document.createElement("div");
    title.className = "datepicker-header";

    var self = this;
    var btn = this.makeButton("gui/images/go-previous.svg", "Ein Jahr zurück", function() {
	self.date.setFullYear(self.date.getFullYear() - 1);
	self.update();
    });
    title.appendChild(btn);

    btn = this.makeButton("gui/images/go-previous-view.svg", "Einen Monat zurück", function() {
	self.date.setMonth(self.date.getMonth() - 1);
	self.update();
    });
    title.appendChild(btn);

    this.titleBarLabel = document.createElement("div");
    this.titleBarLabel.className = "datepicker-header-label";
    title.appendChild(this.titleBarLabel);

    btn = this.makeButton("gui/images/go-next-view.svg", "Einen Monat vor", function() {
	self.date.setMonth(self.date.getMonth() + 1);
	self.update();
    });
    title.appendChild(btn);

    btn = this.makeButton("gui/images/go-next.svg", "Ein Jahr vor", function() {
	self.date.setFullYear(self.date.getFullYear() + 1);
	self.update();
    });
    title.appendChild(btn);
    return title;
}

/**
 * 
 */
DatePickerEditor.prototype.updateTitlebar = function() {

    var namesOfMonth = [ "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez" ];
    this.titleBarLabel.textContent = namesOfMonth[this.date.getMonth()] + " " + this.date.getFullYear();
}

/**
 * 
 * @param imgUrl
 * @param onclick
 * @returns {___anonymous1562_1564}
 */
DatePickerEditor.prototype.makeButton = function(imgUrl, title, onclick) {

    var div = document.createElement("div");
    div.className = "datepicker-header-button";
    div.title = title;

    var img = document.createElement("img");
    img.src = imgUrl;
    div.appendChild(img);

    div.addEventListener("click", function() {
	onclick();
    });

    return div;
}

/**
 * 
 */
DatePickerEditor.prototype.createBody = function() {

    var body = document.createElement("div");
    body.className = "datepicker-body";
    body.tabIndex="0";
    return body;
}

DatePickerEditor.prototype.updateBody = function() {

    UIUtils.clearChilds(this.content);
    var currDate = this.findStartDate();
    var endDate = this.findEndDate();
    var row = this.createRow();

    while (currDate <= endDate) {

	var cell = this.createCell(currDate);
	row.appendChild(cell);

	if (currDate.getDay() == 0) {
	    this.content.appendChild(row);
	    row = this.createRow();
	}
	currDate.setDate(currDate.getDate() + 1);
    }

    if (row.firstChild) {
	this.content.appendChild(row);
    }
}

/**
 * 
 * @returns {___anonymous3649_3651}
 */
DatePickerEditor.prototype.createRow = function() {

    var row = document.createElement("div");
    row.className = "datepicker-body-row";
    return row;
}

/**
 * 
 */
DatePickerEditor.prototype.createCell = function(date) {

    var currDate = new Date(date);

    var cell = document.createElement("div");
    cell.className = "datepicker-cell";

    var title = document.createElement("div");
    title.className = "datepicker-cell-title";
    title.textContent = DateTimeUtils.formatDate(date, "{D}");
    cell.appendChild(title);

    var content = document.createElement("span");
    content.textContent = DateTimeUtils.formatDate(date, "{dd}");
    cell.appendChild(content);

    if (this.isSelectedDate(currDate)) {
	UIUtils.addClass(cell, "datepicker-cell-currdate");
    } else {
	if (currDate.getMonth() != this.date.getMonth()) {
	    UIUtils.addClass(cell, "datepicker-cell-disabled");
	}
    }

    var self = this;
    cell.addEventListener("click", function() {

	self.anchor.value = DateTimeUtils.formatDate(currDate, "{dd}.{mm}.{yyyy}");
	UIUtils.fireEvent("change", self.anchor);
	UIUtils.fireEvent("input", self.anchor);
	self.close();
    });
    return cell;
}

/**
 * 
 */
DatePickerEditor.prototype.isSelectedDate = function(date) {

    return (date.getDate() == this.date.getDate() && date.getMonth() == this.date.getMonth() && date.getFullYear() == this.date.getFullYear());
}

/**
 * 
 * @returns {Date}
 */
DatePickerEditor.prototype.findStartDate = function() {

    var date = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
    var day = date.getDay();
    day = (day == 0) ? 6 : day - 1;
    date.setDate(date.getDate() - day);
    return date;
}

DatePickerEditor.prototype.findEndDate = function() {

    var date = new Date(this.date.getFullYear(), this.date.getMonth() + 1, -1);
    var day = date.getDay();
    if (day != 0) {
	day = 7 - day;
	date.setDate(date.getDate() + day);
    }
    return date;
}

/*---------------------------------------------------------------------------*/
/**
 * All about the autoCompletion stuff
 */
var DateAutoCompleter = function(anchor) {
    var self = this;
    this.anchor = UIUtils.getElement(anchor);

    this.anchor.addEventListener("change", function(evt) {
	self.checkAndCompleteInput();
    });

    this.anchor.addEventListener("input", function() {
	self.checkAndCompleteInput();
    });
}

/**
 * 
 */
DateAutoCompleter.prototype.checkAndCompleteInput = function() {

    var val = this.anchor.value;

    var parts = val.split(/[\s\.]+/);
    if (parts.length == 3) {

	var day = parseInt(parts[0], 10);
	var month = parseInt(parts[1], 10);
	var year = parseInt(parts[2], 10);
	if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {

	    if (year < 100) {
		year = 2000 + year;
	    }

	    val = this.formatResult(day, month, year);
	    if (this.anchor.value != val) {

		this.anchor.value = val;

		// enforce a change event to update the appl model
		if (this.anchor.onchange != null) {
		    this.anchor.onchange();
		}
		this.anchor.dispatchEvent(new Event('input'));
	    }
	}
    }
}

/**
 * 
 * @param day
 * @param month
 * @param year
 * @returns {String}
 */
DateAutoCompleter.prototype.formatResult = function(day, month, year) {

    var day = this.formatInteger(day, 2);
    var month = this.formatInteger(month, 2);
    var year = this.formatInteger(year, 4);
    return day + "." + month + "." + year;
}

/**
 * 
 * @param value
 * @param width
 * @returns
 */
DateAutoCompleter.prototype.formatInteger = function(value, width) {

    var result = "0000" + value;
    var idx = result.length - width;
    return result.substr(idx);
}