/**
 * 
 */
let NewMemberFinder = function(onsubmit) {

    WorkSpaceFrame.call(this, "gui/images/header.jpg");
    this.onsubmit = onsubmit;

    let self = this;
    this.load("gui/member/new_memberfinder.html", function() {

	let input = UIUtils.getElement("member-search-input");
	let preview = UIUtils.getElement("member-search-preview");
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
NewMemberFinder.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
NewMemberFinder.prototype.startTimer = function() {

    let self = this;

    this.stopTimer();
    this.timer = window.setTimeout(function() {
	self.performSearch();
    }, 500);
}

/**
 * 
 */
NewMemberFinder.prototype.stopTimer = function() {

    if (this.timer) {
	window.clearTimeout(this.timer);
	this.timer = null;
    }
}

/**
 * 
 */
NewMemberFinder.prototype.clearPreview = function() {
    UIUtils.clearChilds("member-search-preview");
}

/**
 * 
 */
NewMemberFinder.prototype.performSearch = function() {

    let search = UIUtils.getElement("member-search-input").value;

    let self = this;
    let caller = new ServiceCaller();
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
NewMemberFinder.prototype.showSearchPreview = function(model, search) {

    let preview = UIUtils.getElement("member-search-preview")
    this.clearPreview();

    let allMembers = model.evaluateXPath("//search-member-ok-rsp/members/member");
    for (let i = 0; i < allMembers.length; i++) {

	let xpath = XmlUtils.getXPathTo(allMembers[i]);
	preview.appendChild(this.renderPreviewItem(model, xpath, search));
    }
}

/**
 * 
 */
NewMemberFinder.prototype.renderPreviewItem = function(model, xpath, search) {

    let result = document.createElement("div");

    let content = model.getValue(xpath + "/zname");
    content += ", ";
    content += model.getValue(xpath + "/vname");
    content += ", ";
    content += model.getValue(xpath + "/zip_code");
    content += " ";
    content += model.getValue(xpath + "/city");
    content += ", ";
    content += model.getValue(xpath + "/street");

    let replacement = "<b>" + search + "</b>";
    content = content.replace(new RegExp(search, 'gi'), replacement);
    result.innerHTML = content;

    let self = this;
    result.addEventListener("click", function() {

	self.close();
	let member = model.evaluateXPath(xpath)[0];
	self.onsubmit(member);
    });
    return result;
}
