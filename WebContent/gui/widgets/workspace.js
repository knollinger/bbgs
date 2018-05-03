WorkSpace = (function() {

    // Keine ContextMenus!
    // document.body.addEventListener("contextmenu", function(evt) {
    //
    // evt.preventDefault();
    // }, false);

    // prevent touchmove!
    document.body.addEventListener("touchmove", function(evt) {

	evt.preventDefault();
	evt.stopPropagation();
    }, false);

    return {

	clearAll : function() {
	    UIUtils.clearChilds(document.getElementById("workspace"));
	    UIUtils.clearChilds(document.getElementById("dialogs"));
	}

    }
})();

/**
 * 
 */
var WorkSpaceFrame = function(logoUrl) {

    this.frame = document.createElement("div");
    this.frame.className = "workspace-frame";

    this.header = this.makeHeader();
    this.frame.appendChild(this.header);

    if (logoUrl) {
	this.logo = this.makeLogo(logoUrl);
	this.frame.appendChild(this.logo);
    }

    var actionbar = document.createElement("div");
    actionbar.className = "workspace-actionbar";
    this.frame.appendChild(actionbar);

    this.naviBox = this.makeNaviBox();
    actionbar.appendChild(this.naviBox);

    this.toolbox = this.makeToolBox();
    actionbar.appendChild(this.toolbox);

    this.content = document.createElement("div");
    this.content.className = "workspace-frame-body";
    this.frame.appendChild(this.content);

    var workSpace = UIUtils.getElement("workspace");
    workSpace.appendChild(this.frame);

    var self = this;
    this.frame.addEventListener("keydown", function(evt) {

	switch (evt.keyCode) {
	case 27:
	    self.handleEscape();
	    evt.stopPropagation();
	    evt.preventDefault();
	    break;

	default:
	    break;
	}
    });
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeLogo = function(logoUrl) {

    var logo = document.createElement("div");
    logo.className = "navigation-header";
    logo.style.backgroundImage = "url('" + logoUrl + "')";

    var title = document.createElement("span");
    title.textContent = "Bayerns beste Gipfelstürmer";
    logo.appendChild(title);
    return logo;
}

/**
 * 
 */
WorkSpaceFrame.prototype.handleEscape = function() {

    var workSpace = UIUtils.getElement("workspace");
    if (workSpace.children.length > 1) {
	this.close();
    }
}

/**
 * 
 * @param url
 * @param onload
 */
WorkSpaceFrame.prototype.load = function(url, onload) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.content.innerHTML = req.responseText;

		// ist der Content annotiert?
		var annotations = self.content.getElementsByClassName("workspace-frame-content")[0];
		if (annotations) {

		    self.setTitle(annotations.dataset.frameTitle || "");
		    self.enableBackButton((annotations.dataset.hasBackbutton == "yes"));
		    self.enableSaveButton((annotations.dataset.hasSavebutton == "yes"));
		    self.enableHelpButton(annotations.dataset.helpUrl);
		}

		if (onload) {
		    onload(self);
		}
	    }
	}
    }
    req.send();
}

/**
 * 
 */
WorkSpaceFrame.prototype.close = function() {

    if (this.onClose) {
	this.onClose();
    }
    this.frame.parentElement.removeChild(this.frame);
}

/**
 * 
 * @param value
 */
WorkSpaceFrame.prototype.enableBackButton = function(value) {

    if (value) {
	UIUtils.removeClass(this.backButton, "hidden");
    } else {
	UIUtils.addClass(this.backButton, "hidden");
    }
}

/**
 * 
 * @param value
 */
WorkSpaceFrame.prototype.enableSaveButton = function(value) {

    if (value) {
	UIUtils.removeClass(this.saveButton, "hidden");
    } else {
	UIUtils.addClass(this.saveButton, "hidden");
    }
}

/**
 * 
 * @param value
 */
WorkSpaceFrame.prototype.enableHomeButton = function(value) {

    if (value) {
	UIUtils.removeClass(this.homeBtn, "hidden");
    } else {
	UIUtils.addClass(this.homeBtn, "hidden");
    }
}

/**
 * 
 */
