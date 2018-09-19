//actions.js
var Buff = require('./buff.js').Buff,
    ClassInfo = require('./classinfo.js').ClassInfo;

ActionEnums = {
	AlterStat: 'alterStat',
	AlterStatPercent: 'alterStatPercent',
	AlterCurrentEnergy: 'alterCurrentEnergy',
	AlterHealthByPercent: 'alterHealthByPercent',
	SetHidden: 'setHidden',
	AddOnAttackEffect: 'addOnAttackEffect',
	Poison: 'poison',
	HealingFieldEffect: 'healingFieldEffect',
	CheckStealthRemove: 'checkStealthRemove'
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
	Instruct: 'instruct',
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
	Repair: 'repair',
	Bolster: 'bolster',
	Aim: 'aim',
	Shout: 'shout',
	Focus: 'focus',
	HeroicLeap: 'heroicLeap',
	HeroicCharge: 'heroicCharge',
	PowerShot: 'powerShot',
	PowerAttack: 'powerAttack',
	Slam: 'slam',
	FirstAid: 'firstAid',
	Resuscitate: 'resuscitate',
	HealingField: 'healingField',
	Sprint: 'sprint',
	Influence: 'influence',
	PrecisionStrike: 'precisionStrike',
	Cripple: 'cripple',
	ShieldBoost: 'shieldBoost',
	Concentrate: 'concentrate'
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
	var Buff = require('./buff.js').Buff;
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

Actions.prototype.setHidden = function(unit,data){
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

Actions.prototype.healingFieldEffect = function(unit,data){
	//get all units in radius;
	var radius = data.radius;
	var node = unit.currentNode
	var nodes = unit.owner.gameSession.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: unit.owner.gameSession.clientActionEnums.ActionBubble,
        text: 'Healing Field'
	});
	for (var i = 0; i < nodes.length;i++){
		var node = nodes[i];
		if (node.unit){
			if (node.unit.owner == unit.owner){
				data.actionData = node.unit.damage('heal',data.value,data.actionData);
			}
		}
	}
	return false;
}

Actions.prototype.checkStealthRemove = function(unit,data){
	//get all units in radius;
	var session = unit.owner.gameSession;
	var pass = false;
	for (var i in session.allUnits){
		var u = session.allUnits[i];
		if (u != unit && u.owner == unit.owner && (!u.dead && !u.fainted & !u.hidden)){
			pass = true;
		}
	}
	if (!pass){
		console.log('Stealth failed - team dead!!!');
		return true;
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
		case ActionEnums.HealingFieldEffect:
			return this.healingFieldEffect;
			break;
		case ActionEnums.CheckStealthRemove:
			return this.checkStealthRemove;
			break
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
	var Buff = require('./buff.js').Buff;
	//first, check team
	var pass = false;
	for (var i in session.allUnits){
		var u = session.allUnits[i];
		if (u != unit && u.owner == unit.owner && (!u.dead && !u.fainted & !u.hidden)){
			pass = true;
		}
	}
	if (!pass){
		console.log('Stealth failed - team dead!');
		return false;
	}
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
	buff.actionsOnTick.push({
        "action": "checkStealthRemove"
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
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
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
	var Buff = require('./buff.js').Buff;
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


Actions.prototype.instruct = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Instruct'
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
	var Buff = require('./buff.js').Buff;
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

Actions.prototype.repair = function(unit,session,data){
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	if (u.human){
		return false;
	}
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Repair'
	});
	if (!u){return false;}
	value = Math.round(u.maximumHealth.value * ((25+unit.dexterity.value*2)/100));
	u.damage('heal',value,data.actionData);
	return true;
}

Actions.prototype.bolster = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Bolster'
	});
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.strength.nMod += 2;
			nodes[i].unit.strength.set(true);
			data.actionData.push({
		        action: session.clientActionEnums.DmgText,
		        unitid: nodes[i].unit.id,
		        text: 'Strength +2'
		    });
		}
	}
	return true;
}

Actions.prototype.aim = function(unit,session,data){
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Aim'
	});
	var val = Math.ceil(unit.skill.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	unit.skill.nMod += val;
	unit.skill.set(true);
	data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: unit.id,
        text: 'Skill +' + val
    });
	return true;
}

Actions.prototype.shout = function(unit,session,data){
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Shout'
	});
	var val = Math.ceil(unit.power.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	unit.power.nMod += val;
	unit.power.set(true);
	data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: unit.id,
        text: 'Power +' + val
    });
	return true;
}

