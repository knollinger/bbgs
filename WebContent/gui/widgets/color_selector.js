/*---------------------------------------------------------------------------*/
/**
 * Eine "advanced dropdown", welche eine Auswahl definierter Farben darstellen
 * kann. Als Basis wird eine DIV erwartet, deren ID oder deren Element-Referenz
 * beim Aufruf des Konstruktors übergeben werden muss.
 * 
 * Um Farben hinzu zu fügen muss die Methode "addColorItem" aufgerufen werden.
 */

/**
 * Konstruktor
 * 
 * @param elem
 *                die ID oder die Element-Referenz auf die zu dekorierende DIV
 * @param placeholder
 *                optionaler String, welcher in der DIV dargestellt wird, solang
 *                keine Farbe ausgewählt ist
 */
var ColorSelector = function(elem, placeholder) {

    this.anchor = UIUtils.getElement(elem);
    this.anchor.tabIndex = "0";
    this.placeholder = placeholder || "Farbe auswählen";
    this.items = {};
    this.setupValueProperty();

    this.tabIndex = "0";
    this.display = document.createElement("div");
    this.display.className = "color-select-display";
    this.anchor.appendChild(this.display);

    this.container = document.createElement("div");
    this.container.className = "color-select-cnr";
    this.anchor.appendChild(this.container);

    var self = this;
    this.display.addEventListener("click", function() {
	if (self.container.style.display != "block") {
	    self.container.style.width = self.display.getBoundingClientRect().width + "px";
	    self.container.style.display = "block";
	} else {
	    self.container.style.display = "none";
	}
    });

    this.anchor.addEventListener("blur", function() {
	self.container.style.display = "none";

    });
}

/**
 * Füge einen Farb-EIntrag hinzu
 * 
 * @param id
 *                die eindeutige Kennung des Farbwertes. Dieser wird als value
 *                geliefert
 * 
 * @param color
 *                ein HTML-Farbwert. Es sind alle Notationen erlaubt
 * 
 * @param name
 *                eine textuelle Beschreibung der Farbe
 */
ColorSelector.prototype.addColorItem = function(id, color, name) {

    var item = document.createElement("div");
    item.className = "color-select-item";
    item.style.borderLeftColor = color;
    item.textContent = name;
    this.container.appendChild(item);

    var self = this;
    item.addEventListener("click", function() {
	self.anchor.value = id;
	self.container.style.display = "none";
    });

    this.items[id] = item;
    return item;
}

/**
 * passe die darstellung der ANzeige auf eine AUswahl bzw. auf den Aufruf des
 * ValueSetters an
 */
ColorSelector.prototype.adjustDisplay = function() {

    UIUtils.clearChilds(this.display);

    if (this.selected && this.items[this.selected]) {
	this.display.appendChild(this.items[this.selected].cloneNode(true));
    } else {
	this.display.appendChild(document.createTextNode(this.placeholder));
    }
}

/**
 * erzeuge das value-property
 */
ColorSelector.prototype.setupValueProperty = function() {

    var self = this;
    Object.defineProperty(this.anchor, "value", {
	get : function() {
	    return self.selected;
	},
	set : function(newVal) {
	    if (self.selected !== newVal) {
		self.selected = newVal;
		self.adjustDisplay();
		self.anchor.dispatchEvent(new Event("change"));
	    }
	},
	enumberable : true,
	configurable : true
    });
}

/*---------------------------------------------------------------------------*/
/**
 * 
 * Die Übersicht aller definierten Farben mit der Möglichkeit zum InplaceEdit
 */
var ColorsOverview = function() {

    WorkSpaceFrame.call(this);

    var self = this;
    this.load("gui/widgets/color_overview.html", function() {

	self.loadModel(function() {
	    self.actionAdd = self.createAddAction();
	    self.actionRemove = self.createRemoveAction();

	    new TableDecorator("edit_colors_overview");
	    self.fillTable();

	    self.model.addChangeListener("//named-colors-model/colors", function() {
		self.enableSaveButton(true);
	    });
	});
    });
}
ColorsOverview.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
ColorsOverview.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "named-colors-model":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("NAMEDCOLORS_LOAD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("NAMEDCOLORS_LOAD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {

	var title = MessageCatalog.getMessage("NAMEDCOLORS_LOAD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("NAMEDCOLORS_LOAD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("get-all-named-colors-request");
    caller.invokeService(req);
}

/**
 * 
 */
ColorsOverview.prototype.createAddAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/color-add.svg", "Eine neue Farbe anlegen", function() {

	var color = XmlUtils.parse(ColorsOverview.EMPTY_COLOR);
	color.getElementsByTagName("id")[0].textContent = UUID.create("colors_");
	self.model.addElement("//named-colors-model/colors", color.documentElement);
	self.fillTable();
    });
    this.addAction(action);
    return action;
}
ColorsOverview.EMPTY_COLOR = "<color><id/><action>CREATE</action><value/><name/></color>";

/**
 * 
 */
ColorsOverview.prototype.createRemoveAction = function() {

    var self = this;
    var action = new WorkSpaceFrameAction("gui/images/color-remove.svg", "Eine Farbe entfernen", function() {

	var title = MessageCatalog.getMessage("TITLE_REMOVE_COLOR");
	var messg = MessageCatalog.getMessage("QUERY_REMOVE_COLOR");
	new MessageBox(MessageBox.QUERY, title, messg, function() {
	    self.model.setValue(self.currColor + "/action", "REMOVE");
	    self.currRow.parentElement.removeChild(self.currRow);
	    self.currRow = self.currColor = null;
	    self.actionRemove.hide();
	});
    });
    this.addAction(action);
    action.hide();
    return action;
}

