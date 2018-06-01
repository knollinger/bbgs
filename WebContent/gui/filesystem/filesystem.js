/**
 * 
 */
var FileSystemExplorer = function(id) {

    WorkSpaceFrame.call(this);
    this.currentFolderId = id || FileSystemExplorer.ID_ROOTFOLDER;
    this.setupUI();

    var self = this;
    this.loadContent(function() {
	self.updateContent();
    });
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

    this.breadCrumb = document.createElement("div");
    this.breadCrumb.className = "filesystem-breadcrumb-cnr";
    this.content.appendChild(this.breadCrumb);

    this.view = document.createElement("div");
    this.view.className = "filesystem-view";
    this.content.appendChild(this.view);
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

    this.actionCreateFile = new WorkSpaceFrameAction("gui/images/document-add.svg", "Eine neue Datei erstellen", function() {
    });
    this.addAction(this.actionCreateFile);
}

/**
 * 
 */
FileSystemExplorer.prototype.createRemoveItemAction = function() {

    this.actionRemoveElement = new WorkSpaceFrameAction("gui/images/trashbin.svg", "Das ausgewählte Element löschen", function() {
    });
    this.addAction(this.actionRemoveElement);
    this.actionRemoveElement.hide();
}

/**
 * 
 */
FileSystemExplorer.prototype.loadContent = function(onload) {

    var self = this;
    var caller = new ServiceCaller();
    caller.onSuccess = function(rsp) {
	switch (rsp.documentElement.nodeName) {
	case "folder-content-model":
	    self.model = new Model(rsp);
	    onload();
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
    
    
    UIUtils.clearChilds(this.view);
    
    var allFolders = this.model.evaluateXPath("//folder-content-model/filesys-objects/filesys-object[blob-id = '-1']");
    for(var i = 0; i < allFolders.length; i++) {
	
	var xpath = XmlUtils.getXPathTo(allFolders[i]);
	this.view.appendChild(this.createFolderEntry(xpath));
    }

    var allFiles = this.model.evaluateXPath("//folder-content-model/filesys-objects/filesys-object[blob-id != '-1']");
    for(var i = 0; i < allFiles.length; i++) {
	
	var xpath = XmlUtils.getXPathTo(allFiles[i]);
	this.view.appendChild(this.createFileEntry(xpath));
    }
}

/**
 * 
 */
FileSystemExplorer.prototype.createFolderEntry = function(xpath) {
    
    var entry = document.createElement("div");
    entry.className = "filesystem-view-entry";
    
    var radio = document.createElement("input");
    radio.type="radio";
    radio.name = "filesystem_" + this.currentFolderId;
    entry.appendChild(radio);
    
    var icon = document.createElement("img");
    icon.src = "gui/images/folder.svg";
    entry.appendChild(icon);
    
    var text = document.createElement("input");
    text.type = "text";
    text.value = this.model.getValue(xpath + "/name");
    entry.appendChild(text);

    var self = this;
    entry.addEventListener("click", function() {
	radio.checked = true;
	self.selectedItem = xpath;
	self.actionRemoveElement.show();
    });

    entry.addEventListener("dblclick", function() {
	var id = self.model.getValue(xpath + "/id");
	new FileSystemExplorer(id);
    });
    return entry;
}

/**
 * TODO: is a duplicate....grrrr!
 */
FileSystemExplorer.prototype.createFileEntry = function(xpath) {
    
    var entry = document.createElement("div");
    entry.className = "filesystem-view-entry";
    
    var radio = document.createElement("input");
    radio.type="radio";
    radio.name = "filesystem_" + this.currentFolderId;
    entry.appendChild(radio);
    
    var icon = document.createElement("img");
    icon.src = "gui/images/document.svg";
    entry.appendChild(icon);
    
    var text = document.createElement("input");
    text.type = "text";
    text.value = this.model.getValue(xpath + "/name");
    entry.appendChild(text);

    var self = this;
    entry.addEventListener("click", function() {
	radio.checked = true;
	self.selectedItem = xpath;
	self.actionRemoveElement.show();
    });

    entry.addEventListener("dblclick", function() {
	var id = self.model.getValue(xpath + "/id");
	new FileSystemExplorer(id);
    });
    return entry;
}
