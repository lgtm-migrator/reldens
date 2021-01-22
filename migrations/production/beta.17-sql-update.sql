#######################################################################################################################

SET FOREIGN_KEY_CHECKS=0;

#######################################################################################################################
# Config:

UPDATE `config` SET `value`=0 WHERE `path`='ui/chat/defaultOpen';
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('client', 'players/animations/collideWorldBounds', '1', 'b');
INSERT INTO `config` (`scope`, `path`, `value`, `type`) VALUES ('server', 'rooms/world/bulletsStopOnPlayer', '1', 'b');

#######################################################################################################################

SET FOREIGN_KEY_CHECKS=1;

#######################################################################################################################