/**
 * 
 */
ColorsOverview.prototype.fillTable = function() {

    // was passiert beim Tabellen-Klick?
    var self = this;
    var onclick = function(tr, color) {
	var radio = "edit_color_radio_" + color.getElementsByTagName("id")[0].textContent;
	radio = document.getElementById(radio);
	radio.click();

	self.currRow = tr;
	self.currColor = XmlUtils.getXPathTo(color);
	self.actionRemove.show();
    }

    var tbody = UIUtils.getElement("edit_colors_overview_body");
    UIUtils.clearChilds(tbody);

    var fields = this.getColumnDescriptor();
    var allColors = this.model.evaluateXPath("//named-colors-model/colors/color");
    for (var i = 0; i < allColors.length; i++) {
	if (allColors[i].getElementsByTagName("action")[0].textContent != "REMOVE") {
	    this.renderOneColor(tbody, allColors[i], fields, onclick);
	}
    }
    this.actionRemove.hide();
}

/**
 * 
 */
ColorsOverview.prototype.renderOneColor = function(tbody, color, fields, onclick) {

    var row = this.model.createTableRow(color, fields, onclick);
    tbody.appendChild(row);

    color.addEventListener("change", function() {

	var action = color.getElementsByTagName("action")[0];
	if (action.textContent != "CREATE" && action.textContent != "REMOVE") {
	    action.textContent = "MODIFY";
	}
    });
}

/**
 * 
 */
ColorsOverview.prototype.getColumnDescriptor = function() {

    var fields = [];

    var self = this;
    fields.push(function(td, color) {

	var radio = document.createElement("input");
	radio.type = "radio";
	radio.id = "edit_color_radio_" + color.getElementsByTagName("id")[0].textContent;
	radio.name = "edit_color_radio";
	return radio;
    });

    fields.push(function(td, color) {

	var result = document.createElement("div");
	var chooser = new ColorChooser(result);
	self.model.createValueBinding(result, XmlUtils.getXPathTo(color) + "/value", "change");
	return result;
    });

    fields.push(function(td, color) {

	var name = document.createElement("input");
	name.className = "inplace-edit mandatory";
	name.placeholder = name.title = "Bezeichnung";
	name.style.width = "100%";
	self.model.createValueBinding(name, XmlUtils.getXPathTo(color) + "/name", "change");
	return name;
    });
    return fields;
}

/**
 * 
 */
ColorsOverview.prototype.onSave = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "save-all-named-colors-ok-rsp":
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("NAMEDCOLORS_SAVE_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("NAMEDCOLORS_SAVE_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("NAMEDCOLORS_SAVE_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("NAMEDCOLORS_SAVE_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    caller.invokeService(this.model.getDocument());

}

/*---------------------------------------------------------------------------*/
/**
 * Der ColorChooser
 */
var ColorChooser = function(elem) {

    this.anchor = UIUtils.getElement(elem);

    this.display = document.createElement("div");
    this.display.className = "color-chooser-display";
    this.anchor.tabIndex = "0";
    this.anchor.appendChild(this.display);

    this.content = this.createCanvas();
    this.anchor.appendChild(this.content);

    this.setupValueProperty();

    var self = this;
    this.display.addEventListener("click", function() {
	if (self.content.style.display != "block") {
	    self.content.style.display = "block";
	    self.content.focus();
	} else {
	    self.content.style.display = "none";
	}
    });
}

/**
 * 
 */
ColorChooser.prototype.createCanvas = function() {

    var canvas = document.createElement("canvas");
    canvas.className = "color-chooser-content";
    canvas.tabIndex = "0";
    var img = document.createElement("img");
    img.onload = function() {

	canvas.width = img.width;
	canvas.height = img.height;

	var ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
    };
    img.src = "gui/images/color_circle2.png";

    var self = this;
    canvas.addEventListener("click", function(evt) {
	var color = self.getColorByMouse(canvas, evt);
	if (color != null) {
	    self.anchor.value = color;
	}
	canvas.style.display = "none";
    });

    canvas.addEventListener("mousemove", function(evt) {
	var color = self.getColorByMouse(canvas, evt);
	if (color == null) {
	    canvas.style.cursor = null;
	} else {
	    canvas.style.cursor = "crosshair";
	}
    });

    canvas.addEventListener("blur", function() {
	self.content.style.display = "none";

    });

    return canvas;
}

ColorChooser.prototype.getColorByMouse = function(canvas, evt) {

    var color = null;
    var imgData = canvas.getContext("2d").getImageData(evt.offsetX, evt.offsetY, 1, 1).data;
    var a = imgData[3];
    if (a != 0) {
	var r = imgData[0];
	var g = imgData[1];
	var b = imgData[2];
	color = "rgb(" + r + "," + g + "," + b + ")";
    }
    return color;
}

/**
 * 
 */
ColorChooser.prototype.adjustDisplay = function() {

    this.display.style.backgroundColor = this.value;
}

/**
 * erzeuge das value-property
 */
ColorChooser.prototype.setupValueProperty = function() {

    var self = this;
    Object.defineProperty(this.anchor, "value", {
	get : function() {
	    return self.value;
	},
	set : function(newVal) {
	    if (self.value !== newVal) {
		self.value = newVal;
		self.adjustDisplay();
		self.anchor.dispatchEvent(new Event("change"));
	    }
	},
	enumberable : true,
	configurable : true
    });
}
