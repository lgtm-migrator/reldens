/**
 *
 * Reldens - PlayerBody
 *
 * Extended the physics P2js Body to easily update the player state schema and get all bodies position updated
 * automatically.
 *
 */

const { Body, vec2 } = require('p2');
const { GameConst } = require('../../game/constants');
const { sc } = require('@reldens/utils');

class PhysicalBody extends Body
{

    constructor(options)
    {
        super(options);
        this.bodyState = {};
        this.animationBasedOnPress = options.animationBasedOnPress;
        this.diagonalHorizontal = options.diagonalHorizontal;
        this.autoMoving = false;
        this.pathFinder = false;
        // default or initial direction:
        this.pressedDirection = GameConst.DOWN;
        this.currentCol = false;
        this.currentRow = false;
        this.originalCol = false;
        this.originalRow = false;
    }

    integrate(dt)
    {
        let minv = this.invMass,
            f = this.force,
            pos = this.position,
            velo = this.velocity;
        // save old position
        vec2.copy(this.previousPosition, this.position);
        this.previousAngle = this.angle;
        // velocity update
        if(!this.fixedRotation){
            this.angularVelocity += this.angularForce * this.invInertia * dt;
        }
        let integrateFhMinv = vec2.create();
        vec2.scale(integrateFhMinv, f, dt * minv);
        vec2.multiply(integrateFhMinv, this.massMultiplier, integrateFhMinv);
        vec2.add(velo, integrateFhMinv, velo);
        // CCD
        if(!this.integrateToTimeOfImpact(dt)){
            let integrateVelodt = vec2.create();
            // regular position update
            vec2.scale(integrateVelodt, velo, dt);
            vec2.add(pos, pos, integrateVelodt);
            if(!this.fixedRotation){
                this.angle += this.angularVelocity * dt;
            }
        }
        if(this.autoMoving && this.autoMoving.length){
            this.speedToNext(pos);
        }
        if(this.bodyState){
            this.updateBodyState();
        }
        this.aabbNeedsUpdate = true;
    }

    speedToNext()
    {
        if(this.currentCol === this.autoMoving[0][0] && this.currentRow === this.autoMoving[0][1]){
            // if the point was reach then remove it to process the next one:
            this.autoMoving.shift();
            if(!this.autoMoving.length){
                // if there are no more points to process then stop the body and reset the path:
                this.velocity = [0, 0];
                this.resetAuto();
            }
        } else {
            if(this.currentCol === this.autoMoving[0][0] && this.velocity[0] !== 0){
                this.velocity[0] = 0;
            }
            if(this.currentCol > this.autoMoving[0][0]){
                this.initMove(GameConst.LEFT, true);
            }
            if(this.currentCol < this.autoMoving[0][0]){
                this.initMove(GameConst.RIGHT, true);
            }
            if(this.currentRow === this.autoMoving[0][1] && this.velocity[1] !== 0){
                this.velocity[1] = 0;
            }
            if(this.currentRow > this.autoMoving[0][1]){
                this.initMove(GameConst.UP, true);
            }
            if(this.currentRow < this.autoMoving[0][1]){
                this.initMove(GameConst.DOWN, true);
            }
            this.updateCurrentPoints();
        }
    }

    updateBodyState()
    {
        // only update the body if it moves:
        if(
            this.bodyState.x === this.position[0]
            && this.bodyState.y === this.position[1]
            && this.velocity[0] === 0
            && this.velocity[1] === 0
        ){
            this.bodyState.mov = false;
            return;
        }
        // @NOTE: the word "bullet" will be part of our glossary to refer to bodies that will be created, moved, and
        // destroyed on hit or that reach the world boundaries.
        if(sc.isTrue(this, 'isBullet')){
            if(
                this.position[0] < 0 || this.position[0] > (this.worldWidth * this.worldTileWidth)
                || this.position[1] < 0 || this.position[1] > (this.worldHeight * this.worldTileHeight)
            ){
                this.world.removeBodies.push(this);
            }
        }
        // update position:
        this.bodyState.x = this.position[0];
        this.bodyState.y = this.position[1];
        // start or stop animation:
        this.bodyState.mov = (this.velocity[0] !== 0 || this.velocity[1] !== 0);
    }

