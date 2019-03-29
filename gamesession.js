//----------------------------------------------------------------
//gamesession.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Actions = require('./actions.js').Actions,
    Buff = require('./buff.js').Buff,
    HexMap = require('./hexmap.js').HexMap,
    ENUMS = require('./enums.js').Enums;

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var GameSession = function (engine) {
    this.engine = engine;
    this.cEnums = this.engine.clientDataEnums;
    this.players = {};
    this.playerCount = 0;
    this.id = null;
    this.mapName = 'bunker01';
    this.map = null;
    this.mapData = null;

    this.allUnits = {};
    this.turnOrder = [];
    this.chargeMax = 1000000;
    //variables for ID's
    this.idIterator = 0;
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz";

    this.currentState = 'preGame';
    this.gameStates = {
        PreGame: 'preGame',
        InGame: 'inGame',
        PostGame: 'postGame'
    };

    this.currentInGameState = 'betweenTurns';
    this.inGameStates = {
        WaitingForTurnInfo: 'waitingForTurnInfo',
        WaitingForReactionInfo: 'waitingForReactionInfo',
        BetweenTurns: 'betweenTurns'
    };

    this.gameHasStarted = false;

    this.ticker = 0;
    this.timePerTurn = 60; //1 minute turns?
    this.timeInBetweenTurns = 1.5;

    this.reactionTicker = 0;
    this.timePerReaction = 30;
    this.letters = {};
    this.numbers = {};
    this.operators = {};

    this.moveChargePercent = 0.35;
    this.actionChargePercent = 0.35;
    this.waitChargePercent = 0.3;

    this.clientActionEnums = {
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
    }
};

GameSession.prototype.init = function (data) {
    this.id = data.sid;
    this.map = new HexMap(this);
    var names = ['tri1','throne','arena', 'ice_ravine'];
    //for (var i in this.engine.maps){
    //    names.push(i);
    //}
    var name = names[Math.floor(Math.random()*names.length)];
    //var name = 'hugeHex';
    //name = this.mapName;
    this.mapData = this.engine.maps[name];
    this.map.init(this.engine.maps[name]);
    this.mapData = this.map.getClientData();
    var n = '1234567890';
    var l = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var o = '+-/*';
    for (var i = 0; i < n.length;i++){
        this.numbers[n.charAt(i)] = true;
    }
    for (var i = 0; i < l.length;i++){
        this.letters[l.charAt(i)] = true;
    }
    for (var i = 0; i < o.length;i++){
        this.operators[o.charAt(i)] = true;
    }

};


GameSession.prototype.tick = function(deltaTime) {
    this.deltaTime = deltaTime;

    switch(this.currentState){
        case this.gameStates.PreGame:
            this.tickPreGame(deltaTime);
            break;
        case this.gameStates.InGame:
            this.tickInGame(deltaTime);
            break;
        case this.gameStates.PostGame:
            this.tickPostGame(deltaTime);
            break;
    }

    this.emit();
    this.clearQueue();
}

GameSession.prototype.tickPreGame = function(deltaTime) {

    //check if both players are ready then change state
    var playersReady = 0
    for (var player in this.players){
        if (this.players[player].ready){
            playersReady += 1;
        }
    }

    if (playersReady == this.playerCount){
        console.log('Players ready - initializing game');
        
        for (var i in this.allUnits){
            this.allUnits[i].reset();
        }
        //this.getUnitsNotInLos();
        this.getTurnOrder();

        //send down unit info
        for (var p in this.players){
            var player = this.players[p];
            player.identifiedUnits = {};
            var cData = {};
            cData[ENUMS.MYUNITS] = [];
            cData[ENUMS.OTHERUNITS] = [];
            cData[ENUMS.TURNLIST] = [];
            cData[ENUMS.TURNPERCENT] = [];
            for (var i in this.allUnits){
                var unit = this.allUnits[i];
                if (player.myUnits[unit.id]){
                    cData[ENUMS.MYUNITS].push(unit.getClientData());
                }else{
                    if (player.unitsNotInLos[i] != true){
                        cData[ENUMS.OTHERUNITS].push(unit.getLessClientData());
                    }else{
                        cData[ENUMS.OTHERUNITS].push(unit.getLessClientData(true));
                    }
                }
            }
            for (var i = 0; i < this.turnOrder.length;i++){
                cData[ENUMS.TURNLIST].push(this.turnOrder[i].id);
                cData[ENUMS.TURNPERCENT].push(this.allUnits[this.turnOrder[i].id].charge);
            }
            this.queuePlayer(player,ENUMS.UNITINFO,cData);
        }
        this.ticker = 0;
        this.currentState = this.gameStates.InGame;
    }
}

