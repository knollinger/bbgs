/**
 * 
 */
var FileSystemExplorer = function(id) {

    WorkSpaceFrame.call(this);
    this.currentFolderId = id || FileSystemExplorer.ID_ROOTFOLDER;
    this.setupUI();

    var self = this;
    this.loadContent();
    this.setTitle("Dokumenten-Verwaltung");
}
FileSystemExplorer.prototype = Object.create(WorkSpaceFrame.prototype);

/**
 * 
 */
FileSystemExplorer.ID_ROOTFOLDER = -1;

/**
 * 
 */
FileSystemExplorer.prototype.setupUI = function() {

    this.createAddFolderAction();
    this.createAddFileAction();
    this.createRemoveItemAction();

    this.content.className = "filesystem-explorer";
    
    var self = this;
    this.prepareDropArea(this.content, this.currentFolderId, function() {
	self.loadContent();
    });
}

/**
 * 
 */
FileSystemExplorer.prototype.createAddFolderAction = function() {

    this.actionCreateFolder = new WorkSpaceFrameAction("gui/images/folder-add.svg", "Einen neuen Ordner erstellen", function() {
    });
    this.addAction(this.actionCreateFolder);
}

/**
 * 
 */
FileSystemExplorer.prototype.createAddFileAction = function() {

    var picker = document.createElement("input");
    picker.type = "file";
    UIUtils.addClass(picker, "hidden");

    var self = this;
    picker.addEventListener("change", function(evt) {
	self.uploadFiles(picker.files, self.currentFolderId, function() {
	    self.loadContent();
	});
    });
    
    this.actionCreateFile = new WorkSpaceFrameAction("gui/images/document-add.svg", "Eine neue Datei erstellen", function() {
	picker.click();
    });
    
    this.addAction(this.actionCreateFile);
    this.actionCreateFile.btn.appendChild(picker);
}

/**
 * 
 */
FileSystemExplorer.prototype.createRemoveItemAction = function() {

    var self = this;
    this.actionRemoveElement = new WorkSpaceFrameAction("gui/images/trashbin.svg", "Das ausgewählte Element löschen", function() {
	self.removeFileSystemObject(self.selectedXPath, self.selectedEntry);
    });
    this.addAction(this.actionRemoveElement);
    this.actionRemoveElement.hide();
}

/**
 * 
 */
FileSystemExplorer.prototype.loadContent = function() {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "folder-content-model":
	    self.model = new Model(rsp);
	    self.updateContent();
	    break;

	case "error-response":
	    // TODO: not yet implemented
	    break;
	}
    }
    caller.onError = function(req, status) {
	// TODO: not yet implemented
    }

    var req = XmlUtils.createDocument("get-folder-content-req");
    XmlUtils.setNode(req, "id", this.currentFolderId);
    caller.invokeService(req);
}

/**
 * 
 */
FileSystemExplorer.prototype.updateContent = function() {

    var allParents = this.model.evaluateXPath("//folder-content-model/parents/parent");
    var title = "Dokumente [Home";
    for (var i = 0; i < allParents.length; i++) {

	var xpath = XmlUtils.getXPathTo(allParents[i]);
	title += "/";
	title += this.model.getValue(xpath);
    }
    title += "]";
    this.setTitle(title);

    UIUtils.clearChilds(this.content);
    var allFolders = this.model.evaluateXPath("//folder-content-model/filesys-objects/filesys-object[type = 'FOLDER']");
    for (var i = 0; i < allFolders.length; i++) {

	var xpath = XmlUtils.getXPathTo(allFolders[i]);
	this.content.appendChild(this.createFolderEntry(xpath));
    }
    this.content.appendChild(this.createContentSeparator());

    var allFiles = this.model.evaluateXPath("//folder-content-model/filesys-objects/filesys-object[type = 'FILE']");
    for (var i = 0; i < allFiles.length; i++) {

	var xpath = XmlUtils.getXPathTo(allFiles[i]);
	this.content.appendChild(this.createFileEntry(xpath));
    }
    this.content.appendChild(this.createContentSeparator());
}

