USE TEST;
ALTER TABLE contacts ADD COLUMN `relation` VARCHAR(20) NULL DEFAULT 'OTHER';
insert into contacts(ref_id, domain, zname, vname, vname2, title, phone, mobile, email, relation) select ref_id, "MEMBER", zname, vname, vname2, title, phone, mobile, email, relation from family;
drop table family;

ALTER TABLE course_locations DROP COLUMN contact1;
ALTER TABLE course_locations DROP COLUMN contact2;
ALTER TABLE course_locations DROP COLUMN phone1;
ALTER TABLE course_locations DROP COLUMN phone2;
ALTER TABLE course_locations DROP COLUMN mobile1;
ALTER TABLE course_locations DROP COLUMN mobile2;
ALTER TABLE course_locations DROP COLUMN email1;
ALTER TABLE course_locations DROP COLUMN email2;


update `contacts` set `vname2` = '' where vname2 is null; 
update `contacts` set `title` = '' where title is null;
update `contacts` set `phone` = '' where phone is null;
update `contacts` set `phone2`  = '' where phone2 is null;
update `contacts` set `mobile`  = '' where mobile is null;
update `contacts` set `mobile2`  = '' where mobile2 is null;
update `contacts` set `email`  = '' where email is null;
update `contacts` set `email2`  = '' where email2 is null;

ALTER TABLE contacts ALTER COLUMN vname2 SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN title SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN phone SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN mobile SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN email SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN phone2 SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN mobile2 SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN email2 SET DEFAULT '' ;

update members set member_since='2014-10-01', member_until='2015-07-31' where project_year=1;
update members set member_since='2015-10-01', member_until='2016-07-31' where project_year=2;
update members set member_since='2016-10-01', member_until='2017-07-31' where project_year=3;
update members set member_since='2017-10-01', member_until='2018-07-31' where project_year=4;
update members set member_since='2018-10-01', member_until='2019-07-31' where project_year=5;
ALTER TABLE members DROP COLUMN project_year;
ALTER TABLE members CHANGE COLUMN `school` `school` INT(10) NULL DEFAULT NULL ;
update members set school=NULL where school=-1;
update members set school=NULL where school=0;


alter table members add  `type_as_text` CHAR(30);
update members set type_as_text='Trainer' where type="TEACHER";
update members set type_as_text='Scout' where type="SCOUT";
update members set type_as_text='Ex-Scout' where type="EXSCOUT";
update members set type_as_text='Praktikant' where type="PRAKTIKANT";
update members set type_as_text='Ehren-Amtler' where type="EHRENAMT";
update members set type_as_text='Festangestellt' where type="FEST";
update members set type_as_text='Kurs-Teilnehmer' where type="STUDENT";
update members set type_as_text='Geflüchtete' where type="REFUGEE";
update members set type_as_text='Kurz-Mitgliedschafft' where type="SHORT";
update members set type_as_text='Online-Anmeldung Regelkurs' where type="REG_COURSE";
update members set type_as_text='Online-Anmeldung Veranstaltung' where type="REG_EVENT";


/*
 * Die folgenden Trigger ist notwendig, um die Volltextsuche auch über 
 * die MemberTypes (aus Benutzersicht) sicher zu stellen 
 */
DELIMITER $$
create trigger trg_update_members before update on members
for each row
BEGIN
	case NEW.type
	when "TEACHER" then SET NEW.type_as_text = "Trainer";
    when "SCOUT" then set NEW.type_as_text = "Scout";
    when "EXSCOUT" then set NEW.type_as_text = "Ex-Scout";
    when "PRAKTIKANT" then set NEW.type_as_text = "Praktikant";
    when "EHRENAMT" then set NEW.type_as_text = "Ehren-Amtler";
    when "FEST" then set NEW.type_as_text = "Festangestellt";
    when "STUDENT" then set NEW.type_as_text = "Kurs-Teilnehmer";
    when "REFUGEE" then set NEW.type_as_text = "Geflüchtete";
    when "SHORT" then set NEW.type_as_text = "Kurz-Mitgliedschafft";
    when "REG_COURSE" then set NEW.type_as_text = "Online-Anmeldung Regelkurs";
    when "REG_EVENT" then set NEW.type_as_text = "Online-Anmeldung Veranstaltung";
    END CASE;
