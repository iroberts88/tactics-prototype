//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User,
    Utils = require('./utils.js').Utils,
    Unit = require('./unit.js').Unit,
    Attribute = require('./attribute.js').Attribute,
    ClassInfo = require('./classinfo.js').ClassInfo,
    Ability = require('./ability.js').Ability,
    Actions = require('./actions.js').Actions,
    Enums = require('./enums.js').Enums;

const crypto = require('crypto');

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var Player = function(){
    this.MAX_UNITS = 30;
    this.engine = null;
    this.session = null;
    this.user = null;
    this.mapData = null;

    this.ready = null;

    //game variables
    this.identifiedUnits = {};
    this.unitsNotInLos = {};
    this.myUnits = {};

    this.isNPC = false;

};

Player.prototype.init = function (data) {
    //init player specific variables
   
    this.netQueue = [];

    if (typeof data.socket != 'undefined'){
        this.socket = data.socket;
        this.setupSocket();
    }

    this.ready = false;
};
    
Player.prototype.getUnit = function(id){
    //returns a unit with the given ID
    for (var i = 0; i < this.user.characters.length;i++){
        if (this.user.characters[i].id == id){
            return this.user.characters[i];
        }
    }
    return null;
}
Player.prototype.tick = function(deltaTime){
   
};


Player.prototype.hasUnit = function(id){
    //returns true if player has a unit with the given id
    for (var i = 0; i < this.user.characters.length;i++){
        if (this.user.characters[i].id == id){
            return true;
        }
    }
    return false;
}

Player.prototype.getUnitsNotInLos = function(){
    for (var i in this.session.players){
        if (this.session.players[i] == this){
            continue;
        }
        var enemyPlayer = this.session.players[i];
        for (var u in enemyPlayer.myUnits){
            //default to NO LOS
            var los = 1;
            for (var mu in this.myUnits){
                //check if the unit is out of vision distance
                if (this.session.map.cubeDistance(enemyPlayer.myUnits[u].currentNode,this.myUnits[mu].currentNode) > this.myUnits[mu].vision.value){
                    continue;
                }
                //check if the unit is within LOS
                los = this.session.map._getLOS(enemyPlayer.myUnits[u].currentNode,this.myUnits[mu].currentNode);
                if (los != 1){break;}
            }
            if (los == 1){
                this.unitsNotInLos[u] = true;
            }else{
                this.unitsNotInLos[u] = false;
            }
        }
    }
    console.log(this.unitsNotInLos);
};

Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setGameEngine = function(ge){
    this.engine = ge;
};

Player.prototype.setGameSession = function(gs){
    this.session = gs;
};