GameSession.prototype.tickInGame = function(deltaTime) {
    if (!this.gameHasStarted){
        var cData = {};
        cData[ENUMS.DELAY] = this.timeInBetweenTurns;
        cData[ENUMS.TIMEPERTURN] = this.timePerTurn;
        this.queueData(ENUMS.STARTGAME,cData);
        this.gameHasStarted = true;
        return;
    }
    switch(this.currentInGameState){
        case this.inGameStates.WaitingForTurnInfo:
            this.ticker += deltaTime;
            if (this.ticker >= this.timePerTurn){
                this.ticker = 0;
                this.allUnits[this.turnOrder[0].id].endTurn();
                //process turn and get new Turn order
                this.currentInGameState = this.inGameStates.BetweenTurns;
                //first unit has completed the turn??
                if (this.allUnits[this.turnOrder[0].id].moveUsed){ 
                    this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax*this.moveChargePercent;
                    this.allUnits[this.turnOrder[0].id].moveUsed = false;
                }
                if (this.allUnits[this.turnOrder[0].id].actionUsed){
                    this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax*this.actionChargePercent;
                    this.allUnits[this.turnOrder[0].id].actionUsed = false;
                }
                this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax*this.waitChargePercent;
                this.getTurnOrder();
                var turnList = [];
                var turnPercent = [];
                for (var i = 0; i < this.turnOrder.length;i++){
                    turnList.push(this.turnOrder[i].id);
                    turnPercent.push(this.allUnits[this.turnOrder[i].id].charge);
                }
                var cData2 = {};
                cData2[ENUMS.TURNLIST] = turnList;
                cData2[ENUMS.TURNPERCENT] = turnPercent;
                this.queueData(ENUMS.NEWTURNORDER,cData2);
            }
            break;
        case this.inGameStates.WaitingForReactionInfo:
            break;
        case this.inGameStates.BetweenTurns:
            this.ticker += deltaTime;
            if (this.ticker >= this.timeInBetweenTurns){
                this.ticker = 0;
                this.currentInGameState = this.inGameStates.WaitingForTurnInfo;
            }
            break;


    }
}

GameSession.prototype.tickPostGame = function(deltaTime) {
    
}

GameSession.prototype.getId = function() {
    var id = this.idIterator + 'x';
    for(var i=0; i<3; i++){
        id += this.possibleIDChars.charAt(Math.floor(Math.random() * this.possibleIDChars.length));
    }
    this.idIterator += 1;
    return id;
}

GameSession.prototype.addPlayer = function(p) {
    this.players[p.id] = p;
    p.setGameSession(this);
    this.playerCount += 1;
}

GameSession.prototype.removePlayer = function(p) {
    p.setGameSession(null);
    delete this.players[p.id];
    this.playerCount -= 1;
}

GameSession.prototype.gameStart = function(){
    console.log("Game " + this.id + ' started');
    //set up units in the map

    //for now just randomize the units and positions
    var sz = 1;
    var used = {};
    for (var p in this.players){
        var player = this.players[p];
        player.identifiedUnits = {};
        player.myUnits = {};
        this.queuePlayer(player,ENUMS.MAPINFO, this.mapData);
        for (var i = 0; i < 5;i++){
            var uid = player.user.characters[i].id;
            this.allUnits[uid] = player.user.characters[i];
            player.myUnits[uid] = this.allUnits[uid];
            //init unit health/etc
            this.allUnits[uid].reset();
            //set position on the map
            var haveNode = false;
            var node;
            while(!haveNode){
                node = this.map['startZone' + sz][Math.floor(Math.random()*this.map['startZone' + sz].length)];
                if (!used[node.nodeid]){
                    used[node.nodeid] = 1;
                    node.unit = this.allUnits[uid];
                    this.allUnits[uid].currentNode = node;
                    haveNode = true;
                }
            }
            this.allUnits[uid].direction = this.map.cardinalDirections[Math.floor(Math.random()*this.map.cardinalDirections.length)];
        }
        sz += 1;
    }
    
}

