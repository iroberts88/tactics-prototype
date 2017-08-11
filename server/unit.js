//----------------------------------------------------------------
//unit.js
//the base unit for players and enemies
//----------------------------------------------------------------

var SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1
var P = SAT.Polygon;
var V = SAT.Vector;
var C = SAT.Circle;

function Unit() {
    
    return {
        gameEngine: null,
        gameSession: null,
        id: null,

        hitData:  null,
        moveVector:  null,
        speed: null,
        
        update: function(deltaTime){

        },

        setGameSession: function(gs) {
            this.gameSession = gs;
        },

        setGameEngine: function(ge) {
            this.gameEngine = ge;
        },

        move: function(dt) {
            try{
                this.hitData.pos.x += (this.moveVector.x * dt * this.speed);
                this.hitData.pos.y += (this.moveVector.y * dt * this.speed);
            }catch(e){
                this.gameSession.queueData('debug', {desc: "Failed to move enemy", error: e});
            }
        }
    }
}

exports.Unit = Unit;