WorkSpaceFrame.prototype.enableHelpButton = function(helpUrl) {

    if (helpUrl) {
	UIUtils.removeClass(this.helpBtn, "hidden");
	this.helpUrl = helpUrl;
    } else {
	UIUtils.addClass(this.helpBtn, "hidden");
    }
}

/**
 * 
 * @param text
 */
WorkSpaceFrame.prototype.setTitle = function(text) {

    this.title.innerHTML = text;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeHeader = function() {

    this.header = document.createElement("div");
    this.header.className = "workspace-frame-header";

    // Menu
    var menu = document.createElement("img");
    menu.className = "workspace-frame-header-icon";
    menu.src = "gui/images/navigation-menu.svg";
    menu.addEventListener("click", function() {
	new MainMenu(menu);
    })
    this.header.appendChild(menu);

    // Title
    this.title = document.createElement("span");
    this.title.className = "workspace-frame-header-title";
    this.header.appendChild(this.title);

    // home
    this.homeBtn = document.createElement("img");
    this.homeBtn.className = "workspace-frame-header-icon";
    this.homeBtn.title = "Zum Haupt-Menü";
    this.homeBtn.src = "gui/images/home.svg";
    this.homeBtn.addEventListener("click", function() {
	MainNavigation.showHomeScreen();
    })
    this.header.appendChild(this.homeBtn);

    this.header.appendChild(UIUtils.createClearFix());
    return this.header;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeNaviBox = function() {

    var naviBox = document.createElement("div");
    naviBox.className = "workspace-frame-navigationbox";

    var self = this;

    // Back-Button
    this.backButton = this.makeActionBtn("gui/images/go-previous.svg", "Zurück", function(evt) {
	evt.stopPropagation();
	if (self.onBack) {
	    self.onBack();
	}
	self.close();
    });
    naviBox.appendChild(this.backButton);

    // save button
    this.saveButton = this.makeActionBtn("gui/images/document-save.svg", "Speichern", function(evt) {

	evt.stopPropagation();
	if (!self.onSave) {
	    self.close();
	} else {
	    if (self.validate()) {
		self.onSave();
		self.close();
	    }
	}
    });
    UIUtils.addClass(this.saveButton, "hidden");
    naviBox.appendChild(this.saveButton);

    naviBox.appendChild(UIUtils.createClearFix());

    return naviBox;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeToolBox = function() {

    var toolbox = document.createElement("div");
    toolbox.className = "workspace-frame-toolbox";
    return toolbox;
}

/**
 * 
 * @param action
 * @param text
 * @param onClick
 */
WorkSpaceFrame.prototype.addAction = function(action) {

    var div = this.makeActionBtn(action.img, action.text, action.onClick);
    action.btn = div;
    this.toolbox.appendChild(div);
    return div;
}

/**
 * 
 */
WorkSpaceFrame.prototype.makeActionBtn = function(imgUrl, title, onclick) {

    var image = document.createElement("img");
    image.addEventListener("click", onclick);
    image.ondragstart = function() {
	return false;
    };
    image.src = imgUrl;

    var btn = document.createElement("div");
    btn.className = "workspace-frame-action";
    btn.title = title;
    btn.appendChild(image);
    return btn;
}

/**
 * actions für den WorkSpaceFrame
 */
var WorkSpaceFrameAction = function(img, text, onClick) {

    this.btn = null;
    this.img = img;
    this.text = text;
    this.onClick = onClick;

    var self = this;
    this.show = function() {
	self.btn.style.display = "inline-block";
    }

    this.hide = function() {
	self.btn.style.display = "none";
    }

    this.isVisible = function() {
	return self.btn.style.display != "none";
    }
}

/**
 * 
 */
WorkSpaceFrame.prototype.validate = function() {

    return new Validator().validate(this.content);
}

/*---------------------------------------------------------------------------*/
/**
 * 
 */
var WorkSpaceTabBinder = function(tabbedPane, radio, contentPane) {

    this.tabbedPane = tabbedPane;
    this.radio = radio;
    this.contentPane = contentPane;
}

/**
 * 
 */
WorkSpaceTabBinder.prototype.associateTabPane = function(subFrame) {

    var self = this;
    this.subFrame = subFrame;
    this.radio.addEventListener("click", function() {

	self.tabbedPane.handleActivation(subFrame);
    });
}

/**
 * 
 */
WorkSpaceTabBinder.prototype.select = function() {
    this.radio.click();
}

/**
 * 
 */
WorkSpaceTabBinder.prototype.isSelected = function() {
    return this.radio.checked;
}

/**
 * 
 */
WorkSpaceTabBinder.prototype.validate = function() {

    this.select();
    return new Validator().validate(this.contentPane);
}

/*---------------------------------------------------------------------------*/
/**
 * WorkSpaceTabbedFrames werden verwendet, um einen Accordeon/TabDialog zu
 * konstruieren. Jedem TabbedFrame ist ein eindeutiger GruppenNamen zu zuweisen.
 * Dieser wird im Rahmen des üblichen RadioButtonHacks zur Addressierung
 * verwendet.
 */
var WorkSpaceTabbedFrame = function(groupName) {

    WorkSpaceFrame.call(this);
    UIUtils.addClass(this.frame, "accordeon-cnr");
    this.groupName = groupName;
    this.currentSelection = null;
    this.tabs = [];
}
WorkSpaceTabbedFrame.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 * @param imgUrl
 * @param text
 */
WorkSpaceTabbedFrame.prototype.addTab = function(imgUrl, text) {

    var self = this;
    var id = UUID.create("workspace_tab");

    var radio = document.createElement("input");
    radio.className = "accordeon-btn";
    radio.type = "radio";
    radio.name = this.groupName;
    radio.id = id;
    this.content.appendChild(radio);
    var label = document.createElement("label");
    label.setAttribute("for", id);

    var img = document.createElement("img");
    img.src = imgUrl;
    label.appendChild(img);
    label.appendChild(document.createTextNode(text));

    this.content.appendChild(label);

    var content = document.createElement("div");
    content.className = "accordeon-content";
    this.content.appendChild(content);

    var tabBinder = new WorkSpaceTabBinder(this, radio, content);
    this.tabs.push(tabBinder);
    return tabBinder;
}

/**
 * 
 */
WorkSpaceTabbedFrame.prototype.handleActivation = function(currentSubFrame) {

    if (this.currentSelection) {
	this.currentSelection.deactivate();
    }
    this.currentSelection = currentSubFrame;
    this.currentSelection.activate();
}

/**
 * 
 */
WorkSpaceTabbedFrame.prototype.getSelectedTab = function() {

    for (var i = 0; i < this.tabs.length; i++) {

	if (this.tabs[i].isSelected()) {
	    return this.tabs[i];
	}
    }
    return null;
}

/**
 * 
 */
WorkSpaceTabbedFrame.prototype.validate = function() {

    var result = true;

    for (var i = 0; result && i < this.tabs.length; i++) {

	result = this.tabs[i].validate();
    }
    return result;
}

/*---------------------------------------------------------------------------*/
/**
 * WorkSpaceTabPanes werden im Content von Accordeons/Tabs angezeigt. Die
 * wichtigsten Methoden sind activate und deactivate. Hier müssen die SubFrames
 * alle dem aktuellen Zustand enstprechenden Actions anzeigen bzw. alle mit
 * ihnen verbandelten Actions verstecken.
 */

/**
 * @param parentFrame
 * @param targetContainer
 */
var WorkSpaceTabPane = function(parentFrame, targetContainer) {

    this.parentFrame = parentFrame;
    this.targetCnr = UIUtils.getElement(targetContainer);
    this.actions = [];
}

/**
 * Der Methodenrumpf ist nur zur dokumentation vorhanden.
 */
WorkSpaceTabPane.prototype.activate = function() {

}

/**
 * Verstecke alle Actions, welche mit dem SubFrame assoziiert sind
 */
WorkSpaceTabPane.prototype.deactivate = function() {

    for (var i = 0; i < this.actions.length; i++) {
	this.actions[i].hide();
    }
}

/**
 * @param htmlSrc
 *                die url mit der htmlSourse für den SubFrame
 * @param onload
 *                callback, welcher beim erfolgreichen laden gerufen wird. der
 *                Callback erhält das SubFrameObject als Parameter übergeben
 */
WorkSpaceTabPane.prototype.load = function(htmlSrc, onload) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", htmlSrc, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.targetCnr.innerHTML = req.responseText;

		if (onload) {
		    onload(self);
		}
	    }
	}
    }
    req.send();
}

