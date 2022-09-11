#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 0;

#######################################################################################################################

# Config:
UPDATE `config` SET `value` = '1' WHERE `path` = 'rooms/selection/allowOnLogin';
UPDATE `config` SET `value` = '1' WHERE `path` = 'rooms/selection/allowOnRegistration';
UPDATE `config` SET `path` = 'rooms/world/timeStep' WHERE `path` = 'rooms/world/timestep';
DELETE FROM `config` WHERE `path` = 'rooms/world/gravity_enabled';
INSERT INTO `config` VALUES(NULL, 'client', 'general/engine/clientInterpolation', '1', 'b');
INSERT INTO `config` VALUES(NULL, 'client', 'general/engine/interpolationSpeed', '0.4', 'i');
INSERT INTO `config` VALUES(NULL, 'client', 'general/engine/experimentalClientPrediction', '0', 'b');
DELETE FROM `config` WHERE `path` = 'players/size/width' AND `scope` = 'server';
DELETE FROM `config` WHERE `path` = 'players/size/height' AND `scope` = 'server';
INSERT INTO `config` VALUES(NULL, 'client', 'players/physicalBody/width', '25', 'i');
INSERT INTO `config` VALUES(NULL, 'client', 'players/physicalBody/height', '25', 'i');
UPDATE `config` SET `scope` = 'client' WHERE `path` = 'general/controls/allow_simultaneous_keys';

# Features:
INSERT INTO `features` (`code`, `title`, `is_enabled`) VALUES ('prediction', 'Prediction', '1');

# Rooms:
ALTER TABLE `rooms`	ADD COLUMN `customData` TEXT NULL COLLATE 'utf8_unicode_ci' AFTER `room_class_key`;

# Top-Down room demo:
INSERT INTO `rooms` (`id`, `name`, `title`, `map_filename`, `scene_images`, `room_class_key`, `customData`) VALUES (NULL, 'TopDownRoom', 'Gravity World!', 'reldens-gravity', 'reldens-forest', NULL, '{"gravity":[0,625],"applyGravity":true,"allowPassWallsFromBelow":true,"timeStep":0.012}');

SET @reldens_top_down_demo_room_id = (SELECT `id` FROM `rooms` WHERE `name` = 'TopDownRoom');
INSERT INTO `rooms_return_points` (`id`, `room_id`, `direction`, `x`, `y`, `is_default`, `from_room_id`) VALUES (NULL, @reldens_top_down_demo_room_id, 'left', 340, 600, 0, NULL);

SET @reldens_house2_room_id = (SELECT `id` FROM `rooms` WHERE `name` = 'ReldensHouse_2');
INSERT INTO `rooms_change_points` (`id`, `room_id`, `tile_index`, `next_room_id`) VALUES (NULL, @reldens_top_down_demo_room_id, 540, @reldens_house2_room_id);
INSERT INTO `rooms_change_points` (`id`, `room_id`, `tile_index`, `next_room_id`) VALUES (NULL, @reldens_house2_room_id, 500, @reldens_top_down_demo_room_id);
INSERT INTO `rooms_change_points` (`id`, `room_id`, `tile_index`, `next_room_id`) VALUES (NULL, @reldens_house2_room_id, 780, @reldens_top_down_demo_room_id);

# Objects:
SET @reldens_forest_room_id = (SELECT `id` FROM `rooms` WHERE `name` = 'ReldensForest');
INSERT INTO `objects` (`id`, `room_id`, `layer_name`, `tile_index`, `object_class_key`, `client_key`, `title`, `private_params`, `client_params`, `enabled`) VALUES (NULL, @reldens_forest_room_id, 'forest-collisions', 258, 'npc_5', 'quest_npc_1', 'Miles', NULL, NULL, 1);

SET @reldens_object_alfred_id = (SELECT `id` FROM `objects` WHERE `object_class_key` = 'npc_1' AND `client_key` = 'people_town_1');
SET @reldens_object_healer_id = (SELECT `id` FROM `objects` WHERE `object_class_key` = 'npc_2' AND `client_key` = 'healer_1');
SET @reldens_object_merchant_id = (SELECT `id` FROM `objects` WHERE `object_class_key` = 'npc_3' AND `client_key` = 'merchant_1');
SET @reldens_object_weapons_master_id = (SELECT `id` FROM `objects` WHERE `object_class_key` = 'npc_4' AND `client_key` = 'weapons_master_1');
SET @reldens_object_quest_npc = (SELECT `id` FROM `objects` WHERE `object_class_key` = 'npc_5' AND `client_key` = 'quest_npc_1');

# Objects assets:
INSERT INTO `objects_assets` (`object_asset_id`, `object_id`, `asset_type`, `asset_key`, `file_1`, `file_2`, `extra_params`) VALUES (NULL, @reldens_object_quest_npc, 'spritesheet', 'quest_npc_1', 'people-quest-npc', NULL, '{"frameWidth":52,"frameHeight":71}');

# Objects contents (client_params):
UPDATE `objects` SET `client_params`='{"content":"Hello! My name is Alfred. Go to the forest and kill some monsters! Now... leave me alone!"}' WHERE `id`= @reldens_object_alfred_id;
UPDATE `objects` SET `client_params`='{"content":"Hello traveler! I can restore your health, would you like me to do it?","options":{"op1":{"label":"Heal HP","value":1},"op2":{"label":"Nothing...","value":2},"op3":{"label":"Need some MP","value":3}},"enabled":true,"ui":true}' WHERE `id`= @reldens_object_healer_id;
UPDATE `objects` SET `client_params`='{"content":"Hi there! What would you like to do?","options":{"buy":{"label":"Buy","value":"buy"},"sell":{"label":"Sell","value":"sell"},"trade":{"label":"Trade","value":"trade"}}}' WHERE `id`= @reldens_object_merchant_id;
UPDATE `objects` SET `client_params`='{"content":"Hi! I am the weapons master, choose your weapon and go kill some monsters!","enabled":true,"ui":true}' WHERE  `id`= @reldens_object_weapons_master_id;
UPDATE `objects` SET `client_params`='{"content":"Hi there! Do you want a coin? I can give you one if you give me a tree branch.","options":{"op1":{"label":"Sure!","value":1},"op2":{"label":"No, thank you.","value":2}},"enabled":true,"ui":true}' WHERE `id`= @reldens_object_quest_npc;

# Object properties (private_params):
UPDATE `objects` SET `private_params`='{"runOnAction":true,"playerVisible":true}' WHERE `id` = @reldens_object_alfred_id;
UPDATE `objects` SET `private_params`='{"runOnAction":true,"playerVisible":true,"sendInvalidOptionMessage":true}' WHERE `id` = @reldens_object_healer_id OR `id` = @reldens_object_merchant_id OR `id` = @reldens_object_weapons_master_id OR `id` = @reldens_object_quest_npc;

#######################################################################################################################

SET FOREIGN_KEY_CHECKS = 1;

#######################################################################################################################
