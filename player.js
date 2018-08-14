//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var User = require('./user.js').User,
    Utils = require('./utils.js').Utils,
    Attribute = require('./attribute.js').Attribute,
    ClassInfo = require('./classinfo.js').ClassInfo;

const crypto = require('crypto');

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var Player = function(){
    this.MAX_UNITS = 30;
    this.gameEngine = null;
    this.gameSession = null;
    this.user = null;
    this.mapData = null;

    this.ready = null;

    //game variables
    this.identifiedUnits = {};
    this.myUnits = {}

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
Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setGameEngine = function(ge){
    this.gameEngine = ge;
};

Player.prototype.setGameSession = function(gs){
    this.gameSession = gs;
};

Player.prototype.setupSocket = function() {

    // On playerUpdate event
    var that = this;

    this.socket.on('playerUpdate', function (data) {
        try{
            if (that.gameSession){
                //if the player is in a gameSession - deal with received data
               switch(data.command){
                    case 'exitGame':
                        try{
                            that.gameSession.handleDisconnect(that,true);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'exitGameError', error: e.stack, data: data});
                        }
                        break;
                    case 'ready':
                        console.log(data)
                        if (data.val){
                            that.ready = true;
                        }else{
                            console.log('TODO - Player failed to load in. Cancel session and return players to the main menu');
                        }
                        break;
                    case 'move':
                        //make sure the unit at the top of the turn order is the player's
                        if (!that.hasUnit(that.gameSession.turnOrder[0].id)){
                            return;
                        }
                        //send the data to gameSession and execute the move
                        that.gameSession.unitMove(data);
                        break;
                    case 'attack':
                        console.log('attacking...')
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        if (!that.hasUnit(that.gameSession.turnOrder[0].id)){
                            return;
                        }
                        //send the data to gameSession and execute the attack
                        that.gameSession.unitAttack(data);
                        break;
                    case 'ability':
                        console.log('using an ability...')
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        if (!that.hasUnit(that.gameSession.turnOrder[0].id)){
                            return;
                        }
                        //send the data to gameSession and execute the ability
                        that.gameSession.unitAbility(data);
                        break;
                    case 'item': 
                        console.log("Inventory action");
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        if (!that.hasUnit(that.gameSession.turnOrder[0].id)){
                            return;
                        }
                        //send the data to gameSession and execute the item
                        that.gameSession.unitItem(data);
                        break;
                    case 'endTurn':
                        console.log("ending turn...");
                        console.log(data);
                        //make sure the unit at the top of the turn order is the player's
                        if (!that.hasUnit(that.gameSession.turnOrder[0].id)){
                            return;
                        }
                        //send the data to gameSession and execute the attack
                        that.gameSession.unitEnd(data);
                        break;
               }
            }else{
                //player is not in a game currently - main menu commands
                console.log(data);
                switch(data.command){
                    case 'learnAbility':
                        try{
                            //get the unit
                            var cID = data['classID'];
                            var aID = data['ablID'];
                            var uID = data['unitID'];
                            var unit;
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == uID){
                                    unit = that.user.characters[i];
                                    continue;
                                }
                            }
                            //get the ability
                            var abl;
                            for (var a = 0; a < unit.classInfo.allClassAbilities[cID].length;a++){
                                if (aID == unit.classInfo.allClassAbilities[cID][a].id){
                                    abl = unit.classInfo.allClassAbilities[cID][a];
                                }
                            }
                            //check available AP
                            if (unit.classInfo.ap[cID] < abl.ApCost){
                                break;
                            }
                            //check if ability is already learned
                            if (unit.classInfo.learnedAbilities[aID]){
                                break;
                            }
                            //ability can be learned. reduce AP and add to learned abilities list
                            unit.classInfo.ap[cID] -= abl.ApCost;
                            unit.classInfo.learnedAbilities[aID] = true;
                            //update client
                            data.apCost = abl.ApCost;
                            that.gameEngine.queuePlayer(that,'learnAbility',data);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'learnAbilityError', error: e.stack, lData: data});
                        }
                        break;
                    case 'equipAbility':
                        try{
                            //get the unit
                            var cID = data['classID'];
                            var aID = data['ablID'];
                            var uID = data['unitID'];
                            var unit;
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == uID){
                                    unit = that.user.characters[i];
                                    continue;
                                }
                            }
                            //get the ability
                            var abl;
                            for (var a = 0; a < unit.classInfo.allClassAbilities[cID].length;a++){
                                if (aID == unit.classInfo.allClassAbilities[cID][a].id){
                                    abl = unit.classInfo.allClassAbilities[cID][a];
                                }
                            }
                            //check available SLOTS
                            if (unit.abilitySlots.value - unit.usedAbilitySlots < abl.sCost){
                                break;
                            }
                            //check if ability is already equipped
                            if (unit.classInfo.equippedAbilities[aID]){
                                break;
                            }
                            //ability can be equipped. add current slots and add to learned abilities list
                            unit.classInfo.equippedAbilities[aID] = true;
                            unit.setAbilitySlots();
                            //update client
                            data.sCost = abl.sCost;
                            that.gameEngine.queuePlayer(that,'equipAbility',data);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'equipAbilityError', error: e.stack, lData: data});
                        }
                        break;
                    case 'unEquipAbility':
                        try{
                            //get the unit
                            var cID = data['classID'];
                            var aID = data['ablID'];
                            var uID = data['unitID'];
                            var unit;
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == uID){
                                    unit = that.user.characters[i];
                                    continue;
                                }
                            }
                            //get the ability
                            var abl;
                            for (var a = 0; a < unit.classInfo.allClassAbilities[cID].length;a++){
                                if (aID == unit.classInfo.allClassAbilities[cID][a].id){
                                    abl = unit.classInfo.allClassAbilities[cID][a];
                                }
                            }
                            //check if ability is already not equipped
                            if (typeof unit.classInfo.equippedAbilities[aID] == 'undefined'){
                                break;
                            }
                            //ability can be un-equipped.
                            delete unit.classInfo.equippedAbilities[aID];
                            unit.setAbilitySlots();
                            //update client
                            data.sCost = abl.sCost;
                            that.gameEngine.queuePlayer(that,'unEquipAbility',data);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'unEquipAbilityError', error: e.stack, lData: data});
                        }
                        break;
                    case 'clearAbilities':
                        try{
                            //get the unit
                            var uID = data['unitID'];
                            var unit;
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == uID){
                                    unit = that.user.characters[i];
                                    continue;
                                }
                            }
                            unit.usedAbilitySlots = 0;
                            unit.classInfo.equippedAbilities = {};
                            //update client
                            that.gameEngine.queuePlayer(that,'clearAbilities',data);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'clearAbilitiesError', error: e.stack, lData: data});
                        }
                        break;
                    case 'logout':
                        try{
                            that.gameEngine.playerLogout(that);
                            that.gameEngine.queuePlayer(that,'logout', {});
                            that.user.unlock();
                            that.user.updateDB();
                            that.user = null;
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'logoutError', error: e.stack});
                        }
                        break;
                    case 'deleteChar':
                        try{
                            //remove the character from the player's character list
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == data['charToDelete']){
                                    console.log('deleting character: ' + that.user.characters[i].name);
                                    that.user.characters.splice(i,1);
                                    that.gameEngine.queuePlayer(that,'deleteUnit',{'id': data['charToDelete']});
                                    continue;
                                }
                            }
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'deleteCharError', error: e.stack, dData: data});
                        }
                        break;
                    case 'itemToUnit':
                        try{
                            var unit = that.getUnit(data.unitID);
                            var itemID = that.user.inventory.items[data.itemIndex].itemID;
                            //add item to unit
                            if (unit.inventory.addItemUnit(itemID,1, true)){
                                //remove item from player
                                that.user.inventory.removeItem(data.itemIndex,1,true);
                            }
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'itemToPlayerError', error: e.stack, dData: data});
                        }
                        break;
                    case 'itemToPlayer':
                        try{
                            var unit = that.getUnit(data.unitID);
                            itemID = unit.inventory.items[data.itemIndex].itemID;
                            //add item to player
                            that.user.inventory.addItem(itemID,1, true);
                            //remove item from unit
                            unit.inventory.removeItemUnit(data.itemIndex,true);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'itemToPlayerError', error: e.stack, dData: data});
                        }
                        break;
                    case 'equipItem':
                        console.log(data);
                        try{
                            var unit = that.getUnit(data.unitID);
                            //add item to player
                            unit.inventory.equip(data.itemIndex, true);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'equipItemError', error: e.stack, dData: data});
                        }
                        break;
                    case 'unEquipItem':
                        console.log(data);
                        try{
                            var unit = that.getUnit(data.unitID);
                            //add item to player
                            unit.inventory.unEquip(data.itemIndex, true);
                        }catch(e){
                            that.gameEngine.debug(that,{id: 'unEquipItemError', error: e.stack, dData: data});
                        }
                        break;
                    case 'addUnit':
                        //TODO -- validate unit before creation
                        //check max characters
                        if (that.user.characters.length < 30){
                            try{
                                var char = new Unit();
                                char.init({
                                    id: that.gameEngine.getId(),
                                    owner: that,
                                    name: data.name,
                                    sex: data.sex,
                                    inventory: ['gun_sidearm','weapon_combatKnife']
                                });
                                for (var i in data.stats){
                                    char[i].base = data.stats[i];
                                    char[i].set();
                                }
                                char.classInfo = new ClassInfo();
                                char.classInfo.init({unit: char});
                                char.classInfo.setBaseClass(data.class);
                                char.classInfo.setClass(data.class);
                                //create object to send to the client
                                char.levelUp();
                                that.gameEngine.queuePlayer(that,'addNewUnit', {'unit': char.getClientData()});
                                that.user.characters.push(char);
                            }catch(e){
                                that.gameEngine.debug(that,{'id': 'addUnitError', 'error': e.stack});
                            }
                        }
                        break;
                    case 'addRandomChar':
                        if (that.user.characters.length < 30){
                            try{
                                var char = new Unit();
                                var sexes = ['male','female'];
                                var sex = sexes[Math.floor(Math.random()*sexes.length)];
                                var nT = sex;
                                var lastNT = 'last';
                                //if (sex == 'female'){nT = 'romanFemale';lastNT = 'romanLastF'}
                                char.init({
                                    id: that.gameEngine.getId(),
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
                                char.classInfo.init({unit: char});
                                char.classInfo.setBaseClass(cl);
                                char.classInfo.setClass(cl);
                                char.levelUp();
                                that.gameEngine.queuePlayer(that,'addNewUnit', {'unit': char.getClientData()});
                                that.user.characters.push(char);
                            }catch(e){
                                that.gameEngine.debug(that,{'id': 'addRandomUnitError', 'error': e.stack});
                            }
                        }
                        break;
                    case 'testGame':
                        that.gameEngine.playersWaiting.push(that.id);
                        break;
                    case 'cancelSearch':
                        that.gameEngine.playerCancelSearch(that);
                        break;
                }
            }
        }catch(e){
            console.log("Player Update Error");
            that.gameEngine.debug(that,{'id': 'error', 'error': e.stack});
        }
    });

    this.socket.on('confirmMapSave', function (d) {
        try{
            if (d.c){
                that.gameEngine.mapids.push(that.mapData.name);
                that.gameEngine.maps[that.mapData.name] = {
                    'mapid': that.mapData.name,
                    'mapData': that.mapData.mapData,
                    'sz1': that.mapData.sz1,
                    'sz2': that.mapData.sz2
                }
                that.gameEngine.queuePlayer(that,"mapSaved", {name:d.name});
            }else{
                that.mapData = null;
            }
        }catch(e){
            that.gameEngine.debug(that, {'id': 'confirmMapSaveError', 'error': e.stack, cMapData: d});
        }
    });

    this.socket.on('deleteMap', function (d) {
        try{
            delete that.gameEngine.maps[d.name];
            for (var i = 0; i < that.gameEngine.mapids.length;i++){
                if (d.name == that.gameEngine.mapids[i]){
                    that.gameEngine.mapids.splice(i,1);
                }
            }
        }catch(e){
            that.gameEngine.debug(that, {'id': 'deleteMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('createMap', function (d) {
        try{
            if (typeof that.gameEngine.maps[d.name] == 'undefined'){
                that.gameEngine.mapids.push(d.name);
                that.gameEngine.maps[d.name] = {
                    'mapid': d.name,
                    'mapData': d.mapData,
                    'sz1': d.sz1,
                    'sz2': d.sz2
                }
                that.gameEngine.queuePlayer(that,"mapSaved", {name:d.name});
            }else{
                that.gameEngine.queuePlayer(that,"confirmMapSave", {name:d.name});
                that.mapData = d;
            }
        }catch(e){
            that.gameEngine.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('editMap', function (d) {
        console.log(d);
        try{
            if (typeof that.gameEngine.maps[d.name] != 'undefined'){
                that.gameEngine.queuePlayer(that,"editMap",{found:true,
                    name:d.name,
                    mapData:that.gameEngine.maps[d.name].mapData,
                    sz1: that.gameEngine.maps[d.name].sz1,
                    sz2: that.gameEngine.maps[d.name].sz2
                });
            }else{
                console.log('No map named ' + d.name);
                that.gameEngine.queuePlayer(that,"editMap", {found: false});
            }
        }catch(e){
            that.gameEngine.debug(that, {'id': 'createMapError', 'error': e.stack, dMapData: d});
        }
    });

    this.socket.on('clientCommand', function(data) {
        // this needs to be parsed: data.command
        // format: >COMMAND ID AMOUNT
        //commands:
        try{
            var commandBool = false;
            var c = data.command;
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
                    // -maxAp <unitID>
                    try{
                        if (commands[1] == 'all'){
                            for (var i = 0; i < that.user.characters.length;i++){
                                for (var j in that.user.characters[i].classInfo.ap){
                                    that.user.characters[i].addAp(j,9999);
                                }
                            }
                        }else{
                            for (var i = 0; i < that.user.characters.length;i++){
                                if (that.user.characters[i].id == commands[1]){
                                    for (var j in that.user.characters[i].classInfo.ap){
                                        that.user.characters[i].addAp(j,9999);
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
                    // -addItem <itemID> <optional:amount>
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
                    // -addItemUnit <unitID> <itemID> <optional:amount>
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
                        for (var i in that.gameEngine.items){
                            that.user.inventory.addItem(that.gameEngine.items[i].itemid,1, true);
                        }
                    }catch(e){
                        console.log(e);
                        console.log('Unable to add item ' + commands[2]);
                    }
                    break;
                case '-next':
                    if(that.gameSession){
                        that.gameSession.ticker = that.gameSession.timePerTurn;
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
            if (that.gameSession){
                that.gameSession.handleDisconnect(that,false);
            }else{
                that.gameEngine.removePlayer(that);
            }
            // If callback exists, call it
            if(that.onDisconnectHandler != null && typeof that.onDisconnectHandler == 'function' ) {
                that.onDisconnectHandler();
            }
        }catch(e){
            console.log('error on disconnect ( will error out on guest or user = null)');
        }
    });

    
    this.socket.on('loginAttempt', function (d) {

        try{
            if (!that.gameSession){
                if (d.guest){
                    //SET USER DATA TO GUEST
                    that.user = User();
                    that.user.setOwner(that);
                    that.user.init({guest: true});
                    that.user.setLastLogin(Date.now());
                    that.gameEngine.queuePlayer(that,"loggedIn", {name:that.user.userData.username,stats:that.user.userData.stats});
                }else if (d.sn && d.pw){
                    d.sn = d.sn.toLowerCase();
                    if (!that.gameEngine.users[that.gameEngine._userIndex[d.sn]].loggedin){
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
                                    that.gameEngine.queuePlayer(that,"loggedIn", {name:data.Item.username});
                                }else{
                                    that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wp'});
                                }
                            }
                        });
                    }else{
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'l'});
                    }
                }
            }
        }catch(e){
            console.log('Login Attempt failed');
            console.log(e);
            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wp'});
        }
    });
    //TODO - set player variable to show they are logged in
    //on the client - catch "loggedIn" and move to the main menu, display stats, add logout button
    this.socket.on('createUser', function (d) {
        console.log(d);
        try{
            d.sn = d.sn.toLowerCase();
            if (!that.gameSession && d.sn != 'guest' && d.pw){
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
                                        that.gameEngine.users[d.sn] = params3.Item;
                                        that.gameEngine._userIndex[d.sn] = d.sn;
                                        that.gameEngine.queuePlayer(that,"loggedIn", {name:d.sn});
                                    }
                                });
                            }
                        });
                        
                    }else if (typeof data.Item != 'undefined'){
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'uiu'});
                    }else if (d.sn.length < 3 || d.sn.length > 16){
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'ule'});
                    }else if (d.pw.length < 8 || d.pw.length > 16){
                        that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'ple'});
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