Player.prototype.setupSocket = function() {

    // On playerUpdate event
    var that = this;

    this.socket.on([Enums.PLAYERUPDATE], function (data) {
        try{
            if (that.session){
                //if the player is in a session - deal with received data
               switch(data[Enums.COMMAND]){
                    case Enums.EXITGAME:
                        try{
                            that.session.handleDisconnect(that,true);
                        }catch(e){
                            that.engine.debug(exitGameError, e.stack,data);
                        }
                        break;
                    case Enums.READY:
                        if (data[Enums.VALUE] == true){
                            that.ready = true;
                        }else{
                            console.log('TODO - Player failed to load in. Cancel session and return players to the main menu');
                        }
                        break;
                    case Enums.MOVE:
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        if (!that.hasUnit(that.session.turnOrder[0].id) || !that.engine.validateData(data,[Enums.Q,Enums.R])){
                            return;
                        }
                        data.q = data[Enums.Q];
                        data.r = data[Enums.R];
                        //send the data to session and execute the move
                        that.session.unitMove(data);
                        break;
                    case Enums.ATTACK:
                        console.log('attacking...')
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        //also check that the session is awaiting turn info and not between turns
                        if (!that.hasUnit(that.session.turnOrder[0].id) || that.session.currentInGameState != that.session.inGameStates.WaitingForTurnInfo || !that.engine.validateData(data,[Enums.Q,Enums.R])){
                            return;
                        }
                        data.q = data[Enums.Q];
                        data.r = data[Enums.R];
                        //send the data to session and execute the attack
                        data[Enums.ACTIONDATA] = [];
                        if (that.session.unitAttack(data)){
                            var cData = {};
                            cData[Enums.ACTIONDATA] = data[Enums.ACTIONDATA];
                            that.session.queueData(Enums.ACTION,cData);
                        }
                        break;
                    case Enums.ABILITY:
                        console.log('using an ability...')
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        //also check that the session is awaiting turn info and not between turns
                        if (!that.hasUnit(that.session.turnOrder[0].id) || that.session.currentInGameState != that.session.inGameStates.WaitingForTurnInfo|| !that.engine.validateData(data,[Enums.Q,Enums.R,Enums.ABILITYID])){
                            return;
                        }
                        data.q = data[Enums.Q];
                        data.r = data[Enums.R];
                        data.abilityid = data[Enums.ABILITYID];
                        //send the data to session and execute the ability
                        that.session.unitAbility(data);
                        break;
                    case Enums.ITEM: 
                        console.log("Inventory action");
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        //also check that the session is awaiting turn info and not between turns
                        if (!that.hasUnit(that.session.turnOrder[0].id) || that.session.currentInGameState != that.session.inGameStates.WaitingForTurnInfo){
                            return;
                        }
                        //send the data to session and execute the item
                        that.session.unitItem(data);
                        break;
                    case Enums.ENDTURN:
                        console.log("ending turn...");
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        //also check that the session is awaiting turn info and not between turns
                        if (!that.hasUnit(that.session.turnOrder[0].id) || that.session.currentInGameState != that.session.inGameStates.WaitingForTurnInfo  || !that.engine.validateData(data,[Enums.DIRECTION])){
                            return;
                        }
                        data.direction = data[Enums.DIRECTION];
                        //send the data to session and execute the attack
                        that.session.unitEnd(data);
                        break;
               }
            }else{
                //player is not in a game currently - main menu commands
                switch(data[Enums.COMMAND]){
                    case Enums.LEARNABILITY:
                        try{
                            //validate data
                            if (!that.engine.validateData(data,[Enums.CLASSID,Enums.ABILITYID,Enums.UNITID])){
                                console.log('Learn ability error, invalid data');
                                return;
                            }
                            var uID = data[Enums.UNITID];
                            var unit = that.user.getUnit(uID);
                            if (!unit){
                                console.log('Learn ability error, invalid unit');
                                return;
                            }
                            unit.classInfo.learnAbility(data);
                        }catch(e){
                            that.engine.debug('learnAbilityError',e.stack,data);
                        }
                        break;
                    case Enums.EQUIPABILITY:
                        try{
                            //validate data
                            if (!that.engine.validateData(data,[Enums.CLASSID,Enums.ABILITYID,Enums.UNITID])){
                                console.log('Equip ability error, invalid data');
                                return;
                            }
                            var uID = data[Enums.UNITID];
                            var unit = that.user.getUnit(uID);
                            if (!unit){
                                console.log('Equip ability error, invalid unit');
                                return;
                            }
                            unit.classInfo.equipAbility(data);
                        }catch(e){
                            that.engine.debug('equipAbilityError',e,data);
                        }
                        break;
                    case Enums.UNEQUIPABILITY:
                        try{
                            //validate data
                            console.log(data);
                            if (!that.engine.validateData(data,[Enums.CLASSID,Enums.ABILITYID,Enums.UNITID])){
                                console.log('UNEQUIP ability error, invalid data');
                                return;
                            }
                            var uID = data[Enums.UNITID];
                            var unit = that.user.getUnit(uID);
                            if (!unit){
                                console.log('Un-Equip ability error, invalid unit');
                                return;
                            }
                            unit.classInfo.unEquipAbility(data);
                        }catch(e){
                            that.engine.debug('unEquipAbilityError', e,data);
                        }
                        break;
                    case Enums.CLEARABILITIES:
                        try{
                            //get the unit
                            if (!that.engine.validateData(data,[Enums.UNITID])){
                                console.log('Clear abilities error, invalid data');
                                return;
                            }
                            var uID = data[Enums.UNITID];
                            var unit = that.user.getUnit(uID);
                            if (!unit){
                                console.log('Clear abilities error, invalid unit');
                                return;
                            }
                            unit.usedAbilitySlots = 0;
                            unit.classInfo.equippedAbilities = {};
                            //update client
                            that.engine.queuePlayer(that,Enums.CLEARABILITIES,data);
                        }catch(e){
                            that.engine.debug('clearAbilitiesError',e.stack,data);
                        }
                        break;
                    case Enums.LOGOUT:
                        try{
                            that.engine.playerLogout(that);
                            that.engine.queuePlayer(that,Enums.LOGOUT, {});
                            that.user.unlock();
                            that.user.updateDB();
                            that.user = null;
                        }catch(e){
                            that.engine.debug('logoutError',e.stack);
                        }
                        break;
                    case Enums.DELETECHAR:
                        try{
                            //get the unit
                            if (!that.engine.validateData(data,[Enums.UNITID])){
                                console.log('Delete Unit error, invalid data');
                                return;
                            }
                            var uID = data[Enums.UNITID];
                            //remove the character from the player's character list
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == uID){
                                    console.log('deleting character: ' + that.user.characters[i].name);
                                    that.user.characters.splice(i,1);
                                    that.engine.queuePlayer(that,Enums.DELETECHAR,that.engine.createClientData(Enums.UNITID, uID));
                                    continue;
                                }
                            }
                        }catch(e){
                            that.engine.debug('deleteCharError',e.stack,data);
                        }
                        break;
                    case Enums.ITEMTOUNIT:
                        try{
                            if (!that.engine.validateData(data,[Enums.INDEX,Enums.UNITID])){
                                console.log('item to unit error, invalid data');
                                return;
                            }
                            var unit = that.getUnit(data[Enums.UNITID]);
                            var id = that.user.inventory.getItemID(data[Enums.INDEX]);
                            if (!unit || !id){
                                console.log('itemtoUnit Error');
                                return;
                            }
                            //add item to unit
                            if (unit.inventory.addItemUnit(id,1, true)){
                                //remove item from player
                                that.user.inventory.removeItem(data[Enums.INDEX],1,true);
                            }
                        }catch(e){
                            that.engine.debug('itemToPlayerError',e.stack,data);
                        }
                        break;
                    case Enums.ITEMTOPLAYER:
                        try{
                            if (!that.engine.validateData(data,[Enums.INDEX,Enums.UNITID])){
                                console.log('item to player error, invalid data');
                                return;
                            }
                            var unit = that.getUnit(data[Enums.UNITID]);
                            var id = unit.inventory.getItemID(data[Enums.INDEX]);
                            if (!unit || !id){
                                console.log('itemtoPlayer Error');
                                return;
                            }
                            //add item to player
                            that.user.inventory.addItem(id,1, true);
                            //remove item from unit
                            unit.inventory.removeItemUnit(data[Enums.INDEX],true);
                        }catch(e){
                            that.engine.debug('itemToPlayerError',e,data);
                        }
                        break;
                    case Enums.EQUIPITEM:
                        try{
                            if (!that.engine.validateData(data,[Enums.INDEX,Enums.UNITID])){
                                console.log('equip item error, invalid data');
                                return;
                            }
                            var unit = that.getUnit(data[Enums.UNITID]);
                            var id = that.user.inventory.getItemID(data[Enums.INDEX]);
                            if (!unit || !id){
                                console.log('equip item Error');
                                return;
                            }
                            //equip item
                            unit.inventory.equip(data[Enums.INDEX], true);
                        }catch(e){
                            that.engine.debug('equipItemError',e,data);
                        }
                        break;
                    case Enums.UNEQUIPITEM:
                        try{
                            if (!that.engine.validateData(data,[Enums.INDEX,Enums.UNITID])){
                                console.log('ue item Unit error, invalid data');
                                return;
                            }
                            var unit = that.getUnit(data[Enums.UNITID]);
                            var id = that.user.inventory.getItemID(data[Enums.INDEX]);
                            if (!unit || !id){
                                console.log('equip item Error');
                                return;
                            }
                            //unequip item
                            unit.inventory.unEquip(data[Enums.INDEX], true);
                        }catch(e){
                            that.engine.debug('unEquipItemError',e.stack,data);
                        }
                        break;
                    case Enums.ADDUNIT:
                        //TODO -- validate unit before creation
                        if (!that.engine.validateData(data,[Enums.NAME, Enums.SEX,Enums.STATS,Enums.CLASS])){
                            console.log('Add Unit error, invalid data');
                            return;
                        }
                        if (!that.engine.validateData(data[Enums.STATS],[Enums.STRENGTH,Enums.ENDURANCE,Enums.AGILITY,Enums.DEXTERITY,Enums.INTELLIGENCE,Enums.WILLPOWER,Enums.CHARISMA])){
                            console.log('Add Unit error, invalid STAT data');
                            return;
                        }
                        //check max characters
                        if (that.user.characters.length < 30){
                            try{
                                var char = new Unit();
                                char.init({
                                    id: that.engine.getId(),
                                    owner: that,
                                    name: data[Enums.NAME],
                                    sex: data[Enums.SEX],
                                    inventory: ['gun_sidearm','weapon_combatKnife']
                                });
                                //TODO VALIDATE STATS AMOUNTSSSS, sex, CLASS
                                char.strength.base = data[Enums.STATS][Enums.STRENGTH];
                                char.strength.set();
                                char.endurance.base = data[Enums.STATS][Enums.ENDURANCE];
                                char.endurance.set();
                                char.agility.base = data[Enums.STATS][Enums.AGILITY];
                                char.agility.set();
                                char.dexterity.base = data[Enums.STATS][Enums.DEXTERITY];
                                char.dexterity.set();
                                char.intelligence.base = data[Enums.STATS][Enums.INTELLIGENCE];
                                char.intelligence.set();
                                char.willpower.base = data[Enums.STATS][Enums.WILLPOWER];
                                char.willpower.set();
                                char.charisma.base = data[Enums.STATS][Enums.CHARISMA];
                                char.charisma.set();

                                char.classInfo = new ClassInfo();
                                char.classInfo.setUnit(char);
                                char.classInfo.setBaseClass(data[Enums.CLASS]);
                                char.classInfo.setClass(data[Enums.CLASS]);
                                char.classInfo.init({});
                                //create object to send to the client
                                char.levelUp();
                                char.level -= 1;
                                that.engine.queuePlayer(that,Enums.ADDNEWUNIT, that.engine.createClientData(Enums.UNITID, char.getClientData()));
                                that.user.characters.push(char);
                            }catch(e){
                                that.engine.debug(that,{'id': 'addUnitError', 'error': e.stack});
                            }
                        }
                        break;
                    case Enums.ADDRANDOMCHAR:
                        if (that.user.characters.length < 30){
                            try{
                                console.log('adding char..')
                                var char = new Unit();
                                var sexes = ['male','female'];
                                var sex = sexes[Math.floor(Math.random()*sexes.length)];
                                var nT = sex;
                                var lastNT = 'last';
                                //if (sex == 'female'){nT = 'romanFemale';lastNT = 'romanLastF'}
                                char.init({
                                    id: that.engine.getId(),
                                    owner: that,
                                    name: '' + Utils.generateName(nT) + ' ' + Utils.generateName(lastNT),
                                    sex: sex,
                                    inventory: ['gun_sidearm','weapon_combatKnife']
                                });
                                var classes = ['soldier','medic','scout','tech'];
                                var cl = classes[Math.floor(Math.random()*classes.length)];
                                //randomize stats
                                var stats = ['strength','endurance','agility','dexterity','willpower','intelligence','charisma'];
                                for (var i = 0;i < 20;i++){
                                    var randStat = stats[Math.floor(Math.random()*stats.length)];
                                    char[randStat].base += 1;
                                    char[randStat].set();
                                }
                                char.classInfo = new ClassInfo();
                                char.classInfo.setUnit(char);
                                char.classInfo.setBaseClass(cl);
                                char.classInfo.setClass(cl);
                                char.classInfo.init({});
                                char.levelUp();
                                char.level -= 1;
                                that.engine.queuePlayer(that,Enums.ADDNEWUNIT, that.engine.createClientData(Enums.UNITID, char.getClientData()));
                                that.user.characters.push(char);
                            }catch(e){
                                console.log(e.stack)
                                that.engine.debug(that,{'id': 'addRandomUnitError', 'error': e.stack});
                            }
                        }
                        break;
                    case Enums.TESTGAME:
                        that.engine.playersWaiting.push(that.id);
                        break;
                    case Enums.CNACELSEARCH:
                        that.engine.playerCancelSearch(that);
                        break;
                }
            }
        }catch(e){
            console.log("Player Update Error");
            that.engine.debug(that,'playerUpdateError',{'id': 'error', 'error': e.stack});
        }
    });

    this.socket.on('confirmMapSave', function (d) {
        try{
            if (d.c){
                that.engine.mapids.push(that.mapData.name);
                that.engine.maps[that.mapData.name] = {
                    'mapid': that.mapData.name,
                    'mapData': that.mapData.mapData,
                    'sz1': that.mapData.sz1,
                    'sz2': that.mapData.sz2
                }
                that.engine.queuePlayer(that,"mapSaved", {name:d.name});
            }else{
                that.mapData = null;
            }
        }catch(e){
            that.engine.debug(that, {'id': 'confirmMapSaveError', 'error': e.stack, cMapData: d});
        }
    });

    this.socket.on('deleteMap', function (d) {
        try{
            delete that.engine.maps[d.name];
            for (var i = 0; i < that.engine.mapids.length;i++){
                if (d.name == that.engine.mapids[i]){
                    that.engine.mapids.splice(i,1);
                }
            }
        }catch(e){
            that.engine.debug(that, {'id': 'deleteMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('createMap', function (d) {
        try{
            if (typeof that.engine.maps[d.name] == 'undefined'){
                that.engine.mapids.push(d.name);
                that.engine.maps[d.name] = {
                    'mapid': d.name,
                    'mapData': d.mapData,
                    'sz1': d.sz1,
                    'sz2': d.sz2
                }
                that.engine.queuePlayer(that,"mapSaved", {name:d.name});
            }else{
                that.engine.queuePlayer(that,"confirmMapSave", {name:d.name});
                that.mapData = d;
            }
        }catch(e){
            that.engine.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('editMap', function (d) {
        try{
            if (typeof that.engine.maps[d.name] != 'undefined'){
                var mapData = {};
                for (let i in that.engine.maps[d.name].mapData){
                    mapData[i] = {};
                    for (let j in that.engine.maps[d.name].mapData[i]){
                        mapData[i][j] = Utils.getClientNode(that.engine.maps[d.name].mapData[i][j]);
                    }
                }
                var sz1 = [];
                var sz2 = [];
                for (let k in that.engine.maps[d.name].sz1){
                    sz1.push(Utils.getClientNode(that.engine.maps[d.name].sz1[k]));
                }
                for (let l in that.engine.maps[d.name].sz2){
                    sz2.push(Utils.getClientNode(that.engine.maps[d.name].sz2[l]));
                }
                that.engine.queuePlayer(that,"editMap",that.engine.createClientData(
                    Enums.FOUND, true,
                    Enums.NAME, d.name,
                    Enums.MAPDATA, mapData,
                    Enums.STARTZONE1, sz1,
                    Enums.STARTZONE2, sz2
                ));

            }else{
                console.log('No map named ' + d.name);
                that.engine.queuePlayer(that,"editMap", that.engine.createClientData(Enums.FOUND,false));
            }
        }catch(e){
            that.engine.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on(Enums.CLIENTCOMMAND, function(data) {
        if (!that.engine.validateData(data,[Enums.COMMAND])){
            return;
        }
        if (typeof data[Enums.COMMAND] != 'string'){
            return;
        }
        // this needs to be parsed: data.command
        // format: >COMMAND ID AMOUNT
        //commands:
        try{
            var commandBool = false;
            var c = data[Enums.COMMAND];
            var commands = [];
            var from = 0;
            for (var i = 0; i < c.length; i++){
                if (c.charAt(i) === ' '){
                    commands.push(c.substring(from,i))
                    from = i+1;
                }
            }
            commands.push(c.substring(from,c.length));
            switch (commands[0]){
                case 'say':
                    break;
                case '-setStat':
                    try{
                        for (var i = 0; i < that.user.characters.length;i++){
                            if (that.user.characters[i].id == commands[1] && parseInt(commands[3])){
                                that.user.characters[i].setStat(commands[2],parseInt(commands[3]));
                            }
                        }
                    }catch(e){
                        console.log(e);
                        console.log('Unable to set stat ' + commands[2] + ' to ' + commands[3]);
                    }
                    break;
                case '-modStat':
                    try{
                        for (var i = 0; i < that.user.characters.length;i++){
                            if (that.user.characters[i].id == commands[1] && parseInt(commands[3])){
                                that.user.characters[i].modStat(commands[2],parseInt(commands[3]));
                            }
                        }
                    }catch(e){
                        console.log(e);
                    }
                    break;
                case '-setName':
                    break;
                case '-maxAp':
                    // max a character's AP
                    // -maxAp <unitid>
                    try{
                        if (commands[1] == 'all'){
                            for (var i = 0; i < that.user.characters.length;i++){
                                for (var j in that.user.characters[i].classInfo.ap){
                                    that.user.characters[i].addAp({classid: j, amt: 9999,updateClient: true});
                                }
                            }
                        }else{
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == commands[1]){
                                    for (var j in that.user.characters[i].classInfo.ap){
                                    that.user.characters[i].addAp({classid: j, amt: 9999,updateClient: true});
                                    }
                                }
                            }
                        }
                    }catch(e){
                        console.log(e);
                    }
                    break;
                case '-addItem':
                    // attempt to add an item to player inventory
                    // -addItem <id> <optional:amount>
                    try{
                        var amt = 1;
                        if (typeof commands[2] != 'undefined'){
                            amt = commands[2];
                        }
                        that.user.inventory.addItem(commands[1],amt, true);
                    }catch(e){
                        console.log(e);
                        console.log('Unable to add item ' + commands[2]);
                    }
                    break;
                case '-addItemUnit':
                    // attempt to add an item to unit inventory
                    // -addItemUnit <unitid> <id> <optional:amount>
                    try{
                        var amt = 1;
                        if (typeof commands[3] != 'undefined'){
                            amt = commands[3];
                        }
                        for (var i = 0; i < that.user.characters.length;i++){
                            if (that.user.characters[i].id == commands[1]){
                                that.user.characters[i].inventory.addItemUnit(commands[2],amt,true);
                            }
                        }
                    }catch(e){
                        console.log(e);
                        console.log('Unable to add item ' + commands[2] + ' to ' + commands[1]);
                    }
                    break;
                case '-addAll':
                    // attempt to add ALL ITEMS to player inventory
                    // -addAll
                    try{
                        for (var i in that.engine.items){
                            that.user.inventory.addItem(that.engine.items[i].itemid,1, true);
                        }
                    }catch(e){
                        console.log(e);
                        console.log('Unable to add item ' + commands[2]);
                    }
                    break;
                case '-next':
                    if(that.session){
                        that.session.ticker = that.session.timePerTurn;
                    }
                    break;
            }
        }catch(e){
            console.log(e);
        }
    });

    this.socket.on('disconnect', function () {
        try{
            that.user.unlock();
            console.log('Player ' + that.id + ' (' + that.user.userData.username + ') has disconnected.');
            that.user.updateDB();
            if (that.session){
                that.session.handleDisconnect(that,false);
            }else{
                that.engine.removePlayer(that);
            }
            // If callback exists, call it
            if(that.onDisconnectHandler != null && typeof that.onDisconnectHandler == 'function' ) {
                that.onDisconnectHandler();
            }
        }catch(e){
            console.log('error on disconnect ( will error out on guest or user = null)');
        }
    });

    
    this.socket.on(Enums.LOGINATTEMPT, function (d) {
        d.sn = d[Enums.USERNAME];
        d.pw = d[Enums.PASSWORD];
        d.guest = d[Enums.GUEST];

        try{
            if (!that.session){
                if (d.guest){
                    //SET USER DATA TO GUEST
                    that.user = User();
                    that.user.setOwner(that);
                    that.user.init({guest: true});
                    that.user.setLastLogin(Date.now());
                    that.engine.queuePlayer(that,Enums.LOGIN, that.engine.createClientData(
                        Enums.USERNAME, that.user.userData.username
                    ));
                }else if (d.sn && d.pw){

                    if (!that.engine.validateData(d,[Enums.USERNAME,Enums.PASSWORD])){
                        that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'nvd'));
                        return;
                    }
                    d.sn = d.sn.toLowerCase();
                    if (!that.engine.users[that.engine._userIndex[d.sn]].loggedin){
                        var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                        var params = {
                            TableName: 'users',
                            Key: {
                                username: d.sn
                            }
                        }
                        docClient.get(params, function(err, data) {
                            if (err) {
                                console.error("Unable to find user. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                const hash = crypto.createHmac('sha256', d.pw);
                                if (hash.digest('hex') == data.Item.password){
                                    //SET USER DATA TO EXISTING USER
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(data.Item);
                                    that.user.lock();
                                    that.user.setLastLogin(Date.now().toJSON);
                                    that.engine.queuePlayer(that,Enums.LOGIN, that.engine.createClientData(
                                        Enums.USERNAME, that.user.userData.username,
                                        Enums.STATS, that.user.userData.stats
                                    ));
                                }else{
                                    that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'wp'));
                                }
                            }
                        });
                    }else{
                        that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'l'));
                    }
                }
            }
        }catch(e){
            console.log('Login Attempt failed');
            console.log(e);
            that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'l'));
        }
    });
    //TODO - set player variable to show they are logged in
    //on the client - catch "loggedIn" and move to the main menu, display stats, add logout button
    this.socket.on(Enums.CREATEUSER, function (d) {

        if (!that.engine.validateData(d,[Enums.USERNAME,Enums.PASSWORD])){
            that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'nvd'));
        }
        d.sn = d[Enums.USERNAME];
        d.pw = d[Enums.PASSWORD];
        console.log(d);
        try{
            d.sn = d.sn.toLowerCase();
            if (!that.session && d.sn != 'guest' && d.pw){
                var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                var params = {
                    TableName: 'users',
                    Key: {
                        username: d.sn
                    }
                }
                docClient.get(params, function(err, data) {
                if (err) {
                } else {
                    //check password lengths, and if item exists
                    console.log("Create user succeeded:", JSON.stringify(data, null, 2));
                    if (d.sn.length >= 3 && d.sn.length <= 16 && d.pw.length >= 8 && d.pw.length <= 16 && typeof data.Item == 'undefined'){
                        console.log('valid account info - creating account');
                        //first, initialize the user data
                        var params2 = {
                            TableName: 'tactics_userdata',
                            Item: {
                                'username': d.sn,
                                'characters': [],
                                'inventory': []
                            }
                        }
                        docClient.put(params2, function(err, data2) {
                            if (err) {
                                console.error("Unable to add user data. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                console.log("Create userdata succeeded:", JSON.stringify(data2, null, 2));
                                //hash the password
                                const hash = crypto.createHmac('sha256', d.pw);
                                var u = {
                                    username: d.sn,
                                    password: hash.digest('hex')
                                };
                                that.user = User();
                                that.user.setOwner(that);
                                that.user.init(u);
                                var params3 = {
                                    TableName: 'users',
                                    Item: {
                                        'username': d.sn,
                                        'password': that.user.userData.password,
                                        'admin': false,
                                        'chatlog': [],
                                        'loggedin': true,
                                        'createDate': new Date().toJSON(),
                                        'lastLogin': new Date().toJSON()
                                    }
                                }
                                docClient.put(params3, function(err, data3) {
                                    if (err) {
                                        console.error("Unable to add user. Error JSON:", JSON.stringify(err, null, 2));
                                    } else {
                                        console.log("Create user succeeded:", JSON.stringify(data3, null, 2));
                                        that.engine.users[d.sn] = params3.Item;
                                        that.engine._userIndex[d.sn] = d.sn;
                                        that.engine.queuePlayer(that,Enums.LOGIN, that.engine.createClientData(
                                            Enums.USERNAME, d.sn
                                        )); 
                                    }
                                });
                            }
                        });
                        
                    }else if (typeof data.Item != 'undefined'){
                        that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'uiu'));
                    }else if (d.sn.length < 3 || d.sn.length > 16){
                        that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'ule'));
                    }else if (d.pw.length < 8 || d.pw.length > 16){
                        that.engine.queuePlayer(that,Enums.SETLOGINERRORTEXT, that.engine.createClientData(Enums.TEXT, 'ple'));
                    }
                }
                });
            }
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
};

exports.Player = Player;