GameSession.prototype.turnSort = function(arr){
    if (arr.length <=1){
        return arr;
    }
    var smaller = [];
    var larger = [];
    var pivotArr = [arr[0]];
    var pivot = arr[0].val;
    for (var x = 1;x < arr.length;x++){
        if (arr[x].val < pivot){
            smaller.push(arr[x]);
        }else if (arr[x].val > pivot){
            larger.push(arr[x]);
        }else{
            //values are equal, randomize turn position in pivot array (TODO -- or go by some other metric?)
            if (Math.round(Math.random())){
                pivotArr.push(arr[x]);

                this.allUnits[arr[x].id].charge -= 1;
            }else{
                pivotArr.splice(0,0,arr[x]);
                this.allUnits[arr[x].id].charge += 1;
            }
        }
    }
    smaller = this.turnSort(smaller);
    larger = this.turnSort(larger);
    smaller = smaller.concat(pivotArr);
    
    return smaller.concat(larger);
}
GameSession.prototype.getTurnOrder = function(){
    //new turn
    this.turnOrder = [];
    for (var i in this.allUnits){
        var unit = this.allUnits[i];
        if (unit.dead || unit.fainted){continue;}
        if (unit.isCastTimer){
            this.turnOrder.push({val: (this.chargeMax-unit.charge)/unit.speed, id: unit.id});
        }else{
            this.turnOrder.push({val: (this.chargeMax-unit.charge)/unit.speed.value, id: unit.id});
        }
    }
    this.turnOrder = this.turnSort(this.turnOrder);

    for (var i in this.allUnits){
        var unit = this.allUnits[i];
        if (unit.dead || unit.fainted){continue;}
        if (unit.isCastTimer){
            unit.charge += Math.round(this.turnOrder[0].val)*unit.speed;
        }else{
            unit.charge += Math.round(this.turnOrder[0].val)*unit.speed.value;
        }
    }
    //now check if the new turn is a cast time
    if (this.allUnits[this.turnOrder[0].id].isCastTimer){
        var abl = this.allUnits[this.turnOrder[0].id];
        //Do the ability!!
        abl.data[ENUMS.ACTIONDATA] = [];
        this.allUnits[abl.unitid].removeBuffsWithTag('removeOnAction');
        var aFunc = Actions.getAbility(abl.abilityData.id);
        aFunc(this.allUnits[abl.unitid],this,abl.data);
        var cData = {};
        cData[ENUMS.ACTIONDATA] = abl.data[ENUMS.ACTIONDATA];
        this.queueData(ENUMS.ACTION,cData);
        var cData2 = {};
        cData2[ENUMS.UNITID] = this.turnOrder[0].id;
        this.queueData(ENUMS.REMOVEUNIT,cData2);
        this.allUnits[abl.unitid].casting = null;
        delete this.allUnits[this.turnOrder[0].id];
        this.getTurnOrder();
    }else if (this.allUnits[this.turnOrder[0].id].ai){
        //ai stuff...
        var actionData = [];
        var unit = this.allUnits[this.turnOrder[0].id];
        var aiFunc = UnitAI.getAction(unit.aiInfo.id);
        actionData = aiFunc(unit,this,unit.aiInfo,actionData);
        if (!actionData){
            console.log('ai failed');
            return;
        }
        var cData = {};
        cData[ENUMS.ACTIONDATA] = actionData;
        this.queueData(ENUMS.ACTION,cData);
        this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax;
        this.getTurnOrder();
    }else if (this.turnOrder.length && typeof this.allUnits[this.turnOrder[0].id] != 'undefined'){
        this.allUnits[this.turnOrder[0].id].setMoveLeft(this.allUnits[this.turnOrder[0].id].move.value);
    }
}

GameSession.prototype.getUnitsNotInLos = function(){
    for (var i in this.players){
        this.players[i].getUnitsNotInLos();
    }
}

////////////////////////////////////////////////////////////////
//                  Unit Turn Functions                        /
////////////////////////////////////////////////////////////////