END;$$
DELIMITER ;

DELIMITER $$
create trigger trg_insert_members before insert on members
for each row
BEGIN
	case NEW.type
	when "TEACHER" then SET NEW.type_as_text = "Trainer";
    when "SCOUT" then set NEW.type_as_text = "Scout";
    when "EXSCOUT" then set NEW.type_as_text = "Ex-Scout";
    when "PRAKTIKANT" then set NEW.type_as_text = "Praktikant";
    when "EHRENAMT" then set NEW.type_as_text = "Ehren-Amtler";
    when "FEST" then set NEW.type_as_text = "Festangestellt";
    when "STUDENT" then set NEW.type_as_text = "Kurs-Teilnehmer";
    when "REFUGEE" then set NEW.type_as_text = "Geflüchtete";
    when "SHORT" then set NEW.type_as_text = "Kurz-Mitgliedschafft";
    when "REG_COURSE" then set NEW.type_as_text = "Online-Anmeldung Regelkurs";
    when "REG_EVENT" then set NEW.type_as_text = "Online-Anmeldung Veranstaltung";
    END CASE;
END;$$
DELIMITER ;


ALTER TABLE members DROP INDEX `FULLTEXT`;
ALTER TABLE members ADD FULLTEXT INDEX `member_ft`  (
	`zname` ASC, 
    `vname` ASC, 
    `vname2` ASC, 
    `title` ASC, 
    `city` ASC, 
    `street` ASC, 
    `phone` ASC,
    `phone2` ASC,
    `mobile` ASC,
    `mobile2` ASC,
    `email` ASC,
    `email2` ASC,
    `type_as_text` ASC
);

ALTER TABLE `members` 
CHANGE COLUMN `sex` `sex` CHAR(1) NULL DEFAULT 'U' ,
CHANGE COLUMN `zip_code` `zip_code` INT(5) NULL DEFAULT -1 ,
CHANGE COLUMN `photoagreement` `photoagreement` VARCHAR(10) NULL DEFAULT 'NONE' ;

ALTER TABLE members ALTER COLUMN vname2 SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN title SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN phone SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN mobile SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN email SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN phone2 SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN mobile2 SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN email2 SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN city SET DEFAULT '' ;
ALTER TABLE members ALTER COLUMN street SET DEFAULT '' ;


update `members` set `vname2` = '' where vname2 is null; 
update `members` set `title` = '' where title is null;
update `members` set `phone` = '' where phone is null;
update `members` set `phone2`  = '' where phone2 is null;
update `members` set `mobile`  = '' where mobile is null;
update `members` set `mobile2`  = '' where mobile2 is null;
update `members` set `email`  = '' where email is null;
update `members` set `email2`  = '' where email2 is null;
update `members` set `city`  = '' where city is null;
update `members` set `street`  = '' where street is null;

ALTER TABLE contacts ALTER COLUMN vname2 SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN title SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN phone SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN mobile SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN email SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN phone2 SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN mobile2 SET DEFAULT '' ;
ALTER TABLE contacts ALTER COLUMN email2 SET DEFAULT '' ;

ALTER TABLE notes ADD FULLTEXT INDEX `notes_ft`  (
	`note` ASC
);

ALTER TABLE courses ADD FULLTEXT INDEX `courses_ft`  (
	name ASC,
    description ASC
);

