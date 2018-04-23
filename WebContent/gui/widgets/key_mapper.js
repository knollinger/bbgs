var KeyMap = function() {

    this.mappings = {};

    /*---------------------------------------------------------------------------*/
    /**
     * The Representation of a mapping
     */
    var Mapping = function(keyCode, isShiftDown, istCtrlDown, isAltDown, isMetaDown, callback) {
	this.isShiftDown = isShiftDown;
	this.isCtrlDown = isCtrlDown;
	this.isAltDown = isAltDown;
	this.isMetaDown = isMetaDown;
	this.callback = callback;
    }

    Mapping.prototype.match = function(evt) {

	return this.keyCode == evt.keyCode && (
		(this.isShiftDown && evt.shiftKey) ||
		(this.isCtrlDown && evt.ctrlKey) ||
		(this.isAltDown && evt.altKey) ||
		(this.isMetaDown && evt.metaKey) ||
		true);
    }
}