
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
                var actionFunc = this.getAction(this.currentAction[ENUMS.ACTION]);
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
            case ENUMS.MOVE:
                return this.move;
                break;
            case ENUMS.FACE:
                return this.face;
                break;
            case ENUMS.REVEAL:
                return this.reveal;
                break;
            case ENUMS.HIDE:
                return this.hide;
                break;
            case ENUMS.ACTIONUSED:
                return this.actionUsed;
                break;
            case ENUMS.ATTACK:
                return this.attack;
                break;
            case ENUMS.NOLOS:
                return this.noLos;
                break;
            case ENUMS.ACTIONBUBBLE:
                return this.actionBubble;
                break;
            case ENUMS.DAMAGETEXT:
                return this.dmgText;
                break;
            case ENUMS.SETENERGY:
                return this.setEnergy;
                break;
            case ENUMS.SLAM:
                return this.slam;
                break;
            case ENUMS.REVERSAL:
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
            data.unit = Game.units[data[ENUMS.UNITID]];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            var sp = 'sprite' + t;
            var cont = 'container' + t;
            if (data.unit.currentNode.unit == data.unit){
                data.unit.currentNode.unit = null;
            }
            data.newNode = Game.map.getAxial({x:data[ENUMS.X],y:data[ENUMS.Y],z:data[ENUMS.Z]});
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
            data.unit = Game.units[data[ENUMS.UNITID]];
            data.target = Game.units[data[ENUMS.TARGETID]]
            if (data.unit.currentNode.unit == data.unit){
                data.unit.currentNode.unit = null;
            }
            if (data.target.currentNode.unit == data.target){
                data.target.currentNode.unit = null;
            }
            data.newNode1 = Game.map.axialMap[data[ENUMS.UNITNEWNODE][ENUMS.Q]][data[ENUMS.UNITNEWNODE][ENUMS.R]];
            data.newNode2 = Game.map.axialMap[data[ENUMS.TARGETNEWNODE][ENUMS.Q]][data[ENUMS.TARGETNEWNODE][ENUMS.R]];
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
            data.unit = Game.units[data[ENUMS.UNITID]];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            var sp = 'sprite' + t;
            var cont = 'container' + t;
            if (data.unit.currentNode.unit == data.unit){
                data.unit.currentNode.unit = null;
            }
            data.newNode = Game.map.getAxial({x:data[ENUMS.X],y:data[ENUMS.Y],z:data[ENUMS.Z]});
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
            if (actions.end){
                Game.getLineOfSight();
            }
            if(data[ENUMS.REDUCELEFT]){
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
        Game.units[data[ENUMS.UNITID]].setNewDirection(data[ENUMS.DIRECTION]);
        actions.endAction(data);
    };

    Actions.prototype.reveal = function(dt,actions,data){
        //change the unit's facing and end
        if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
            if (!Game.units[data[ENUMS.UNITID]].visible){
                var t = 1;
                if (!(Game.map.currentRotation%2)){t = 2}
                Game.map['container'+t].addChild(Game.units[data[ENUMS.UNITID]].sprite);
                Game.units[data[ENUMS.UNITID]].visible = true;
            }
            Game.units[data[ENUMS.UNITID]].sprite.alpha = 1;
            Game.units[data[ENUMS.UNITID]].setCurrentNode(data[ENUMS.Q],data[ENUMS.R],Game.map);
            Game.units[data[ENUMS.UNITID]].setNewDirection(data[ENUMS.DIRECTION]);
            Game.updateUnitsBool = true;
        }
        actions.endAction(data);
    };

    Actions.prototype.hide = function(dt,actions,data){
        //change the unit's facing and end
        if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
            if (Game.units[data[ENUMS.UNITID]].owner == mainObj.playerID){
                Game.units[data[ENUMS.UNITID]].sprite.alpha = 0.5;
            }else{
                var t = 1;
                if (!(Game.map.currentRotation%2)){t = 2}
                Game.map['container'+t].removeChild(Game.units[data[ENUMS.UNITID]].sprite);
                Game.units[data[ENUMS.UNITID]].visible = false;
                Game.units[data[ENUMS.UNITID]].currentNode.unit = null;
                Game.units[data[ENUMS.UNITID]].currentNode = null;
            }
        }
        actions.endAction(data);
    };

    Actions.prototype.attack = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            Game.units[data[ENUMS.UNITID]].addActionBubble(data[ENUMS.WEAPON]);
            Game.units[data[ENUMS.UNITID]].setNewDirection(data[ENUMS.DIRECTION]);
            data.ticker = 0;
        }
        data.ticker += dt;
        if (data.ticker >= 1.5){
            actions.endAction(data);
        }
    };

    Actions.prototype.noLos = function(dt,actions,data){
        Game.units[data[ENUMS.UNITID]].addActionBubble('No Line of Sight!');
        actions.endAction(data);
    };

    Actions.prototype.actionBubble = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            Game.units[data[ENUMS.UNITID]].addActionBubble(data[ENUMS.TEXT]);
        }
        data.ticker += dt;
        if (data.ticker >= 1.5){
            actions.endAction(data);
        }
    };
    Actions.prototype.dmgText = function(dt,actions,data){
        console.log(data);
        if (data[ENUMS.OWNERONLY] && Game.units[data[ENUMS.UNITID]].owner != mainObj.playerID){
            console.log('END')
            actions.endAction(data);
        }
        if (typeof Game.units[data[ENUMS.UNITID]] == 'undefined'){
            actions.endAction(data);
        }
        var unit = Game.units[data[ENUMS.UNITID]];
        unit.addDmgText(data[ENUMS.TEXT],data[ENUMS.TYPE]);
        var resetIP = false;
        if (typeof data[ENUMS.CURRENTHEALTH] != 'undefined'){
            unit.currentHealth = data[ENUMS.CURRENTHEALTH];
            resetIP = true;
        }
        if (typeof data[ENUMS.CURRENTSHIELDS] != 'undefined'){
            unit.currentShields = data[ENUMS.CURRENTSHIELDS];
            resetIP = true;
        }
        if (data[ENUMS.DEAD] && typeof data[ENUMS.DEAD] != 'undefined'){
            unit.currentNode.unit = null;
            unit.setDead();
            unit.dead = true;
            resetIP = true;
        }else if (typeof data[ENUMS.FAINTED] != 'undefined'){
            unit.setFainted(data[ENUMS.FAINTED]);
            resetIP = true;
        }
        if (resetIP){
            unit.infoPane = Game.getUnitInfoPane(data[ENUMS.UNITID]);
        }
        actions.endAction(data);
    };
    Actions.prototype.actionUsed = function(dt,actions,data){
        Game.units[data[ENUMS.UNITID]].actionUsed = true;
        actions.endAction(data);
    };
    Actions.prototype.setEnergy = function(dt,actions,data){
        Game.units[data[ENUMS.UNITID]].currentEnergy = data[ENUMS.VALUE];
        Game.units[data[ENUMS.UNITID]].infoPane = Game.getUnitInfoPane(data[ENUMS.UNITID]);
        actions.endAction(data);
    };

    window.Actions = Actions;
})(window);
