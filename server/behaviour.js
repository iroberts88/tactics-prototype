//----------------------------------------------------------------
//behaviour.js
//various behaviours assigned to the enemy shapes to dictate movement etc.
//----------------------------------------------------------------

var SAT = require('./SAT.js'); //SAT POLYGON COLLISSION1
var V = SAT.Vector;
var P = SAT.Polygon;
var C = SAT.Circle;

//Assign to enemies for Enemy AI

var Behaviour = function() {};

var behaviourEnums = {
    BasicMoveTowards: 'basicMoveTowards',
    Square: 'square',
    Square2: 'square2',
    Star: 'star',
    Pentagon: 'pentagon',
    Pentagon2: 'pentagon2',
    PentagonKill: 'pentagonKill',
    Chaos: 'chaos',
    Trapezoid: 'trapezoid',
    Parallelogram: 'parallelogram'
};

Behaviour.prototype.getNewTarget = function(e,s){
    try{
        var activePlayers = [];
        for (var t in s.players){
            if (!s.players[t].kill){
                activePlayers.push(s.players[t])
            }
        }
        if (activePlayers.length > 0){
            var target = activePlayers[Math.floor(Math.random()*activePlayers.length)];
            s.queueData('enemyNewTarget', {id: e.id, targetId: target.id})
            return target;
        }else{
            return 'none';
        }
    }catch(e){
        console.log('get target error');
        console.log(e.stack);
    }
}

Behaviour.prototype.chaos = function(enemy, deltaTime, data){
    if (typeof data.changedSpeed == 'undefined'){
        data.changedSpeed = false;
    }
    if (!data.changedSpeed){
        enemy.speed = data.speed;
        data.changedSpeed = true;
    }
    var Behaviour = require('./behaviour.js').Behaviour;
    Behaviour.basicMoveTowards(enemy,deltaTime, data);
}
Behaviour.prototype.basicMoveTowards = function(enemy, deltaTime, data){
    try{
        if (typeof data.acceleration == 'undefined'){
            data.acceleration = new V(0,0);
        }
        if (typeof data.noTarget == 'undefined'){
            data.noTarget = false;
        }
        enemy.active = true;
        //Get the closest player and set as target position;
        var xDist;
        var yDist;
        var target = enemy.gameSession.players[data.targetId];
        if (target.kill || data.noTarget){
            //there is no current target!
            var Behaviour = require('./behaviour.js').Behaviour;
            target = Behaviour.getNewTarget(enemy, enemy.gameSession);
            if (target != 'none'){
                data.targetId = target.id;
            }else{
                data.noTarget = true;
            }
        }else{
            xDist = target.hitData.pos.x - enemy.hitData.pos.x;
            yDist = target.hitData.pos.y - enemy.hitData.pos.y;
            if (!enemy.moveVector){
                enemy.moveVector = new V(0,0);
            }else{
                data.acceleration = new V(xDist,yDist).normalize();
                enemy.moveVector.x += data.acceleration.x*deltaTime*data.spring;
                enemy.moveVector.y += data.acceleration.y*deltaTime*data.spring;
                if (Math.sqrt(enemy.moveVector.x*enemy.moveVector.x + enemy.moveVector.y*enemy.moveVector.y) > 1){
                    enemy.moveVector.normalize();
                }
            }
        }
        //move
        enemy.hitData.pos.x += enemy.speed * enemy.moveVector.x * deltaTime;
        enemy.hitData.pos.y += enemy.speed * enemy.moveVector.y * deltaTime;
    }catch(e){
        data.noTarget = true;
    }
};

