/**
 * 
 */
var MailNavigation = function() {
    
    Navigation.call(this, "gui/images/header4.jpg");
    
    var self = this;
    
    this.addNavigationButton("gui/images/mail.svg", "Email senden", function() {
        new MailEditor();
    });
      
    this.addNavigationButton("gui/images/adressbook.svg", "Email-Verteiler bearbeiten", function() {
        new MailGroupOverview();
    });
    this.setTitle("Email");
}
MailNavigation.prototype = Object.create(Navigation.prototype);
