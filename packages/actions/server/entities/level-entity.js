/**
 *
 * Reldens - LevelEntity
 *
 */

const { AdminEntityProperties } = require('../../../admin/server/admin-entity-properties');

class LevelEntity extends AdminEntityProperties
{

    static propertiesConfig(extraProps)
    {
        let properties = {
            id: {},
            key: {},
            label: {
                isTitle: true
            },
            required_experience: {},
            levels_set_id: {
                type: 'reference',
                reference: 'skills_levels_set'
            },
        };

        let listPropertiesKeys = Object.keys(properties);
        let editPropertiesKeys = [...listPropertiesKeys];

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

module.exports.LevelEntity = LevelEntity;
