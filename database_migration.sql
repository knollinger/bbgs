drop table planning_items;
drop table invoice_records;
drop table invoice_items;

ALTER TABLE `BBGS`.`attachments` 
ADD COLUMN `attached_from` INT(10) NULL DEFAULT 0 AFTER `mimetype`,
ADD COLUMN `attached_at` TIMESTAMP NULL DEFAULT NULL AFTER `attached_from`;


ALTER TABLE members  CHANGE COLUMN `street` `street` VARCHAR(256) NULL DEFAULT '' ;
ALTER TABLE contacts
ADD COLUMN `zip_code` INT(5) NULL AFTER `relation` DEFAULT '',
ADD COLUMN `city` VARCHAR(30) NULL AFTER `zip_code` DEFAULT '',
ADD COLUMN `street` VARCHAR(256) NULL AFTER `city` DEFAULT '';
update contacts set zip_code=0, city='', street='';