/**
 * Füge eine Action hinzu
 */
WorkSpaceTabPane.prototype.addAction = function(action) {

    this.actions.push(action);
    this.parentFrame.addAction(action);
}

/**
 * abgeleitete Klassen lten diese Methode überschreiben und die InputValidierung
 * vor nehmen.
 */
// WorkSpaceTabPane.prototype.validate = function() {
//    
// return new Validator().validate(this.targetCnr);
//
// }
/*---------------------------------------------------------------------------*/
/**
 * Dialoge
 */
var WorkSpaceDialog = function(title) {

    this.frame = document.createElement("div");
    this.frame.className = "dialog-frame";

    this.titlebar = this.createTitlebar(title);
    this.frame.appendChild(this.titlebar);

    this.actionbar = this.createActionbar(title);
    this.frame.appendChild(this.actionbar);

    this.body = document.createElement("div");
    this.body.className = "dialog-body";
    this.frame.appendChild(this.body);

    this.buttonbar = this.createButtonbar(title);
    this.frame.appendChild(this.buttonbar);

    UIUtils.getElement("dialogs").appendChild(this.frame);
}

/**
 * 
 */
WorkSpaceDialog.prototype.createTitlebar = function(title) {

    var titlebar = document.createElement("div");
    titlebar.className = "dialog-title";
    titlebar.textContent = title;
    return titlebar;
}

