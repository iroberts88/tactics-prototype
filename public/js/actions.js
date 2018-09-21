
(function(window) {
    var Actions = function(){}

    Actions.prototype.actionEnums = {
        Test: 'test',
        Move: 'move',
        Face: 'face',
        Reveal: 'reveal',
        Hide: 'hide',
        Attack: 'attack',
        NoLOS: 'noLos',
        ActionBubble: 'actionBubble',
        DmgText: 'dmgText',
        ActionUsed: 'actionUsed',
        SetEnergy: 'setEnergy',
        Slam: 'slam',
        Reversal: 'reversal'
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
            try{
                var actionFunc = this.getAction(this.currentAction.action);
                actionFunc(dt,this,this.currentAction);
            }catch(e){
                console.log(e);
            }
        }
    };

    Actions.prototype.endAction = function(data){
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
            case this.actionEnums.Reveal:
                return this.reveal;
                break;
            case this.actionEnums.Hide:
                return this.hide;
                break;
            case this.actionEnums.ActionUsed:
                return this.actionUsed;
                break;
            case this.actionEnums.Attack:
                return this.attack;
                break;
            case this.actionEnums.NoLos:
                return this.noLos;
                break;
            case this.actionEnums.ActionBubble:
                return this.actionBubble;
                break;
            case this.actionEnums.DmgText:
                return this.dmgText;
                break;
            case this.actionEnums.SetEnergy:
                return this.setEnergy;
                break;
            case this.actionEnums.Slam:
                return this.slam;
                break;
            case this.actionEnums.Reversal:
                return this.reversal;
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
        data.ticker += dt;
        if (data.ticker > 0.5){
            actions.endAction(data);
        }
    };
    Actions.prototype.slam = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            data.speed = 0.1; //seconds it takes to move 1 node
            data.unit = Game.units[data.unitid];
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
        }
        data.unit.sprite.position.x = data.startPos[0] + data.vector[0]*data.ticker/data.speed;
        data.unit.sprite.position.y = data.startPos[1] + data.vector[1]*data.ticker/data.speed;
        data.ticker += dt;
        if (data.ticker >= data.speed){
            data.unit.sprite.position.x = data.endPos[0];
            data.unit.sprite.position.y = data.endPos[1];
            actions.endAction(data);
            data.unit.currentNode = data.newNode;
            if (!data.newNode.unit){
                data.newNode.unit = data.unit;
            }
        }
    };

    Actions.prototype.reversal = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            data.speed = 0.1; //seconds it takes to move 1 node
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            var sp = 'sprite' + t;
            data.unit = Game.units[data.unitid];
            data.target = Game.units[data.targetid]
            if (data.unit.currentNode.unit == data.unit){
                data.unit.currentNode.unit = null;
            }
            if (data.target.currentNode.unit == data.target){
                data.target.currentNode.unit = null;
            }
            data.newNode1 = Game.map.axialMap[data.unitNewNode.q][data.unitNewNode.r];
            data.newNode2 = Game.map.axialMap[data.targetNewNode.q][data.targetNewNode.r];
            data.startPos1 = [data.unit.sprite.position.x,data.unit.sprite.position.y];
            data.startPos2 = [data.target.sprite.position.x,data.target.sprite.position.y];
            data.endPos1 = [data.newNode1[sp].position.x,data.newNode1[sp].position.y-Game.map.TILE_HEIGHT*(data.newNode1.h+1)*0.8*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting]];
            data.endPos2 = [data.newNode2[sp].position.x,data.newNode2[sp].position.y-Game.map.TILE_HEIGHT*(data.newNode2.h+1)*0.8*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting]];
            data.vector1 = [data.endPos1[0]-data.startPos1[0],data.endPos1[1]-data.startPos1[1]];
            data.vector2 = [data.endPos2[0]-data.startPos2[0],data.endPos2[1]-data.startPos2[1]];
        }
        data.unit.sprite.position.x = data.startPos1[0] + data.vector1[0]*data.ticker/data.speed;
        data.unit.sprite.position.y = data.startPos1[1] + data.vector1[1]*data.ticker/data.speed;
        data.target.sprite.position.x = data.startPos2[0] + data.vector2[0]*data.ticker/data.speed;
        data.target.sprite.position.y = data.startPos2[1] + data.vector2[1]*data.ticker/data.speed;
        data.ticker += dt;
        if (data.ticker >= data.speed){
            data.unit.sprite.position.x = data.endPos1[0];
            data.unit.sprite.position.y = data.endPos1[1];
            data.target.sprite.position.x = data.endPos2[0];
            data.target.sprite.position.y = data.endPos2[1];
            actions.endAction(data);
            data.unit.currentNode = data.newNode1;
            data.target.currentNode = data.newNode2;
            if (!data.newNode1.unit){
                data.newNode1.unit = data.unit;
            }
            if (!data.newNode2.unit){
                data.newNode2.unit = data.target;
            }
        }
    };
    Actions.prototype.move = function(dt,actions,data){
        //move the given unit 1 node
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            data.speed = 0.33; //seconds it takes to move 1 node
            data.unit = Game.units[data.unitid];
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
            actions.endAction(data);
            if(data.reduceLeft){
                data.unit.moveLeft -= 1;
            }
            data.unit.currentNode = data.newNode;
            if (!data.newNode.unit){
                data.newNode.unit = data.unit;
            }
        }
    };

    Actions.prototype.face = function(dt,actions,data){
        //change the unit's facing and end
        Game.units[data.unitid].setNewDirection(data.direction);
        actions.endAction(data);
    };

    Actions.prototype.reveal = function(dt,actions,data){
        //change the unit's facing and end
        if (typeof Game.units[data.unitid] != 'undefined'){
            if (!Game.units[data.unitid].visible){
                var t = 1;
                if (!(Game.map.currentRotation%2)){t = 2}
                Game.map['container'+t].addChild(Game.units[data.unitid].sprite);
                Game.units[data.unitid].visible = true;
            }
            Game.units[data.unitid].sprite.alpha = 1;
            Game.units[data.unitid].setCurrentNode(data.q,data.r,Game.map);
            Game.units[data.unitid].setNewDirection(data.direction);
            Game.updateUnitsBool = true;
        }
        actions.endAction(data);
    };

    Actions.prototype.hide = function(dt,actions,data){
        //change the unit's facing and end
        if (typeof Game.units[data.unitid] != 'undefined'){
            if (Game.units[data.unitid].owner == mainObj.playerID){
                Game.units[data.unitid].sprite.alpha = 0.5;
            }else{
                var t = 1;
                if (!(Game.map.currentRotation%2)){t = 2}
                Game.map['container'+t].removeChild(Game.units[data.unitid].sprite);
                Game.units[data.unitid].visible = false;
                Game.units[data.unitid].currentNode.unit = null;
                Game.units[data.unitid].currentNode = null;
            }
        }
        actions.endAction(data);
    };

    Actions.prototype.attack = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            Game.units[data.unitid].addActionBubble(data.weapon);
            Game.units[data.unitid].setNewDirection(data.newDir);
            data.ticker = 0;
        }
        data.ticker += dt;
        if (data.ticker >= 1.5){
            actions.endAction(data);
        }
    };

    Actions.prototype.noLos = function(dt,actions,data){
        Game.units[data.unitid].addActionBubble('No Line of Sight!');
        actions.endAction(data);
    };

    Actions.prototype.actionBubble = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            Game.units[data.unitid].addActionBubble(data.text);
        }
        data.ticker += dt;
        if (data.ticker >= 1.5){
            actions.endAction(data);
        }
    };
    Actions.prototype.dmgText = function(dt,actions,data){
        if (data.ownerOnly && Game.units[data.unitid].owner != mainObj.playerID){
            actions.endAction(data);
        }
        if (typeof Game.units[data.unitid] == 'undefined'){
            actions.endAction(data);
        }
        Game.units[data.unitid].addDmgText(data.text,data.type);
        var resetIP = false;
        if (typeof data.newHealth != 'undefined'){
            Game.units[data.unitid].currentHealth = data.newHealth;
            resetIP = true;
        }
        if (typeof data.newShields != 'undefined'){
            Game.units[data.unitid].currentShields = data.newShields;
            resetIP = true;
        }
        if (data.dead && typeof data.dead != 'undefined'){
            Game.units[data.unitid].currentNode.unit = null;
            Game.units[data.unitid].setDead();
            Game.units[data.unitid].dead = true;
            resetIP = true;
        }else if (typeof data.fainted != 'undefined'){
            Game.units[data.unitid].setFainted(data.fainted);
            resetIP = true;
        }
        if (resetIP){
            Game.units[data.unitid].infoPane = Game.getUnitInfoPane(data.unitid);
        }
        actions.endAction(data);
    };
    Actions.prototype.actionUsed = function(dt,actions,data){
        Game.units[data.unitid].actionUsed = true;
        actions.endAction(data);
    };
    Actions.prototype.setEnergy = function(dt,actions,data){
        Game.units[data.unitid].currentEnergy = data.val;
        Game.units[data.unitid].infoPane = Game.getUnitInfoPane(data.unitid);
        actions.endAction(data);
    };

    window.Actions = Actions;
})(window);
