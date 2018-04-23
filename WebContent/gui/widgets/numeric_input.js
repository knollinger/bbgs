var NumericInputField = function(elem) {

    this.field = UIUtils.getElement(elem);
    this.field.style.textAlign = "right";
    this.value = (elem.value) ? this.parseValue(elem.value) : "0";
    this.hasChanged = false;

    var self = this;
    this.updateValue();
    this.field.addEventListener("keydown", function(evt) {
	self.onKeyDown(evt);
    });
    this.field.addEventListener("mousedown", function(evt) {
	self.field.focus();
	self.adjustCursorPos();
	evt.preventDefault();
    });
    this.field.addEventListener("blur", function(evt) {
	if (self.hasChanged) {
	    self.hasChanged = false;
	    self.field.dispatchEvent(new Event("change"));
	}
    });
}

/**
 * 
 */
NumericInputField.prototype.updateValue = function() {

    var val = parseFloat(this.value) / 100;
    this.field.value = val.toLocaleString(val, {
	useGrouping : true,
	minimumFractionDigits : 2,
	maximumFractionDigits : 2
    });
    this.adjustCursorPos();
}

/**
 * 
 */
NumericInputField.prototype.parseValue = function(val) {

    if (val.indexOf(",") != -1) {
	val = val.replace(".", "");
    }
    val = val.replace(",", ".");
    val = parseFloat(val) * 100;
    return "" + val;
}

/**
 * 
 */
NumericInputField.prototype.onKeyDown = function(evt) {

    switch (evt.keyCode) {
    case 8: // BACKSPACE
	this.value = (this.value.length > 1) ? this.value.substring(0, this.value.length - 1) : "0";
	this.updateValue();
	this.field.dispatchEvent(new Event("input"));
	evt.preventDefault();
	this.hasChanged = true;
	break;

    case 9: // TAB
    case 13: // ENTER
    case 27: // ESC
    case 144: // NUMLOCK
	break;

    default:
	var c = NumericInputField.digitsByKeyCode[evt.keyCode];
	if (c) {
	    this.value += c;
	    this.updateValue();
	    this.field.dispatchEvent(new Event("input"));
	    this.hasChanged = true;

	}
	evt.preventDefault();
	break;
    }
}

/**
 * 
 */
NumericInputField.prototype.adjustCursorPos = function() {

    var len = this.field.value.length;
    if (this.field.createTextRange) {
	var range = this.field.createTextRange();
	range.move('character', len);
	range.select();
    } else {
	if (this.field.setSelectionRange) {
	    this.field.setSelectionRange(len, len);
	}
    }
}

/**
 * 
 */
NumericInputField.digitsByKeyCode = {
    48 : "0",
    49 : "1",
    50 : "2",
    51 : "3",
    52 : "4",
    53 : "5",
    54 : "6",
    55 : "7",
    56 : "8",
    57 : "9",
    96 : "0",
    97 : "1",
    98 : "2",
    99 : "3",
    100 : "4",
    101 : "5",
    102 : "6",
    103 : "7",
    104 : "8",
    105 : "9"
}

 /**
     * 
     */
//NumericInputField.prototype.setupValueProperty = function() {
//
//    Object.defineProperty(this, "value", {
//	get : function() {
//	    return parseFloat(this.value) / 100;
//	},
//	set : function(newVal) {
//	    this.value = "" + newVal * 100;
//	    this.updateValue();
//	},
//	enumberable : true,
//	configurable : true
//    });
//}