Actions.prototype.focus = function(unit,session,data){
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Focus'
	});
	var val = Math.ceil(unit.tactics.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	unit.tactics.nMod += val;
	unit.tactics.set(true);
	data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: unit.id,
        text: 'Tactics +' + val
    });
	return true;
}

Actions.prototype.powerShot = function(unit,session,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'gun'){
    	return false;
    }
    data.ablMod = 1+(25+Math.floor(unit.strength.value*2))/100;
    data = session.executeAttack(data);
    if (!data){return false;}
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Power Shot',
        newDir: data.d.newDir
    });
	return true;
}

Actions.prototype.powerAttack = function(unit,session,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
    data.ablMod = 1+(25+Math.floor(unit.dexterity.value*2))/100;
    data = session.executeAttack(data);
    if (!data){return false;}
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Power Attack',
        newDir: data.d.newDir
    });
	return true;
}

Actions.prototype.slam = function(unit,session,data){
	if (typeof data.target == 'undefined'){
		return false;
	}
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Slam'
	});
    var dir = session.map.getNewDirectionAxial(data.target.currentNode,unit.currentNode);
    var m = Math.floor(1+unit.strength.value/5);
    for (var i = 0; i < m;i++){
    	//get node
    	var newNode = session.map.getAxialNeighbor(data.target.currentNode,dir);
    	while(newNode.deleted){
    		i+=1;
    		if (i >= m){
    			//can't hit onto a deleted node
    			return true;
    		}
    		newNode = session.map.getAxialNeighbor(newNode,dir);
    		if (!newNode){
    			//hit the edge of the map
    			return true;
    		}
    	}
    	if (!newNode){
    		continue;
    	}
    	if (newNode.unit){
    		//damage both and end
    		var dmg = Math.round(10*(1+unit.tactics.value/50));
    		data.target.damage('physical',dmg,data.actionData);
    		newNode.unit.damage('physical',dmg,data.actionData);
    		return true;
    	}
    	if (newNode.h-data.target.currentNode.h >= data.target.height){
    		//slam into the wall and take damage, then end
    		var dmg = Math.round(30*(1+unit.tactics.value/50));
    		data.target.damage('physical',dmg,data.actionData);
    		return true;
    	}else{
    		//move the target to the new node
    		data.target.newNode(newNode);
    		data.actionData.push({
	            action: session.clientActionEnums.Slam,
	            unitid: data.target.id,
	            x: newNode.x,
	            y: newNode.y,
	            z: newNode.z
	        });
    	}
    }
	return true;
}

Actions.prototype.heroicCharge = function(unit,session,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
	data.unit = unit;
    var player = data.unit.owner.id;
    var endingNode = session.map.getCube(data);
    data.path = session.map.findPath(session.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:unit.jump.value});
    if (data.path.length > (unit.move.value + Math.floor(unit.agility.value/3)+1) || data.path.length <=2){
    	console.log("invalid Path on heroic charge...");
    	console.log(data.path);
    	return false;
    }
    data.isAMove = false;
    data = session.executeMove(data);
    data.ablMod = 1+(15+Math.floor(unit.charisma.value))/100;
    //get all within weapon range
    var nodes = weapon.getWeaponNodes(session.map,unit.currentNode);
    for (var i = 0; i < nodes.length;i++){
    	if (nodes[i].unit){
    		if (nodes[i].unit.owner != unit.owner){
    			data.q = nodes[i].q;
    			data.r = nodes[i].r;
    			data = session.executeAttack(data);
    		}
    	}
    }
    if (!data){return false;}
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Heroic Charge',
        newDir: data.d.newDir
    });
	return true;
}

Actions.prototype.heroicLeap = function(unit,session,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
	data.unit = unit;
    var player = data.unit.owner.id;
    var endingNode = session.map.getCube(data);
    data.path = session.map.findPath(session.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:(unit.jump.value + Math.floor(unit.strength.value/2))});
    if (data.path.length != 2 || data.path[data.path.length-1].h - unit.currentNode.h < 3){
    	console.log("invalid Path on heroic leap...");
    	console.log('height 1: ' + unit.currentNode.h);
    	console.log("height 2: " + data.path[data.path.length-1].h);
    	console.log(data.path);
    	return false;
    }
    data.isAMove = false;
    data = session.executeMove(data);
    data.ablMod = 1+(15+Math.floor(unit.charisma.value))/100;
    //get all within weapon range
    //should check unit first?
    var nodes = weapon.getWeaponNodes(session.map,unit.currentNode);
    for (var i = 0; i < nodes.length;i++){
    	if (nodes[i].unit){
    		if (nodes[i].unit.owner != unit.owner){
    			data.q = nodes[i].q;
    			data.r = nodes[i].r;
    			data = session.executeAttack(data);
    		}
    	}
    }
    if (!data){return false;}
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Heroic Leap',
        newDir: data.d.newDir
    });
	return true;
}

