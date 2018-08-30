//----------------------------------------------------------------
//gamesession.js
//----------------------------------------------------------------

var Player = require('./player.js').Player,
    Actions = require('./actions.js').Actions,
    HexMap = require('./hexmap.js').HexMap;

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var GameSession = function (engine) {
    this.gameEngine = engine;
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
    }

    this.currentInGameState = 'betweenTurns';
    this.inGameStates = {
        WaitingForTurnInfo: 'waitingForTurnInfo',
        WaitingForReactionInfo: 'waitingForReactionInfo',
        BetweenTurns: 'betweenTurns'
    }

    this.gameHasStarted = false;

    this.ticker = 0;
    this.timePerTurn = 60; //1 minute turns?
    this.timeInBetweenTurns = 1.5;

    this.reactionTicker = 0;
    this.timePerReaction = 30;
    this.letters = {};
    this.numbers = {};
    this.operators = {};

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
        SetEnergy: 'setEnergy'
    }
};

GameSession.prototype.init = function (data) {
    this.id = data.sid;
    this.map = new HexMap(this);
    var names = [];
    for (var i in this.gameEngine.maps){
        names.push(i);
    }
    var name = 'testMap';//names[Math.floor(Math.random()*names.length)];
    //name = this.mapName;
    this.mapData = this.gameEngine.maps[name];
    this.map.init(this.gameEngine.maps[name]);
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
        this.getTurnOrder();

        //send down unit info
        for (var p in this.players){
            var player = this.players[p];
            var myUnits = [];
            var otherUnits = [];
            var turnList = [];
            var turnPercent = [];
            
            for (var i in this.allUnits){
                var unit = this.allUnits[i];
                if (player.myUnits[unit.id]){
                    myUnits.push(unit.getClientData());
                }else{
                    var data = unit.getLessClientData();
                    otherUnits.push(data);
                }
            }
            for (var i = 0; i < this.turnOrder.length;i++){
                turnList.push(this.turnOrder[i].id);
                turnPercent.push(this.allUnits[this.turnOrder[i].id].charge);
            }
            this.queuePlayer(player,'unitInfo',{myUnits: myUnits,otherUnits: otherUnits,turnList: turnList,turnPercent:turnPercent});
        }
        this.ticker = 0;
        this.currentState = this.gameStates.InGame;
    }
}

