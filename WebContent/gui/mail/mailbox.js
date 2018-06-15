var MailBoxViewer = function() {

    WorkSpaceTabbedFrame.call(this, "mailbox");

    var self = this;
    this.loadModel(function() {
	self.update();
    });
}
MailBoxViewer.prototype = Object.create(WorkSpaceTabbedFrame.prototype);

/**
 * 
 */
MailBoxViewer.prototype.loadModel = function(onsuccess) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch(rsp.documentElement.nodeName) {
	case "get-mailbox-ok-rsp":
	    self.model = new Model(rsp);
	    onsuccess();
	    break;
	    
	case "error-response":
	    var title = MessageCatalog.getMessage("GETMAILBOX_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("GETMAILBOX_ERROR_MESSAGE", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }
    caller.onError = function(req, status) {
	    var title = MessageCatalog.getMessage("GETMAILBOX_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("GETMAILBOX_TECHERROR_MESSAGE", status);
	    new MessageBox(MessageBox.ERROR, title, messg);
    }
    
    var req = XmlUtils.createDocument("get-mailbox-req");
    caller.invokeService(req);
}

/**
 * 
 */
MailBoxViewer.prototype.update = function() {
    
    
}
