var MessageCatalog = (function() {

    var catalog = {

	SVCCALLER_TITLE_ERROR : "Fehler bei der Server-Kommunikation",
	SVCCALLER_MSG_SESSION_LOST : "Deine Server-Sitzung ist abgelaufen, Du musst Dich erneut anmelden.<br>Nach bestätigen dieser Meldung wird die Anwendung direkt zur Anmnelde-Maske zurück kehren",

	// --------------------------------------------------------------------
	//
	// all about the login page
	//
	QUERY_LOGOUT_TITLE : "Bis Du sicher ?",
	QUERY_LOGOUT : "M&ouml;chtest Du Dich wirklich abmelden?<br><br>Eventuell noch nicht gespeicherte &Auml;nderungen gehen dann verloren.",
	LOGIN_ERROR_TITLE : "Fehler bei der Anmeldung",
	LOGIN_TECH_ERROR : "Bei der Anmeldung ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	// --------------------------------------------------------------------
	//
	// all about the pwd change
	//
	EMPTY_OLD_PWD : "Bitte gebe Dein aktuelles Kennwort ein",
	EMPTY_NEW_PWD : "Bitte gebe das neue Kennwort ein",
	SAME_NEW_PWD : "Das neue Kennwort muss sich vom alten Kennwort unterscheiden",
	NEW_PWDS_DIFFERENT : "Das neue Kennwort und die Kontroll-Eingabe sind verschieden",

	CHANGE_PWD_ERROR_TITLE : "Fehler beim Kennwort-Wechsel",
	CHANGE_PWD_ERROR : "Bei der Änderung Deines Kennwortes ist ein Fehler aufgetreten..<br>Antwort vom Server:<br>{1}",
	CHANGE_PWD_TECH_ERROR : "Bei der Änderung Deines Kennwortes ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	CHANGE_PWD_SUCCESS_TITLE : "Kennwort-Wechsel erfolgreich",
	CHANGE_PWD_SUCCESS : "Deine Kennwort wurde erfolgreich geändert.",

	// --------------------------------------------------------------------
	//
	// all about Member Main-Navigation
	//
	MEMBER_LOAD : "Lade Mitglieds-Daten",
	MEMBER_LOAD_ERROR_TITLE : "Fehler beim laden der Mitglieds-Daten",
	MEMBER_LOAD_ERROR : "Beim laden der Mitglieds-Informationen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	MEMBER_LOAD_TECH_ERROR : "Beim laden der Mitglieds-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	QUERY_REMOVE_MEMBER_TITLE : "Bist Du sicher?",
	QUERY_REMOVE_MEMBER : "M&ouml;chtest Du das Mitglied '{1}, {2}' wirklich l&ouml;schen?",

	MEMBER_REMOVE_ERROR_TITLE : "Fehler beim l&ouml;schen der Mitglieds-Daten",
	MEMBER_REMOVE_ERROR : "Beim l&ouml;schen der Mitglieds-Informationen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	MEMBER_REMOVE_TECH_ERROR : "Beim l&ouml;schen der Mitglieds-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	MEMBER_SAVE_ERROR_TITLE : "Fehler beim speichern der Mitglieds-Daten",
	MEMBER_SAVE_ERROR : "Beim speichern der Mitglieds-Informationen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	MEMBER_SAVE_TECH_ERROR : "Beim speichern der Mitglieds-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	MEMBER_FINDER_HINT_EDIT : "Bitte wähle das zu bearbeitende Mitglied aus",
	MEMBER_FINDER_HINT_PRINT : "Bitte wähle das Mitglied aus, dessen Daten Du drucken oder exportieren möchstest",
	MEMBER_FINDER_HINT_REMOVE : "Bitte wähle das zu löschende Mitglied aus",

	PARTNER_OVERVIEW_ERROR_TITLE : "Fehler beim laden der Partner-&Uuml;bersicht",
	PARTNER_OVERVIEW_ERROR : "Beim laden der Partner-&Uuml;bersicht ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	PARTNER_OVERVIEW_TECH_ERROR : "Beim laden der Partner-&Uuml;bersicht ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",
	PARTNER_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	PARTNER_QUERY_REMOVE : "M&ouml;chtest Du wirklich den Partner '{1}' l&ouml;schen ?",
	PARTNER_LOAD_ERROR_TITLE : "Fehler beim laden der Partner-Daten",
	PARTNER_LOAD_ERROR : "Beim laden der Partner-Informationen ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	PARTNER_LOAD_TECH_ERROR : "Beim laden der Partner-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	SAVE_PARTNER_ERROR_TITLE : "Fehler beim speichern der Partner-Daten",
	SAVE_PARTNER_ERROR : "Beim speichern der Partner-Informationen ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	SAVE_PARTNER_TECH_ERROR : "Beim speichern der Partner-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	PARTNER_TERMIN_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	PARTNER_TERMIN_QUERY_REMOVE : "M&ouml;chtest Du den Partner-Termin wirklich l&ouml;schen ?",
	REMOVE_PARTNER_ERROR_TITLE : "Fehler beim l&ouml;schen der Partner-Daten",
	REMOVE_PARTNER_ERROR : "Beim l&ouml;schen der Partner-Informationen ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	REMOVE_PARTNER_TECH_ERROR : "Beim l&ouml;schen der Partner-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	// --------------------------------------------------------------------
	//
	// all about Contacts
	//
	CONTACT_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	CONTACT_QUERY_REMOVE : "M&ouml;chtest Du wirklich den Kontakt '{1}, {2}' l&ouml;schen ?",

	// ---------------------------------------------------------------------
	//
	// all about attachments
	//
	UPLOD_TOO_BIG_TITLE : "Die Datei ist zu gro&szlig",
	UPLOD_TOO_BIG : "Die Datei '{1}' hat eine Datei-Gr&ouml;&szlig;e von {2} MB und ist somit zu gro&szlig; um gespeichert zu werden. Du kannst maximal Dateien mit {3} MB speichern.",
	ATTACHMENT_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	ATTACHMENT_QUERY_REMOVE : "M&ouml;chtest Du wirklich den Anhang '{1}' l&ouml;schen ?",

	// ---------------------------------------------------------------------
	//
	// all about notes
	//
	NOTE_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	NOTE_QUERY_REMOVE : "M&ouml;chtest Du die Notiz wirklich l&ouml;schen ?",

	// --------------------------------------------------------------------
	//
	// all about Courses
	//
	COURSE_GETALL_ERROR_TITLE : "Fehler bei der Ermittlung der Kurse",
	COURSE_GETALL_ERROR : "Beim laden der Kurs-Informationen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSE_GETALL_TECH_ERROR_TITLE : "Beim laden der Kurs-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	COURSE_GET_ERROR_TITLE : "Fehler beim laden der Kurs-Informationen",
	COURSE_GET_ERROR : "Beim laden der Kurs-Informationen ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSE_GET_TECH_ERROR : "Beim laden der Kurs-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	COURSE_ASSIGN_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	COURSE_ASSIGN_QUERY_REMOVE : "M&ouml;chtest Du wirklich die Zuordnung zum Kurs '{1}' l&ouml;schen ?",

	COURSE_MEMBER_REMOVE : "M&ouml;chtest Du den Teilnehmer '{1}, {2}' wirklich aus dem Kurs '{3}' entfernen?",
	COURSE_QUERY_REMOVE_TITLE : "Bist Du sicher ?",

	// --------------------------------------------------------------------
	//
	// all about Coursetermins
	//
	COURSE_TERMIN_TOOLTIP : "<b>Wo:</b><br>{1}<br><br><b>Wann:</b><br>{2} - {3}<br><br><b>Zielgruppe:</b><br>{4}<br><br><b>Trainer:</b><br>{5}",
	COURSETERMIN_LOAD : "Lade Mitglieds-Daten",
	COURSETERMIN_LOAD_ERROR_TITLE : "Fehler beim laden des Kurs-Termins",
	COURSETERMIN_LOAD_ERROR : "Beim laden der Termin-Informationen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSETERMIN_LOAD_TECH_ERROR : "Beim laden der Termin-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	COURSETERMIN_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	COURSETERMIN_QUERY_REMOVE : "M&ouml;chtest Du den Kurs-Termin '{1}' wirklich aus dem Kurs '{2}' l&ouml;schen ?<br><br><b>Vorsicht!<br>Dieser Vorgang kann nicht r&uuml;ckg&auml;ngig gemacht werden!</b>",
	COURSETERMIN_REMOVE_ERROR_TITLE : "Fehler beim l&ouml;schen des Kurs-Termins",
	COURSETERMIN_REMOVE_ERROR : "Beim laden der Termin-Informationen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSETERMIN_REMOVE_TECH_ERROR : "Beim laden der Termin-Informationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	COURSE_QUERY_REMOVE_TITLE : "Bist Du sicher ?",
	COURSE_QUERY_REMOVE : "M&ouml;chtest Du den Kurs '{1}' <b>und alle seine Termine, Notizen und Anhänge</b> wirklich l&ouml;schen ?<br><br>Dieser Vorgang kann nicht r&uuml;ckg&auml;ngig gemacht werden!",
	COURSE_REMOVE_ERROR_TITLE : "Fehler beim l&ouml;schen des Kurses",
	COURSE_REMOVE_ERROR : "Beim l&ouml;schen des Kurses ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSE_REMOVE_TECH_ERROR_TITLE : "Beim l&ouml;schen des Kurses ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	COURSE_QUERY_COPY_TITLE : "EInen Kurs kopieren",
	COURSE_QUERY_COPY : "M&ouml;chtest Du den Kurs '{1}' kopieren? <br><br>Es werden alle Kursteilenehmer, Trainer und Scouts &uuml;bernommen",
	COURSE_COPY_ERROR_TITLE : "Fehler kopieren des Kurses",
	COURSE_COPY_ERROR : "Beim kopieren des Kurses ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSE_COPY_TECH_ERROR_TITLE : "Beim kopieren des Kurses ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	// --------------------------------------------------------------------
	//
	// all about CourseLocations
	//
	COURSELOCATION_LOAD_ERROR_TITLE : "Fehler beim laden des Kurs-Lokationen",
	COURSELOCATION_LOAD_ERROR : "Beim laden der Kurs-Lokationen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSELOCATION_LOAD_TECH_ERROR : "Beim laden der Kurs-Lokationen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",
	COURSELOCATION_SAVE_ERROR_TITLE : "Fehler beim laden des Kurs-Lokationen",
	COURSELOCATION_SAVE_ERROR : "Beim speichern der Kurs-Lokation ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	COURSELOCATION_SAVE_TECH_ERROR : "Beim speichern der Kurs-Lokation ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",
	TITLE_REMOVE_LOCATION : "Bist Du sicher?",
	QUERY_REMOVE_LOCATION : "M&ouml;chtest Du die Kurs-Lokation '{1}' wirklich löschen?",

	// --------------------------------------------------------------------
	//
	// all about CourseLocations
	//
	NAMEDCOLORS_LOAD_ERROR_TITLE : "Fehler beim laden der Farb-Definitionen",
	NAMEDCOLORS_LOAD_ERROR : "Beim laden der Farb-Definitionen ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	NAMEDCOLORS_LOAD_TECH_ERROR : "Beim laden der Farb-Definitionen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	NAMEDCOLORS_SAVE_ERROR_TITLE : "Fehler beim speichern der Farb-Definitionen",
	NAMEDCOLORS_SAVE_ERROR : "Beim speichern der Farb-Definitionen ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	NAMEDCOLORS_SAVE_TECH_ERROR : "Beim speichern der Farb-Definitionen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	TITLE_REMOVE_COLOR : "Bist Du sicher?",
	QUERY_REMOVE_COLOR : "M&ouml;chtest Du die Farb-Definition wirklich l&ouml;schen?",

	// --------------------------------------------------------------------
	//
	// all about Mail/SMS
	//
	ADDRBOOK_LOAD_ERROR_TITLE : "Fehler beim laden des Addressbuchs",
	ADDRBOOK_LOAD_ERROR : "Beim laden des Addressbuchs ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	ADDRBOOK_LOAD_TECH_ERROR : "Beim laden des Adressbuchs ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	// --------------------------------------------------------------------
	//
	// all about Mail/SMS
	//
	LOAD_MAILGROUPS_ERROR_TITLE : "Fehler beim laden der Mail-Verteiler",
	LOAD_MAILGROUPS_ERROR : "Beim laden der Mail-Verteiler ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	LOAD_MAILGROUPS_TECH_ERROR : "Beim laden der Mail-Verteiler ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	LOAD_MAILGROUP_ERROR_TITLE : "Fehler beim laden des Mail-Verteilers",
	LOAD_MAILGROUP_ERROR : "Beim laden des Mail-Verteilers ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	LOAD_MAILGROUP_TECH_ERROR : "Beim laden des Mail-Verteilers ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	SAVE_MAILGROUP_ERROR_TITLE : "Fehler beim speichern des Mail-Verteilers",
	SAVE_MAILGROUP_ERROR : "Beim speichern des Mail-Verteilers ist ein technischer Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	SAVE_MAILGROUP_TECH_ERROR : "Beim speichern des Mail-Verteilers ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	TITLE_REMOVE_GROUPMEMBER : "Bist Du sicher?",
	QUERY_REMOVE_GROUPMEMBER : "M&ouml;chtest Du das Mitglied '{1}, {2}' wirklich aus dem Mail-Verteiler löschen?",

	// --------------------------------------------------------------------
	//
	// all about todos
	//
	LOAD_TODOLISTOVERVIEW_ERROR_TITLE : "Fehler beim laden der Aufgaben-Liste",
	LOAD_TODOLISTOVERVIEW_ERROR : "Beim laden der Aufgabenliste ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	LOAD_TODOLISTOVERVIEW_TECH_ERROR : "Beim laden der Aufgabenliste ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	SAVE_TODOLIST_MODEL_ERROR_TITLE : "Fehler beim speichern der AUfgaben-Liste",
	SAVE_TODOLIST_MODEL_ERROR : "Beim speichern der Aufgabenliste ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	SAVE_TODOLIST_MODEL_TECH_ERROR : "Beim speichern der Aufgabenliste ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",

	TITLE_REMOVE_TASK : "Bist DU sicher?",
	QUERY_REMOVE_TASK : "M&ouml;chtest Du die Aufgabe '{1}' wirklich l&ouml;schen?",

	// --------------------------------------------------------------------
	//
	// all about the DSGVO stuff
	//
	SEND_DSEMAIL_OK_TITLE : "Datenschutz-Erkl&auml;rungen gesendet",
	SEND_DSEMAIL_ERR_TITLE : "Fehler beim senden der Datenschutz-Erkl&auml;rung",
	SEND_DSEMAIL_SUCCESS : "Die Mails mit der Datenschutz-Erklärung wurde erfolgreich zur Zustellung &uuml;bergeben",
	SEND_DSEMAIL_ERR : "Beim senden der Datenschutz-Erkl&auml;rungen ist ein Fehler aufgetreten.<br>Antwort vom Server:<br>{1}",
	SEND_DSEMAIL_TECHERR : "Beim senden der Datenschutz-Erkl&auml;rungen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",
	
	LOAD_DSE_VERSIONS_ERROR_TITLE : "Fehler beim laden der Datenschutz-Erklärungen",
	LOAD_DSE_VERSIONS_ERROR : "Fehler beim laden der Datenschutz-Erkl&auml;rung.<br>Antwort vom Server:<br>{1}",
	LOAD_DSE_VERSIONS_TECHERROR : "Beim laden der Datenschutz-Erkl&auml;rungen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",
	SAVE_DSE_VERSIONS_ERROR_TITLE : "Fehler beim speichern der Datenschutz-Erklärungen",
	SAVE_DSE_VERSIONS_ERROR : "Fehler beim speichern der Datenschutz-Erkl&auml;rung.<br>Antwort vom Server:<br>{1}",
	SAVE_DSE_VERSIONS_TECHERROR : "Beim speichern der Datenschutz-Erkl&auml;rungen ist ein technischer Fehler aufgetreten.<br>Der Server antwortete mit dem Antwort-Code {1}",
    }

    return {

	getMessage : function(msgId) {

	    var fmt = catalog[msgId];
	    if (typeof (fmt) == "undefined") {
		fmt = msgId;
	    }

	    var args = arguments;
	    return fmt.replace(/{(\d+)}/g, function(match, number) {
		return typeof args[number] != 'undefined' ? args[number] : "(nicht definiert)";
	    });
	}
    }
})();