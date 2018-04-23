var NotificationManager = (function() {

    var maxWait = 60000;

    return {

	start : function() {
	    setTimeout(NotificationManager.poll, 1);
	},
	
	poll : function() {

	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", "notifications", true);
	    xhr.timeout = maxWait;
	    xhr.onreadystatechange = function(evt) {

		if (xhr.readyState == XMLHttpRequest.prototype.DONE) {

		    if (xhr.status == 200) {
			console.log(xhr.responseXML);
			NotificationManager.start();
		    }
		}
	    }

	    xhr.onerror = function(evt) {
		setTimeout(NotificationManager.poll, maxWait);
	    }
	    
	    xhr.ontimeout = function(evt) {
		NotificationManager.start();
	    }
	    
	    var req = XmlUtils.createDocument("get-notifications-req");
	    XmlUtils.setNode(req, "max-wait", maxWait * 0.95);
	    xhr.send(XmlUtils.stringify(req));
	}
    }
})();