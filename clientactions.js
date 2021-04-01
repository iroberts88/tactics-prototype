
var	Enums = require('./enums.js').Enums,
    Utils = require('./utils.js').Utils,
    Ability = require('./ability.js').Ability;

var ClientActions = function(){}

ClientActions.prototype.damageText = function(unitid,text,shields=null,health=null,fainted=null,type=null,dead=null){
	//add a damage text object
	//optionals can change a unit's status
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.TEXT] = text;
	data[Enums.ACTION] = Enums.DAMAGETEXT;
	if (shields){
		data[Enums.SHIELDS] = shields;
	}
	if (health){
		data[Enums.HEALTH] = health;
	}
	if (fainted){
		data[Enums.FAINTED] = fainted;
	}
	if (type){
		data[Enums.TYPE] = type;
	}
	if (dead){
		data[Enums.DEAD] = dead;
	}
	return data;
}
ClientActions.prototype.damageTextOwnerOnly = function(unitid,text){
	//add a damage text object
	//only the unit owner sees this
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.TEXT] = text;
	data[Enums.ACTION] = Enums.DAMAGETEXT;
	data[Enums.OWNERONLY] = true;
	return data;
}
ClientActions.prototype.setEnergy = function(unitid,value){
	//set the energy of a unit
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.VALUE] = value;
	data[Enums.ACTION] = Enums.SETENERGY;
	return data;
}
ClientActions.prototype.reveal = function(unitid,directions,q,r){
	//reveal a unit that has become un-hidden
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.DIRECTIONS] = directions;
	data[Enums.Q] = q;
	data[Enums.R] = r;
	data[Enums.ACTION] = Enums.REVEAL;
	return data;
}
ClientActions.prototype.hide = function(unitid){
	//hide a unit
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.ACTION] = Enums.HIDE;
	return data;
}
ClientActions.prototype.actionBubble = function(unitid,text){
	//timed action bubble
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.TEXT] = text;
	data[Enums.ACTION] = Enums.ACTIONBUBBLE;
	return data;
}
ClientActions.prototype.log = function(text){
	//log an action
	let data = {};
	data[Enums.TEXT] = text;
	data[Enums.ACTION] = Enums.LOG;
	return data;
}
ClientActions.prototype.face = function(unitid,direction){
	//unit facing is changing
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.DIRECTION] = direction;
	data[Enums.ACTION] = Enums.FACE;
	return data;
}
ClientActions.prototype.attack = function(unitid,weapon,direction){
	//unit uses their weapon to attack
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.WEAPON] = weapon;
	data[Enums.DIRECTION] = direction;
	data[Enums.ACTION] = Enums.ATTACK;
	return data;
}
ClientActions.prototype.move = function(unitid,x,y,z){
	//move the unit to a node
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.X] = x;
	data[Enums.Y] = y;
	data[Enums.Z] = z;
	data[Enums.ACTION] = Enums.MOVE;
	return data;
}
ClientActions.prototype.slam = function(unitid,x,y,z){
	//slam action - moves target to a new node
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.X] = x;
	data[Enums.Y] = y;
	data[Enums.Z] = z;
	data[Enums.ACTION] = Enums.SLAM;
	return data;
}
ClientActions.prototype.reversal = function(unitid,unitnewnode,target,targetnewnode){
	//reversal action - units swap places
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.UNITNEWNODE] = unitnewnode;
	data[Enums.TARGET] = target;
	data[Enums.TARGETNEWNODE] = targetnewnode;
	data[Enums.ACTION] = Enums.REVERSAL;
	return data;
}
ClientActions.prototype.noLOS = function(unitid){
	//unit has no LOS
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.ACTION] = Enums.NOLOS;
	return data;
}
ClientActions.prototype.actionUsed = function(unitid){
	//unit's action has been used and is no longer available
	let data = {};
	data[Enums.UNITID] = unitid;
	data[Enums.ACTION] = Enums.ACTIONUSED;
	return data;
}

exports.ClientActions = new ClientActions();