Actions.prototype.firstAid = function(unit,session,data){
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	if (u.mechanical){
		return false;
	}
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'First Aid'
	});
	if (!u){return false;}
	value = Math.round(u.maximumHealth.value * ((25+unit.charisma.value*2)/100));
	u.damage('heal',value,data.actionData);
	return true;
}

Actions.prototype.resuscitate = function(unit,session,data){
	var Buff = require('./buff.js').Buff;
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Resuscitate'
	});
	if (!u){return false;}
	if (u.fainted){
		u.fainted = false;
		u.currentHealth = 1;
		u.damage('heal',0,data.actionData);
	}else{
		return false;
	}
	u.charge = 0;
	data.actionData.pop();
	var speedVal = u.speed.value*((200+unit.agility.value*10+unit.dexterity.value*10)/100);
	var buffData = session.gameEngine.buffs["buff_resuscitate"];
	var buff = new Buff(buffData);
	buff.actionsOnImmediate.push({
        "action": "alterStat",
        "stat": 'speed',
        "value": speedVal
	});
	buff.actionsOnEnd.push({
        "action": "alterStat",
        "stat": 'speed',
        'value': -speedVal
	});
	buff.init({
	    unit: u //the buff will perform actions on this object
	});
	buff.duration = 1;
	data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: u.id,
        text: 'Revived',
        newShields: u.currentShields,
        newHealth: u.currentHealth,
        fainted: u.fainted,
        type: 'heal',
        dead: u.dead
    });
	return true;
}

Actions.prototype.healingField = function(unit,session,data){
    var node = session.map.axialMap[data.q][data.r];
    if (node.unit){
    	return false;
    }
    data.actionData.push({
        action: session.clientActionEnums.ActionBubble,
        unitid: unit.id,
        text: 'Healing Field'
    });
    var hField = new Unit();
    hField.init({
	    name: 'Healing Field Bot',
	    sex: 'none',
	    owner: unit.owner,
	    engine: unit.engine,
	    id: session.getId(),
	    mechanical: true,
	    human: false,
	    speed: unit.speed.value/5*unit.intelligence.value,
	    maximumHealth: (50 + (unit.intelligence.value*5))*(1+unit.tactics.value/100),
	    ai: true,
	    aiInfo: {
	    	id: 'simpleAction',
	    	action: 'healingFieldEffect',
	    	radius: Math.floor(1+unit.intelligence.value/4),
	    	value: Math.round((10+unit.intelligence.value/2+unit.charisma.value/2)*(1+unit.tactics.value/100))
	    }
    });
    hField.classInfo = new ClassInfo();
    hField.classInfo.init({unit: unit});
    hField.classInfo.setBaseClass('');
    hField.classInfo.setClass('');
    hField.setCurrentNode(node);
    hField.direction = 'North'
    session.allUnits[hField.id] = hField;
    session.queueData('addUnit',{unitInfo: hField.getLessClientData()});
	return true;
}

Actions.prototype.sprint = function(unit,session,data){
	data.unit = unit;
    var endingNode = session.map.getCube(data);
    data.path = session.map.findPath(session.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:unit.jump.value});
    if (data.path[data.path.length-1] > Math.floor(unit.agility.value/2)){
    	console.log("invalid Path on sprint...");
    	console.log('height 1: ' + unit.currentNode.h);
    	console.log("height 2: " + data.path[data.path.length-1].h);
    	console.log(data.path);
    	return false;
    }
    data.isAMove = false;
    data = session.executeMove(data);
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.ActionBubble,
        unitid: unit.id,
        text: 'Sprint',
    });
	return true;
}

Actions.prototype.influence = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Influence'
	});
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.charisma.nMod += 2;
			nodes[i].unit.charisma.set(true);
			data.actionData.push({
		        action: session.clientActionEnums.DmgText,
		        unitid: nodes[i].unit.id,
		        text: 'Charisma +2'
		    });
		}
	}
	return true;
}

