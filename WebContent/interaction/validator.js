/**
 * 
 */
var Validator = function() {

}

/**
 * 
 * @param parent
 * @returns {Boolean}
 */
Validator.prototype.validate = function(parent) {

    var result = true;
    var parent = UIUtils.getElement(parent);
    if (parent) {

	var allChilds = parent.querySelectorAll("input,textarea,select");
	for (var i = 0; result && i < allChilds.length; i++) {

	    var currElem = allChilds[i];
	    if (UIUtils.hasClass(currElem, "mandatory")) {
		result = this.assertNotEmpty(currElem);
	    }

	    if (result) {
		var expectedType = currElem.dataset.type;
		if (expectedType && expectedType != "") {
		    result = this.testExpectedType(currElem, expectedType);
		}
	    }
	}
    }
    return result;
}

/**
 * 
 * @param elem
 */
Validator.prototype.assertNotEmpty = function(elem) {

    var empty = false;

    var val = elem.value;
    if (Array.isArray(val)) {
	empty = val.length == 0;
    } else {
	empty = elem.value == "" || elem.value == "UNDEFINED";
    }

    if (empty) {
	console.log("assertNotEmpty failed on: " + elem.id);
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld darf nicht leer sein.")
    }
    return !empty;
}

/**
 * 
 * @param elem
 * @param expectedType
 */
Validator.prototype.testExpectedType = function(elem, expectedType) {

    var result = true;
    var val = elem.value;
    if (val != "") {

	switch (expectedType.toLowerCase()) {
	case 'number':
	    result = this.assertIsNumber(elem);
	    break;

	case 'time':
	    result = this.assertIsTime(elem);
	    break;

	case 'date':
	    result = this.assertIsDate(elem);
	    break;

	case 'zipcode':
	    result = this.assertIsZipCode(elem);
	    break;
	    
	case 'email':
	    result = this.assertIsEmail(elem);
	    break;
	}
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsNumber = function(elem) {

    var result = !isNaN(elem.value);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss eine Zahl beinhalten.")
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsTime = function(elem) {

    var result = DateTimeUtils.isTime(elem.value);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss eine Uhrzeit beinhalten.");
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsDate = function(elem) {

    var result = DateTimeUtils.isDate(elem.value);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss ein Datum beinhalten.");
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsZipCode = function(elem) {

    var n = parseInt(elem.value);
    var result = (n != NaN && n > 0 && n < 100000);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Dieses Feld muss eine Postleitzahl beinhalten.");
    }
    return result;
}

/**
 * 
 * @param value
 */
Validator.prototype.assertIsEmail = function(elem) {

    var result = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(elem.value);
    if (!result) {
	new ToolTip(elem, ToolTip.warningIcon, "Die eingegebene Email-Adresse ist ungültig!");
    }
    return result;
}