GameSession.prototype.tickInGame = function(deltaTime) {
    if (!this.gameHasStarted){
        this.queueData('startGame',{delay: this.timeInBetweenTurns,timePerTurn: this.timePerTurn,timePerReaction: this.timePerReaction});
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
                    this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax/4;
                    this.allUnits[this.turnOrder[0].id].moveUsed = false;
                }
                if (this.allUnits[this.turnOrder[0].id].actionUsed){
                    this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax/4;
                    this.allUnits[this.turnOrder[0].id].actionUsed = false;
                }
                this.allUnits[this.turnOrder[0].id].charge -= this.chargeMax/2;
                this.getTurnOrder();
                var turnList = [];
                var turnPercent = [];
                for (var i = 0; i < this.turnOrder.length;i++){
                    turnList.push(this.turnOrder[i].id);
                    turnPercent.push(this.allUnits[this.turnOrder[i].id].charge);
                }
                this.queueData('newTurnOrder',{turnList:turnList,turnPercent:turnPercent});
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
        this.queuePlayer(player,"mapInfo", {mapData: this.mapData});
        for (var i = 0; i < 5;i++){
            var uid = player.user.characters[i].id;
            this.allUnits[uid] = player.user.characters[i];
            player.myUnits[uid] = uid;
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
                this.allUnits[arr[x].id].charge -= (x*0.001);
            }else{
                pivotArr.splice(0,0,arr[x]);
                this.allUnits[arr[x].id].charge += (x*0.001);
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
    if (this.turnOrder.length && typeof this.allUnits[this.turnOrder[0].id] != 'undefined'){
        if (!this.allUnits[this.turnOrder[0].id].isCastTimer){
            this.allUnits[this.turnOrder[0].id].setMoveLeft(this.allUnits[this.turnOrder[0].id].move.value);
        }
    }
    this.turnOrder = [];
    for (var i in this.allUnits){
        var unit = this.allUnits[i];
        if (unit.dead || unit.fainted){continue;}
        if (unit.isCastTimer){
            this.turnOrder.push({val: Math.ceil((this.chargeMax-unit.charge)/unit.speed), id: unit.id});
        }else{
            this.turnOrder.push({val: Math.ceil((this.chargeMax-unit.charge)/unit.speed.value), id: unit.id});
        }
    }
    this.turnOrder = this.turnSort(this.turnOrder);

    for (var i in this.allUnits){
        var unit = this.allUnits[i];
        if (unit.dead || unit.fainted){continue;}
        if (unit.isCastTimer){
            unit.charge += this.turnOrder[0].val*unit.speed;
        }else{
            unit.charge += this.turnOrder[0].val*unit.speed.value;
        }
    }
    //now check if the new turn is a cast time
    if (this.allUnits[this.turnOrder[0].id].isCastTimer){
        var abl = this.allUnits[this.turnOrder[0].id];
        //Do the ability!!
        abl.data.actionData = [];
        this.allUnits[abl.unitid].removeBuffsWithTag('removeOnAction');
        var aFunc = Actions.getAbility(abl.abilityData.id);
        aFunc(this.allUnits[abl.unitid],this,abl.data);
        this.queueData('action',{actionData:abl.data.actionData});

        this.queueData('removeUnit',{unitid: this.turnOrder[0].id});
        this.allUnits[abl.unitid].casting = null;
        delete this.allUnits[this.turnOrder[0].id];
        this.getTurnOrder();
    }
}

////////////////////////////////////////////////////////////////
//                  Unit Turn Functions                        /
////////////////////////////////////////////////////////////////
GameSession.prototype.unitMove = function(data){
    var unit = this.allUnits[this.turnOrder[0].id];
    if (unit.fainted || unit.dead){
        return;
    }
    var player = unit.owner.id;
    var enemyPlayer;
    for (var playerid in this.players){
        if (playerid != player){
            enemyPlayer = playerid;
        }
    }
    var actionData = [];
    var enemyPlayerData = [];
    var endingNode = this.map.getCube(data);
    var path = this.map.findPath(this.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:unit.jump.value});
    for (var i = 0; i < path.length;i++){
        var a = this.map.getAxial(path[i]);
        if (a.unit){
            if (a.unit.hidden && a.unit.owner != unit.owner){
                //hidden unit!
                path = path.slice(0,i);
                var keepGoing = true;
                a.unit.removeBuffsWithTag('removeOnContact');
                while(keepGoing){
                    if (path.length <=1){
                        return;
                    }else if (path[path.length-1].unit){
                        path.pop();
                    }else{
                        keepGoing = false;
                    }

                }
            }
        }
    }
    var stopped = false;
    for (var i = 1; i < path.length;i++){
        unit.moveUsed = true;
        if (unit.moveLeft <= 0){
            //the unit is out of moves
            unit.newNode(this.map.getAxial(path[i-1]));
            stopped = true;
            break;
        }
        var nextNode = path[i];
        //TODO check reactions for each moved node

        //set the new node for the unit
        var dir = this.map.getNewDirectionCube(path[i-1],path[i]);
        if (dir){
            unit.direction = this.map.cardinalDirections[dir];
        }
        actionData.push({
            action: this.clientActionEnums.Move,
            unitid: unit.id,
            x: path[i].x,
            y: path[i].y,
            z: path[i].z,
        });
        unit.moveLeft -= 1;
    }
    if (!stopped){
        unit.newNode(this.map.getAxial(path[path.length-1]));
    }

    //send down the action info to all players in the battle
    if (unit.hidden){
        //unless the unit is hidden
        for (var i in this.players){
            if (i == player){
                this.queuePlayer(this.players[i],'action',{actionData:actionData});
            }
        }
    }else{
        this.queueData('action',{actionData:actionData});
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
                actionData.push({
                    action: this.clientActionEnums.DmgText,
                    text: 'Partial LOS',
                    unitid: data.node.unit.id
                });
                valid = true;
                losMod = 0.5;
            }else if (los[0] == 'none'){
                valid = false
                actionData.push({
                    action: this.clientActionEnums.NoLos,
                    unitid: data.unit.id
                });
                this.queueData('action',{actionData:actionData});
            }
        }
    }
    if (!valid){
        return false;
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
    data.node.unit.damage(data.weapon.eqData.damageType,Math.round((data.weapon.eqData.damage*tMod)*losMod*data.d.dMod));
    return data;
}
GameSession.prototype.unitAttack = function(data){
    data.actionData = [];
    data = this.executeAttack(data);
    if (!data){return;}
    data.actionData.push({
        action: this.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: data.weapon.name,
        newDir: data.d.newDir,
        unitInfo: [
            {
                target: data.node.unit.id,
                newHealth: data.node.unit.currentHealth,
                newShields: data.node.unit.currentShields,
                fainted: data.node.unit.fainted,
                dead: data.node.unit.dead
            }
        ]
    });
    //TODO check for post-attack reactions

    data.unit.actionUsed = true;
    data.actionData.push({
        action: this.clientActionEnums.ActionUsed,
        unitid: data.unit.id
    });
    //send down action data
    this.queueData('action',{actionData:data.actionData});
}
                      
