
(function(window) {
    var Actions = function(){}

    Actions.prototype.actionEnums = {
        Test: 'test',
        Move: 'move',
        Face: 'face',
        Attack: 'attack',
        NoLOS: 'noLos'
    };

    Actions.prototype.init = function(actions){
        this.end = false;
        this.actions = actions;
        this.currentAction = null;
        this.actionIndex = 0;
    };
    Actions.prototype.update = function(dt){
        if (this.currentAction == null && this.actionIndex < this.actions.length){
            this.currentAction = this.actions[this.actionIndex];
        }else{
            var actionFunc = this.getAction(this.currentAction.action);
            actionFunc(dt,this,this.currentAction);
        }
    };

    Actions.prototype.endAction = function(){
        this.currentAction = null;
        this.actionIndex += 1;
        if (this.actionIndex == this.actions.length){
            this.end = true;
        }
    };

    ///////////////////////////////////////////////
    // Get actions list
    ///////////////////////////////////////////////

    Actions.prototype.getAction = function(a){
        switch(a){
            case this.actionEnums.Test:
                return this.test;
                break;
            case this.actionEnums.Move:
                return this.move;
                break;
            case this.actionEnums.Face:
                return this.face;
                break;
            case this.actionEnums.Attack:
                return this.attack;
                break;
            case this.actionEnums.NoLos:
                return this.noLos;
                break;
            default:
                return this.test;
                break;
        }
    };

    ///////////////////////////////////////////////
    // All Actions
    ///////////////////////////////////////////////

    Actions.prototype.test = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
        }
        console.log(data);
        data.ticker += dt;
        if (data.ticker > 0.5){
            actions.endAction();
        }
    };

    Actions.prototype.move = function(dt,actions,data){
        //move the given unit 1 node
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            data.speed = 0.33; //seconds it takes to move 1 node
            data.unit = Game.units[data.unitID];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            var sp = 'sprite' + t;
            var cont = 'container' + t;
            if (data.unit.currentNode.unit == data.unit){
                data.unit.currentNode.unit = null;
            }
            data.newNode = Game.map.getAxial({x:data.x,y:data.y,z:data.z});
            Game.map[cont].removeChild(data.unit.sprite);
            Game.map[cont].addChildAt(data.unit.sprite,Game.map[cont].getChildIndex(data.newNode[sp])+1);
            data.startPos = [data.unit.sprite.position.x,data.unit.sprite.position.y];
            data.endPos = [data.newNode[sp].position.x,data.newNode[sp].position.y-Game.map.TILE_HEIGHT*(data.newNode.h+1)*0.8*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting]];
            data.vector = [data.endPos[0]-data.startPos[0],data.endPos[1]-data.startPos[1]];
            //get the new facing of the unit and change it
            var direction = Game.map.cardinalDirections[Game.map.getNewDirectionAxial(data.unit.currentNode,data.newNode)];
            data.unit.setNewDirection(direction);
        }
        data.unit.sprite.position.x = data.startPos[0] + data.vector[0]*data.ticker/data.speed;
        data.unit.sprite.position.y = data.startPos[1] + data.vector[1]*data.ticker/data.speed;
        data.ticker += dt;
        if (data.ticker >= data.speed){
            //data.unit.sprite.position.x = data.endPos[0];
            //data.unit.sprite.position.y = data.endPos[1];
            actions.endAction();
            data.unit.moveLeft -= 1;
            data.unit.currentNode = data.newNode;
            if (!data.newNode.unit){
                data.newNode.unit = data.unit;
            }
        }
    };
    Actions.prototype.face = function(dt,actions,data){
        //change the unit's facing and end
        console.log(data);
        Game.units[data.unitID].setNewDirection(data.direction);
        actions.endAction();
    };

    Actions.prototype.attack = function(dt,actions,data){
        //change the unit's facing and end
        actions.endAction();
    };

    Actions.prototype.noLos = function(dt,actions,data){
        //change the unit's facing and end
        actions.endAction();
    };

    window.Actions = Actions;
})(window);
