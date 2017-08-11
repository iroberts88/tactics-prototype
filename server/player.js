//----------------------------------------------------------------
//player.js
//----------------------------------------------------------------

var SAT = require('./SAT.js'), //SAT POLYGON COLLISSION1
    Unit = require('./unit.js').Unit,
    User = require('./user.js').User,
    mongo = require('mongodb').MongoClient

var P = SAT.Polygon;
var V = SAT.Vector;
var C = SAT.Circle;

Player = function(){

    var player = Unit()

    player.radius = null;
    player.targetPosition = null;
    //variables for movement
    player.xDistance = null;
    player.yDistance = null;
    player.hyp = null;
    player.move = null;
    player.actualMoveX = null;
    player.actualMoveY = null;
    player.actualMoveHyp = null;

    player.vectorHitbox = null;

    player.tryingToJoinGame = null;
    player.tryingToJoinSession = null;

    player.kill = null;
    player.revive = null;
    player.killCountDown = null;
    player.god = false;
    player.godTimer = 0;
    player.godTemp = false;

    player.score = 0;

    player.user = null;

    player.init = function (data) {
        //init player specific variables
        this.speed = 6000;
        this.score = 0;
        this.god = false;
        this.godTimer = 0;
        this.godTemp = false;
        this.radius = 20;
        this.kill = false;
        this.revive = false;
        this.killCountDown = 5; //seconds before returned to main menu
        this.netQueue = [];
        this.hitData = new P(new V(960, 540),   [new V(Math.round(-.8*this.radius),Math.round(-.8*this.radius)),
                                             new V(Math.round(-.8*this.radius),Math.round(.8*this.radius)),
                                             new V(Math.round(.8*this.radius),Math.round(.8*this.radius)),
                                             new V(Math.round(.8*this.radius),Math.round(-.8*this.radius))]);
        this.targetPosition = new V(960,540);

        this.vectorHitbox = new P(new V(960,540),[new V(0,-1),new V(0,1),new V(10,1),new V(10,-1)]);

        player.tryingToJoinGame = false;

        if (typeof data.socket != 'undefined'){
            this.socket = data.socket;
            this.setupSocket();
        }
    };
    player.tick = function(deltaTime){
        if (this.godTimer > 0){
            this.godTimer -= deltaTime;
            this.godTemp = true;
        }else if(this.godTemp){
            this.godTemp = false;
            this.god = false;
        }
        //Move closer to targetPosition
        this.xDistance = this.targetPosition.x - this.hitData.pos.x;
        this.yDistance = this.targetPosition.y - this.hitData.pos.y;
        this.hyp = Math.sqrt(this.xDistance*this.xDistance + this.yDistance*this.yDistance);
        this.move = new V(this.xDistance/this.hyp,this.yDistance/this.hyp);
        this.actualMoveX = this.move.x*this.speed*deltaTime;
        this.actualMoveY = this.move.y*this.speed*deltaTime;
        this.actualMoveHyp = Math.sqrt(this.actualMoveX*this.actualMoveX + this.actualMoveY*this.actualMoveY);
        if (this.hyp < this.actualMoveHyp){
            this.vectorHitbox = new P(new V(this.hitData.pos.x,this.hitData.pos.y),[new V(0,this.radius*-1),new V(0,this.radius),new V(this.hyp+1,this.radius),new V(this.hyp+1,this.radius*-1)]);
            this.hitData.pos = new V(this.targetPosition.x, this.targetPosition.y);
        }else{
            this.vectorHitbox = new P(new V(this.hitData.pos.x,this.hitData.pos.y),[new V(0,this.radius*-1),new V(0,this.radius),new V(this.actualMoveHyp+1,this.radius),new V(this.actualMoveHyp+1,this.radius*-1)]);
            this.hitData.pos.x += this.actualMoveX;
            this.hitData.pos.y += this.actualMoveY;
        }
        this.vectorHitbox.rotate(Math.atan2(this.yDistance,this.xDistance));
    };

    player.onDisconnect = function(callback) {
        this.onDisconnectHandler = callback;
    };

    player.setupSocket = function() {

        // On playerUpdate event
        var that = this;

        this.socket.on('playerUpdate', function (data) {
            if (that.gameSession){
                //if the player is in a gameSession - deal with received data
                if (data.newMouseLoc){
                    //need to track player movement on server
                    for (var p in that.gameSession.players){
                        var player = that.gameSession.players[p];
                        if (that.id != p){
                            that.gameSession.queuePlayer(player,'updatePlayerLoc', {playerId: that.id, newLoc: data.newMouseLoc});
                        }
                    }
                    //update the new location
                    that.targetPosition.x = data.newMouseLoc[0];
                    that.targetPosition.y= data.newMouseLoc[1];
                }
            }else{
                if (data.requestPlayerCount){
                    that.gameEngine.queuePlayer(that,'updatePlayerCount', {p: that.gameEngine.playerCount});
                }else if (data.logout){
                    that.user.unlock();
                    that.user.updateDB();
                    that.user = null;
                    that.gameEngine.queuePlayer(that,'logout', {});
                }else if (data.requestHighScores){
                    that.gameEngine.queuePlayer(that,'highScores', {
                        solo: that.gameEngine.soloHighScores,
                        coop: that.gameEngine.coopHighScores,
                        vs: that.gameEngine.vsHighScores,
                        stars: that.gameEngine.starsHighScores
                    });
                }
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
                        commandBool = true
                        that.gameSession.queueData("say", {playerId: that.id,text: c.substring(4)});
                        break;
                    case 'god':
                        //toggle god mode
                        if (that.user.userData.admin){
                            commandBool = true
                            if (that.god){
                                that.god = false;
                            }else{
                                that.god = true;
                            }
                            break;
                        }else{
                            console.log('Not an admin');
                        }
                    case 'how':
                        commandBool = true;
                        if (commands[1] == 'do'){
                            if (commands[2] == 'you'){
                                if (commands[3] == 'turn'){
                                    if (commands[4] == 'this'){
                                        if (commands[5] == 'on'){
                                            if (!that.gameSession){
                                                that.tryingToJoinGame = 'chaos';
                                            }
                                        }   
                                    }
                                }
                            }
                        }
                        break;
                    case 'test':
                        if (that.user.userData.admin){
                            commandBool = true;
                            if (!that.gameSession){
                                that.tryingToJoinGame = 'secret';
                            }
                        }
                        break;
                    case 'stars':
                        commandBool = true;
                        if (!that.gameSession){
                            that.gameEngine.singlePlayerSession(that, 'star');
                        }
                        break;
                    case 'setlevel':
                        if (that.user.userData.admin){
                            commandBool = true;
                            try{
                                that.gameSession.level = parseInt(commands[1]);
                            }catch(e){

                            }
                        }
                        break;
                    case 't':
                        if (that.user.userData.admin){
                            commandBool = true;
                            try{
                                that.gameSession.level = 666;
                            }catch(e){
                                
                            }
                        }
                        break;
                    case 'log':
                        if (that.user.userData.admin){
                            commandBool = true;
                            console.log('log');
                        }
                        break;
                    case 'ping':
                        commandBool = true;
                        if (!that.gameSession){
                            that.gameEngine.queuePlayer(that,"ping", {});
                        }else{
                            that.gameSession.queuePlayer(that,"ping", {});
                        }
                        break;
                }
                if (!commandBool && c != ''){
                    if (c.length > 40){
                        c = c.substring(0,40);
                    }
                    var d = new Date().toString();
                    that.user.userData.chatLog.push({text: c, timeStamp:d});
                    that.gameSession.queueData("say", {playerId: that.id,text: c});
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

        this.socket.on('join', function (data) {
            console.log('Player ' + that.id + ' wants to join a game.');
            if (!that.gameSession){
                if (data.solo){
                    that.gameEngine.singlePlayerSession(that);
                }else if (data.coop){
                    that.tryingToJoinGame = 'coop';
                }else if (data.vs){
                    that.tryingToJoinGame = 'vs';
                }else if (data.stars){
                    that.gameEngine.singlePlayerSession(that, 'star');
                }
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
                        if (!that.gameEngine.users[that.gameEngine._userIndex[data.sn.toLowerCase()]].lock){
                            var url = 'mongodb://127.0.0.1/wisp';
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
                                        that.gameEngine.queuePlayer(that,"loggedIn", {name:arr[0].userName,stats:arr[0].stats});
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

        this.socket.on('cancelJoin', function (data) {
            that.tryingToJoinGame = false;
            if (that.tryingToJoinSession){
                for (var i = 0; i < that.tryingToJoinSession.playersToAdd.length; i++){
                    if (that.tryingToJoinSession.playersToAdd[i] === that){
                        that.tryingToJoinSession.playersToAdd.splice(i,1);
                        break;
                    }
                }
            }
        });
    };

    return player;
}

exports.Player = Player;
