/**
 * 
 */
var Navigation = function(logoUrl) {

    WorkSpaceFrame.call(this, logoUrl);

    var frame = document.createElement("div");
    frame.className = "navigation-frame";

    this.buttonBox = document.createElement("div");
    this.buttonBox.className = "navigation-button-box";
    frame.appendChild(this.buttonBox);

    this.content.appendChild(frame);
    this.content.style.padding = "0";
}

/**
 * 
 */
Navigation.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 * @param img
 * @param text
 * @param onclick
 */
Navigation.prototype.addNavigationButton = function(img, text, onclick) {

    var btn = document.createElement("div");
    btn.className = "navigation-button";
    btn.tabIndex = "0";

    var icon = document.createElement("img");
    icon.src = img;
    btn.appendChild(icon);

    var span = document.createElement("div");
    span.textContent = text;
    btn.appendChild(span);

    btn.addEventListener("click", function() {
	onclick();
    });

    this.buttonBox.appendChild(btn);

    if (this.buttonBox.firstChild == btn) {
	btn.focus();
    }

    var self = this;
    btn.addEventListener("keydown", function(evt) {
	switch (evt.keyCode) {
	case 13:
	    evt.preventDefault();
	    evt.stopPropagation();
	    btn.click();
	    break;

	case 40:
	    self.handleArrowDown(btn);
	    break;

	case 38:
	    self.handleArrowUp(btn);
	    break;
	}
    });
    return btn;
}

/**
 * 
 */
Navigation.prototype.handleArrowUp = function(btn) {

    if (btn.previousSibling) {
	btn.previousSibling.focus();
    } else {
	btn.parentElement.lastChild.focus();
    }
}

/**
 * 
 */
Navigation.prototype.handleArrowDown = function(btn) {

    if (btn.nextSibling) {
	btn.nextSibling.focus();
    } else {
	btn.parentElement.firstChild.focus();
    }
}