Actions.prototype.precisionStrike = function(unit,session,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
    data = session.executeAttack(data);
    if (!data){return false;}
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Precision Strike',
        newDir: data.d.newDir
    });
    data.node.unit.healMod.nMod -= unit.strength.value*2;
    if (data.node.unit.healMod.value < -100){
    	data.node.unit.healMod.value = -100;
    }
    data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: data.node.unit.id,
        text: 'Healing -' + unit.strength.value*2 + '%'
    });
    data.node.unit.healMod.set();
	return true;
}

Actions.prototype.cripple = function(unit,session,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'gun'){
    	return false;
    }
    data = session.executeAttack(data);
    if (!data){return false;}
    data.node.unit.moveLeft -= Math.floor(1+unit.dexterity.value/5);
    data.actionData.splice(0,0,{
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Cripple',
        newDir: data.d.newDir
    });
    data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: data.node.unit.id,
        text: 'Move -' + Math.floor(1+unit.dexterity.value/5)
    });
	return true;
}

Actions.prototype.shieldBoost = function(unit,session,data){
	var Buff = require('./buff.js').Buff;
	if (typeof data.target == 'undefined'){
		return false;
	}
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Shield Boost'
	});
	var current = data.target.maximumShields.value;
	var percent = (20+unit.willpower.value*5);
	var buffData = session.gameEngine.buffs["buff_shieldBoost"];
	var buff = new Buff(buffData);
	buff.actionsOnImmediate.push({
        "action": "alterStatPercent",
        "stat": 'sh',
        "value": percent/100
	});
	buff.actionsOnEnd.push({
        "action": "alterStatPercent",
        "stat": 'sh',
        "value": percent/100,
        "reverse":true
	});
	buff.init({
	    unit: data.target //the buff will perform actions on this object
	});
	buff.duration = unit.intelligence.value;
	var diff = data.target.maximumShields.value-current;
	data.target.currentShields += diff;
	data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: data.target.id,
        text: 'Shields +' + percent + '%',
        newShields: data.target.currentShields
    });
	return true;
}

Actions.prototype.concentrate = function(unit,session,data){
	var Buff = require('./buff.js').Buff;

	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Concentrate'
	});
	var percent = (125+unit.willpower.value*10);
	var buffData = session.gameEngine.buffs["buff_concentrate"];
	var buff = new Buff(buffData);
	buff.actionsOnImmediate.push({
        "action": "alterStat",
        "stat": 'cSpeedMod',
        "value": percent/100
	});
	buff.actionsOnEnd.push({
        "action": "alterStat",
        "stat": 'cSpeedMod',
        "value": percent/100,
        "reverse":true
	});
	buff.init({
	    unit: unit //the buff will perform actions on this object
	});
	buff.duration = unit.willpower.value;
	data.actionData.push({
        action: session.clientActionEnums.DmgText,
        unitid: data.unit.id,
        text: 'Casting speed +' + percent + '%',
    });
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
		case AbilityEnums.Instruct:
			return this.instruct;
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
		case AbilityEnums.Bolster:
			return this.bolster;
			break;
		case AbilityEnums.Aim:
			return this.aim;
			break;
		case AbilityEnums.Shout:
			return this.shout;
			break;
		case AbilityEnums.Focus:
			return this.focus;
			break;
		case AbilityEnums.HeroicCharge:
			return this.heroicCharge;
			break;
		case AbilityEnums.HeroicLeap:
			return this.heroicLeap;
			break;
		case AbilityEnums.PowerShot:
			return this.powerShot;
			break;
		case AbilityEnums.PowerAttack:
			return this.powerAttack;
			break;
		case AbilityEnums.Slam:
			return this.slam;
			break;
		case AbilityEnums.FirstAid:
			return this.firstAid;
			break;
		case AbilityEnums.Resuscitate:
			return this.resuscitate;
			break;
		case AbilityEnums.HealingField:
			return this.healingField;
			break;
		case AbilityEnums.Sprint:
			return this.sprint;
			break;
		case AbilityEnums.Influence:
			return this.influence;
			break;
		case AbilityEnums.PrecisionStrike:
			return this.precisionStrike;
			break;
		case AbilityEnums.Cripple:
			return this.cripple;
			break;
		case AbilityEnums.ShieldBoost:
			return this.shieldBoost;
			break;
		case AbilityEnums.Concentrate:
			return this.concentrate;
			break;
		default:
			return this.testAbility;
			break;
	}
}

exports.Actions = new Actions();
