//----------------------------------------------------------------
//gameengine.js
//----------------------------------------------------------------

var GameSession = require('./gamesession.js').GameSession,
    Player = require('./player.js').Player;

var self = null;

var GameEngine = function() {
    this.users = {};
    this._userIndex = {};
    this.gameTickInterval = 20;
    this.lastTime = Date.now();
    this.sessions = {}; //List of currently active gameSessions
    this.sessionList = [];
    this.players = {}; //List of players that do not have a gameSession
    this.playersWaiting = [];
    this.openSessions = null;
    //database objects
    this.maps = {};
    this.mapids = [];
    this.items = {};
    this.buffs = {};
    this.classes = {};
    this.abilityIndex = {};
    this.playerCount = 0;
    //variables for ID's
    this.idIterator = 0;
    this.possibleIDChars = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwyz";

    //TODO this should be randomly generated for each new user?
    this.hashSalt = 'Salt makes things taste better';

    this.debugList = {}; //used avoid multiple debug chains in tick()
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
    
    //update all game sessions
    for (var i in self.sessions){
        self.sessions[i].tick(deltaTime);
    }

    //check waiting players and join new sessions
    if (self.playersWaiting.length >= 2){
        var s = self.createSession();
        self.joinSession(s.id,self.players[self.playersWaiting[0]]);
        self.joinSession(s.id,self.players[self.playersWaiting[0]]);
        self.sessions[s.id].gameStart();
    }

    //update debug list
    for (var k in self.debugList){
        self.debugList[k].t -= deltaTime;
        if (self.debugList[k].t <= -5.0){
            //debug hasnt been updated in 5 seconds
            //remove from debug list
            console.log('deleting debug with id ' + self.debugList[k].id);
            delete self.debugList[k];
        }
    }
    self.emit();
    self.clearQueue();
    self.lastTime = now;
}

GameEngine.prototype.getId = function() {
    var id = this.idIterator + 'x';
    for(var i=0; i<3; i++){
        id += this.possibleIDChars.charAt(Math.floor(Math.random() * this.possibleIDChars.length));
    }
    this.idIterator += 1;
    return id;
}

// ----------------------------------------------------------
// Database loading functions
// ----------------------------------------------------------

GameEngine.prototype.loadMaps = function(arr) {
    for (var i = 0; i < arr.length;i++){
        this.maps[arr[i].mapid] = arr[i];
        this.mapids.push(arr[i].mapid);
    }
    console.log('loaded ' + arr.length + ' Maps from db');
}

GameEngine.prototype.loadItems = function(arr) {
    for (var i = 0; i < arr.length;i++){
        this.items[arr[i].itemid] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Items from db');
}

GameEngine.prototype.loadBuffs = function(arr) {
    for (var i = 0; i < arr.length;i++){
        this.buffs[arr[i].buffid] = arr[i];
    }
    console.log('loaded ' + arr.length + ' Buffs from db');
}

GameEngine.prototype.loadClasses = function(arr) {
    this.abilityIndex = {};
    for (var i = 0; i < arr.length;i++){
        this.classes[arr[i].classid] = arr[i];
        //fill in the abiliy index for quick access
        for (var j = 0; j < this.classes[arr[i].classid].abilities.length;j++){
            this.abilityIndex[this.classes[arr[i].classid].abilities[j].id] = [this.classes[arr[i].classid].classid,j];
        }
    }
    console.log('loaded ' + arr.length + ' Classes from db');
}

GameEngine.prototype.loadUsers = function(arr) {
    for (var i = 0;i < arr.length;i++){
        this.users[arr[i].username] = arr[i];
        this.users[arr[i].username].loggedin = false;
        this._userIndex[arr[i].username] = arr[i].username;
    }
    console.log("loaded " + (i) + ' users from db');
}

// ----------------------------------------------------------
// Session Functions
// ----------------------------------------------------------

GameEngine.prototype.createSession = function(){
    var session = new GameSession(this);
    session.init({
        sid: this.getId()
    });
    this.sessions[session.id] = session;
    this.sessionList.push(session.id);
    return session;
}

GameEngine.prototype.joinSession = function(id,p) {
    //join a player <p> to a session and remove from session
    this.sessions[id].addPlayer(p);
    this.removePlayer(p);
}

GameEngine.prototype.leaveSession = function(id,p) {
    //remove a player <p> from a session and add back to engine
    this.addPlayer(p);
    this.sessions[id].removePlayer(p);
}

GameEngine.prototype.removeSession = function(id) {
    //delete session with <id>
    delete this.sessions[id];
}

GameEngine.prototype.addPlayer = function(p){
    this.players[p.id] = p;
    this.playerCount += 1;
}

GameEngine.prototype.removePlayer = function(p){
    this.playerLogout(p);
    delete this.players[p.id];
    this.playerCount -= 1;
}

GameEngine.prototype.playerLogout = function(p){
    this.playerCancelSearch(p);
}
GameEngine.prototype.playerCancelSearch = function(p){
    for (var i = 0; i < this.playersWaiting.length; i++){
        if (this.playersWaiting[i] == p.id){
            this.playersWaiting.splice(i,1);
        }
    }
}  

// ----------------------------------------------------------
// Socket Functions
// ----------------------------------------------------------

GameEngine.prototype.newConnection = function(socket) {
    console.log('New Player Connected');
    console.log('Socket ID: ' + socket.id);
    //Initialize new player
    var p = new Player();
    p.id = self.getId();
    p.setGameEngine(self);
    console.log('Player ID: ' + p.id);
    p.init({socket:socket});
    self.queuePlayer(p,'connInfo', {mapNames: self.maps});
    self.addPlayer(p);
}

GameEngine.prototype.emit = function() {
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
GameEngine.prototype.clearQueue = function() {
    for(var i in this.players) {
        this.players[i].netQueue = [];
    }
}

//Queue data to all players in the session
GameEngine.prototype.queueData = function(c, d) {
    var data = { call: c, data: d};
    for(var i in this.players) {
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
            id: d.id,
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

exports.GameEngine = GameEngine;