/**
 *
 * Reldens - Merchant
 *
 * This is an example object class, it extends from the NpcObject class and then define the specific parameters for the
 * behavior and animations.
 *
 */

const { NpcObject } = require('reldens/lib/objects/server/npc-object');
const { GameConst } = require('reldens/lib/game/constants');
const { Logger, sc } = require('@reldens/utils');

class Merchant extends NpcObject
{

    constructor(props)
    {
        super(props);
        this.runOnAction = true;
        this.playerVisible = true;
        // assign extra params:
        this.clientParams.enabled = true;
        this.clientParams.ui = true;
        // @TODO - BETA - All the NPC info will be coming from the storage.
        this.content = 'Hi there! Do you want a coin? I can give you some to buy things.';
        this.options = {
            op1: {label: 'Sure!', value: 1},
            op2: {label: 'No, thank you.', value: 2}
        };
        this.sendInvalidOptionMessage = true;
    }

    async executeMessageActions(client, data, room, playerSchema)
    {
        await super.executeMessageActions(client, data, room, playerSchema);
        let optionIdx = 'op'+data.value;
        if(!this.isValidOption(data) || !this.isValidIndexValue(optionIdx, room, client)){
            return false;
        }
        let selectedOption = this.options[optionIdx];
        if(1 !== selectedOption.value){
            let activationData = {act: GameConst.UI, id: this.id, content: 'Ok...'};
            client.send('*', activationData);
            return;
        }
        // only give each item once:
        if(sc.hasOwn(playerSchema.inventory.manager.items, 'coins')){
            let contentMessage = 'You have too many already.';
            client.send('*', {act: GameConst.UI, id: this.id, content: contentMessage});
            return false;
        }
        let coin = playerSchema.inventory.manager.createItemInstance('coins');
        playerSchema.inventory.manager.addItem(coin).then(() => {
            let activationData = {act: GameConst.UI, id: this.id, content: 'All yours!'};
            client.send('*', activationData);
        }).catch((err) => {
            Logger.error([`Error while adding item "${selectedOption.key}":`, err]);
            let contentMessage = 'Sorry, I was not able to give you the item, contact the admin.';
            client.send('*', {act: GameConst.UI, id: this.id, content: contentMessage});
            return false;
        });
    }

}

module.exports.Merchant = Merchant;
