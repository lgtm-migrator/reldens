/**
 *
 * Reldens - Registered Entities
 *
 */

const { ObjectsAnimationsModel } = require('./animations-model');
const { ObjectsModel } = require('./objects-model');
const { ObjectsAssetsModel } = require('./assets-model');
const { entitiesTranslations } = require('../../entities-translations');
const { entitiesConfig } = require('../../entities-config');

let rawRegisteredEntities = {
    objectsAnimations: ObjectsAnimationsModel,
    objects: ObjectsModel,
    objectsAssets: ObjectsAssetsModel
};

module.exports.rawRegisteredEntities = rawRegisteredEntities;

module.exports.entitiesConfig = entitiesConfig;

module.exports.entitiesTranslations = entitiesTranslations;
