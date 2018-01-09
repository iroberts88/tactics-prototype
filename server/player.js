//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var mongo = require('mongodb').MongoClient,
    User = require('./user.js').User,
    Utils = require('./utils.js').Utils,
    Attribute = require('./attribute.js').Attribute,
    ClassInfo = require('./classinfo.js').ClassInfo;

const crypto = require('crypto');

var Player = function(){
    this.MAX_UNITS = 30;
    
    this.gameEngine = null;
    this.gameSession = null;
    this.user = null;
    this.mapData = null;
};

Player.prototype.init = function (data) {
    //init player specific variables
   
    this.netQueue = [];

    if (typeof data.socket != 'undefined'){
        this.socket = data.socket;
        this.setupSocket();
    }
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
    });

    this.socket.on('confirmMapSave', function (data) {
        try{
            if (data.c){
                mongo.connect('mongodb://127.0.0.1/lithiumAve', function(err, db) {
                    console.log("deleting old map");
                    var query = { name: that.mapData.name };
                    var removed = db.collection('tactics_maps').remove(query);
                    if (removed.nRemoved != 0){
                        console.log("saving new map");
                        db.collection('tactics_maps').insertOne({
                            name: that.mapData.name,
                            mapData: that.mapData.mapData,
                            sz1: that.mapData.sz1,
                            sz2: that.mapData.sz2
                        });
                    }else{
                        console.log("Map doesn't exist? eh?");
                        that.mapData = null;
                    }
                    db.close();
                });
            }else{
                that.mapData = null;
            }
        }catch(e){
            that.gameEngine.debug(that, {'id': 'confirmMapSaveError', 'error': e.stack, cMapData: data});
        }
    });

    this.socket.on('deleteMap', function (data) {
        try{
            mongo.connect('mongodb://127.0.0.1/lithiumAve', function(err, db) {
                var query = { name: data.name };
                var removed = db.collection('tactics_maps').remove(query);
                db.close();
            });
            for (var i = 0; i < that.gameEngine.maps.length;i++){
                if (data.name == that.gameEngine.maps[i]){
                    that.gameEngine.maps.splice(i,1);
                }
            }
        }catch(e){
            that.gameEngine.debug(that, {'id': 'deleteMapError', 'error': e.stack, dMapData: data});
        }
    });

    this.socket.on('createMap', function (data) {
        mongo.connect('mongodb://127.0.0.1/lithiumAve', function(err, db) {
            //see if map exists
            var query = { name: data.name };
            db.collection('tactics_maps').find(query).toArray(function(err, arr) {
                if (err) throw err;
                if (arr.length == 1 ){
                    that.gameEngine.queuePlayer(that,"confirmMapSave", {name:data.name});
                    that.mapData = data;
                }else{
                    db.collection('tactics_maps').insertOne({
                        name: data.name,
                        mapData: data.mapData,
                        sz1: data.sz1,
                        sz2: data.sz2
                    });
                    db.close();
                    that.gameEngine.maps.push(data.name);
                    that.gameEngine.queuePlayer(that,"mapSaved", {name:data.name});
                }
            });
        });
    });

    this.socket.on('editMap', function (data) {
        var url = 'mongodb://127.0.0.1/lithiumAve';
        mongo.connect(url, function(err, db) {
            // ---- Attempt to find existing map ----
            var query = { name: data.name };
            db.collection('tactics_maps').find(query).toArray(function(err, arr) {
                if (err) throw err;
                if (arr.length == 1 ){
                    that.gameEngine.queuePlayer(that,"editMap", {found:true,name:arr[0].name,mapData:arr[0].mapData,sz1: arr[0].sz1,sz2:arr[0].sz2});
                }else{
                    console.log('No map named ' + data.name);
                    that.gameEngine.queuePlayer(that,"editMap", {found: false});
                }
            });
            db.close();
        });
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
                            that.user.inventory.addItem(that.gameEngine.items[i]._dbIndex,1, true);
                        }
                    }catch(e){
                        console.log(e);
                        console.log('Unable to add item ' + commands[2]);
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
            console.log('Player ' + that.id + ' (' + that.user.userData.userName + ') has disconnected.');
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

    
    this.socket.on('loginAttempt', function (data) {

        try{
            if (!that.gameSession){
                if (data.guest){
                    //SET USER DATA TO GUEST
                    that.user = User();
                    that.user.setOwner(that);
                    that.user.init({guest: true});
                    that.user.setLastLogin(Date.now());
                    that.gameEngine.queuePlayer(that,"loggedIn", {name:that.user.userData.userName,stats:that.user.userData.stats});
                }else if (data.sn && data.pw){
                    data.sn = data.sn.toLowerCase();
                    if (!that.gameEngine.users[that.gameEngine._userIndex[data.sn]].lock){
                        var url = 'mongodb://127.0.0.1/lithiumAve';
                        mongo.connect(url, function(err, db) {
                            // ---- Attemp to find existing user ----
                            var query = { userName: data.sn };
                            db.collection('users').find(query).toArray(function(err, arr) {
                                if (err) throw err;
                                const hash = crypto.createHmac('sha256', data.pw).update(that.gameEngine.hashSalt);
                                if (arr.length == 1 && hash.digest('hex') == arr[0].password){
                                    //SET USER DATA TO EXISTING USER
                                    that.user = User();
                                    that.user.setOwner(that);
                                    that.user.init(arr[0]);
                                    that.user.lock();
                                    that.user.setLastLogin(Date.now());
                                    that.gameEngine.queuePlayer(that,"loggedIn", {name:arr[0].userName});
                                }else{
                                    that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'wp'});
                                }
                            });
                            db.close();
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
    this.socket.on('createUser', function (data) {
        try{
            data.sn = data.sn.toLowerCase();
            if (!that.gameSession && data.sn != 'guest' && data.pw){
                var url = 'mongodb://127.0.0.1/lithiumAve';
                mongo.connect(url, function(err, db) {
                    
                    // ---- Attemp to create new user ----
                    var query = { userName: data.sn };
                    //make sure the username is not in use
                    db.collection('users').find(query).toArray(function(err, arr) {
                        if (err) throw err;
                        //SET USER DATA TO NEW USER
                        if (data.sn.length >= 3 && data.sn.length <= 16 && data.pw.length >= 8 && data.pw.length <= 16 && arr.length == 0){
                            console.log('valid account info - creating account');
                            //hash the password
                            const hash = crypto.createHmac('sha256', data.pw).update(that.gameEngine.hashSalt);
                            var u = {
                                userName: data.sn,
                                password: hash.digest('hex')
                            };
                            that.user = User();
                            that.user.setOwner(that);
                            that.user.init(u)
                            db.collection('users').insertOne(that.user.userData, function(err, res) {
                                if (err) throw err;
                                console.log("added user: " + data.sn);
                            });
                            var query = { userName: data.sn };
                            db.collection('users').find(query).toArray(function(err, arr2) {
                                that.gameEngine.users[arr2[0]._id] = arr2[0];
                                that.gameEngine._userIndex[data.sn] = arr2[0]._id;
                                that.gameEngine.queuePlayer(that,"loggedIn", {name:arr2[0].userName,stats:arr2[0].stats});
                            });
                        }else if (arr.length != 0){
                            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'uiu'});
                        }else if (data.sn.length < 3 || data.sn.length > 16){
                            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'ule'});
                        }else if (data.pw.length < 8 || data.pw.length > 16){
                            that.gameEngine.queuePlayer(that,"setLoginErrorText", {text: 'ple'});
                        }
                        db.close();
                    });

                });
            }
        }catch(e){
            console.log('error creating user');
            console.log(e.stack);
        }
    });
};

exports.Player = Player;