ALTER TABLE contacts ADD FULLTEXT INDEX `contacts_ft`  (
	`zname` ASC, 
    `vname` ASC, 
    `vname2` ASC, 
    `title` ASC, 
    `phone` ASC,
    `phone2` ASC,
    `mobile` ASC,
    `mobile2` ASC,
    `email` ASC,
    `email2` ASC
);
UPDATE `contacts` set `vname2` = "" where `vname2` is NULL;
UPDATE `contacts` set `title` = "" where title is NULL;
UPDATE `contacts` set `phone` = "" where phone is NULL;
UPDATE `contacts` set `phone2` = "" where phone2 is NULL;
UPDATE `contacts` set `mobile` = "" where mobile is NULL;
UPDATE `contacts` set `mobile2` = "" where mobile2 is NULL;
UPDATE `contacts` set `email` = "" where email is NULL;
UPDATE `contacts` set `email2` = "" where email2 is NULL;

ALTER TABLE `contacts` CHANGE COLUMN `vname2` `vname2` VARCHAR(30) DEFAULT '';
ALTER TABLE `contacts` CHANGE COLUMN `title` `title` VARCHAR(30) DEFAULT '';
ALTER TABLE `contacts` CHANGE COLUMN `phone` `phone` VARCHAR(20) DEFAULT '';
ALTER TABLE `contacts` CHANGE COLUMN `phone2` `phone2` VARCHAR(20) DEFAULT '';
ALTER TABLE `contacts` CHANGE COLUMN `mobile` `mobile` VARCHAR(20) DEFAULT '';
ALTER TABLE `contacts` CHANGE COLUMN `mobile2` `mobile2` VARCHAR(20) DEFAULT '';
ALTER TABLE `contacts` CHANGE COLUMN `email` `email` VARCHAR(512) DEFAULT '';
ALTER TABLE `contacts` CHANGE COLUMN `email2` `email2` VARCHAR(512) DEFAULT '';


CREATE TABLE `invoice_items` (
  `id`    INT(10) auto_increment,  
  `ref_id`    INT(10) NOT NULL,  
  `type`  VARCHAR(10) NOT NULL,
  `konto` INT NOT NULL,
  `name` VARCHAR(256) NOT NULL,
  `description` VARCHAR(2048) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `invoice_records` (
  `id` INT(10) AUTO_INCREMENT,
  `from_invoice` INT(10) NOT NULL,
  `to_invoice` INT(10) NOT NULL,
  `amount` DOUBLE NOT NULL,
  `description` VARCHAR(256) NOT NULL,
  `date` DATE NOT NULL,
  PRIMARY KEY (`id`)  
);

drop table acc_records;
drop table accounting_posts;

CREATE TABLE `projects` (
  `id` INT(10) auto_increment,
  `name` VARCHAR(256) NOT NULL,
  `description` VARCHAR(2048) NOT NULL,
  `from` DATE NOT NULL,
  `until` DATE NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `planning_items` (
  `id` INT(10) NOT NULL AUTO_INCREMENT,
  `proj_ref` INT(10) NOT NULL,
  `item_ref` INT(10) NOT NULL,
  `amount` DOUBLE NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`proj_ref`) REFERENCES `projects` (`id`),
  FOREIGN KEY (`item_ref`) REFERENCES `invoice_items` (`id`)
);

 /* Named Colors */
delete from named_colors where domain="TASKLIST";
alter table named_colors drop column domain;

drop table membership_rates;


/**
 * Migrate the stupid courseMember -> course-termin -> course relationship
 */
CREATE TABLE course_member (
  `member_id` INT(10) NOT NULL,
  `course_id` INT(10) NOT NULL,
  FOREIGN KEY (`member_id`) REFERENCES members(id),
  FOREIGN KEY (`course_id`) REFERENCES courses(id)
);

insert into course_member (member_id, course_id) select distinct m.member_id, c.id from course_members m left join course_termins t on t.id = m.termin_id left join courses c on t.ref_id = c.id order by c.id, m.member_id;
drop table course_members;

