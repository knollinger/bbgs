/**
 * 
 */
var CourseMainNavigation = function() {
    
    Navigation.call(this);
    
    var self = this;
    
    this.addNavigationButton("gui/images/calendar.svg", "Kurs-Kalender", function() {
        new CourseCalendar(CourseCalendar.WEEKLY);
    });

    this.addNavigationButton("gui/images/course.svg", "Kurse verwalten", function() {
        new CourseOverview(true);
    });
    
    this.addNavigationButton("gui/images/location.svg", "Kurs-Lokationen verwalten", function() {
        new CourseLocationOverview();
    });

    this.addNavigationButton("gui/images/color.svg", "Kurs-Farben verwalten", function() {
        new ColorsOverview();
    });

    this.setTitle("Kurs-Verwaltung");
}


/**
 * 
 */
CourseMainNavigation.prototype = Object.create(Navigation.prototype);