GameSession.prototype.executeMove = function(data){
    data.moveUsed = 0;
    for (var i = 0; i < data.path.length;i++){
        var a = this.map.getAxial(data.path[i]);
        if (a.unit){
            if (a.unit.hidden && a.unit.owner != data.unit.owner){
                //hidden unit!
                data.path = data.path.slice(0,i);
                var keepGoing = true;
                a.unit.removeBuffsWithTag('removeOnContact');
                while(keepGoing){
                    if (data.path.length <=1){
                        return;
                    }else if (data.path[data.path.length-1].unit){
                        data.path.pop();
                    }else{
                        keepGoing = false;
                    }
                }
            }
        }
    }
    var stopped = false;
    for (var i = 1; i < data.path.length;i++){
        if (data.isAMove){
            data.unit.moveUsed = true;
            if (data.unit.moveLeft <= 0){
                //the unit is out of moves
                data.unit.newNode(this.map.getAxial(data.path[i-1]));
                stopped = true;
                break;
            }
        }
        var nextNode = data.path[i];
        //TODO check reactions for each moved node?

        //set the new node for the unit
        var dir = this.map.getNewDirectionCube(data.path[i-1],data.path[i]);
        if (dir){
            data.unit.direction = this.map.cardinalDirections[dir];
        }
        var cData = {};
        cData[ENUMS.ACTION] = ENUMS.MOVE;
        cData[ENUMS.UNITID] = data.unit.id;
        cData[ENUMS.X] = data.path[i].x;
        cData[ENUMS.Y] = data.path[i].y;
        cData[ENUMS.Z] = data.path[i].z;
        cData[ENUMS.REDUCELEFT] = data.isAMove;
        data[ENUMS.ACTIONDATA].push(cData);
        if (data.isAMove){
            data.moveUsed += 1;
        }
    }
    if (!stopped){
        data.unit.newNode(this.map.getAxial(data.path[data.path.length-1]));
    }
    //this.getUnitsNotInLos();
    return data;
}
GameSession.prototype.unitMove = function(data){
    data.unit = this.allUnits[this.turnOrder[0].id];
    if (data.unit.fainted || data.unit.dead){
        return;
    }
    var player = data.unit.owner.id;
    var enemyPlayer;
    for (var playerid in this.players){
        if (playerid != player){
            enemyPlayer = playerid;
        }
    }
    data[ENUMS.ACTIONDATA] = [];
    var enemyPlayerData = [];
    var endingNode = this.map.getCube(data);
    data.path = this.map.findPath(this.map.getCube(data.unit.currentNode),endingNode,{startingUnit: data.unit,maxJump:data.unit.jump.value});
    data.isAMove = true;
    data = this.executeMove(data);
    data.unit.moveLeft -= data.moveUsed;
    //send down the action info to all players in the battle
    var cData = {};
    cData[ENUMS.ACTIONDATA] = data[ENUMS.ACTIONDATA];
    if (data.unit.hidden){
        //unless the unit is hidden
        for (var i in this.players){
            if (i == player){
                this.queuePlayer(this.players[i],ENUMS.ACTION,cData);
            }
        }
    }else{
        this.queueData(ENUMS.ACTION,cData);
    }
}
GameSession.prototype.executeAttack = function(data){
    data.unit = this.allUnits[this.turnOrder[0].id];
    if (data.unit.actionUsed || data.unit.fainted || data.unit.dead){return false;}
    data.node = this.map.axialMap[data.q][data.r];
    if (!data.node.unit){return false;} //node doesnt have a unit? (some weapons might ignore this?)
    data.weapon = data.unit.getWeapon();
    var validNodes = data.weapon.getWeaponNodes(this.map,data.unit.currentNode);
    //check if the node is a valid node
    var valid = false;
    var losMod = 1.0;
    for (var i = 0; i < validNodes.length;i++){
        if (validNodes[i].q == data.node.q && validNodes[i].r == data.node.r){
            //check LOS
            var los = this.map.getLOS(data.unit.currentNode,data.node);
            if (los[1]){
                // Hits another unit!!
                data.node = this.allUnits[los[1]].currentNode;
            }
            if (los[0] == 'full'){
                valid = true;
            }else if (los[0] == 'partial'){
                var cData = {};
                cData[ENUMS.ACTION] = ENUMS.DAMAGTEXT;
                cData[ENUMS.UNITID] = data.node.unit.id
                cData[ENUMS.TEXT] = 'Partial LOS'
                data[ENUMS.ACTIONDATA].push(cData);
                valid = true;
                losMod = 0.5;
            }else if (los[0] == 'none'){
                valid = false
                var cData = {};
                cData[ENUMS.ACTIONDATA] = [{}];
                cData[ENUMS.ACTIONDATA][0][ENUMS.ACTION] = ENUMS.NOLOS;
                cData[ENUMS.ACTIONDATA][0][ENUMS.UNITID] = data.unit.id;
                this.queueData(ENUMS.ACTION,cData);
            }
        }
    }
    if (!valid){
        return false;
    }
    if (data.unit.hidden){
        data[ENUMS.ACTIONDATA] = data.node.unit.damage(data.weapon.eqData.damageType,Math.round(30*(1+data.unit.tactics.value/100)),data[ENUMS.ACTIONDATA]);
    }
    data.unit.removeBuffsWithTag('removeOnAction');
    //TODO check for pre-attack reactions

    //get directional mod
    data.d = this.map.getDMod(data.unit.currentNode,data.node);
    var tMod = 1.0;
    if (data.weapon.type == 'gun'){
        tMod += data.unit.skill.value/100;
    }else if (data.weapon.type == 'weapon'){
        tMod += data.unit.power.value/100;
    }
    //execute attack
    for (var i = 0; i < data.unit.onAttack.length;i++){
        var aFunc = Actions.getAction(data.unit.onAttack[i].action);
        data.unit.onAttack[i].target = data.node.unit;
        aFunc(data.unit,data.unit.onAttack[i]);
    }
    data[ENUMS.ACTIONDATA] = data.node.unit.damage(data.weapon.eqData.damageType,Math.round((data.weapon.eqData.damage*tMod)*losMod*data.d.dMod*data.ablMod),data[ENUMS.ACTIONDATA]);
    return data;
}
GameSession.prototype.unitAttack = function(data){
    data[ENUMS.ACTIONDATA] = [];
    data.ablMod = 1.0;
    data = this.executeAttack(data);
    if (!data){return;}
    var cData = {};
    cData[ENUMS.ACTION] = ENUMS.ATTACK;
    cData[ENUMS.UNITID] = data.unit.id;
    cData[ENUMS.WEAPON] = data.weapon.name;
    cData[ENUMS.DIRECTION] = data.d.newDir;
    data[ENUMS.ACTIONDATA].splice(0,0,cData);
    //TODO check for post-attack reactions
    data.unit.actionUsed = true;
    var cData2 = {};
    cData2[ENUMS.ACTION] = ENUMS.ACTIONUSED;
    cData2[ENUMS.UNITID] = data.unit.id;
    data[ENUMS.ACTIONDATA].push(cData2);

    var apamt = data.unit.addAp({classid: data.unit.classInfo.currentClass});
    var cData3 = {};
    cData3[ENUMS.ACTION] = ENUMS.DAMAGETEXT;
    cData3[ENUMS.UNITID] = data.unit.id;
    cData3[ENUMS.TEXT] = '+' + apamt + ' AP';
    cData3[ENUMS.OWNERONLY] = true;

    data[ENUMS.ACTIONDATA].push(cData3);
    //send down action data
    cData4 = {};
    cData4[ENUMS.ACTIONDATA] = data[ENUMS.ACTIONDATA];
    this.queueData(ENUMS.ACTION,cData4);
}
                      
