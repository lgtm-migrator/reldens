var share = require('../../shared/constants');

class Player
{

    constructor(data)
    {
        // player data:
        this.id = data.id;
        this.sessionId = '';
        this.role_id = data.role_id;
        this.status = data.status;
        this.state = data.state;
        // initial position:
        this.x = 225;
        this.y = 280;
        this.dir = share.DOWN;
        this.mov = false;
        this.scene = 'Town'; // initial scene
        this.players = [];
    }

}

exports.player = Player;
