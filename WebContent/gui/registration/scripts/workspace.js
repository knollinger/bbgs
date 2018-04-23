var WorkSpace = (function() {

    var workspace = document.getElementById("workspace");
    var goForeBtn = document.getElementById("footer-go-fore");
    var goBackBtn = document.getElementById("footer-go-back");

    goBackBtn.addEventListener("click", function() {
	WorkSpace.goBack();
    });

    goForeBtn.addEventListener("click", function() {
	WorkSpace.goFore();
    });

    return {

	frames : [],

	/**
	 * 
	 */
	getWorkspace : function() {

	    return document.getElementById("workspace-body");
	},

	/**
	 * 
	 */
	clear : function() {
	    UIUtils.clearChilds(Workspace.getWorkspace());
	},

	/**
	 * 
	 */
	enableBackButton : function(val) {

	    if (val == undefined || val) {
		UIUtils.removeClass(goBackBtn, "hidden")
	    } else {
		UIUtils.addClass(goBackBtn, "hidden")
	    }
	},

	/**
	 * 
	 */
	enableForeButton : function(val) {

	    if (val == undefined || val) {
		UIUtils.removeClass(goForeBtn, "hidden")
	    } else {
		UIUtils.addClass(goForeBtn, "hidden")
	    }
	},

	/**
	 * 
	 */
	addFrame : function(frame) {
	    this.getWorkspace().appendChild(frame.frame);
	    this.frames.push(frame);
	    frame.onActivation();
	},

	goBack : function() {
	    var ws = this.getWorkspace();
	    ws.removeChild(ws.lastChild);
	    this.frames.pop();
	    this.frames[this.frames.length - 1].onActivation();
	},

	goFore : function() {
	    this.frames[this.frames.length - 1].onGoFore();
	}
    }
})();

/*---------------------------------------------------------------------------*/
var WorkSpaceFrame = function() {

    this.frame = document.createElement("div");
    this.frame.className = "workspace-frame";

    this.title = document.createElement("div");
    this.title.className = "workspace-frame-title";
    this.frame.appendChild(this.title);

    this.titleText = document.createElement("div");
    this.titleText.className = "workspace-frame-title-text";
    this.title.appendChild(this.titleText);

    this.toolbox = document.createElement("div");
    this.toolbox.className = "workspace-frame-toolbox";
    this.title.appendChild(this.toolbox);

    this.content = document.createElement("div");
    this.content.className = "workspace-frame-content";
    this.frame.appendChild(this.content);

    this.actions = [];
    WorkSpace.addFrame(this);
}

/**
 * 
 */
WorkSpaceFrame.prototype.load = function(url, onsuccess) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.content.innerHTML = req.responseText;
		if (onsuccess) {
		    onsuccess();
		}
	    }
	}
    }
    req.send();
}

/**
 * 
 */
WorkSpaceFrame.prototype.setTitle = function(title) {

    this.titleText.textContent = title;
}

/**
 * 
 */
WorkSpaceFrame.prototype.addAction = function(iconURL, text, onclick) {

    var img = document.createElement("img");
    img.className = "workspace-frame-action-icon";
    img.src = iconURL;
    img.addEventListener("dragstart", function(evt) {
	evt.preventDefault();
    });

    var btn = document.createElement("div");
    btn.className = "workspace-frame-action";
    btn.addEventListener("click", function() {
	if(onclick) {
	    onclick();
	}
    });
    btn.appendChild(img);
    this.toolbox.appendChild(btn);
    return btn;
}

/**
 * 
 */
WorkSpaceFrame.prototype.onActivation = function() {

}

/**
 * 
 */
WorkSpaceFrame.prototype.onGoFore = function() {

    alert("not yet implemented");
}