GameSession.prototype.unitAbility = function(data){
    //check if ability is valid and execute
    var unit = this.allUnits[this.turnOrder[0].id];
    data.unit = unit;
    if (unit.actionUsed || unit.fainted || unit.dead){return;}
    data.ability = unit.getAbility(data.abilityid);
    var player = unit.owner.id;
    var node = this.map.axialMap[data.q][data.r];
    data[ENUMS.ACTIONDATA] = [];
    data.ablMod = 1.0;
    switch(data.ability.range){
        case 'self':
            //this should pop up a confirm window immediately?
            possibleNodes = [unit.currentNode];
            break;
        case 'melee':
            var weapon = unit.getWeapon();
            if (weapon.type == 'gun'){
                return;
            }
            possibleNodes = weapon.getWeaponNodes(this.map,unit.currentNode);
            break;
        case 'ranged':
            var weapon = unit.getWeapon();
            if (weapon.type == 'weapon'){
                return;
            }
            possibleNodes = weapon.getWeaponNodes(this.map,unit.currentNode);
            break;
        case 'weapon':
            var weapon = unit.getWeapon();
            possibleNodes = weapon.getWeaponNodes(this.map,unit.currentNode);
            break;
        default:
            //range is a special string, parse for ability distance
            var range = this.parseRange(unit,data.ability.range);
            possibleNodes = this.map.cubeSpiral(this.map.getCube(unit.currentNode),range.d);
            for (var i = 0; i < possibleNodes.length;i++){
                if (data.ability.projectile){
                    if (possibleNodes[i].h - unit.currentNode.h > range.h || (unit.currentNode == possibleNodes[i] && !range.s)){
                        possibleNodes.splice(i,1);
                        i -= 1;
                    }
                }else{
                    if (Math.abs(unit.currentNode.h - possibleNodes[i].h) > range.h || (unit.currentNode == possibleNodes[i] && !range.s)){
                        possibleNodes.splice(i,1);
                        i -= 1;
                    }
                }
            }
            break;
    }
    var gotNode = false;
    for (var i = 0; i < possibleNodes.length;i++){
        if (possibleNodes[i].q == node.q && possibleNodes[i].r == node.r){
            //node is valid!
            //execute the ability!!
            if (node.unit){
                data.target = node.unit;
            }
            gotNode = true;
            var energy = this.parseStringCode(unit,data.ability.eCost);
            if (unit.currentEnergy >= energy){
                unit.currentEnergy -= energy;
                var cData = {};
                cData[ENUMS.ACTION] = ENUMS.SETENERGY;
                cData[ENUMS.UNITID] = unit.id;
                cData[ENUMS.VALUE] = unit.currentEnergy;
                data[ENUMS.ACTIONDATA].push(cData);
            }else{
                var cData = {};
                cData[ENUMS.ACTIONDATA] = [{}];
                cData[ENUMS.ACTIONDATA][0][ENUMS.ACTION] = ENUMS.SETENERGY;
                cData[ENUMS.ACTIONDATA][0][ENUMS.UNITID] = unit.id;
                cData[ENUMS.ACTIONDATA][0][ENUMS.TEXT] = 'Not enough energy';
                this.queuePlayer(unit.owner,ENUMS.ACTION,cData);
                return;
            }
            if (typeof data.ability.speed == 'undefined' || data.ability.speed == 'instant'){
                unit.removeBuffsWithTag('removeOnAction');
                var aFunc = Actions.getAbility(data.ability.id);
                var success = aFunc(unit,this,data);
                if (!success){
                    unit.currentEnergy += energy;
                    var cData = {};
                    cData[ENUMS.ACTIONDATA] = [{}];
                    cData[ENUMS.ACTIONDATA][0][ENUMS.ACTION] = ENUMS.DAMAGETEXT;
                    cData[ENUMS.ACTIONDATA][0][ENUMS.UNITID] = unit.id;
                    cData[ENUMS.ACTIONDATA][0][ENUMS.TEXT] = 'Action failed';
                    this.queuePlayer(unit.owner,ENUMS.ACTION,cData);
                    return;
                }
            }else{
                //The ability has a cast time
                //add cast time to the turn order and start casting!
                var speed = Math.round((unit.speed.value + this.parseStringCode(unit,data.ability.speed)) * unit.castingSpeedMod.value);
                console.log('Cast speed: ' + speed);
                abData = {
                    id: this.engine.getId(),
                    isCastTimer: true,
                    abilityData: data.ability,
                    unitid: unit.id,
                    data: data,
                    speed: speed,
                    charge: 0
                }
                this.allUnits[abData.id] = abData;
                unit.casting = abData.id;
                var cData = {};
                cData[ENUMS.ABILITYID] = abData.id;
                cData[ENUMS.ISCASTTIMER] = true;
                cData[ENUMS.UNIT] = unit.id;
                cData[ENUMS.ID] = abData.id;
                cData[ENUMS.NAME] = data.ability.name;
                cData[ENUMS.SPEED] = speed;
                cData[ENUMS.CHARGE] = 0;
                this.queueData(ENUMS.ADDCASTTIMER,cData);

                var cData2 = {};
                cData2[ENUMS.ACTION] = ENUMS.DAMAGETEXT;
                cData2[ENUMS.UNITID] = unit.id;
                cData2[ENUMS.TEXT] = 'casting...';
                data[ENUMS.ACTIONDATA].push(cData2);
            }
        }
    }
    if (!gotNode){
        var cData3 = {};
        cData3[ENUMS.ACTION] = ENUMS.DAMAGETEXT;
        cData3[ENUMS.UNITID] = unit.id;
        cData3[ENUMS.TEXT] = 'get node failed...';
        data[ENUMS.ACTIONDATA].push(cData3);
        var cData4 = {};
        cData4[ENUMS.ACTIONDATA] = data[ENUMS.ACTIONDATA];
        this.queuePlayer(unit.owner,ENUMS.ACTION,cData4);
        return;
    }
    var apamt = data.unit.addAp({classid: data.unit.classInfo.currentClass,mod: 1.5});
    var cData5 = {};
    cData5[ENUMS.ACTION] = ENUMS.DAMAGETEXT;
    cData5[ENUMS.UNITID] = unit.id;
    cData5[ENUMS.TEXT] = '+' + apamt + ' AP';
    cData5[ENUMS.OWNERONLY] = true;
    data[ENUMS.ACTIONDATA].push(cData5);
    data.unit.actionUsed = true;

    var cData6 = {};
    cData6[ENUMS.ACTION] = ENUMS.ACTIONUSED;
    cData6[ENUMS.UNITID] = unit.id;
    data[ENUMS.ACTIONDATA].push(cData6);

    var cData7 = {};
    cData7[ENUMS.ACTIONDATA] = data[ENUMS.ACTIONDATA];
    this.queuePlayer(unit.owner,ENUMS.ACTION,cData7);
}
                       
