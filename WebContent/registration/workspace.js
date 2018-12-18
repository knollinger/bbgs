/*---------------------------------------------------------------------------*/
/**
 * All about the cookie policy
 */
let CookiePolicyDialog = (function() {

    let dialog = document.getElementById("cookie-policy-dialog");
    let closeIcon = document.getElementById("cookie-policy-close");

    closeIcon.addEventListener("click", function() {
	CookiePolicyDialog.close();
    });

    closeIcon.addEventListener("keydown", function(evt) {
	switch (evt.key) {
	case "Escape":
	case "Enter":
	case "Space":
	    CookiePolicyDialog.close();
	    break;
	}
    });

    return {

	show : function() {
	    window.setTimeout(function() {
		dialog.style.opacity = 1;
		closeIcon.focus();
	    }, 200);
	},

	close : function() {
	    dialog.style.opacity = 0;
	    window.setTimeout(function() {
		dialog.parentNode.removeChild(dialog);
	    }, 800);
	}
    }
})();

/*---------------------------------------------------------------------------*/
/**
 * BusyIndicator
 */
let BusyIndicator = (function() {

    let indicator = document.getElementById("busy-indicator");
    let timer = null;

    /**
     * 
     */
    let stopTimer = function() {
	if (timer) {
	    window.clearTimeout(timer);
	    timer = null;
	}
    }

    /**
     * 
     */
    let startTimer = function(ontimer) {

	stopTimer();
	timer = window.setTimeout(ontimer, 300);
    }

    return {

	show : function() {
	    startTimer(function() {
		UIUtils.removeClass(indicator, "hidden");
	    });
	},

	hide : function() {
	    stopTimer();
	    UIUtils.addClass(indicator, "hidden");
	}
    }
})();

/*---------------------------------------------------------------------------*/
/**
 * All about the workspace
 */
let WorkSpace = (function() {

    let header = document.getElementById("page-header");
    let frame = UIUtils.getElement("#page-content");

    /**
     * change the header-backgroundImage with an opacity animation
     */
    let setBackground = function(newImg) {

	// fade out the current image
	header.style.opacity = 0;
	window.setTimeout(function() {
	    header.style.backgroundImage = newImg;
		header.style.opacity = 1;
	}, 500);
    };

    /**
     * setup the header animation
     */
    (function() {

	let images = [ "header0.jpg", "header1.jpg", "header2.jpg", "header3.jpg", "header4.jpg", "header5.jpg", "header6.jpg", "header7.jpg" ];
	let currImg = 0;
	window.setInterval(function() {

	    currImg = (currImg < images.length - 1) ? currImg + 1 : 0;
	    console.log(currImg);
	    let img = "url('gui/images/" + images[currImg] + "')";
	    setBackground(img);
	}, 20000);
    })();

    /**
     * 
     */
    let fillContent = function(content) {

	frame.style.opacity = 0;
	window.setTimeout(function() {
	    frame.innerHTML = content;
	    UIUtils.getElement("#page-scroller").scrollTo(0, 0);
	    frame.style.opacity = 1;
	}, 500);
    }

    return {

	goHome : function() {
	    this.navigateTo("main.html");
	},

	/**
	 * 
	 */
	navigateTo : function(url) {

	    let xhr = new XMLHttpRequest();
	    xhr.open("GET", url, true);
	    xhr.onreadystatechange = function(evt) {

		if (xhr.readyState == XMLHttpRequest.prototype.DONE) {

		    BusyIndicator.hide();
		    if (xhr.status == 200) {
			fillContent(xhr.responseText);
		    } else {
			// TODO
		    }
		}
	    }

	    xhr.onerror = function(evt) {
		BusyIndicator.hide();
		// TODO
	    }

	    BusyIndicator.show();
	    xhr.send();
	},

	/**
	 * Lade die Resource für die angegebene uui asynchron und blende diese
	 * in den Workspace ein
	 * 
	 * @param uuid
	 */
	loadResource : function(uuid) {

	    let url = "content?uuid=" + uuid;
	    this.navigateTo(url);
	}
    }
})();
