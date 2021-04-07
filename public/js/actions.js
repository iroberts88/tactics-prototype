
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
        Reversal: 'reversal',
        Log: 'log'
    };

    Actions.prototype.init = function(actions){
        this.end = false;
        this.actions = actions;
        this.currentAction = null;
        this.actionIndex = 0;
        this.hasAMove = false;
    };
    Actions.prototype.update = function(dt){
        if (this.currentAction == null && this.actionIndex < this.actions.length){
            this.currentAction = this.actions[this.actionIndex];
        }else{
            try{
                var actionFunc = this.getAction(this.currentAction[Enums.ACTION]);
                actionFunc(dt,this,this.currentAction);

                if (this.end && this.hasAMove){
                    //Game.getLineOfSight();
                }
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
            case Enums.MOVE:
                return this.move;
                break;
            case Enums.FACE:
                return this.face;
                break;
            case Enums.REVEAL:
                return this.reveal;
                break;
            case Enums.HIDE:
                return this.hide;
                break;
            case Enums.ACTIONUSED:
                return this.actionUsed;
                break;
            case Enums.ATTACK:
                return this.attack;
                break;
            case Enums.NOLOS:
                return this.noLos;
                break;
            case Enums.ACTIONBUBBLE:
                return this.actionBubble;
                break;
            case Enums.DAMAGETEXT:
                return this.dmgText;
                break;
            case Enums.SETENERGY:
                return this.setEnergy;
                break;
            case Enums.SLAM:
                return this.slam;
                break;
            case Enums.REVERSAL:
                return this.reversal;
                break;
            case Enums.LOG:
                return this.log;
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
    Actions.prototype.log = function(dt,actions,data){
        console.log(data);
        Game.activityLogMsg(data[Enums.TEXT]);
        actions.endAction(data);
    };
    Actions.prototype.slam = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            data.speed = 0.1; //seconds it takes to move 1 node
            data.unit = Game.units[data[Enums.UNITID]];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            var sp = 'sprite' + t;
            var cont = 'container' + t;
            if (data.unit.currentNode.unit == data.unit){
                data.unit.currentNode.unit = null;
            }
            data.newNode = Game.map.getAxial({x:data[Enums.X],y:data[Enums.Y],z:data[Enums.Z]});
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
            data.unit = Game.units[data[Enums.UNITID]];
            data.target = Game.units[data[Enums.TARGETID]]
            data.unit.currentNode.unit = null;
            data.target.currentNode.unit = null;
            data.newNode1 = Game.map.axialMap[data[Enums.UNITNEWNODE][Enums.Q]][data[Enums.UNITNEWNODE][Enums.R]];
            data.newNode2 = Game.map.axialMap[data[Enums.TARGETNEWNODE][Enums.Q]][data[Enums.TARGETNEWNODE][Enums.R]];
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
            data.newNode1.unit = data.unit;
            data.newNode2.unit = data.target;
        }
    };
    Actions.prototype.move = function(dt,actions,data){
        //move the given unit 1 node
        if (typeof data.ticker == 'undefined'){
            actions.hasAMove = true;
            data.ticker = 0;
            data.speed = 0.33; //seconds it takes to move 1 node
            data.unit = Game.units[data[Enums.UNITID]];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            var sp = 'sprite' + t;
            var cont = 'container' + t;
            if (data.unit.currentNode.unit == data.unit){
                data.unit.currentNode.unit = null;
            }
            data.newNode = Game.map.getAxial({x:data[Enums.X],y:data[Enums.Y],z:data[Enums.Z]});
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
            data.unit.currentNode = data.newNode;
            if (!data.newNode.unit){
                data.newNode.unit = data.unit;
            }
        }
    };

    Actions.prototype.face = function(dt,actions,data){
        //change the unit's facing and end
        Game.units[data[Enums.UNITID]].setNewDirection(data[Enums.DIRECTION]);
        actions.endAction(data);
    };

    Actions.prototype.reveal = function(dt,actions,data){
        //change the unit's facing and end
        if (typeof Game.units[data[Enums.UNITID]] != 'undefined'){
            if (!Game.units[data[Enums.UNITID]].visible){
                var t = 1;
                if (!(Game.map.currentRotation%2)){t = 2}
                Game.map['container'+t].addChild(Game.units[data[Enums.UNITID]].sprite);
                Game.units[data[Enums.UNITID]].visible = true;
            }
            Game.units[data[Enums.UNITID]].sprite.alpha = 1;
            Game.units[data[Enums.UNITID]].setCurrentNode(data[Enums.Q],data[Enums.R],Game.map);
            Game.units[data[Enums.UNITID]].setNewDirection(data[Enums.DIRECTION]);
            Game.updateUnitsBool = true;
        }
        actions.endAction(data);
    };

    Actions.prototype.hide = function(dt,actions,data){
        //change the unit's facing and end
        if (typeof Game.units[data[Enums.UNITID]] != 'undefined'){
            if (Game.units[data[Enums.UNITID]].owner == mainObj.playerID){
                Game.units[data[Enums.UNITID]].sprite.alpha = 0.5;
            }else{
                var t = 1;
                if (!(Game.map.currentRotation%2)){t = 2}
                Game.map['container'+t].removeChild(Game.units[data[Enums.UNITID]].sprite);
                Game.units[data[Enums.UNITID]].visible = false;
                Game.units[data[Enums.UNITID]].currentNode.unit = null;
                Game.units[data[Enums.UNITID]].currentNode = null;
            }
        }
        actions.endAction(data);
    };

    Actions.prototype.attack = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            if (data[Enums.ACTIONBUBBLE]){
                Game.units[data[Enums.UNITID]].addActionBubble(data[Enums.WEAPON]);
            }
            Game.units[data[Enums.UNITID]].setNewDirection(data[Enums.DIRECTION]);
            data.ticker = 0;
        }
        data.ticker += dt;
        if (data.ticker >= 1.5){
            actions.endAction(data);
        }
    };

    Actions.prototype.noLos = function(dt,actions,data){
        Game.units[data[Enums.UNITID]].addActionBubble('No Line of Sight!');
        actions.endAction(data);
    };

    Actions.prototype.actionBubble = function(dt,actions,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
            Game.units[data[Enums.UNITID]].addActionBubble(data[Enums.TEXT]);
        }
        data.ticker += dt;
        if (data.ticker >= 1.5){
            actions.endAction(data);
        }
    };
    Actions.prototype.dmgText = function(dt,actions,data){
        console.log(data);
        if (data[Enums.OWNERONLY] && Game.units[data[Enums.UNITID]].owner != mainObj.playerID){
            console.log('END')
            actions.endAction(data);
        }
        if (typeof Game.units[data[Enums.UNITID]] == 'undefined'){
            actions.endAction(data);
        }
        var unit = Game.units[data[Enums.UNITID]];
        unit.addDmgText(data[Enums.TEXT],data[Enums.TYPE]);
        var resetIP = false;
        if (typeof data[Enums.CURRENTHEALTH] != 'undefined'){
            unit.currentHealth = data[Enums.CURRENTHEALTH];
            resetIP = true;
        }
        if (typeof data[Enums.CURRENTSHIELDS] != 'undefined'){
            unit.currentShields = data[Enums.CURRENTSHIELDS];
            resetIP = true;
        }
        if (data[Enums.DEAD] && typeof data[Enums.DEAD] != 'undefined'){
            unit.currentNode.unit = null;
            unit.setDead();
            unit.dead = true;
            resetIP = true;
        }else if (typeof data[Enums.FAINTED] != 'undefined'){
            unit.setFainted(data[Enums.FAINTED]);
            resetIP = true;
        }
        if (resetIP){
            unit.infoPane = Game.getUnitInfoPane(data[Enums.UNITID]);
        }
        actions.endAction(data);
    };
    Actions.prototype.actionUsed = function(dt,actions,data){
        Game.units[data[Enums.UNITID]].actionUsed = true;
        actions.endAction(data);
    };
    Actions.prototype.setEnergy = function(dt,actions,data){
        Game.units[data[Enums.UNITID]].currentEnergy = data[Enums.VALUE];
        Game.units[data[Enums.UNITID]].infoPane = Game.getUnitInfoPane(data[Enums.UNITID]);
        actions.endAction(data);
    };

    window.Actions = Actions;
})(window);