/**
 * 
 */
WorkSpaceDialog.prototype.createActionbar = function(title) {

    var actionBar = document.createElement("div");
    actionBar.className = "dialog-actionbar";
    return actionBar;
}

/**
 * 
 */
WorkSpaceDialog.prototype.createButtonbar = function(title) {

    var buttonBar = document.createElement("div");
    buttonBar.className = "dialog-buttonbar";

    var self = this;
    this.okButton = this.makeActionBtn("gui/images/dialog-ok.svg", "", function() {
	if (self.onOk) {
	    self.onOk();
	}
	self.close();
    });
    UIUtils.addClass(this.okButton, "hidden");
    buttonBar.appendChild(this.okButton);

    this.cancelButton = this.makeActionBtn("gui/images/dialog-cancel.svg", "", function() {
	if (self.onCancel) {
	    self.onCancel();
	}
	self.close();
    });
    UIUtils.addClass(this.cancelButton, "hidden");
    buttonBar.appendChild(this.cancelButton);

    return buttonBar;
}

/**
 * 
 */
WorkSpaceDialog.prototype.enableOkButton = function(value) {

    var enabled = value == undefined || value;
    if (enabled) {
	UIUtils.removeClass(this.okButton, "hidden");
    } else {
	UIUtils.addClass(this.okButton, "hidden");
    }
}

/**
 * 
 */
WorkSpaceDialog.prototype.enableCancelButton = function(value) {

    var enabled = value == undefined || value;
    if (enabled) {
	UIUtils.removeClass(this.cancelButton, "hidden");
    } else {
	UIUtils.addClass(this.cancelButton);
    }
}

/**
 * 
 */
WorkSpaceDialog.prototype.load = function(url, onsuccess) {

    var self = this;
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function(evt) {

	if (req.readyState == XMLHttpRequest.prototype.DONE) {
	    if (req.status == 200) {

		self.body.innerHTML = req.responseText;
		if (onsuccess) {
		    onsuccess(self);
		}
	    }
	}
    }
    req.send();

}

/**
 * 
 */
WorkSpaceDialog.prototype.close = function() {

    this.frame.parentElement.removeChild(this.frame);
}

/**
 * 
 */
WorkSpaceDialog.prototype.addAction = function(action) {

    var div = this.makeActionBtn(action.img, action.text, action.onClick);
    action.btn = div;
    this.actionbar.appendChild(div);
    return div;
}

/**
 * 
 */
