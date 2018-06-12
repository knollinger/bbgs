/**
 * 
 */
var MainNavigation = function() {
    
    Navigation.call(this, "gui/images/header1.jpg");
    
    var self = this;
    var btn = this.addNavigationButton("gui/images/person.svg", "Mitglieder verwalten", function() {
        new MemberOverview();
    });

    btn = this.addNavigationButton("gui/images/partner.svg", "Partner verwalten", function() {
        new PartnerOverview();
    });
    
    btn = this.addNavigationButton("gui/images/course.svg", "Kurse verwalten", function() {
        new CourseMainNavigation();
    });
    
    btn = this.addNavigationButton("gui/images/money.svg", "Rechnungs Wesen", function() {
        new AccountingNavigation();
    });
    UIUtils.addClass(btn, "hide-on-mobile");
    
    btn = this.addNavigationButton("gui/images/mail.svg", "Mail/SMS", function() {
        new MailNavigation();
    });

    btn = this.addNavigationButton("gui/images/document.svg", "Dokumente verwalten", function() {
	new FileSystemExplorer();
    });

    btn = this.addNavigationButton("gui/images/notes.svg", "TODO-Liste", function() {
	new TodoTasksOverview();
    });
     
    this.setTitle("Bayerns beste Gipfelstürmer");
    this.enableBackButton(false);
    this.enableHomeButton(false);
}


/**
 * 
 */
MainNavigation.prototype = Object.create(Navigation.prototype);

/**
 * 
 */
MainNavigation.showHomeScreen = function() {

    WorkSpace.clearAll();
    new MainNavigation();    
}