/**
 * lösche ein FileSystem-Objekt
 */
FileSystemExplorer.prototype.isFolder = function(xpath) {

    return this.model.getValue(xpath + "/type") == "FOLDER";
}

/**
 * 
 */
FileSystemExplorer.prototype.createFolderEntry = function(xpath) {

    var self = this;
    var id = self.model.getValue(xpath + "/id");
    var entry = this.createEntry("gui/images/folder.svg", xpath);
    var openFolder = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	new FileSystemExplorer(id);
    }
    entry.addEventListener("dblclick", openFolder);
    entry.addEventListener("contextmenu", openFolder);
    this.prepareDropArea(entry, id, function() {
	new FileSystemExplorer(id);
    });
    return entry;
}

/**
 * 
 */
FileSystemExplorer.prototype.createFileEntry = function(xpath) {

    var self = this;
    var mimeType = this.model.getValue(xpath + "/mime-type");
    var iconUrl = "getDocument/mimeTypeIcon?mime-type=" + mimeType;
    var entry = this.createEntry(iconUrl, xpath);
    // var openFolder = function(evt) {
    // evt.stopPropagation();
    // evt.preventDefault();
    // var id = self.model.getValue(xpath + "/id");
    // new FileSystemExplorer(id);
    // }
    return entry;
}

/**
 * 
 */
FileSystemExplorer.prototype.createEntry = function(img, xpath) {

    var entry = document.createElement("div");
    entry.className = "filesystem-entry";

    var radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "filesystem_" + this.currentFolderId;
    entry.appendChild(radio);

    var icon = document.createElement("img");
    icon.src = img;
    entry.appendChild(icon);

    var text = document.createElement("input");
    text.type = "text";
    text.value = this.model.getValue(xpath + "/name");
    entry.appendChild(text);

    var self = this;
    text.addEventListener("keydown", function(evt) {
	evt.stopPropagation();
	switch (evt.keyCode) {
	case 13: // ENTER
	    self.renameFileSystemObject(xpath, text.value);
	    radio.focus(); // just to remove the focus
	    break;

	case 27: // ESCAPE
	    text.value = self.model.getValue(xpath + "/name");
	    radio.focus(); // just to remove the focus
	    break;

	default:
	    break;
	}
    });

    var self = this;
    entry.addEventListener("click", function() {
	radio.checked = true;
	self.selectedXPath = xpath;
	self.selectedEntry = entry;
	self.actionRemoveElement.show();
    });
    return entry;
}

/**
 * 
 */
FileSystemExplorer.prototype.createContentSeparator = function() {

    var result = document.createElement("div");
    result.style.clear = "both";

    return result;
}

/**
 * Benenne ein FS-Objekt um
 * 
 * @param xpath
 *                der xpath zum object im model
 * @param name
 *                der neue Name
 */
FileSystemExplorer.prototype.renameFileSystemObject = function(xpath, name) {

    if (this.model.getValue(xpath + "/name") != name) {

	var self = this;
	var caller = new ServiceCaller();
	caller.onSuccess = function(rsp) {
	    switch (rsp.documentElement.nodeName) {
	    case "rename-filesystem-object-ok-rsp":
		self.model.setValue(xpath + "/name", name);
		break;

	    case "error-response":
		// TODO
		break;
	    }
	}
	caller.onError = function(req, status) {
	    // TODO:
	}

	var req = XmlUtils.createDocument("rename-filesystem-object-req");
	XmlUtils.setNode(req, "id", this.model.getValue(xpath + "/id"));
	XmlUtils.setNode(req, "name", name);
	caller.invokeService(req);
    }
}

/**
 * lösche ein FileSystem-Objekt
 */