Behaviour.prototype.pentagon = function(enemy, deltaTime, data){
    if (typeof data.noTarget == 'undefined'){
        data.noTarget = false;
    }
    try{
        enemy.active = true;
        var xDist;
        var yDist;
        var target = enemy.gameSession.players[data.targetId];
        if (target.kill || data.noTarget){
            //there is no current target!
            var Behaviour = require('./behaviour.js').Behaviour;
            target = Behaviour.getNewTarget(enemy, enemy.gameSession);
            if (target != 'none'){
                data.targetId = target.id;
            }else{
                data.noTarget = true;
            }
        }else{
            xDist = target.hitData.pos.x - enemy.hitData.pos.x;
            yDist = target.hitData.pos.y - enemy.hitData.pos.y;
            if (!enemy.moveVector){
                enemy.moveVector = new V(0,0);
            }else{
                enemy.moveVector = new V(xDist,yDist).normalize();
            }
        }
        //move
        enemy.hitData.pos.x += enemy.speed * enemy.moveVector.x * deltaTime;
        enemy.hitData.pos.y += enemy.speed * enemy.moveVector.y * deltaTime;
    }catch(e){
        data.notarget = true;
    }
};

Behaviour.prototype.pentagon2 = function(enemy, deltaTime, data){
    data.update = false;
    if (!enemy.moveVector){
        enemy.moveVector = new V(data.moveVec[0],data.moveVec[1]);
    }
    if (typeof data.ticker == 'undefined'){
        data.ticker = 0;
    }
    if (typeof data.inPlay == 'undefined'){
        data.inPlay = false;
    }
    data.ticker += deltaTime;
    if (data.ticker > .5 && !data.inPlay){
        enemy.squareKill = true;
        data.inPlay = true;
        data.update = true;
    }
    if (data.inPlay){
        var Behaviour = require('./behaviour.js').Behaviour;
        Behaviour.basicMoveTowards(enemy,deltaTime,data);
    }else{
        //move
        enemy.hitData.pos.x += enemy.speed * enemy.moveVector.x * deltaTime;
        enemy.hitData.pos.y += enemy.speed * enemy.moveVector.y * deltaTime;
    }
    if (data.update){
        enemy.gameSession.queueData('updateEnemyLoc',{id: enemy.id,newPos: [enemy.hitData.pos.x,enemy.hitData.pos.y],newDir: [enemy.moveVector.x,enemy.moveVector.y]});
    }
};

