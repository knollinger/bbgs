drop table planning_items;
drop table invoice_records;
drop table invoice_items;

ALTER TABLE `BBGS`.`attachments` 
ADD COLUMN `attached_from` INT(10) NULL DEFAULT 0 AFTER `mimetype`,
ADD COLUMN `attached_at` TIMESTAMP NULL DEFAULT NULL AFTER `attached_from`;
