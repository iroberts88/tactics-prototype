//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------
var mongo = require('mongodb').MongoClient,
    User = require('./user.js').User,
    Inventory = require('./inventory.js').Inventory,
    Utils = require('./utils.js').Utils,
    Attribute = require('./attribute.js').Attribute,
    ClassInfo = require('./classinfo.js').ClassInfo;

var Player = function(){
    this.MAX_UNITS = 30;
    
    this.gameEngine = null;
    this.gameSession = null;
    this.user = null;
    this.mapData = null;
    this.characters = null;
    this.inventory = null;
};

Player.prototype.init = function (data) {
    //init player specific variables
   
    this.netQueue = [];
    
    this.inventory = new Inventory();
    this.inventory.init({
        owner: this
    })

    this.characters = [];

    if (typeof data.socket != 'undefined'){
        this.socket = data.socket;
        this.setupSocket();
    }
};
    
Player.prototype.tick = function(deltaTime){
   
};

Player.prototype.onDisconnect = function(callback) {
    this.onDisconnectHandler = callback;
};

Player.prototype.setGameEngine = function(ge){
    this.gameEngine = ge;
};

Player.prototype.setupSocket = function() {

    // On playerUpdate event
    var that = this;

    this.socket.on('playerUpdate', function (data) {
        console.log(data);
        if (that.gameSession){
            //if the player is in a gameSession - deal with received data
           
        }else{
            if (data.logout){
                try{
                    that.gameEngine.queuePlayer(that,'logout', {});
                    that.user.unlock();
                    that.user.updateDB();
                    that.user = null;
                }catch(e){
                    console.log('error - unable to logout user');
                    console.log(e.stack);
                }
            }else if(data.deleteChar){
                try{
                    //remove the character from the player's character list
                    console.log(data);
                    for (var i = 0; i < that.characters.length;i++){
                        if (that.characters[i].id == data.deleteChar){
                            console.log('deleting character: ' + that.characters[i].name);
                            that.characters.splice(i,1);
                            that.gameEngine.queuePlayer(that,'deleteUnit',{id: data.deleteChar});
                            continue;
                        }
                    }
                }catch(e){
                    console.log('error - unable delete character');
                    console.log(e.stack);
                }
            }
        }
    });

    this.socket.on('addRandomChar', function(data){
        if (that.characters.length < 30){
            try{
                var char = new Unit();
                var sexes = ['male','female'];
                var sex = sexes[Math.floor(Math.random()*sexes.length)];
                char.init({
                    id: that.gameEngine.getId(),
                    owner: that,
                    name: '' + Utils.generateName(sex) + ' ' + Utils.generateName('last'),
                    sex: sex
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
                char.inventory.addItem(that.gameEngine.items['gun_sidearm'],1)
                char.inventory.addItem(that.gameEngine.items['weapon_combatKnife'],1)
                var Ch = {}
                for (var a in char){
                    if (char[a] instanceof Attribute){
                        Ch[a] = char[a].value;
                    }else{
                        if (a != 'owner'){
                            Ch[a] = char[a];
                        }
                    }
                }
                Ch.name = char.name;
                Ch.sex = char.sex
                Ch.id = char.id;
                Ch.classInfo = {};
                for (var cI in char.classInfo){
                    if (cI != 'unit'){Ch.classInfo[cI] = char.classInfo[cI]}
                }
                Ch.inventory = {};
                Ch.inventory.items = [];
                Ch.inventory.currentWeight = char.inventory.currentWeight;
                Ch.inventory.maxItemPile = char.inventory.maxItemPile;
                for (var i = 0; i < char.inventory.items.length;i++){
                    var item = that.gameEngine.items[char.inventory.items[i][0]]
                    Ch.inventory.items.push({
                        "description": item['description'],
                        "name": item['name'],
                        "type": item['type'],
                        "weight": item['weight']
                    });
                }
                Ch.inventory.maxWeight = char.inventory.maxWeight.value;
                that.gameEngine.queuePlayer(that,'addNewUnit', {'unit': Ch});
                that.characters.push(char);
            }catch(e){
                that.gameEngine.queuePlayer(that,'debug', {error: e.stack});
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
                            mapData: that.mapData.mapData
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
            console.log(e);
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
                        mapData: data.mapData
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
                    that.gameEngine.queuePlayer(that,"editMap", {found:true,name:arr[0].name,mapData:arr[0].mapData});
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
            }
        }catch(e){
            console.log(e);
        }
    });

    this.socket.on('disconnect', function () {
    
        try{
            that.gameEngine.playerCount -= 1;
            that.user.unlock();
            console.log('Player ' + that.id + ' (' + that.user.userData.userName + ') has disconnected.');
            that.user.updateDB();
            if (that.gameSession){
                that.gameSession.queueData('removePlayer', that.id);
                that.gameSession.removePlayer(that);
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
                    that.user.init({});
                    that.user.setOwner(that);
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
                                if (arr.length == 1 && data.pw == arr[0].password){
                                    //SET USER DATA TO EXISTING USER
                                    that.user = User();
                                    that.user.init(arr[0]);
                                    that.user.setOwner(that);
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
                var url = 'mongodb://127.0.0.1/wisp';
                mongo.connect(url, function(err, db) {
                    
                    // ---- Attemp to create new user ----
                    var query = { userName: data.sn };
                    //make sure the username is not in use
                    db.collection('users').find(query).toArray(function(err, arr) {
                        if (err) throw err;
                        //SET USER DATA TO NEW USER
                        if (data.sn.length >= 3 && data.sn.length <= 16 && data.pw.length >= 8 && data.pw.length <= 16 && arr.length == 0){
                            console.log('valid account info - creating account');
                            var u = {
                                userName: data.sn,
                                password: data.pw
                            };
                            that.user = User();
                            that.user.init(u)
                            that.user.setOwner(that);
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