GameSession.prototype.unitItem = function(data){

}
                      
GameSession.prototype.unitEnd = function(data){
    var unit = this.allUnits[this.turnOrder[0].id];
    if (unit.fainted || unit.dead){return;}
    var player = unit.owner.id;
    var enemyPlayer;
    //check correct facing
    var valid = false;
    for(var i = 0; i < this.map.cardinalDirections.length;i++){
        if (this.map.cardinalDirections[i] == data.direction){
            valid = true;
            unit.direction = data.direction;
        }
    }
    if (!valid){return;}
    unit.endTurn();
    var actionData = [{}];
    actionData[0][ENUMS.ACTION] = ENUMS.FACE;
    actionData[0][ENUMS.UNITID] = unit.id;
    actionData[0][ENUMS.DIRECTION] = unit.direction;
    if (this.currentInGameState == this.inGameStates.WaitingForTurnInfo){
        this.ticker = this.timePerTurn;
    }
    //send down the action info to all players in the battle//send down the action info to all players in the battle
    var cData = {};
    cData[ENUMS.ACTIONDATA] = actionData;
    if (unit.hidden){
        //unless the unit is hidden
        for (var i in this.players){
            if (i == player){
                this.queuePlayer(this.players[i],ENUMS.ACTION,cData);
            }
        }
    }else{
        this.queueData(ENUMS.ACTION,cData);
    }
}

