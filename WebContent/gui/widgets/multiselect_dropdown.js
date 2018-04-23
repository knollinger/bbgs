/**
 * Der MultiSelectDropDown adaptiert eine select-box und baut das ganze in eine
 * Dropdown-Box mit Multiselect-Eigenschafften um.
 * 
 * @param dropdown
 *                die id oder die referenz auf die select-box
 * @param optRenderer
 *                optional, wird bei jeder nötigen anpassung des Titels gerufen
 *                und erhält ein Array mit den aktuell selektierten
 *                option-values. der callback muss den darzustellenden Text für
 *                den Titel der MulSelBox liefern
 */
var MultiSelectDropdown = function(dropdown, optRenderer) {

    this.selected = [];
    this.optRenderer = optRenderer || this.defaultOptRenderer;

    var elem = UIUtils.getElement(dropdown);
    if (elem) {

	// now, create the replacement UI
	this.cnr = this.createUI(elem);

	// now, define the valueProperty
	this.setupValueProperty();
    }
}

/**
 * 
 */
MultiSelectDropdown.prototype.createUI = function(dropdown) {

    var self = this;

    var cnr = document.createElement("div");
    cnr.className = dropdown.className + " multsel-cnr";
    cnr.title = dropdown.title;
    cnr.id = dropdown.id;

    this.display = document.createElement("div");
    this.display.className = "multsel-display";
    this.display.textContent = dropdown.title;
    this.title = dropdown.title;
    cnr.appendChild(this.display);

    this.content = document.createElement("div");
    this.content.className = "multsel-option-cnr";
    this.content.style.display = "none";
    cnr.appendChild(this.content);

    // adopt all options
    this.adoptAllOptions(dropdown, this.content);
    this.adjustTitle();

    // make sure, outside clicks will close the content
    document.body.addEventListener("click", function() {
	self.content.style.display = "none";
    });

    // make sure, the content will be shown/hidden on click
    this.display.addEventListener("click", function(evt) {
	evt.stopPropagation();
	if (self.content.style.display == "none") {
	    self.content.style.width = self.display.getBoundingClientRect().width + "px";
	    self.content.style.display = "block";
	} else {
	    self.content.style.display = "none";
	}
    });

    dropdown.parentElement.insertBefore(cnr, dropdown);
    dropdown.parentElement.removeChild(dropdown);
    return cnr;
}

/**
 * 
 */
MultiSelectDropdown.prototype.adoptAllOptions = function(dropdown, content) {

    var allOptions = dropdown.getElementsByTagName("option");
    for (var i = 0; i < allOptions.length; i++) {

	var opt = allOptions[i];
	content.appendChild(this.createOption(opt));
	if (opt.selected) {
	    this.selected.push(opt.value);
	}
    }
}

/**
 * 
 */
MultiSelectDropdown.prototype.setupValueProperty = function() {

    var self = this;
    Object.defineProperty(this.cnr, "value", {
	get : function() {
	    return self.selected;
	},
	set : function(newVal) {

	    var options = self.content.getElementsByTagName("input");
	    for (var i = 0; i < options.length; i++) {

		var option = options[i];
		var optval = parseInt(option.value);
		if (newVal.includes(optval)) {
		    option.checked = true;
		} else {
		    option.checked = false;
		}
	    }
	    self.selected = newVal;
	    self.adjustTitle();
	},
	enumberable : true,
	configurable : true
    });

    Object.defineProperty(this, "value", {
	get : function() {
	    return self.cnr.value;
	},
	set : function(val) {
	    self.cnr.value = val;
	},
	enumberable : true,
	configurable : true
    });
}

/**
 * Delegiere alle "addEventListener"-Methoden an den Container
 */
MultiSelectDropdown.prototype.addEventListener = function(type, callback, capture) {

    this.cnr.addEventListener(type, callback, capture);
}

/**
 * 
 */
MultiSelectDropdown.prototype.createOption = function(srcOption) {

    var self = this;
    var option = document.createElement("div");
    option.className = "multsel-option";

    var id = UUID.create("MultiSelectDrowpdown");
    var cb = document.createElement("input");
    cb.id = id;
    cb.type = "checkbox";
    cb.checked = srcOption.selected;
    cb.value = srcOption.value;
    cb.addEventListener("click", function(evt) {

	var val = cb.value;
	if (cb.checked) {
	    self.selected.push(val);
	} else {
	    self.selected.remove(val);
	}
	self.adjustTitle();
	evt.stopPropagation();
	self.cnr.dispatchEvent(new Event("change"));
    });
    option.appendChild(cb);

    var label = document.createElement("label");
    label.textContent = srcOption.textContent;
    label.setAttribute("for", id);
    option.appendChild(label);
    return option;
}

/**
 * 
 */
MultiSelectDropdown.prototype.adjustTitle = function() {

    var title = this.optRenderer(this.selected.sort());
    this.display.textContent = title;
}

/**
 * 
 */
MultiSelectDropdown.prototype.defaultOptRenderer = function(selected) {

    return this.title + ": " + this.selected.sort();
}