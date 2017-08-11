//----------------------------------------------------------------
//enemy.js
//----------------------------------------------------------------

var SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1
var V = SAT.Vector;
var C = SAT.Circle;
var P = SAT.Polygon;

var Unit = require('./unit.js').Unit;
var Behaviour = require('./behaviour.js').Behaviour;

Enemy = function(){

    var enemy = Unit();

    this.behaviour = null;
    this.killToStartNextEvent = null;
    this.bFunc = null;
    this.scoreBase = null;

    enemy.init = function(data) {
        try{
            this.active = false;
            this.kill = false;
            this.scoreBase = data.scoreBase;
            this.squareKill = data.squareKill;
            this.speed = data.speed;
            this.behaviour = data.behaviour;
            this.bFunc = Behaviour.getBehaviour(this.behaviour.name);
            this.killToStartNextEvent = data.killToStartNextEvent;
            this.type = data.type;
            if (data.killFunc){
                this.killFunc = data.killFunc;
            }else{
                this.killFunc = null;
            }
            if (data.radius){
                this.hitData = new P(new V(data.pos[0], data.pos[1]),   [new V(Math.round(-.8*data.radius),Math.round(-.8*data.radius)),
                                                                         new V(Math.round(-.8*data.radius),Math.round(.8*data.radius)),
                                                                         new V(Math.round(.8*data.radius),Math.round(.8*data.radius)),
                                                                         new V(Math.round(.8*data.radius),Math.round(-.8*data.radius))]);
            }else if (data.hitBoxSize){
                this.hitData = new P(new V(data.pos[0], data.pos[1]),   [new V(-1*data.hitBoxSize[0]/2,-1*data.hitBoxSize[1]/2),
                                                                         new V(-1*data.hitBoxSize[0]/2,data.hitBoxSize[1]/2),
                                                                         new V(data.hitBoxSize[0]/2,data.hitBoxSize[1]/2),
                                                                         new V(data.hitBoxSize[0]/2,-1*data.hitBoxSize[1]/2)]);
            }else if (data.hd){
                var points = [];
                for (var i = 0; i < data.hd.points.length; i++){
                    points.push(new V(data.hd.points[i][0],data.hd.points[i][1]));
                }
                this.hitData = new P(new V(data.hd.pos[0],data.hd.pos[1]),points);
            }
        }catch(e){
            this.gameSession.log({error: e.stack, code: 'enemy_init'});
        }
    };

    enemy.tick = function(dt) {
        try{
            this.bFunc(this, dt, this.behaviour);
            //check collisions
            for (var player in this.gameSession.players){
                var p = this.gameSession.players[player];
                if (!p.god && !p.kill && this.active){
                    if (SAT.testPolygonPolygon(this.hitData,p.hitData) || SAT.testPolygonPolygon(this.hitData,p.vectorHitbox)){
                        this.gameSession.gameModeManager.killPlayerFunc(p);
                    }
                }
            }
        }catch(e){
            this.gameSession.log({error: e.stack, code: 'enemy_tick'});
        }
    };

    return enemy;
}

exports.Enemy = Enemy;