GameSession.prototype.parseRange = function(unit,range){
    var results = {
        d: 0, //distance
        h: 0, //height
        s: false //self
    };
    if (range.substring(range.length-3,range.length) == '(m)'){
        range = range.substring(0,range.length-3);
    }
    //get distance
    var dString = '';
    var start = 0
    for (var i = start; i < range.length;i++){
        if (range.charAt(i) == ' '){
            continue;
        }else if (range.charAt(i) == '|'){
            start = i+1;
            break;
        }else{
            dString += range.charAt(i);
        }
    }
    //get height
    var hString = '';
    for (var i = start; i < range.length;i++){
        if (range.charAt(i) == ' '){
            continue;
        }else if (range.charAt(i) == '|'){
            start = i+1;
            break;
        }else{
            hString += range.charAt(i);
        }
    }
    //get self?
    var sString = '';
    for (var i = start; i < range.length;i++){
        if (range.charAt(i) == ' '){
            continue;
        }else if (range.charAt(i) == '|'){
            start = i+1;
            break;
        }else{
            sString += range.charAt(i);
        }
    }
    if (sString == 'self'){
        results.s = true;
    }
    results.d = this.parseStringCode(unit,dString);
    results.h = this.parseStringCode(unit,hString);
    return results;
},
GameSession.prototype.parseStringCode = function(unit,code){
    if (typeof code == 'number'){return code;}
    if (code.charAt(0) != '<'){return parseInt(code);}
    _code = code.substring(1,code.length-1);
    var cArr = [];
    //seperate the code into numbers,operators, and attr codes
    var currentType = this.getType(_code.charAt(0));
    var str = '';
    var percent = false;
    if (_code.charAt(_code.length-1) == '%'){
        percent = true;
        //code is an energy percentile
        _code = _code.substring(0,_code.length-1);
    }
    for (var i = 0; i < _code.length;i++){
        if (this.getType(_code.charAt(i)) == currentType){
            str += _code.charAt(i);
        }else{
            if (currentType == 'a'){
                cArr.push(this.getAttr(unit,str));
            }else if (currentType == 'n'){
                cArr.push(parseInt(str));
            }else{
                cArr.push(str);
            }
            str = _code.charAt(i);
            currentType = this.getType(_code.charAt(i));
        }
    }
    if (currentType == 'a'){
        cArr.push(this.getAttr(unit,str));
    }else if (currentType == 'n'){
        cArr.push(parseInt(str));
    }else{
        cArr.push(str);
    }
    for (var i = 0; i < cArr.length;i++){
        if (cArr[i] == '*'){
            var n = cArr[i-1] * cArr[i+1];
            cArr.splice(i-1,3,n);
            i-=1;
        }
    }
    for (var i = 0; i < cArr.length;i++){
        if (cArr[i] == '/'){
            var n = Math.floor(cArr[i-1] / cArr[i+1]);
            cArr.splice(i-1,3,n);
            i-=1;
        }
    }
    for (var i = 0; i < cArr.length;i++){
        if (cArr[i] == '+'){
            var n = cArr[i-1] + cArr[i+1];
            cArr.splice(i-1,3,n);
            i-=1;
        }
        if (cArr[i] == '-'){
            var n = cArr[i-1] - cArr[i+1];
            cArr.splice(i-1,3,n);
            i-=1;
        }
    }
    if (percent){
        return Math.ceil(unit.currentEnergy * (cArr[0]/100));
    }
    return(cArr[0]);   
};
GameSession.prototype.getAttr = function(unit,str){
    switch(str){
        case 'MOV':
            return unit.move.value;
            break;
        case 'JMP':
            return unit.jump.value;
            break;
        case 'SPD':
            return unit.speed.value;
            break;
        case 'STR':
            return unit.strength.value;
            break;
        case 'END':
            return unit.endurance.value;
            break;
        case 'DEX':
            return unit.dexterity.value;
            break;
        case 'AGI':
            return unit.agility.value;
            break;
        case 'INT':
            return unit.intelligence.value;
            break;
        case 'WIL':
            return unit.willpower.value;
            break;
        case 'CHA':
            return unit.charisma.value;
            break;
        default:
            console.log("Unable to find attr string");
            return 0;
    }
};
GameSession.prototype.getType = function(char){
    if (this.letters[char]){return 'a';}
    if (this.numbers[char]){return 'n';}
    if (this.operators[char]){return 'o';}
    console.log("ERROR @ session.getType");
    console.log(char);
    return null;
};
GameSession.prototype.checkEnd = function(){
    var playerStatus = {};
    var playerIndex = [];
    var gameEnded = false;
    for (var i in this.players){
        var playerHasActiveUnit = false;
        playerIndex.push(i);
        var p = this.players[i];
        for (var j in this.allUnits){
            var unit = this.allUnits[j];
            if (unit.owner.id == p.id && (!unit.dead && !unit.fainted)){
                playerHasActiveUnit = true;
            }
        }
        if (playerHasActiveUnit){
            playerStatus[i] = true;
        }else{
            gameEnded = true;
            playerStatus[i] = false;
        }
    }
    if (gameEnded){
        for (var i in playerStatus){
            var data = {};
            data[ENUMS.WON] = playerStatus[i];
            this.queuePlayer(this.players[i],ENUMS.ENDGAME,data);
            this.engine.leaveSession(this.id,this.players[i]);
        }
        this.engine.removeSession(this.id);
    }
}
////////////////////////////////////////////////////////////////
//                  Socket Functions
////////////////////////////////////////////////////////////////

