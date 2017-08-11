//----------------------------------------------------------------
//GameModeManager.js
// used by a game session to update different game modes
//----------------------------------------------------------------

var GameModeManager = function(session) {
    this.session = session
    this.timePerEvent = null;
    this.timeBetweenEvents = null;
    this.timePerEventTicker = null;
    this.timeBetweenEventsTicker = null;
    this.warningTime = null;
    this.warningSent = null;
    this.eventStarted = null;
    this.betweenEvents = null;
    this.eventEnemyArray = null;
    this.squares = null;
    this.maxSquares = null;
    this.trapEvery = null;
    this.totalTime = null;
    this.starsTicker = null;
    this.starsMax = null;
    this.starsCurrent = null;
    this.gameMode = null;

    this.eventFunc = null;
    this.tickFunc = null;
    this.killPlayerFunc = null;
    this.tickPlayersFunc = null;
    this.tickEnemiesFunc = null;

    this.score = null;

    this.sentCoopLose = null;
}

GameModeManager.prototype.init = function (data) {
    //TODO different game types etc. in init
    this.timePerEvent = data.timePerEvent;
    this.timeBetweenEvents = data.timeBetweenEvents;
    this.timePerEventTicker = 0;
    this.timeBetweenEventsTicker = 0;
    this.warningTime = data.warningTime;
    this.warningSent = false;
    this.eventStarted = false;
    this.eventEnemyArray = ['c1'];
    this.squares = [];
    this.maxSquares = data.maxSquares;
    this.betweenEvents = true;
    this.trapEvery = 8;
    this.squaresEvery = data.squaresEvery;
    //stars game mode
    this.totalTime = 0;
    this.starsTicker = 0;
    this.starsMax = 30;
    this.starsCurrent = 0;
    this.score = 0;
    this.sentCoopLose = false;
};


GameModeManager.prototype.tick = function(deltaTime){
    this.tickFunc(deltaTime);
}

/////////////////////////////////////////////////////////////////
//           Functions for  gameModeManager.tick               //
////////////////////////////////////////////////////////////////
GameModeManager.prototype.normalTick = function(deltaTime){
    //Events
    if (this.betweenEvents){
        this.timeBetweenEventsTicker += deltaTime;
        if (this.timeBetweenEventsTicker >= this.timeBetweenEvents){
            this.eventFunc();
            this.betweenEvents = false;
            this.eventStarted = true;
            this.timeBetweenEventsTicker = 0;
            this.timePerEventTicker = 0;
        }
    }else{
        //event is ongoing - check enemies to see if the necessary ones have been killed
        var eventComplete = true;
        for (var i in this.session.enemies){
            if (this.session.enemies[i].killToStartNextEvent){
                eventComplete = false;
            }
        }
        if (eventComplete){
            for (var i in this.session.enemies){
                if (this.session.enemies[i].type == 'star' || this.session.enemies[i].type == 'trap'){
                    this.session.enemies[i].kill = true;
                }
            } 
            this.betweenEvents = true;
            this.warningSent = false;
            this.eventStarted = false;
            this.timeBetweenEventsTicker = 0;
            this.timePerEventTicker = 0;
        }
    }
    if (this.eventStarted){
        this.timePerEventTicker += deltaTime;
        if (this.timePerEventTicker >= this.timePerEvent){
            //NEW EVENT - Took too long to finish the level!
            for (var i in this.session.enemies){
                this.session.enemies[i].scoreBase = 0;
            }
            this.eventFunc();
            this.timeBetweenEventsTicker = 0;
            this.timePerEventTicker = 0;
        }
    }
    //warning if new event is near
    if ((this.timeBetweenEventsTicker > (this.timeBetweenEvents-this.warningTime) ||
        this.timePerEventTicker > (this.timePerEvent - this.warningTime)) && !this.warningSent){
        this.warningSent = true;
        this.session.queueData('warning',{time: this.warningTime, level: this.session.level});
    }
}

