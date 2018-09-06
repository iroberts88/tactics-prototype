//actions.js
var Buff = require('./buff.js').Buff;

ActionEnums = {
	AlterStat: 'alterStat',
	AlterStatPercent: 'alterStatPercent',
	AlterCurrentEnergy: 'alterCurrentEnergy',
	AlterHealthByPercent: 'alterHealthByPercent',
	SetHidden: 'setHidden',
	AddOnAttackEffect: 'addOnAttackEffect',
	Poison: 'poison'
};

AbilityEnums = {
	TestAbility: 'testAbility',
	Stealth: 'stealth',
	Flare: 'flare',
	QuickAttack: 'quickAttack',
	Agitate: 'agitate',
	Cheer: 'cheer',
	Interrupt: 'interrupt',
	PoisonWeapon: 'poisonWeapon',
	Scan: 'scan',
	Direct: 'direct',
	FlareGrenade: 'flareGrenade',
	CryoGrenade: 'cryoGrenade',
	Grenade: 'grenade',
	ShockGrenade: 'shockGrenade',
	CorrosiveGrenade: 'corrosiveGrenade',
	ToxicGrenade: 'toxicGrenade',
	EmpGrenade: 'empGrenade',
	UnstableGrenade: 'unstableGrenade',
	VoidGrenade: 'voidGrenade',
	ResUp: 'resUp',
	Repair: 'repair'
};

var Actions = function(){}

//-----------------------------------------------------------------------------------------------|
//                                      Item/Buff Functions                                      |
//-----------------------------------------------------------------------------------------------|

Actions.prototype.alterStat = function(unit,data){
	if (data.reverse){
		unit.modStat(data.stat,data.value*-1);
	}else{
		unit.modStat(data.stat,data.value);
	}
	return false;
}

Actions.prototype.alterStatPercent = function(unit,data){
	if (data.reverse){
		unit.modStatPercent(data.stat,data.value*-1);
	}else{
		unit.modStatPercent(data.stat,data.value);
	}
	return false;
}
Actions.prototype.alterHealthByPercent = function(unit,data){
	data.actionData = unit.damage(data.type,Math.ceil(unit.maximumHealth.value*data.val),data.actionData);
	return false;
}
Actions.prototype.poison = function(unit,data){
	var buffData = unit.owner.gameEngine.buffs["buff_poison"];
	var buff = new Buff(buffData);
	console.log(data.target.name);
	buff.init({
		unit: data.target
	});
	buff.actionsOnTick.push({
        "action": "alterHealthByPercent",
        "val": (5+Math.floor(unit.intelligence.value/3))/100,
        'type': 'pois'
	});
	unit.owner.gameSession.queueData('action',{
        actionData: [{
        	action: unit.owner.gameSession.clientActionEnums.DmgText,
	        unitid: data.target.id,
	        text: "Poisoned"
	    }]
	});
	return false;
}
Actions.prototype.addOnAttackEffect = function(unit,data){
	
	if (data.reverse){
		for (var i = 0; i < unit.onAttack.length;i++){
			if (unit.onAttack.action == data.actionid){
				unit.onAttack.splice(i,1);
				i-=1;
			}
		}
	}else{
		unit.onAttack.push(data.effect)
	}
	console.log(unit.onAttack);
	return false;
}
Actions.prototype.alterCurrentEnergy = function(unit,data){
	var value = unit.owner.gameSession.parseStringCode(unit,data.val);
	if (unit.currentEnergy >= value){
		unit.currentEnergy -= value;
	}else{
		unit.owner.gameSession.queueData('action',{
	        actionData: [{
	        	action: unit.owner.gameSession.clientActionEnums.DmgText,
		        unitid: unit.id,
		        text: 'Not enough energy'
		    }]
		});
		return true;
	}
	unit.owner.gameSession.queueData('action',{
        actionData: [{
        	action: unit.owner.gameSession.clientActionEnums.SetEnergy,
	        unitid: unit.id,
	        val: unit.currentEnergy
	    }]
	});
	return false;
}

Actions.prototype.setHidden= function(unit,data){
	if (data.reverse){
		if (unit.hidden){
			unit.hidden = false;
			unit.owner.gameSession.queueData('action',{
		        actionData: [{
		        	action: unit.owner.gameSession.clientActionEnums.Reveal,
			        unitid: unit.id,
			        direction: unit.direction,
			        q: unit.currentNode.q,
			        r: unit.currentNode.r
			    }]
	    	});
		}
	}else{
		unit.hidden = true;
		unit.owner.gameSession.queueData('action',{
			actionData: [{
		        action: unit.owner.gameSession.clientActionEnums.Hide,
		        unitid: unit.id
		    }]
    	});
	}
	return false;
}

Actions.prototype.getAction = function(a){
	switch(a){
		case ActionEnums.AlterStat:
			return this.alterStat;
			break;
		case ActionEnums.AlterStatPercent:
			return this.alterStatPercent;
			break;
		case ActionEnums.AlterCurrentEnergy:
			return this.alterCurrentEnergy;
			break;
		case ActionEnums.AlterHealthByPercent:
			return this.alterHealthByPercent;
			break;
		case ActionEnums.SetHidden:
			return this.setHidden;
			break;
		case ActionEnums.Poison:
			return this.poison;
			break;
		case ActionEnums.AddOnAttackEffect:
			return this.addOnAttackEffect;
			break;
	}
}


