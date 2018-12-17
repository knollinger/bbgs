/**
 * 
 */
var MemberFinder = function(onsubmit) {

   
    WorkSpaceFrame.call(this, "gui/images/header.jpg");
    this.onsubmit = onsubmit;

    var self = this;
    this.load("gui/member/member_finder.html", function() {

	var input = UIUtils.getElement("member-search-input");
	var preview = UIUtils.getElement("member-search-preview");
	input.addEventListener("input", function() {

	    self.stopTimer();
	    if (input.value) {
		self.startTimer();
	    } else {
		self.clearPreview();
	    }
	});
	input.focus();
    });
}
MemberFinder.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
MemberFinder.prototype.startTimer = function() {

    var self = this;

    this.stopTimer();
    this.timer = window.setTimeout(function() {
	self.performSearch();
    }, 500);
}

/**
 * 
 */
MemberFinder.prototype.stopTimer = function() {

    if (this.timer) {
	window.clearTimeout(this.timer);
	this.timer = null;
    }
}

/**
 * 
 */
MemberFinder.prototype.clearPreview = function() {
    UIUtils.clearChilds("member-search-preview");
}

/**
 * 
 */
MemberFinder.prototype.performSearch = function() {

    var search = UIUtils.getElement("member-search-input").value;

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "search-member-ok-rsp":
	    self.showSearchPreview(new Model(rsp), search);
	    break;

	case "error-response":
	    console.log(rsp.getElementsByTagName("msg")[0].textContent);
	    break;
	}
    }
    caller.onError = function(req, status) {
	console.log(status);
    }

    var req = XmlUtils.createDocument("search-member-req");
    XmlUtils.setNode(req, "search", search);
    caller.invokeService(req.documentElement);
}

/**
 * 
 */
MemberFinder.prototype.showSearchPreview = function(model, search) {

    var preview = UIUtils.getElement("member-search-preview")
    this.clearPreview();

    var allMembers = model.evaluateXPath("//search-member-ok-rsp/members/member");
    for (var i = 0; i < allMembers.length; i++) {

	var xpath = XmlUtils.getXPathTo(allMembers[i]);
	preview.appendChild(this.renderPreviewItem(model, xpath, search));
    }
}

/**
 * 
 */
MemberFinder.prototype.renderPreviewItem = function(model, xpath, search) {

    var result = document.createElement("div");

    var content = model.getValue(xpath + "/zname");
    content += ", ";
    content += model.getValue(xpath + "/vname");
    content += ", ";
    content += model.getValue(xpath + "/zip_code");
    content += " ";
    content += model.getValue(xpath + "/city");
    content += ", ";
    content += model.getValue(xpath + "/street");

    var replacement = "<b>" + search + "</b>";
    content = content.replace(new RegExp(search, 'gi'), replacement);
    result.innerHTML = content;

    var self = this;
    result.addEventListener("click", function() {

	self.close();
	var member = model.evaluateXPath(xpath)[0];
	self.onsubmit(member);
    });
    return result;
}