    resetAuto()
    {
        this.autoMoving = [];
        return this;
    }

    initMove(direction, isAuto = false)
    {
        if(!isAuto){
            // if user moves the player then reset the auto move.
            this.resetAuto();
        }
        let speed = this.world.worldSpeed;
        if(this.world.allowSimultaneous){
            if(direction === GameConst.RIGHT){
                this.validateAndSetDirection(direction, this.diagonalHorizontal, this.velocity[1]);
                this.velocity[0] = speed;
            }
            if(direction === GameConst.LEFT){
                this.validateAndSetDirection(direction, this.diagonalHorizontal, this.velocity[1]);
                this.velocity[0] = -speed;
            }
            if(direction === GameConst.UP){
                this.validateAndSetDirection(direction, !this.diagonalHorizontal, this.velocity[0]);
                this.velocity[1] = -speed;
            }
            if(direction === GameConst.DOWN){
                this.validateAndSetDirection(direction, !this.diagonalHorizontal, this.velocity[0]);
                this.velocity[1] = speed;
            }
        } else {
            // if body is moving then avoid multiple key press at the same time:
            if(direction === GameConst.RIGHT && this.velocity[1] === 0){
                this.velocity[0] = speed;
            }
            if(direction === GameConst.LEFT && this.velocity[1] === 0){
                this.velocity[0] = -speed;
            }
            if(direction === GameConst.UP && this.velocity[0] === 0){
                this.velocity[1] = -speed;
            }
            if(direction === GameConst.DOWN && this.velocity[0] === 0){
                this.velocity[1] = speed;
            }
        }
    }

    validateAndSetDirection(direction, diagonal, velocity)
    {
        if(this.animationBasedOnPress || this.bodyState.autoDirection){
            if(diagonal || velocity === 0){
                this.bodyState.dir = direction;
            }
        }
    }

    stopMove()
    {
        // stop by setting speed to zero:
        this.velocity = [0, 0];
        return this;
    }

    moveToPoint(toPoint)
    {
        this.resetAuto();
        this.updateCurrentPoints();
        let fromPoints = [this.currentCol, this.currentRow];
        let toPoints = [toPoint.column, toPoint.row];
        this.autoMoving = this.getPathFinder().findPath(fromPoints, toPoints);
        if(!this.autoMoving){
             this.stopMove();
        }
        return this.autoMoving;
    }

    updateCurrentPoints()
    {
        // if the player disconnects and it's the only one on the room the world would be destroyed at this point:
        if(!this.world){
            return;
        }
        let {currentCol, currentRow} = this.positionToTiles(this.position[0], this.position[1]);
        if(!this.currentCol){
            this.originalCol = currentCol;
        }
        if(!this.currentRow){
            this.originalRow = currentRow;
        }
        this.currentCol = currentCol;
        this.currentRow = currentRow;
        return this;
    }

    moveToOriginalPoint()
    {
        if(!this.originalCol || this.originalRow){
            this.updateCurrentPoints();
        }
        this.moveToPoint({column: this.originalCol, row: this.originalRow});
    }

    positionToTiles(x, y)
    {
        let currentCol = Math.round((x - (this.worldTileWidth/2)) / this.worldTileWidth);
        currentCol = (currentCol >= 0) ? ((currentCol > this.worldWidth) ? (this.worldWidth) : currentCol) : 0;
        let currentRow = Math.round((y - (this.worldTileHeight/2)) / this.worldTileHeight);
        currentRow = (currentRow >= 0) ? ((currentRow > this.worldHeight) ? (this.worldHeight) : currentRow) : 0;
        return {currentCol, currentRow};
    }

    getPathFinder()
    {
        // @NOTE: body path finder is for when the body has it's own respawn area and grid, the world path finder is for
        // any object in the room that could be anywhere in the room.
        return (this.pathFinder ? this.pathFinder : this.world.pathFinder);
    }

    get worldTileWidth()
    {
        return this.world.mapJson.tilewidth;
    }

    get worldTileHeight()
    {
        return this.world.mapJson.tileheight;
    }

    get worldWidth()
    {
        return this.world.mapJson.width;
    }

    get worldHeight()
    {
        return this.world.mapJson.height;
    }

}

module.exports.PhysicalBody = PhysicalBody;