GameSession.prototype.unitAbility = function(data){
    //check if ability is valid and execute
    var unit = this.allUnits[this.turnOrder[0].id];
    if (unit.actionUsed || unit.fainted || unit.dead){return;}
    data.ability = unit.getAbility(data.abilityid);
    var player = unit.owner.id;
    var node = this.map.axialMap[data.q][data.r];
    data.actionData = [];
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
                if (Math.abs(unit.currentNode.h - possibleNodes[i].h) > range.h || (unit.currentNode == possibleNodes[i] && !range.s)){
                    possibleNodes.splice(i,1);
                    i -= 1;
                }
            }
            break;
    }
    for (var i = 0; i < possibleNodes.length;i++){
        if (possibleNodes[i].q == node.q && possibleNodes[i].r == node.r){
            //node is valid!
            //execute the ability!!
            var energy = this.parseStringCode(unit,data.ability.eCost);
            if (unit.currentEnergy >= energy){
                unit.currentEnergy -= energy;
                data.actionData.push({
                    action: this.clientActionEnums.SetEnergy,
                    unitid: unit.id,
                    val: unit.currentEnergy
                });
            }else{
                data.actionData.push({
                    action: this.clientActionEnums.DmgText,
                    unitid: unit.id,
                    text: 'Not enough energy'
                });
                this.queuePlayer(unit.owner,'action',{actionData:data.actionData});
                return;
            }
            if (typeof data.ability.speed == 'undefined' || data.ability.speed == 'instant'){
                unit.removeBuffsWithTag('removeOnAction');
                var aFunc = Actions.getAbility(data.ability.id);
                aFunc(unit,this,data);
            }else{
                //The ability has a cast time
                //add cast time to the turn order and start casting!
                abData = {
                    id: this.gameEngine.getId(),
                    isCastTimer: true,
                    abilityData: data.ability,
                    unitid: unit.id,
                    data: data,
                    speed: data.ability.speed,
                    charge: 0
                }
                this.allUnits[abData.id] = abData;
                unit.casting = abData.id;
                this.queueData('addCastTimer',{
                    id: abData.id,
                    isCastTimer: true,
                    unitid: unit.id,
                    abilityName: data.ability.name,
                    speed: data.ability.speed,
                    data: data,
                    charge: 0
                });
                data.actionData.push({
                    action: this.clientActionEnums.DmgText,
                    unitid: unit.id,
                    text: 'casting...'
                })
            }
        }
    }
    unit.actionUsed = true;
    data.actionData.push({
        action:this.clientActionEnums.ActionUsed,
        unitid: unit.id
    });
    this.queueData('action',{actionData:data.actionData});
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
    var actionData = [{
        action: this.clientActionEnums.Face,
        unitid: unit.id,
        direction: data.direction
    }];
    if (this.currentInGameState == this.inGameStates.WaitingForTurnInfo){
        this.ticker = this.timePerTurn;
    }
    //send down the action info to all players in the battle//send down the action info to all players in the battle
    if (unit.hidden){
        //unless the unit is hidden
        for (var i in this.players){
            if (i == player){
                this.queuePlayer(this.players[i],'action',{actionData:actionData});
            }
        }
    }else{
        this.queueData('action',{actionData:actionData});
    }
}

GameSession.prototype.parseRange = function(unit,range){
    var results = {
        d: 0, //distnace
        h: 0, //height
        s: false //self
    };
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
        }
    }
    for (var i = 0; i < cArr.length;i++){
        if (cArr[i] == '/'){
            var n = Math.floor(cArr[i-1] / cArr[i+1]);
            cArr.splice(i-1,3,n);
        }
    }
    for (var i = 0; i < cArr.length;i++){
        if (cArr[i] == '+'){
            var n = cArr[i-1] + cArr[i+1];
            cArr.splice(i-1,3,n);
        }
        if (cArr[i] == '-'){
            var n = cArr[i-1] - cArr[i+1];
            cArr.splice(i-1,3,n);
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
////////////////////////////////////////////////////////////////
//                  Socket Functions
////////////////////////////////////////////////////////////////

GameSession.prototype.handleDisconnect = function(p,toEngine){
    //remove players and delete session
    console.log("Game " + this.id + ' has ended');
    for (var i in this.players){
        if (!(p.id == i && !toEngine)){
            this.gameEngine.leaveSession(this.id,this.players[i]);
        }
        //TODO send main menu command to every player
    }
    this.gameEngine.removeSession(this.id);
}
//Queue data to all players in the session
GameSession.prototype.queueData = function(c, d) {
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

GameSession.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

GameSession.prototype.emit = function() {
    try{
        for(var i in this.players) {
            if (this.players[i].netQueue.length > 0){
                this.players[i].socket.emit('serverUpdate', this.players[i].netQueue);
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
