/**
 * Der klägliche Versuch, Multipart-Messages irgendwie zu visualisieren.
 * 
 * Aber evtl wärs einfache selbiges am Server zu renderen?
 * 
 */
var MultipartRenderer = (function() {

    return {

	/**
	 * parse einen Multipart
	 * 
	 * @param multipart
	 * @param boundary
	 * @return eine div, welche alle Parts beinhaltet
	 */
	parseMultipart : function(multipart, boundary) {

	    var result = document.createElement("div");

	    var allParts = multipart.split(boundary);
	    for (var i = 0; i < allParts.length; i++) {

		div.appendChild(this.handlePart(allParts[i]));
	    }
	    return div;
	},

	/**
	 * verarbeite einen teil der Multipart-message
	 * 
	 * @param part
	 *                der einzelne Teil, incl. seiner Header
	 * @return ein geeignetes HTML-Element, um den Part zu visualisieren
	 */
	handlePart : function(part) {

	    var result = null;
	    var partLines = part.split("\r\n");
	    var header = this.extractHeaders(partLines);
	    var body = this.decodeBody(this.partLines, header["content-transfer-encoding"]);
	    if (body) {

		var contentType = this.parseContentType(header["content-type"]);
		switch (contentType("%%TYPE%%")) {
		case "text/text":
		    break;

		case "text/html":
		    break;

		case "image/*":
		    break;
		}
	    }
	    return result;
	},

	/**
	 * extrahiere alle Header und entferne diese vom Part. Es bleibt
	 * lediglich der Body zurück
	 */
	extractHeaders : function(partLines) {

	    var headers = {};

	    while (partLines.length && partLines[i] != "") {

		var hdr = this.parseHeaderLine(partLines[i]);
		headers[hdr.key] = header.val;
		partLines.splice(0, 1);
	    }
	    partLines.splice(0, 1);

	    return headers;
	},

	/**
	 * Nehme eine HeaderZeile auseinander und liefere ein Objelt mit den
	 * Properties "key" und "val" zurück. diese Beinhalten dann die
	 * jeweiligen (getrimmten) Werte.
	 * 
	 * @param line
	 */
	parseHeaderLine : function(line) {

	    var keyAndValue = line.split(":");
	    return {
		key : keyAndValue[0].trim().toLowerCase(),
		val : keyAndValue[1].trim().toLowerCase()
	    }
	},

	/**
	 * Parse den ContentType
	 * 
	 * @param line
	 */
	parseContentType : function(type) {

	    var parts = type.split(";");
	    result = {};

	    for (var i = 0; i < parts.length; i++) {

		var key, val;
		var subParts = parts[i].split("=");
		if (subParts.length > 1) {
		    key = keyAndValue[0].trim().toLowerCase();
		    val = keyAndValue[1].trim().toLowerCase();
		} else {
		    key = "%%TYPE%%";
		    val = parts[i];
		}
		result[key] = val;
	    }
	},

	/**
	 * Decodiere den Body eines Parts. Im Endeffekt kommt immer ein
	 * ByteArray raus (okay, gibts ned in JS) Das ganze ist im RFC1341
	 * beschrieben, die Doku findest Du hier:
	 * https://www.w3.org/Protocols/rfc1341/5_Content-Transfer-Encoding.html
	 */
	decodeBody : function(body, encoding) {

	    var result = null;
	    switch (encoding.toUpperCase()) {
	    case "BASE64":
		result = atob(body);
		break;

	    case "QUOTED-PRINTABLE":
		// TDODO
		break;

	    case "7BIT":
		// TDODO
		break;

	    case "8BIT":
		// TDODO
		break;

	    case "BINARY":
		// TDODO
		break;

	    default:
		break;

	    }
	    return result;
	}
    }
})();
