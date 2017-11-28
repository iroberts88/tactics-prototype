//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

//var GameSession = require('./gamesession.js').GameSession,
var mongo = require('mongodb').MongoClient,
    Player = require('./player.js').Player;

var self = null;

var GameEngine = function() {
    this.users = {};
    this._userIndex = {};
    this.gameTickInterval = 20;
    this.lastTime = Date.now();
    this.sessions = {}; //List of currently active gameSessions
    this.players = {}; //List of players that do not have a gameSession
    this.openSessions = null;
    this.maps = [];
    this.items = {};
    this.buffs = {};
    this.classes = {};
    this.playerCount = 0;
    //variables for ID's
    this.ids = {};
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    this.debugList = {}; //avoid multiple debug chains
}

GameEngine.prototype.init = function () {
    this.start();
};

GameEngine.prototype.start = function () {
    console.log('Starting Game Engine.');
    console.log('Ready. Waiting for players to connect...');
    self = this;
    setInterval(this.tick, this.gameTickInterval);
}

GameEngine.prototype.tick = function() {
    var now = Date.now();
    var deltaTime = (now-self.lastTime) / 1000.0;
    /*
    //update all sessions
    self.openSessions = [];
    for(var i in self.sessions) {
        self.sessions[i].tick(deltaTime);
        if (self.sessions[i].playerCount < self.sessions[i].maxPlayers){
            //this session is open
            self.openSessions.push(self.sessions[i]);
        }
        if (self.sessions[i].playerCount + self.sessions[i].playersToAdd.length <= 0){
            self.sessions[i].emptyFor += deltaTime;
            if (self.sessions[i].emptyFor > 0.1){
                console.log("deleting session " + self.sessions[i].id);
                delete self.sessions[i];
            }
        }
    }
    for (var player in self.players){
        var p = self.players[player];
        if(p.tryingToJoinGame){
            var openSession = false;
            for (var session = 0;session < self.openSessions.length;session++){
                if (self.openSessions[session].gameModeManager.gameMode == p.tryingToJoinGame){
                    //there is an open session of the correct type
                    //add the player if it is between rounds!
                    openSession = true;
                    if (self.openSessions[session].gameModeManager.betweenEvents && self.openSessions[session].playerCount + self.openSessions[session].playersToAdd.length <= self.openSessions[session].maxPlayers){
                        self.openSessions[session].playersToAdd.push(p);
                        p.tryingToJoinGame = false;
                        p.tryingToJoinSession = self.openSessions[session];
                    }
                }
            }
            if (!openSession){
                console.log('Creating a new ' + p.tryingToJoinGame + ' session');
                var s = new GameSession(self);
                s.init({ sid: self.getId(), gameMode: p.tryingToJoinGame });
                console.log('session id: ' + s.id);
                self.sessions[s.id] = s;
            }
        }
    }*/
    //update debug list
    for (var i in self.debugList){
        self.debugList[i].t -= deltaTime;
        if (self.debugList[i].t <= -5.0){
            //debug hasnt been updates in 5 seconds
            //remove from debug list
            console.log('deleting debug with id' + self.debugList[i].id);
            delete self.debugList[i];
        }
    }
    self.emit();
    self.clearQueue();
    self.lastTime = now;
}


GameEngine.prototype.getId = function() {
    var id = '';
    for( var i=0; i < 6; i++ ){
        id += this.possibleIDChars.charAt(Math.floor(Math.random() * this.possibleIDChars.length));
    }
    if (!this.ids[id]){
        this.ids[id] = 1;
        return id;
    }else{
        return this.getId();
    }
    return id;
}

// ----------------------------------------------------------
// Data loading functions (from db etc)
// ----------------------------------------------------------

GameEngine.prototype.loadMaps = function(arr) {
    for (var i = 0; i < arr.length;i++){
        this.maps.push(arr[i].name);
    }
    console.log('loaded ' + arr.length + ' Maps from db');
}

GameEngine.prototype.loadItems = function(arr) {
    for (var i = 0; i < arr.length;i++){
        this.items[arr[i]._dbIndex] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Items from db');
}

GameEngine.prototype.loadBuffs = function(arr) {
    for (var i = 0; i < arr.length;i++){
        this.buffs[arr[i]._dbIndex] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Buffs from db');
}

GameEngine.prototype.loadClasses = function(arr) {
    for (var i = 0; i < arr.length;i++){
        this.classes[arr[i]._dbIndex] = arr[i];
        //fill in the abiliy index for quick access
        this.classes[arr[i]._dbIndex].abilityIndex = {};
        for (var j = 0; j < this.classes[arr[i]._dbIndex].abilities.length;j++){
            this.classes[arr[i]._dbIndex].abilityIndex[this.classes[arr[i]._dbIndex].abilities[j].id] = j;
        }
    }
    console.log('loaded ' + arr.length + ' Classes from db');
}

GameEngine.prototype.loadUsers = function(arr) {
    for (var i = 0;i < arr.length;i++){
        this.users[arr[i]._id] = arr[i];
        this._userIndex[arr[i].userName] = arr[i]._id;
    }
    console.log("loaded " + (i) + ' users from db');
}


// ----------------------------------------------------------
// Socket Functions
// ----------------------------------------------------------

GameEngine.prototype.newConnection = function(socket) {
    console.log('New Player Connected');
    console.log('Socket ID: ' + socket.id);
    self.playerCount += 1;
    //Initialize new player and add to the proper session
    var p = new Player();
    p.id = self.getId();
    p.setGameEngine(self);
    console.log('Player ID: ' + p.id);
    p.init({socket:socket});
    self.queuePlayer(p,'connInfo', {mapNames: self.maps});
    self.players[p.id] = p;
}

GameEngine.prototype.emit = function() {
    var i;
    try{
        for(i in this.players) {
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
//Queue data to all players in the session
GameEngine.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    var i;
    for(i in this.players) {
        this.players[i].netQueue.push(data);
    }
}

//Queue data to a specific player
GameEngine.prototype.queuePlayer = function(player, c, d) {
    var data = { call: c, data: d};
    player.netQueue.push(data);
}

//Queue DEBUG data to a specific player
GameEngine.prototype.debug = function(player, d) {
    var data = { call: 'debug', data: d};
    if (typeof this.debugList[d.id] == 'undefined'){
        //new debug error
        //add to debug list and send to client
        this.debugList[d.id] = {
            id: data.id,
            n: 1,
            t: 1.0
        }
        data.data.n = 1;
        player.netQueue.push(data);
    }else{
        this.debugList[d.id].n += 1;
        data.data.n = this.debugList[d.id].n
        if (this.debugList[d.id].t <= 0){
            player.netQueue.push(data);
            this.debugList[d.id].t = 1.0;
        }
    }
}

GameEngine.prototype.clearQueue = function() {
    //this.queue = [];
    var i;
    for(i in this.players) {
        this.players[i].netQueue = [];
    }
}

exports.GameEngine = GameEngine;