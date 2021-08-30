/**
 *
 * Reldens - LevelModifiersEntity
 *
 */

const { AdminEntityProperties } = require('../../../admin/server/admin-entity-properties');
const { sc } = require('@reldens/utils');

class LevelModifiersEntity extends AdminEntityProperties
{

    static propertiesConfig(extraProps)
    {
        let properties = {
            id: {},
            level_id: {
                type: 'reference',
                reference: 'skills_levels'
            },
            key: {
                isTitle: true
            },
            property_key: {},
            operation: {},
            value: {},
            minValue: {},
            maxValue: {},
            minProperty: {},
            maxProperty: {},
        };

        let listPropertiesKeys = Object.keys(properties);
        let editPropertiesKeys = [...listPropertiesKeys];

        listPropertiesKeys = sc.removeFromArray(listPropertiesKeys, [
            'minValue',
            'maxValue',
            'minProperty',
            'maxProperty'
        ]);
        editPropertiesKeys.splice(editPropertiesKeys.indexOf('id'), 1);

        return Object.assign({
            listProperties: listPropertiesKeys,
            showProperties: Object.keys(properties),
            filterProperties: listPropertiesKeys,
            editProperties: editPropertiesKeys,
            properties
        }, extraProps);
    }

}

module.exports.LevelModifiersEntity = LevelModifiersEntity;
