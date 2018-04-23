/**
 * 
 */
var DocumentViewer = function(url, title) {

    BusyIndicator.show();
    
    var glass = this.createGlassPane();
    glass.appendChild(this.createTitlebar(title, glass));
    glass.tabIndex = "0";
    document.body.appendChild(glass);
    glass.focus();

    this.detectMimeType(url, glass);
}

/**
 * 
 */
DocumentViewer.prototype.createGlassPane = function() {

    var glass = document.createElement("div");
    glass.className = "docviewer-glasspane";
    glass.addEventListener("keydown", function(evt) {

        switch (evt.keyCode) {
        case 27: // ESCAPE
            glass.parentElement.removeChild(glass);
            break;

        default:
            break;
        }

    });
    return glass;
}

/**
 * 
 * @param title
 * @param glass
 */
DocumentViewer.prototype.createTitlebar = function(title, glass) {

    var titlebar = document.createElement("div");
    titlebar.className = "docviewer-titlebar";

    var text = document.createElement("span");
    text.textContent = title;
    text.className = "docviewer-titlebar-text";
    titlebar.appendChild(text);

    var btn = document.createElement("img");
    btn.src = "gui/images/dialog-cancel.svg";
    btn.className = "docviewer-titlebar-btn";
    titlebar.appendChild(btn);
    btn.addEventListener("click", function() {
        glass.parentElement.removeChild(glass);
    });

    titlebar.appendChild(UIUtils.createClearFix());
    return titlebar;
}

/**
 * XHR folgt automatisch redirektionen, es lässt sich nicht ändern Sollte die
 * Session grade verloren sein, so haben wir keine Chance den Status-Code 302 zu
 * testen. Es ist schmutzig, aber wir prüfen nun einfach ob die ResponseURL auf
 * die Startseite verweist. In dem Fall navigieren wir das Window manuell dahin
 * 
 * @param url
 */
DocumentViewer.prototype.detectMimeType = function(url, glass) {

    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, true);
    xhr.onreadystatechange = function(evt) {

        if (xhr.readyState == XMLHttpRequest.prototype.DONE) {

            BusyIndicator.hide();
            if (xhr.status == 200) {
                var rspUrl = xhr.responseURL;
                if (rspUrl.endsWith("/index.html")) {
                    self.handleSessionLost();
                } else {
                    self.createPlayer(url, xhr.getResponseHeader("Content-Type"), glass);
                }
            }
        }
    }

    xhr.onerror = function(evt) {
        var title = Messages.getMessage("SVCCALLER_TITLE_ERROR");
        var msg = Messages.getMessage("SVCCALLER_MSG_TECH_ERROR");
        MessageBox.showWarningMsg(title, msg);
    }
    xhr.send("");
}

/**
 * 
 */
DocumentViewer.prototype.handleSessionLost = function(rspUrl) {

    var title = Messages.getMessage("SVCCALLER_TITLE_ERROR");
    var msg = Messages.getMessage("SVCCALLER_MSG_SESSION_LOST");
    MessageBox.showInfoMsg(title, msg, function() {
        window.location.href = rspUrl;
    });
}

/**
 * 
 * @param url
 * @param mimeType
 */
DocumentViewer.prototype.createPlayer = function(url, mimeType, glass) {

    var player = null;
    var mainType = mimeType.split("/")[0];
    switch (mainType) {
    case "image":
        player = document.createElement("img");
        player.className = "docviewer-image center-to-parent";
        player.src = url;
        break;

    case "video":
        player = document.createElement("video");
        player.className = "docviewer-video center-to-parent";
        player.autoplay = true;
        player.controls = true;
        var source = document.createElement("source");
        source.src = url;
        source.type = mimeType;
        player.appendChild(source);
        break;

    default:
        player = document.createElement("iframe");
        player.className = "docviewer-iframe center-to-parent";
        player.src = url;
        break;
    }
    glass.appendChild(player);
    player.onload = function(evt) {
        glass.style.display = "block";
    };
}