//-----------------------------------------------------------------------------------------------|
//                                    Unit Ability Functions                                     |
//-----------------------------------------------------------------------------------------------|

Actions.prototype.testAbility = function(unit,session,data){
	console.log('test ability!!!');
	return false;
}

Actions.prototype.stealth = function(unit,session,data){
	//set the unit as stealthed and reduce speed
	var buffData = session.gameEngine.buffs["buff_stealth"];
	//TODO if agility changes while buff is active, does NOT change speed!
	var buff = new Buff(buffData);
	buff.actionsOnImmediate.push({
        "action": "alterStatPercent",
        "stat": "speed",
        "value": -(50-unit.agility.value*2)/100
	});
	buff.actionsOnEnd.push({
        "action": "alterStatPercent",
        "stat": "speed",
        "value": (50-unit.agility.value*2)/100
	});
	buff.actionsOnTick.push({
        "action": "alterCurrentEnergy",
        val: data.ability.tickECost
	});
	buff.init({
	    unit: unit //the buff will perform actions on this object
	})
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Stealth'
	})
	return true;
}

Actions.prototype.flare = function(unit,session,data){
	//get all units in radius
	var radius = Math.floor(1+unit.intelligence.value/3);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Flare'
	});
	for (var i = 0; i < nodes.length;i++){
		//reveal and set new direction
		var nextUnit = nodes[i].unit;
		var d = session.map.getDMod(nextUnit.currentNode,node);
		if (d.newDir){
			nextUnit.direction = d.newDir;
		}else{
			d.newDir = nextUnit.direction
		}
		data.actionData.push({
	        action: session.clientActionEnums.Face,
	        unitid: nextUnit.id,
	        direction: d.newDir
    	});
    	if (nextUnit.hidden){
			nextUnit.removeBuffsWithTag('stealth');
	    }
	}
	return true;
}
Actions.prototype.quickAttack = function(unit,session,data){
    data = session.executeAttack(data);
    if (!data){return false;}
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Quick Attack',
        newDir: data.d.newDir,
    });
    unit.charge += session.chargeMax*(0.3+Math.round(unit.agility.value*1.5)/100);
	return true;
}
Actions.prototype.agitate = function(unit,session,data){
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Agitate'
	});
	if (!u){return false;}
	u.strength.nMod -= 1;
	u.strength.set(true);
	u.endurance.nMod -= 1;
	u.endurance.set(true);
	u.agility.nMod -= 1;
	u.agility.set(true);
	u.dexterity.nMod -= 1;
	u.dexterity.set(true);
	u.intelligence.nMod -= 1;
	u.intelligence.set(true);
	u.willpower.nMod -= 1;
	u.willpower.set(true);
	u.charisma.nMod -= 1;
	u.charisma.set(true);
	data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: u.id,
        text: 'all stats -1'
    });
	return true;
}
Actions.prototype.cheer = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Cheer'
	});
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.agility.nMod += 2;
			nodes[i].unit.agility.set(true);
			data.actionData.push({
		        action: session.clientActionEnums.DmgText,
		        unitid: nodes[i].unit.id,
		        text: 'Agility +2'
		    });
		}
	}
	return true;
}
Actions.prototype.interrupt = function(unit,session,data){
    data = session.executeAttack(data);
    if (!data){return false;}
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Interrupt',
        newDir: data.d.newDir
    });
    data.node.unit.charge -= session.chargeMax*((10+unit.agility.value)/100);
    if (data.node.unit.charge < 0){
    	data.node.unit.charge = 0;
    }
    //reduce any casting timers!
    for (var i in session.allUnits){
    	if (session.allUnits[i].isCastTimer && session.allUnits[i].unitid == data.node.unit.id){
    		session.allUnits[i].charge -= session.chargeMax*((20+unit.agility.value*2)/100);
    	}
    }
	return true;
}

Actions.prototype.poisonWeapon = function(unit,session,data){
    //get the units weapon
    var weapon = unit.getWeapon();
    if (weapon.type == 'weapon'){
    	//add poison on hit!
		var buffData = session.gameEngine.buffs["buff_poisonedWeapon"];
		var buff = new Buff(buffData);
		buff.actionsOnImmediate.push({
	        "action": "addOnAttackEffect",
	        "effect": {
	        	"action": "poison",
	        	"instances": 1+Math.floor(unit.intelligence.value/4),
	        }
		});
		buff.actionsOnEnd.push({
			"action": "addOnAttackEffect",
	        "reverse": true,
	        "actionid": "poison"
		});
		buff.init({
		    unit: unit //the buff will perform actions on this object
		})
		data.actionData.push({
			unitid: unit.id,
	        action: session.clientActionEnums.ActionBubble,
	        text: 'Poison Weapon'
		});
    }else{
    	return false;
    }
	return true;
}

