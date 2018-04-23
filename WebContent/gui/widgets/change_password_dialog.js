/*---------------------------------------------------------------------------*/
/**
 * all about the Licences
 */
var ChangePasswordDialog = function() {

    WorkSpaceDialog.call(this, "Kennwort ändern");

    var self = this;
    this.load("gui/widgets/change_passwd_dialog.html", function() {

	self.enableCancelButton();
	UIUtils.getElement("old_pwd").focus();
	UIUtils.getElement("old_pwd").addEventListener("input", function() {
	    self.onOldPwdInput();
	});
	UIUtils.getElement("new_pwd").addEventListener("input", function() {
	    self.onNewPwdInput();
	});
	UIUtils.getElement("new_pwd1").addEventListener("input", function() {
	    self.onNewPwd1Input();
	});
    });
}
ChangePasswordDialog.prototype = Object.create(WorkSpaceDialog.prototype);

/**
 * 
 */
ChangePasswordDialog.prototype.onOldPwdInput = function() {

    var val = UIUtils.getElement("old_pwd").value;
    if (!val) {
	this.showMsg("EMPTY_OLD_PWD");
    } else {
	this.showMsg("");
    }
    this.adjustOkBtn();
}

/**
 * 
 */
ChangePasswordDialog.prototype.onNewPwdInput = function() {

    UIUtils.getElement("new_pwd1").value = "";
    var val = UIUtils.getElement("new_pwd").value;
    if (!val) {
	this.showMsg("EMPTY_NEW_PWD");
    } else {
	if (val == UIUtils.getElement("old_pwd").value) {
	    this.showMsg("SAME_NEW_PWD");
	} else {
	    this.showMsg("");
	}
    }
    this.adjustOkBtn();
}

/**
 * 
 */
ChangePasswordDialog.prototype.onNewPwd1Input = function() {

    if (UIUtils.getElement("new_pwd").value != UIUtils.getElement("new_pwd1").value) {
	this.showMsg("NEW_PWDS_DIFFERENT");
    } else {
	this.showMsg("");
    }
    this.adjustOkBtn();
}

/**
 * 
 */
ChangePasswordDialog.prototype.showMsg = function(msg) {

    var text = MessageCatalog.getMessage(msg);
    UIUtils.getElement("change_password_message").textContent = text;
}

/**
 * 
 */
ChangePasswordDialog.prototype.adjustOkBtn = function() {

    var oldPwd = UIUtils.getElement("old_pwd").value;
    var newPwd = UIUtils.getElement("new_pwd").value;
    var newPwd1 = UIUtils.getElement("new_pwd1").value;

    var ok = oldPwd && oldPwd != newPwd;
    ok = ok && newPwd;
    ok = ok && newPwd1;
    ok = ok && oldPwd != newPwd;
    ok = ok && (newPwd == newPwd1);

    this.enableOkButton(ok);
}

/**
 * 
 */
ChangePasswordDialog.prototype.onOk = function() {

    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "change-password-ok-rsp":
	    var title = MessageCatalog.getMessage("CHANGE_PWD_SUCCESS_TITLE");
	    var messg = MessageCatalog.getMessage("CHANGE_PWD_SUCCESS");
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;

	case "error-response":
	    var title = MessageCatalog.getMessage("CHANGE_PWD_ERROR_TITLE");
	    var messg = MessageCatalog.getMessage("CHANGE_PWD_ERROR", rsp.getElementsByTagName("msg")[0].textContent);
	    new MessageBox(MessageBox.ERROR, title, messg);
	    break;
	}
    }

    caller.onError = function(req, status) {
	var title = MessageCatalog.getMessage("CHANGE_PWD_ERROR_TITLE");
	var messg = MessageCatalog.getMessage("CHANGE_PWD_TECH_ERROR", status);
	new MessageBox(MessageBox.ERROR, title, messg);
    }

    var req = XmlUtils.createDocument("change-password-req");
    XmlUtils.setNode(req, "old-pwd", UIUtils.getElement("old_pwd").value);
    XmlUtils.setNode(req, "new-pwd", UIUtils.getElement("new_pwd").value);
    caller.invokeService(req);
}