Behaviour.prototype.pentagonKill = function(enemy, deltaTime, data){
    var enemiesAdded = [];
    var pos = [enemy.hitData.pos.x, enemy.hitData.pos.y];
    if (data.stage == 1){
        var vec = new V(0,1);
        for (var i = 0; i < 12;i++){
            var e = enemy.gameSession.addEnemy('pent2',{pos:pos, moveVec:[vec.x,vec.y], target: enemy.behaviour.targetId});
            enemiesAdded.push({type: 'pent2', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            vec.rotate(0.523599);
        }
    }else if (data.stage == 2){
        var vec = new V(0,1);
        for (var i = 0; i < 6;i++){
            var e = enemy.gameSession.addEnemy('pent3',{pos:pos, moveVec:[vec.x,vec.y], target: enemy.behaviour.targetId});
            enemiesAdded.push({type: 'pent3', id: e.id, x: e.hitData.pos.x, y: e.hitData.pos.y, behaviour: e.behaviour});
            vec.rotate(1.0472);
        }
    }
    enemy.gameSession.queueData('addEnemies', {data: enemiesAdded});
}

Behaviour.prototype.square = function(enemy, deltaTime, data){
    if (typeof data.ticker == 'undefined'){
        data.ticker = 0;
    }
    data.ticker += deltaTime;
    if (data.ticker >= 2.0){
        enemy.active = true;
    }
    for (var i in enemy.gameSession.enemies){
        var e = enemy.gameSession.enemies[i];
        var kill = false;
        if (e.squareKill){
            //collide?
            if (SAT.testPolygonPolygon(enemy.hitData, e.hitData)){
                kill = true;
            }
        }
        if (kill){
            e.kill = true;
        }
    }
};

Behaviour.prototype.square2 = function(enemy, deltaTime, data){
    var Behaviour = require('./behaviour.js').Behaviour;
    Behaviour.square(enemy,deltaTime, data);
    var update = false;
    if (!enemy.moveVector){
        enemy.moveVector = new SAT.Vector(data.startMove[0] - enemy.hitData.pos.x, data.startMove[1] - enemy.hitData.pos.y).normalize();
    }
    if (typeof data.inPlay == 'undefined'){
        data.inPlay = false;
    }
    if (data.inPlay){
        var radius = 20;
        if (enemy.hitData.pos.x < 0){
            enemy.hitData.pos.x = 0;
            enemy.moveVector.x = enemy.moveVector.x * -1;
            update = true;
        }
        if (enemy.hitData.pos.y < 0){
            enemy.hitData.pos.y = 0;
            enemy.moveVector.y = enemy.moveVector.y * -1;
            update = true;
        }
        if (enemy.hitData.pos.x > 1920){
            enemy.hitData.pos.x = 1920;
            enemy.moveVector.x = enemy.moveVector.x * -1;
            update = true;
        }
        if (enemy.hitData.pos.y > 1080){
            enemy.hitData.pos.y = 1080;
            enemy.moveVector.y = enemy.moveVector.y * -1;
            update = true;
        }
    }else{
        if (enemy.hitData.pos.x < 1920 && enemy.hitData.pos.x > 0 && enemy.hitData.pos.y < 1080 && enemy.hitData.pos.y > 0){
            data.inPlay = true;
        }
    }
    //move
    enemy.hitData.pos.x += enemy.speed * enemy.moveVector.x * deltaTime;
    enemy.hitData.pos.y += enemy.speed * enemy.moveVector.y * deltaTime;
    if (update){
        enemy.gameSession.queueData('updateEnemyLoc',{id: enemy.id,newPos: [enemy.hitData.pos.x,enemy.hitData.pos.y],newDir: [enemy.moveVector.x,enemy.moveVector.y]});
    }
};

Behaviour.prototype.star = function(enemy, deltaTime, data){
    enemy.active = true;
    var update = false;
    if (!enemy.moveVector){
        enemy.moveVector = new SAT.Vector(data.startMove[0] - enemy.hitData.pos.x, data.startMove[1] - enemy.hitData.pos.y).normalize();
    }
    if (typeof data.inPlay == 'undefined'){
        data.inPlay = false;
    }
    if (data.inPlay){
        var radius = 20;
        if (enemy.hitData.pos.x < 0){
            enemy.hitData.pos.x = 0;
            enemy.moveVector.x = enemy.moveVector.x * -1;
            update = true;
        }
        if (enemy.hitData.pos.y < 0){
            enemy.hitData.pos.y = 0;
            enemy.moveVector.y = enemy.moveVector.y * -1;
            update = true;
        }
        if (enemy.hitData.pos.x > 1920){
            enemy.hitData.pos.x = 1920;
            enemy.moveVector.x = enemy.moveVector.x * -1;
            update = true;
        }
        if (enemy.hitData.pos.y > 1080){
            enemy.hitData.pos.y = 1080;
            enemy.moveVector.y = enemy.moveVector.y * -1;
            update = true;
        }
    }else{
        if (enemy.hitData.pos.x < 1920 && enemy.hitData.pos.x > 0 && enemy.hitData.pos.y < 1080 && enemy.hitData.pos.y > 0){
            data.inPlay = true;
        }
    }
    //move
    enemy.hitData.pos.x += enemy.speed * enemy.moveVector.x * deltaTime;
    enemy.hitData.pos.y += enemy.speed * enemy.moveVector.y * deltaTime;
    if (update){
        enemy.gameSession.queueData('updateEnemyLoc',{id: enemy.id,newPos: [enemy.hitData.pos.x,enemy.hitData.pos.y],newDir: [enemy.moveVector.x,enemy.moveVector.y]});
    }
};

Behaviour.prototype.trapezoid = function(enemy, deltaTime, data){
    enemy.active = true;
    if (typeof data.moving == 'undefined'){
        if (enemy.hitData.pos.x <= 0){
            enemy.moveVector = new SAT.Vector(1,0);
            data.moving = 'r';
        }else if (enemy.hitData.pos.y <= 0){
            enemy.moveVector = new SAT.Vector(0,1);
            data.moving = 'd';
        }else if (enemy.hitData.pos.x >= 1920){
            enemy.moveVector = new SAT.Vector(-1,0);
            data.moving = 'l';
        }else if (enemy.hitData.pos.y >= 1080){
            enemy.moveVector = new SAT.Vector(0,-1);
            data.moving = 'u';
        }
    }else{
        if (data.moving == 'r'){
            if (enemy.hitData.pos.x >= 32){
                enemy.hitData.pos.x = 32;
                enemy.moveVector = new SAT.Vector(0,0);
            }
        }else if (data.moving == 'l'){
            if (enemy.hitData.pos.x <= 1888){
                enemy.hitData.pos.x = 1888;
                enemy.moveVector = new SAT.Vector(0,0);
            }
        }else if (data.moving == 'u'){
            if (enemy.hitData.pos.y <= 1048){
                enemy.hitData.pos.y = 1048;
                enemy.moveVector = new SAT.Vector(0,0);
            }
        }else if (data.moving == 'd'){
            if (enemy.hitData.pos.y >= 32){
                enemy.hitData.pos.y = 32;
                enemy.moveVector = new SAT.Vector(0,0);
            }
        }
    }
    //move
    enemy.hitData.pos.x += enemy.speed * enemy.moveVector.x * deltaTime;
    enemy.hitData.pos.y += enemy.speed * enemy.moveVector.y * deltaTime;
};

Behaviour.prototype.parallelogram = function(enemy, deltaTime, data){
    enemy.active = true;
    if (typeof data.moving == 'undefined'){
        if (enemy.hitData.pos.x < 0){
            enemy.moveVector = new SAT.Vector(1,0);
            data.moving = 'r';
        }else if (enemy.hitData.pos.y < 0){
            enemy.moveVector = new SAT.Vector(0,1);
            data.moving = 'd';
        }else if (enemy.hitData.pos.x > 1920){
            enemy.moveVector = new SAT.Vector(-1,0);
            data.moving = 'l';
        }else if (enemy.hitData.pos.y > 1080){
            enemy.moveVector = new SAT.Vector(0,-1);
            data.moving = 'u';
        }
    }else{
        if (data.moving == 'r'){
            if (enemy.hitData.pos.x >= 2016){
                enemy.kill = true;
            }
        }else if (data.moving == 'l'){
            if (enemy.hitData.pos.x <= -96){
                enemy.kill = true;
            }
        }else if (data.moving == 'u'){
            if (enemy.hitData.pos.y <= -64){
                enemy.kill = true;
            }
        }else if (data.moving == 'd'){
            if (enemy.hitData.pos.y >= 1144){
                enemy.kill = true;
            }
        }
    }
    //move
    enemy.hitData.pos.x += enemy.speed * enemy.moveVector.x * deltaTime;
    enemy.hitData.pos.y += enemy.speed * enemy.moveVector.y * deltaTime;
};

Behaviour.prototype.getBehaviour = function(actionStr){
    //return a behaviour based on passed id
    var Behaviour = require('./behaviour.js').Behaviour;
    switch(actionStr) {
        case behaviourEnums.BasicMoveTowards:
            return Behaviour.basicMoveTowards;
            break;
        case behaviourEnums.Square:
            return Behaviour.square;
            break;
        case behaviourEnums.Square2:
            return Behaviour.square2;
            break;
        case behaviourEnums.Star:
            return Behaviour.star;
            break;
        case behaviourEnums.Pentagon:
            return Behaviour.pentagon;
            break;
        case behaviourEnums.Pentagon2:
            return Behaviour.pentagon2;
            break;
        case behaviourEnums.PentagonKill:
            return Behaviour.pentagonKill;
            break;
        case behaviourEnums.Chaos:
            return Behaviour.chaos;
            break;
        case behaviourEnums.Trapezoid:
            return Behaviour.trapezoid;
            break;
        case behaviourEnums.Parallelogram:
            return Behaviour.parallelogram;
            break;
    }
};

exports.Behaviour = new Behaviour();
