USE `BBGS`;

DELIMITER $$

USE `BBGS`$$
DROP TRIGGER IF EXISTS `BBGS`.`trg_insert_members` $$
DELIMITER ;
USE `BBGS`;

DELIMITER $$

USE `BBGS`$$
DROP TRIGGER IF EXISTS `BBGS`.`trg_update_members` $$
DELIMITER ;

ALTER TABLE `BBGS`.`members` 
DROP INDEX `member_ft` ;

ALTER TABLE `BBGS`.`members` 
DROP COLUMN `type_as_text`;