GameSession.prototype.handleDisconnect = function(p,toEngine){
    //remove players and delete session
    console.log("Game " + this.id + ' has ended');
    for (var i in this.players){
        var data = {};
        data[ENUMS.WON] = true;
        this.queuePlayer(this.players[i],ENUMS.ENDGAME,data);
        //remove players from session and back to engine (except disconnected player)
        if (!(p.id == i && !toEngine)){
            this.engine.leaveSession(this.id,this.players[i]);
        }
    }
    this.engine.removeSession(this.id);
}
//Queue data to all players in the session
GameSession.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    for(var i in this.players) {
        this.players[i].netQueue.push(data);
    }
}

GameSession.prototype.queueActionData = function(c, d) {
    //check each action data to see if the player has LOS of the action when it occurs
    var data = { call: c, data: d};
    for(var i in this.players) {

        this.players[i].netQueue.push(data);
    }
}

//Queue data to a specific player
GameSession.prototype.queuePlayer = function(player, c, d) {
    var data = { call: c, data: d};
    player.netQueue.push(data);
}

//Queue data to all players that have identified a particular unit
GameSession.prototype.queueDataIfIdentified = function( c, d) {
    var data = { call: c, data: d};
    var unit = this.allUnits[d[ENUMS.UNITID]];
    for(var i in this.players) {
        unit.owner == this.players[i]
        if (unit.owner == this.players[i] || this.players[i].identifiedUnits[unit.id]){
            this.players[i].netQueue.push(data);
        }
    }
}

GameSession.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

GameSession.prototype.emit = function() {
    try{
        for(var i in this.players) {
            if (this.players[i].netQueue.length > 0){
                this.players[i].socket.emit(ENUMS.SERVERUPDATE, this.players[i].netQueue);
            }
        }
    }catch(e){
        try{
            console.log(this.players[i].netQueue);
        }catch(e){}
        console.log(e);
        console.log(i);
    }
}


exports.GameSession = GameSession;
