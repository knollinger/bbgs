/**
 * 
 */
var MainNavigation = function() {
    
    Navigation.call(this, "gui/images/header1.jpg");
    
    var self = this;
    var btn = this.addNavigationButton("gui/images/person.svg", "Mitglieder verwalten", function() {
        new MemberNavigation();
    });

    btn = this.addNavigationButton("gui/images/partner.svg", "Partner verwalten", function() {
        new PartnerNavigation();
    });
    
    btn = this.addNavigationButton("gui/images/course.svg", "Kurse verwalten", function() {
        new CourseMainNavigation();
    });
    btn = this.addNavigationButton("gui/images/mail.svg", "Mail/SMS", function() {
        new MailNavigation();
    });
     
    btn = this.addNavigationButton("gui/images/dse.svg", "Datenschutz-Erklärung verwalten", function() {
	new DSENavigation();
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