WorkSpaceDialog.prototype.makeActionBtn = function(imgUrl, title, onclick) {

    var image = document.createElement("img");
    image.addEventListener("click", onclick);
    image.ondragstart = function() {
	return false;
    };
    image.src = imgUrl;

    var btn = document.createElement("div");
    btn.className = "workspace-frame-action";
    btn.title = title;
    btn.appendChild(image);
    btn.tabIndex = "0";
    return btn;
}

/*---------------------------------------------------------------------------*/
/**
 * PopupMenu
 */
var PopupMenu = function(anchor) {

    this.makeUI();
    this.adjustToAnchor(anchor);
}

/**
 * 
 */
PopupMenu.prototype.makeUI = function() {

    this.ui = document.createElement("div");
    this.ui.className = "popup-menu-cnr";
    this.ui.tabIndex = "0";

    document.body.appendChild(this.ui);
    this.ui.focus();

    var self = this;
    this.ui.addEventListener("blur", function() {
	UIUtils.removeElement(self.ui);
    });
    this.ui.addEventListener("keydown", function(evt) {
	if (evt.keyCode == 27) {
	    UIUtils.removeElement(self.ui);
	}
    });    
}


/**
 * 
 */
PopupMenu.prototype.clear = function() {
    
    UIUtils.clearChilds(this.ui);
}

/**
 * 
 */
PopupMenu.prototype.makeMenuItem = function(text, onclick) {
    
    var item = document.createElement("div");
    item.className = "popup-menu-item";
    item.textContent = text;

    var self = this;
    item.addEventListener("click", function() {
	onclick();
    });
    this.ui.appendChild(item);
}

/**
 * 
 */
PopupMenu.prototype.adjustToAnchor = function(anchor) {

    var anchorRect = anchor.getBoundingClientRect();
    var ui = this.ui.getBoundingClientRect();

    var left = anchorRect.left;
    var top = 5 + anchorRect.top + anchorRect.height;
    this.ui.style.top = window.scrollY + top + "px";
    this.ui.style.left = window.scrollX + left + "px";
}


/*---------------------------------------------------------------------------*/
/**
 * 
 */
var MainMenu = function(anchor) {

    PopupMenu.call(this, anchor);
    
    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case 'get-session-state-loggedin-response':
	    self.makeMenuItems(true);
	    break;

	case 'get-session-state-loggedout-response':
	    self.makeMenuItems(false);
	    break;
	}
    }
    var req = XmlUtils.createDocument("get-session-state-request");
    caller.invokeService(req);
}
MainMenu.prototype = Object.create(PopupMenu.prototype);

/**
 * 
 */
MainMenu.prototype.makeMenuItems = function(loggedIn) {

    var self = this;
    if (loggedIn) {

	this.makeMenuItem("Abmelden", function() {
	    self.logout();
	});

	this.makeMenuItem("Kennwort ändern", function() {
	    new ChangePasswordDialog();
	});
    }

    this.makeMenuItem("Über das Projekt", function() {
	new AboutDialog();
    });

    this.makeMenuItem("Opensource Lizenzen", function() {
	new LicenceDialog();
    });
}

/**
 * 
 */
MainMenu.prototype.logout = function() {

    var title = MessageCatalog.getMessage("QUERY_LOGOUT_TITLE");
    var messg = MessageCatalog.getMessage("QUERY_LOGOUT");
    new MessageBox(MessageBox.QUERY, title, messg, function() {
	SessionManager.logout();
    });
}

/*---------------------------------------------------------------------------*/
/**
 * all about the AboutDialog
 */
var AboutDialog = function() {

    WorkSpaceDialog.call(this, "Über das Projekt");

    var self = this;
    this.load("gui/widgets/about.html", function() {
	self.enableOkButton();
    });
}
AboutDialog.prototype = Object.create(WorkSpaceDialog.prototype);

/*---------------------------------------------------------------------------*/
/**
 * all about the Licences
 */
var LicenceDialog = function() {

    WorkSpaceDialog.call(this, "Opensource Lizenzen");

    var self = this;
    this.load("gui/widgets/licences.html", function() {
	self.enableOkButton();
    });
}
LicenceDialog.prototype = Object.create(WorkSpaceDialog.prototype);
