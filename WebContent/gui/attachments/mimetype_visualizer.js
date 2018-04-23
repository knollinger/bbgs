var MimeTypeVisualizer = (function(mimeType) {

    return {

	/**
	 * Erzeuge ein Image, welches den gegebenen MimeType visualisiert.
	 * 
	 * @param der
	 *                MimeType
	 * @param size
	 *                optional. wenn nicht angegeben werden 16px angenommen
	 */
	getMimeTypeIcon : function(mimeType, size) {

	    var img = document.createElement("img");
	    img.src = "getDocument/mimeTypeIcon?mime-type=" + mimeType;
	    return img;
	}
    }

})();