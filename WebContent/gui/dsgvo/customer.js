var DSGVOCustomer = (function() {

    return {

	init : function() {

	    document.getElementById("dsgvo_accept").addEventListener("click", function() {
		DSGVOCustomer.sendResponse(true);
	    });

	    document.getElementById("dsgvo_reject").addEventListener("click", function() {
		DSGVOCustomer.sendResponse(false);
	    });
	},

	sendResponse : function(state) {

	    var caller = new ServiceCaller();
	    caller.onSuccess = function(rsp) {
		switch (rsp.documentElement.nodeName) {
		case "dsgvo-accepted-rsp":
		    window.location = "dsgvo_accepted.html";
		case "dsgvo-rejected-rsp":
		    window.location = "dsgvo_rejected.html";
		case "error-response":
		    window.location = "dsgvo_error.html";
		}
	    }
	    caller.onError = function(req, status) {
		window.location = "dsgvo_error.html";
	    }

	    var req = XmlUtils.createDocument("dsgvo-req");
	    XmlUtils.setNode(req, "email", document.getElementById("dsgvo_email").textContent);
	    XmlUtils.setNode(req, "state", state);
	    caller.invokeService(req);
	}
    }
})();