GameModeManager.prototype.starsTick = function(deltaTime){
    this.totalTime += deltaTime;
    this.starsTicker += deltaTime;
    if (this.starsTicker >= 1.0){
        //add star
        if (this.starsCurrent < this.starsMax){
            var enemiesAdded = [];
            var e = this.session.addEnemy('star',{});
            enemiesAdded.push({type: 'star', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            this.session.queueData('addEnemies', {data: enemiesAdded});
            this.starsTicker -= 1.0;
            this.starsCurrent += 1;
        }else if (this.starsTicker >= 10.0){
            var enemiesAdded = [];
            for (var player in this.session.players){
                var e = this.session.addEnemy('tri',{target: player});
                enemiesAdded.push({type: 'tri', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            }
            this.session.queueData('addEnemies', {data: enemiesAdded});
            this.starsTicker -= 10.0;
            this.starsCurrent += 1;
        }
    }
}



/////////////////////////////////////////////////////////////////
//                Functions for events used in .tick          //
////////////////////////////////////////////////////////////////

GameModeManager.prototype.newEvent = function() {
    var enemiesAdded = [];
    var data = {};
    var rand = Math.min(100,Math.round(5 + this.session.level/2));
    if (Math.round(Math.random())){
        data.switchSides = true;
    }else{
        data.switchSides = false;
    }
    if (this.session.level % 13 == 0){
        //add squares every 4 levels
        //TODO add squares to its own func
        if (this.session.level%this.squaresEvery == 0 || this.squares.length == 0){
            if (this.squares.length >= this.maxSquares){
                var r = (Math.floor(Math.random()*this.squares.length));
                var randomSquare = this.squares[r];
                randomSquare.kill = true;
                this.squares.splice(r,1);
            }
            var chance = 10+Math.sqrt(this.session.level*10);
            if (this.session.level <=28){
                chance = 0;
            }
            if (Math.random()*100 < chance){
                var e = this.session.addEnemy('sq2',data);
                enemiesAdded.push({type: 'sq2', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour:e.behaviour});
                this.squares.push(e);
            }else{
                var e = this.session.addEnemy('sq',data);
                enemiesAdded.push({type: 'sq', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y});
                this.squares.push(e);
            }
        }
        for (var player in this.session.players){
            for (var i = 0; i < Math.min(3,Math.ceil(this.session.level/26));i++){
                data.target = player;
                var e = this.session.addEnemy('pent',data);
                enemiesAdded.push({type: 'pent', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            }
        }
        for (var i = 0; i < Math.min(10,Math.floor(this.session.level/14));i++){
            var e = this.session.addEnemy('star',data);
            enemiesAdded.push({type: 'star', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
        }
    }else if (this.session.level % 25 == 0){
        //parallellogram event!!!
        //kill all squares
        for (var i = 0; i < this.squares.length; i++){
            this.squares[i].kill = true;
        }
        this.squares = [];
        //add stars
        var num = Math.min(10,Math.ceil(this.session.level / 17));
        for (var i = 0; i < num; i++){
            var e = this.session.addEnemy('star',data);
            enemiesAdded.push({type: 'star', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
        }
        //add parallelograms
        enemiesAdded = this.getParallelograms(enemiesAdded);
    }else{
        //add squares every 4 levels
        if (this.session.level%this.squaresEvery == 0 || this.squares.length == 0){
            if (this.squares.length >= this.maxSquares){
                var r = (Math.floor(Math.random()*this.squares.length));
                var randomSquare = this.squares[r];
                randomSquare.kill = true;
                this.squares.splice(r,1);
            }
            var chance = 10+Math.sqrt(this.session.level*10);
            if (this.session.level <=25){
                chance = 0;
            }
            if (Math.random()*100 < chance){
                var e = this.session.addEnemy('sq2',data);
                enemiesAdded.push({type: 'sq2', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour:e.behaviour});
                this.squares.push(e);
            }else{
                var e = this.session.addEnemy('sq',data);
                enemiesAdded.push({type: 'sq', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y});
                this.squares.push(e);
            }
        }
        switch(this.session.level){
            case 3:
                this.eventEnemyArray.push('c2');
                break;
            case 6:
                this.eventEnemyArray.push('c3');
                break;
            case 10:
                this.eventEnemyArray.push('tri');
                break;
        }
        this.trapEvery = Math.max(2,(8-Math.floor(this.session.level/50)));
        if (this.session.level >= 24 && this.session.level%this.trapEvery == 0){
            //for trapezoid event
            var positions = [[64,-32],[192,-32],[320,-32],[448,-32],[576,-32],[704,-32],[832,-32],[960,-32],[1088,-32],
                            [1216,-32],[1344,-32],[1472,-32],[1600,-32],[1728,-32],[1856,-32]];
            for (var i = 0; i < positions.length; i++){
                data.pos = positions[i];
                var e = this.session.addEnemy('trap',data);
                enemiesAdded.push({type: 'trap', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y});
                e.hitData.rotate(3.14);
            }
            positions = [[64,1112],[192,1112],[320,1112],[448,1112],[576,1112],[704,1112],[832,1112],[960,1112],[1088,1112],
                            [1216,1112],[1344,1112],[1472,1112],[1600,1112],[1728,1112],[1856,1112]];
            for (var i = 0; i < positions.length; i++){
                data.pos = positions[i];
                var e = this.session.addEnemy('trap',data);
                enemiesAdded.push({type: 'trap', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y});
            }
            positions = [[-32,192],[-32,320],[-32,448],[-32,576],[-32,704],[-32,832],[-32,960]];
            for (var i = 0; i < positions.length; i++){
                data.pos = positions[i];
                var e = this.session.addEnemy('trap',data);
                enemiesAdded.push({type: 'trap', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y});
                e.hitData.rotate(-1.57);
            }
            positions = [[1952,192],[1952,320],[1952,448],[1952,576],[1952,704],[1952,832],[1952,960]];
            for (var i = 0; i < positions.length; i++){
                data.pos = positions[i];
                var e = this.session.addEnemy('trap',data);
                enemiesAdded.push({type: 'trap', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y});
                e.hitData.rotate(1.57);
            }
        }
        var chaos = false;
        if (Math.random()<0.01){
            chaos = true;
        }
        rand = Math.ceil(rand/this.session.playerCount);
        for (var player in this.session.players){
            for (var i = 0; i < rand;i++){
                var type = this.eventEnemyArray[Math.floor(Math.random()*this.eventEnemyArray.length)];
                if (chaos){
                    type = 'chaos';
                }
                data.target = player;
                var e = this.session.addEnemy(type,data);
                enemiesAdded.push({type: type, id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            }
            if (this.session.level == 20){
                data.target = player;
                var e = this.session.addEnemy('hex',data);
                enemiesAdded.push({type: 'hex', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            }
            if (this.session.level >= 27 && this.session.level%3 == 0){
                if (Math.round(Math.random())){
                    data.target = player;
                    var e = this.session.addEnemy('hex',data);
                    enemiesAdded.push({type: 'hex', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
                }else{
                    data.target = player;
                    var e = this.session.addEnemy('pent',data);
                    enemiesAdded.push({type: 'pent', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
                }
            }
        }
        var stars = Math.min(10,(Math.ceil(this.session.level/25)+this.session.level%2));
        if (this.session.level >= 15){
            for (var i = 0; i < stars; i++){
                var e = this.session.addEnemy('star',data);
                enemiesAdded.push({type: 'star', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            }
        }
    }
    this.session.queueData('addEnemies', {data: enemiesAdded});
    this.session.level += 1;
    this.warningSent = false;
}

GameModeManager.prototype.chaosEvent = function() {
    var enemiesAdded = [];
    var data = {};
    var rand = Math.round(5 + this.session.level);
    if (rand > 100){
        rand = 100;
    }
    //add squares every 4 levels
    if (this.session.level%this.squaresEvery == 0 || this.squares.length == 0){
        if (this.squares.length >= this.maxSquares){
            var r = (Math.floor(Math.random()*this.squares.length));
            var randomSquare = this.squares[r];
            randomSquare.kill = true;
            this.squares.splice(r,1);
        }
        var e = this.session.addEnemy('sq2',data);
        enemiesAdded.push({type: 'sq2', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour:e.behaviour});
        this.squares.push(e);
    }
    rand = Math.ceil(rand/this.session.playerCount);
    for (var player in this.session.players){
        for (var i = 0; i < rand;i++){
            var type = this.eventEnemyArray[Math.floor(Math.random()*this.eventEnemyArray.length)];
            data.target = player;
            data.pos = this.getRandomPos(true,false);
            var e = this.session.addEnemy(type,data);
            enemiesAdded.push({type: type, id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
        }
    }
    for (var p = 0; p < Math.round(Math.random()*8); p++){
        data.pos = this.getRandomPos(true,false);
        var e = this.session.addEnemy('par', data);
        enemiesAdded.push({type: 'par', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
    }
    this.session.queueData('addEnemies', {data: enemiesAdded});
    this.session.level += 1;
    this.warningSent = false;
}

/////////////////////////////////////////////////////////////////
//                Functions for killing players                    //
////////////////////////////////////////////////////////////////
//These are called in enemy.tick

GameModeManager.prototype.killPlayer = function(player){
    player.kill = true;
    if (this.gameMode == 'solo'){
        player.user.checkSoloHighScore(this.score);
        player.user.checkSoloLevelRecord(this.session.level-1);
        player.gameEngine.checkSoloHighScore(player,this.score,this.session.level-1);
    }
    this.session.queueData('killPlayer', {id:player.id});
    this.session.queueData('youLose', {score: this.score});
}

GameModeManager.prototype.killPlayerStars = function(player){
    player.kill = true;
    player.user.checkStarsLongestGame(Math.round(this.totalTime*10)/10);
    player.gameEngine.checkStarsLongestGame(player.user.userData.userName, Math.round(this.totalTime*10)/10)
    this.session.queueData('killPlayer', {id:player.id});
    this.session.queueData('youLasted', {time: Math.round(this.totalTime*10)/10});
}

GameModeManager.prototype.killPlayerCoop = function(player){
    //TODO - score multiplier for this level should be 0 when a player dies
    player.kill = true;
    player.revive = true;
    this.session.queueData('killPlayer', {id:player.id});
}

GameModeManager.prototype.killPlayerVersus = function(player){
    player.kill = true;
    this.session.queueData('killPlayer', {id:player.id});
    this.session.queuePlayer(player,'youLose', {});
    for (var i in this.session.players){
        var winner = this.session.players[i];
        if (winner.id != player.id){
            winner.god = true;
            winner.kill = true;
            winner.user.vsGameWon();
            winner.gameEngine.checkVSGamesWon(winner.user.userData.userName,winner.user.userData.stats.vsGamesWon);
            this.session.queuePlayer(winner,'youWin', {});
        }
    }
}

/////////////////////////////////////////////////////////////////
//                Functions for ticking players                   //
////////////////////////////////////////////////////////////////
//called in the session.tick

GameModeManager.prototype.tickPlayers = function(deltaTime){
    for (var i in this.session.players){
        var player = this.session.players[i];
        player.tick(deltaTime);
        if (player.kill){
            player.killCountDown -= deltaTime;
            if (player.killCountDown <= 0){
                //remove player from session?
                this.session.removePlayer(player);
            }
            this.session.canJoin = false;
        }
    }
}

GameModeManager.prototype.tickPlayersCoop = function(deltaTime){
    var activePlayers = 0;
    var players = 0;
    for (var i in this.session.players){
        var player = this.session.players[i];
        player.tick(deltaTime);
        if (!player.kill){
            activePlayers += 1;
        }
        players += 1;
    }
    if (!activePlayers && players > 0){
        //there are no active PLayers... they have all died. remove all from session after countdown!
        if (!this.sentCoopLose){
            this.session.queueData('youLose', {score:this.score});
            for (var i in this.session.players){
                var player = this.session.players[i];
                player.user.checkCoopHighScore(this.score);
                player.user.checkCoopLevelRecord(this.session.level-1);
            }
            this.session.engine.checkCoopHighScore(this.session.players,this.score,this.session.level-1);
            this.sentCoopLose = true;
            this.session.canJoin = false;
        }
        for (var i in this.session.players){
            player.killCountDown -= deltaTime;
            if (player.killCountDown <= 0){
                //remove player from session?
                this.session.removePlayer(player);
            }
        }
    }else{
        //there are active players... if you are between a session re-add the dead players!
        for (var i in this.session.players){
            var player = this.session.players[i];
            if (player.revive && this.betweenEvents){
                player.kill = false;
                player.revive = false;
                player.god = true;
                player.godTimer = this.timeBetweenEvents-this.timeBetweenEventsTicker;
                this.session.queuePlayer(player,'unKillPlayer', {});
                for (var j in this.session.players){
                    var p = this.session.players[j];
                    if (p.id != player.id){
                        var d = {
                            id: player.id,
                            x: player.hitData.pos.x,
                            y: player.hitData.pos.y,
                            radius: player.radius,
                            speed: player.speed
                        };
                        this.session.queuePlayer(p,'addPlayerWisp', d);
                    }
                }
            }
        }
    }
}

/////////////////////////////////////////////////////////////////
//                Functions for ticking Enemies               //
////////////////////////////////////////////////////////////////
//called in the session.tick

GameModeManager.prototype.tickEnemies = function(deltaTime){
    for (var i in this.session.enemies){
        var enemy = this.session.enemies[i];
        enemy.tick(deltaTime);
        if (enemy.kill){
            if (enemy.killFunc){
                var Behaviour = require('./behaviour.js').Behaviour;
                var B = Behaviour.getBehaviour(enemy.killFunc.name);
                B(enemy,deltaTime,enemy.killFunc);
            }
            this.score += Math.round(enemy.scoreBase*(this.timePerEvent-this.timePerEventTicker));
            this.session.queueData('removeEnemy', {id: enemy.id});
            delete this.session.enemies[i];
        }
    }
}

GameModeManager.prototype.tickEnemiesCoop = function(deltaTime){
    for (var i in this.session.enemies){
        var enemy = this.session.enemies[i];
        enemy.tick(deltaTime);
        if (enemy.kill){
            if (enemy.killFunc){
                var Behaviour = require('./behaviour.js').Behaviour;
                var B = Behaviour.getBehaviour(enemy.killFunc.name);
                B(enemy,deltaTime,enemy.killFunc);
            }
            //if any players are dead it will not be scored
            var alive = true;
            for (var p in this.session.players){
                if (this.session.players[p].kill){
                    alive = false;
                }
            }
            if (alive){
                this.score += Math.round(enemy.scoreBase*(this.timePerEvent-this.timePerEventTicker));
            }
            this.session.queueData('removeEnemy', {id: enemy.id});
            delete this.session.enemies[i];
        }
    }
}
/////////////////////////////////////////////////////////////////
//                Utility/other functions                      //
////////////////////////////////////////////////////////////////
GameModeManager.prototype.getRandomPos = function(canBeTopOrBottom,swap) {
    //get a random position outside the map 
    var h = 1080;
    var w = 1920;
    var p = [0,0];
    var side = Math.floor(Math.random()*2);
    if (canBeTopOrBottom){
        side = Math.floor(Math.random()*4);
    }
    if (swap){
        side = 2+Math.round(Math.random());
    }

    if (side == 0){ //left
        p[0] = -100 + Math.round(Math.random()*-100);
        p[1] = -200 + Math.round(Math.random()*(h+400));
    }else if (side == 1){ //right
        p[0] = w + 100 + Math.round(Math.random()*100);
        p[1] = -200 + Math.round(Math.random()*(h+400));
    }else if (side == 2){ //top
        p[0] = 200 + Math.round(Math.random()*(w-400));
        p[1] = -100 + Math.round(Math.random()*-100);
    }else if (side == 3){
        p[0] = 200 + Math.round(Math.random()*(w-400));
        p[1] = h + 100 + Math.round(Math.random()*100);
    }
    return p;
}

GameModeManager.prototype.getParallelograms = function(enemiesAdded) {
    var rowStart = 2120;
    var colStart = -64;
    var arr = [];
    var lateral = true;
    if (Math.round(Math.random())){
        rowStart = -200 -20*196;
    }
    var rand = Math.random()*4;
    if (rand < 1){
        rowStart = -200 -20*196;
        colStart = -64;
    }else if (rand < 2){
        rowStart = 64;
        colStart = -200 -20*128;
        lateral = false
    }else if (rand < 3){
        rowStart = 64;
        colStart = 1280;
        lateral = false;
    }
    for (var row = 0;row < 20;row++){
        var arr2 = [];
        for (var col = 0;col < 10;col++){
            arr2.push(1);
        }
        arr.push(arr2);
    }
    //lateral
    var points = [  [0,(1+Math.floor(Math.random()*8))],
                    [3+Math.floor(Math.random()*3),(1+Math.floor(Math.random()*8))],
                    [8+Math.floor(Math.random()*3),(1+Math.floor(Math.random()*8))],
                    [14+Math.floor(Math.random()*3),(1+Math.floor(Math.random()*8))],
                    [19,(1+Math.floor(Math.random()*8))]];
    for (var i = 0; i < 4;i++){
        var atNextPoint = false;
        var currentLoc = [points[i][0],points[i][1]];
        while(!atNextPoint){
            arr[currentLoc[0]][currentLoc[1]] = 0;
            if (currentLoc[0] < points[i+1][0]){
                currentLoc[0] += 1;
            }else if (currentLoc[0] > points[i+1][0]){
                currentLoc[0] -= 1;
            }else if (currentLoc[1] < points[i+1][1]){
                currentLoc[1] += 1;
            }else if (currentLoc[1] > points[i+1][1]){
                currentLoc[1] -= 1;
            }
            if (currentLoc[0] == points[i+1][0] && currentLoc[1] == points[i+1][1]){
                atNextPoint = true;
            }
        }
    }
    arr[points[4][0]][points[4][1]] = 0;
    if (lateral){
        for (var i = 0; i < arr.length;i++){
            for (var j = 0; j < arr[i].length;j++){
                if (arr[i][j]){
                    var e = this.session.addEnemy('par', {pos: [rowStart+192*i,colStart+(128*j)]});
                    enemiesAdded.push({type: 'par', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
                }
            }
        }
    }else{
        for (var i = 0; i < arr.length;i++){
            for (var j = 0; j < arr[i].length;j++){
                if (arr[i][j]){
                    var e = this.session.addEnemy('par', {pos: [rowStart+192*j,colStart+(128*i)]});
                    enemiesAdded.push({type: 'par', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
                }
            }
        }
    }
    return enemiesAdded;
}

exports.GameModeManager = GameModeManager;