Actions.prototype.scan = function(unit,session,data){
	//get all units in radius
	var radius = Math.floor(1+unit.intelligence.value/4);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Scan'
	});
	for (var i = 0; i < nodes.length;i++){
		//reveal and set new direction
		var nextUnit = nodes[i].unit;
		if (nextUnit.hidden){continue;}
		if (nextUnit.owner != unit.owner){
			//send down detailed unit info!
			unit.owner.gameSession.queuePlayer(unit.owner,'updateUnitInfo',{
		        unitid: nextUnit.id,
		        info: nextUnit.getClientData()
			});
		}
	}
	return true;
}


Actions.prototype.direct = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Direct'
	});
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.intelligence.nMod += 2;
			nodes[i].unit.intelligence.set(true);
			data.actionData.push({
		        action: session.clientActionEnums.DmgText,
		        unitid: nodes[i].unit.id,
		        text: 'Intelligence +2'
		    });
		}
	}
	return true;
}

Actions.prototype.grenade = function(unit,session,data){
	//get all units in radius;
	if (typeof data.dmgType == 'undefined'){
		data.dmgType = 'expl';
	}
	if (typeof data.txt == 'undefined'){
		data.txt = 'Grenade';
	}if (typeof data.dmg == 'undefined'){
		data.dmg = 20;
	}
	var radius = Math.floor(1+unit.intelligence.value/10);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: data.txt
	});
	for (var i = 0; i < nodes.length;i++){
		data.actionData = nodes[i].unit.damage(data.dmgType,Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),data.actionData);
	}
	return true;
}

Actions.prototype.flareGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'heat';
	data.txt = 'Flare Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.cryoGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'cold';
	data.txt = 'Cryo Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.shockGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'elec';
	data.txt = 'Shock Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.corrosiveGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'corr';
	data.txt = 'Corrosive Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.toxicGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'pois';
	data.txt = 'Toxic Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.empGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'puls';
	data.txt = 'EMP Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.unstableGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'radi';
	data.txt = 'Unstable Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.voidGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'grav';
	data.txt = 'Void Grenade';
	data.dmg = 25;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.flareGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'heat';
	data.txt = 'Flare Grenade';
	data.dmg = 20;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.resUp = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(2);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Resist UP'
	});
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			var percent = unit.willpower.value*4;
			var buffData = session.gameEngine.buffs["buff_resistUp"];
			var buff = new Buff(buffData);
			var resistances = ['hRes','cRes','puRes','poRes','rRes','gRes','aRes','eRes'];
			for (var j = 0; j <resistances.length;j++){
				buff.actionsOnImmediate.push({
			        "action": "alterStat",
			        "stat": resistances[j],
			        "value": percent
				});
				buff.actionsOnEnd.push({
			        "action": "alterStat",
			        "stat": resistances[j],
			        "value": percent,
			        "reverse":true
				});
			}
			buff.init({
			    unit: nodes[i].unit //the buff will perform actions on this object
			});
			buff.duration = Math.floor(1+unit.charisma.value/2);
			data.actionData.push({
		        action: session.clientActionEnums.DmgText,
		        unitid: nodes[i].unit.id,
		        text: 'All res +' + percent + '%'
		    });
		}
	}
	return true;
}

Actions.prototype.getAbility = function(a){
	console.log('getting ability <' + a + '>');
	switch(a){
		case AbilityEnums.TestAbility:
			return this.testAbility;
			break;
		case AbilityEnums.Flare:
			return this.flare;
			break;
		case AbilityEnums.Agitate:
			return this.agitate;
			break;
		case AbilityEnums.Cheer:
			return this.cheer;
			break;
		case AbilityEnums.QuickAttack:
			return this.quickAttack;
			break;
		case AbilityEnums.Interrupt:
			return this.interrupt;
			break;
		case AbilityEnums.Stealth:
			return this.stealth;
			break;
		case AbilityEnums.PoisonWeapon:
			return this.poisonWeapon;
			break;
		case AbilityEnums.Scan:
			return this.scan;
			break;
		case AbilityEnums.Direct:
			return this.direct;
			break;
		case AbilityEnums.FlareGrenade:
			return this.flareGrenade;
			break;
		case AbilityEnums.CryoGrenade:
			return this.cryoGrenade;
			break;
		case AbilityEnums.Grenade:
			return this.grenade;
			break;
		case AbilityEnums.ShockGrenade:
			return this.shockGrenade;
			break;
		case AbilityEnums.CorrosiveGrenade:
			return this.corrosiveGrenade;
			break;
		case AbilityEnums.ToxicGrenade:
			return this.toxicGrenade;
			break;
		case AbilityEnums.EmpGrenade:
			return this.empGrenade;
			break;
		case AbilityEnums.UnstableGrenade:
			return this.unstableGrenade;
			break;
		case AbilityEnums.VoidGrenade:
			return this.voidGrenade;
			break;
		case AbilityEnums.ResUp:
			return this.resUp;
			break;
		case AbilityEnums.Repair:
			return this.repair;
			break;
		default:
			return this.testAbility;
			break;
	}
}

exports.Actions = new Actions();