FileSystemExplorer.prototype.removeFileSystemObject = function(xpath, entry) {

    var self = this;
    var name = this.model.getValue(xpath + "/name");
    var msg = (this.isFolder(xpath)) ? "QUERY_REMOVE_FILESYS_FOLDER" : "QUERY_REMOVE_FILESYS_FILE";
    msg = MessageCatalog.getMessage(msg, name);
    var title = MessageCatalog.getMessage("TITLE_REMOVE_FILESYS_OBJ");
    new MessageBox(MessageBox.QUERY, title, msg, function() {

	var caller = new ServiceCaller();
	caller.onSuccess = function(rsp) {
	    switch (rsp.documentElement.nodeName) {
	    case "remove-filesystem-object-ok-rsp":
		self.model.removeElement(xpath);
		UIUtils.removeElement(entry);
		break;

	    case "error-response":
		// TODO
		break;
	    }
	}
	caller.onError = function(req, status) {
	    // TODO:
	}

	var req = XmlUtils.createDocument("remove-filesystem-object-req");
	XmlUtils.setNode(req, "id", self.model.getValue(xpath + "/id"));
	caller.invokeService(req);
    });
}

/**
 * Bereite die DropArea für den Transfer via DnD vor.
 * 
 * @param folderElement
 *                das Element, welches als DropArea dienen soll. Entweder das
 *                Element selbst (Reference auf die DIV) oder die Id des
 *                Elements
 * 
 * @param folderId
 *                die FileSystemObject-Id, welche in der Datenbank als Parent
 *                für das neue File verwendet werden soll
 * 
 * @param onfinish
 *                wird nach dem erfolgreichen upload aufgerufen
 */
FileSystemExplorer.prototype.prepareDropArea = function(folderElement, folderId, onfinish) {

    var self = this;
    var folder = UIUtils.getElement(folderElement);

    var onDragOver = function(evt) {
	evt.preventDefault();
	evt.stopPropagation();
	UIUtils.addClass(folder, "is-dragover")
	evt.dataTransfer.effectAllowed = evt.dataTransfer.dropEffect = "copy";
	return false;
    }
    folder.addEventListener("dragenter", onDragOver);
    folder.addEventListener("dragover", onDragOver);

    var onDragEnd = function(evt) {
	evt.preventDefault();
	evt.stopPropagation();
	UIUtils.removeClass(folder, "is-dragover")
	return false;
    }
    folder.addEventListener("dragend", onDragEnd);
    folder.addEventListener("dragleave", onDragEnd);

    folder.addEventListener("drop", function(evt) {
	evt.preventDefault();
	evt.stopPropagation();
	var droppedFiles = evt.dataTransfer.files;
	UIUtils.removeClass(folder, "is-dragover")
	self.uploadFiles(evt.dataTransfer.files, folderId, onfinish);
	return false;
    });
}

/**
 * lade die selektierten files hoch
 */
FileSystemExplorer.prototype.uploadFiles = function(files, parentId, onfinish) {

    var self = this;
    var req = XmlUtils.createDocument("upload-filesystem-objects-req");
    XmlUtils.setNode(req, "parent-id", parentId);

    var sendRequest = function() {

	var caller = new ServiceCaller();
	caller.onSuccess = function(rsp) {
	    onfinish();
	}
	caller.onError = function(req, status) {
	    // TODO: not yet impl
	}
	caller.invokeService(req);
    }

    var i = 0;
    var loadOneFile = function() {
	var reader = new FileReader();
	reader.onloadstart = function() {
	    BusyIndicator.show();
	}
	reader.onload = function(evt) {
	    BusyIndicator.show();
	    var node = XmlUtils.createDocument("file");
	    XmlUtils.setNode(node, "name", files[i].name);
	    XmlUtils.setNode(node, "mime-type", files[i].type);
	    XmlUtils.setNode(node, "data", btoa(evt.target.result));
	    XmlUtils.copyNode(node.documentElement, req.documentElement, true);

	    i++;
	    if (i < files.length) {
		loadOneFile();
	    } else {
		sendRequest();
	    }
	};
	reader.readAsBinaryString(files[i]);
    }

    loadOneFile();
}
