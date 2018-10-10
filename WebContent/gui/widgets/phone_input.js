var PhoneInputField = function(anchor) {

    var self = this;
    UIUtils.getElement(anchor).type = "tel";
    new InputFieldDecorator(anchor, "phone-input", function() {
	self.makeCall(UIUtils.getElement(anchor));
    });
}

/*
 * liefere die Breite des BackgroundIcons.
 */
PhoneInputField.prototype.getIconAreaWidth = function() {

    var result = window.getComputedStyle(this.anchor, null)['padding-right'];
    return parseInt(result);
}

/**
 * 
 */
PhoneInputField.prototype.makeCall = function(anchor) {

    var phoneNr = anchor.value || anchor.placeholder;

    // todo: normalisieren!
    var url = "tel:" + phoneNr;
    window.open(url);
}