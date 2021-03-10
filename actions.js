//actions.js
var Buff = require('./buff.js').Buff,
    ClassInfo = require('./classinfo.js').ClassInfo,
    Utils = require('./utils.js').Utils,
    Enums = require('./enums.js').Enums;

ActionEnums = {
	AlterStat: 'alterStat',
	AlterStatPercent: 'alterStatPercent',
	AlterCurrentEnergy: 'alterCurrentEnergy',
	AlterHealthByPercent: 'alterHealthByPercent',
	AddReaction: 'addReaction',
	SetHidden: 'setHidden',
	AddOnAttackEffect: 'addOnAttackEffect',
	Poison: 'poison',
	HealingFieldEffect: 'healingFieldEffect',
	CheckStealthRemove: 'checkStealthRemove',
	PreparedShotAttack: 'preparedShotAttack',

	CounterAttackEffect: 'counterAttackEffect',
	EvasionEffect: 'evasionEffect',
	DodgeEffect: 'dodgeEffect'
};

AbilityEnums = {
	TestAbility: 'testAbility',
	//scout abilities
	Agitate: 'agitate',
	Cheer: 'cheer',
	Climber: 'climber',
	Counterattack: 'counterAttack',
	Dodge: 'dodge',
	Evasion: 'evasion',
	Flare: 'flare',
	Guile: 'guile',
	Interrupt: 'interrupt',
	PoisonWeapon: 'poisonWeapon',
	QuickAttack: 'quickAttack',
	Stealth: 'stealth',
	//tech
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
	Dictate: 'dictate',
	MechCloak: 'mechCloak',
	CybLegs: 'cybLegs',
	CybArms: 'cybArms',
	CybBrain: 'cybBrain',
	CybEyes: 'cybEyes',
	CybLungs: 'cybLungs',
	CybHeart: 'cybHeart',
	//soldier abilities
	Bolster: 'bolster',
	Battlecry: 'battlecry',
	Aim: 'aim',
	Shout: 'shout',
	Focus: 'focus',
	HeroicLeap: 'heroicLeap',
	HeroicCharge: 'heroicCharge',
	PowerShot: 'powerShot',
	PowerAttack: 'powerAttack',
	Reversal: 'reversal',
	Slam: 'slam',
	//medic abilities
	FirstAid: 'firstAid',
	Resuscitate: 'resuscitate',
	HealingField: 'healingField',
	Sprint: 'sprint',
	Influence: 'influence',
	PrecisionStrike: 'precisionStrike',
	Cripple: 'cripple',
	ShieldBoost: 'shieldBoost',
	Concentrate: 'concentrate',
	//marksman abilities
	Center: 'center',
	Gunner: 'gunner',
	PreparedShot: 'preparedShot'

	//commando abilities
	//splicer abilities
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
	data[Enums.ACTIONDATA] = unit.damage(data.type,Math.ceil(unit.maximumHealth.value*data.val),data[Enums.ACTIONDATA]);
	return false;
}

Actions.prototype.addReaction = function(unit,d){
	var data = Utils.uniqueCopy(d);
	if (data.reverse){
		var arr = unit.getReactionType(data['type']);
		for (var i = 0; i < arr.length;i++){
			if (arr[i]['action'] == data['type']){
				arr.splice(i,1);
				continue;
			}
		}
		unit.setReactions(data['type'],arr);
	}else{
		var arr = unit.getReactionType(data['type']);
		arr.unshift(data['value']);
		unit.setReactions(data['type'],arr);
	}
	return false;
}

Actions.prototype.poison = function(unit,data){
	var Buff = require('./buff.js').Buff;
	var buffData = unit.owner.engine.buffs["buff_poison"];
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
	var cData = {};
	cData[Enums.ACTIONDATA] = [{}];
	cData[Enums.ACTIONDATA][0][Enums.ACTION] = Enums.DAMAGETEXT;
	cData[Enums.ACTIONDATA][0][Enums.UNITID] = data.target.id;
	cData[Enums.ACTIONDATA][0][Enums.TEXT] = "Poisoned";
	unit.owner.session.queueData(Enums.ACTION,cData);
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
	var value = unit.owner.session.parseStringCode(unit,data.val);
	if (unit.currentEnergy >= value){
		unit.currentEnergy -= value;
	}else{
		var cData = {};
		cData[Enums.ACTIONDATA] = [{}];
		cData[Enums.ACTIONDATA][0][Enums.ACTION] = Enums.DAMAGETEXT;
		cData[Enums.ACTIONDATA][0][Enums.UNITID] = unit.id;
		cData[Enums.ACTIONDATA][0][Enums.TEXT] = "Not Enough Energy";
		unit.owner.session.queueData(Enums.ACTION,cData);
		return true;
	}
	var cData = {};
	cData[Enums.ACTIONDATA] = [{}];
	cData[Enums.ACTIONDATA][0][Enums.ACTION] = Enums.SETENERGY;
	cData[Enums.ACTIONDATA][0][Enums.UNITID] = unit.id;
	cData[Enums.ACTIONDATA][0][Enums.VALUE] = unit.currentEnergy;
	unit.owner.session.queueData(Enums.ACTION,cData);

	return false;
}

Actions.prototype.setHidden = function(unit,data){
	if (data.reverse){
		if (unit.hidden){
			unit.hidden = false;
			var cData = {};
			cData[Enums.ACTIONDATA] = [{}];
			cData[Enums.ACTIONDATA][0][Enums.ACTION] = Enums.REVEAL;
			cData[Enums.ACTIONDATA][0][Enums.UNITID] = unit.id;
			cData[Enums.ACTIONDATA][0][Enums.DIRECTIONS] = unit.direction;
			cData[Enums.ACTIONDATA][0][Enums.Q] = unit.currentNode.q;
			cData[Enums.ACTIONDATA][0][Enums.R] = unit.currentNode.r;
			unit.owner.session.queueData(Enums.ACTION,cData);
		}
	}else{
		unit.hidden = true;
		var cData = {};
		cData[Enums.ACTIONDATA] = [{}];
		cData[Enums.ACTIONDATA][0][Enums.ACTION] = Enums.HIDE;
		cData[Enums.ACTIONDATA][0][Enums.UNITID] = unit.id;
		unit.owner.session.queueData(Enums.ACTION,cData);
	}
	return false;
}

Actions.prototype.healingFieldEffect = function(unit,data){
	//get all units in radius;
	var radius = data.radius;
	var node = unit.currentNode
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);

	var aData = {};
	aData[Enums.UNITID] = unit.id;
	aData[Enums.ACTION] = Enums.ACTIONBUBBLE;
	aData[Enums.TEXT] = 'Healing Field';
	data[Enums.ACTIONDATA].push(aData);

	for (var i = 0; i < nodes.length;i++){
		var node = nodes[i];
		if (node.unit){
			if (node.unit.owner == unit.owner){
				data[Enums.ACTIONDATA] = node.unit.damage('heal',data.value,data[Enums.ACTIONDATA]);
			}
		}
	}
	return false;
}

Actions.prototype.checkStealthRemove = function(unit,data){
	//get all units in radius;
	var session = unit.owner.session;
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
Actions.prototype.preparedShotAttack = function(target,unit,data,actionData){
	//get all units in radius;
	console.log('EXECUTE PREPARED SHOT');
	console.log(data);
	console.log(target.name);
	console.log(unit.name);
	return [actionData,false];
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
		case ActionEnums.AddReaction:
			return this.addReaction;
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
		case ActionEnums.PreparedShotAttack:
			return this.preparedShotAttack;
			break
		case ActionEnums.EvasionEffect:
			return this.evasionEffect;
			break
		case ActionEnums.DodgeEffect:
			return this.dodgeEffect;
			break
		case ActionEnums.CounterAttackEffect:
			return this.counterAttackEffect;
			break
	}
}


//-----------------------------------------------------------------------------------------------|
//                                    Unit Ability Functions                                     |
//-----------------------------------------------------------------------------------------------|

Actions.prototype.testAbility = function(unit,session,data){
	console.log('test ability!!!');
	return true;
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
	var buffData = session.engine.buffs["buff_stealth"];
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
	var aData = {};
	aData[Enums.UNITID] = unit.id;
	aData[Enums.ACTION] = Enums.ACTIONBUBBLE;
	aData[Enums.TEXT] = 'STEALTH';
	data[Enums.ACTIONDATA].push(aData);

	return true;
}

Actions.prototype.flare = function(unit,session,data){
	//get all units in radius
	var radius = Math.floor(1+unit.intelligence.value/3);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	var aData = {};
	aData[Enums.UNITID] = unit.id;
	aData[Enums.ACTION] = Enums.ACTIONBUBBLE;
	aData[Enums.TEXT] = 'Flare';
	data[Enums.ACTIONDATA].push(aData);
	for (var i = 0; i < nodes.length;i++){
		//reveal and set new direction
		var nextUnit = nodes[i].unit;
		var d = session.map.getDMod(nextUnit.currentNode,node);
		if (d.newDir){
			nextUnit.direction = d.newDir;
		}else{
			d.newDir = nextUnit.direction
		}
		var cData = {};
		cData[Enums.ACTION] = Enums.FACE;
		cData[Enums.UNITID] = nextUnit.id;
		cData[Enums.DIRECTION] = d.nerDir;
		data[Enums.ACTIONDATA].push(cData);
    	if (nextUnit.hidden){
			nextUnit.removeBuffsWithTag('stealth');
	    }
	}
	return true;
}
Actions.prototype.quickAttack = function(unit,session,data){
    data = session.executeAttack(data);
    if (!data){return false;}
    var cData = {};
    cData[Enums.ACTION] = Enums.ATTACK;
    cData[Enums.UNITID] = data.unit.id;
    cData[Enums.WEAPON] = 'Quick Attack';
    cData[Enums.DIRECTION] = data.d.newDir;
    data[Enums.ACTIONDATA].splice(0,0,cData);
    unit.charge += session.chargeMax*(0.3+Math.round(unit.agility.value*1.5)/100);
	return true;
}
Actions.prototype.guile = function(unit,session,abl){
    if (abl.reverse){
    	unit.charisma.nMod -= 3;
    }else{
    	unit.charisma.nMod += 3;
    }
    unit.charisma.set(true);
	return true;
}
Actions.prototype.climber = function(unit,session,abl){
	var val = (Math.ceil(unit.strength.value/4));
	abl.data.value = val;
    if (abl.reverse){
    	unit.jump.nMod -= val;
    	unit.strength.removeOnChange('climber');
    }else{
    	unit.jump.nMod += val;

    	unit.strength.addOnChange({
    		name: 'climber',
    		func: function(updateClient,attr,ability){
    			attr.owner.jump.nMod -= ability.data.value;
    			ability.data.value = (Math.ceil(attr.owner.strength.value/4));
    			attr.owner.jump.nMod += ability.data.value;
    			attr.owner.jump.set(updateClient);
    		},
    		ability: abl
    	})
    }
    unit.jump.set(true);
	return true;
}
Actions.prototype.dodge = function(unit,session,abl){
    if (abl.reverse){
    	unit.removeOnTakeDamage('dodge');
    }else{
    	unit.addOnTakeDamage({
    		name: 'dodgeEffect'
    	})
    }
	return true;
}
Actions.prototype.evasion = function(unit,session,abl){
    if (abl.reverse){
    	unit.removeOnTakeDamage('evasion');
    }else{
    	unit.addOnTakeDamage({
    		name: 'evasionEffect'
    	})
    }
	return true;
}
Actions.prototype.counterAttack = function(unit,session,abl){
    if (abl.reverse){
    	unit.removeOnTakeDamage('counterAttack');
    }else{
    	unit.addOnTakeDamage({
    		name: 'counterAttackEffect'
    	})
    }
	return true;
}
Actions.prototype.agitate = function(unit,session,data){
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	var aData = {};
	aData[Enums.UNITID] = unit.id;
	aData[Enums.ACTION] = Enums.ACTIONBUBBLE;
	aData[Enums.TEXT] = 'Agitate';
	data[Enums.ACTIONDATA].push(aData);
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
    var cData = {};
    cData[Enums.ACTION] = Enums.DAMAGETEXT;
    cData[Enums.UNITID] = u.id;
    cData[Enums.TEXT] = 'All Stats -1';
	data[Enums.ACTIONDATA].push(cData);
	return true;
}
Actions.prototype.cheer = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	var aData = {};
	aData[Enums.UNITID] = unit.id;
	aData[Enums.ACTION] = Enums.ACTIONBUBBLE;
	aData[Enums.TEXT] = 'Cheer';
	data[Enums.ACTIONDATA].push(aData);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.agility.nMod += 2;
			nodes[i].unit.agility.set(true);
			var aData = 
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'Agility +2'
		    ));
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
    var cData = {};
    cData[Enums.ACTION] = Enums.ATTACK;
    cData[Enums.UNITID] = data.unit.id;
    cData[Enums.WEAPON] = 'Interrupt';
    cData[Enums.DIRECTION] = data.d.newDir;
    data[Enums.ACTIONDATA].splice(0,0,cData);
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
		var buffData = session.engine.buffs["buff_poisonedWeapon"];
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
		data[Enums.ACTIONDATA].push(unit.engine.createClientData(
			Enums.UNITID,unit.id,
			Enums.ACTION,Enums.ACTIONBUBBLE,
			Enums.TEXT,'poisonWeapon'
		));
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
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Scan'
	));
	for (var i = 0; i < nodes.length;i++){
		//reveal and set new direction
		var nextUnit = nodes[i].unit;
		if (nextUnit.hidden){continue;}
		if (nextUnit.owner != unit.owner){
			//send down detailed unit info!
			unit.owner.identifiedUnits[nextUnit.id] = true;
			unit.owner.session.queuePlayer(unit.owner,Enums.UPDATEUNITINFO,unit.engine.createClientData(
		        Enums.UNITID, nextUnit.id,
		        Enums.UNITINFO, nextUnit.getClientData()
			));
		}
	}
	return true; 
}


Actions.prototype.aim = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Aim'
	));
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.dexterity.nMod += 2;
			nodes[i].unit.dexterity.set(true);
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'Dexterity +2'
		    ));
		}
	}
	return true;
}
Actions.prototype.center = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Center'
	));
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.willpower.nMod += 2;
			nodes[i].unit.willpower.set(true);
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'Willpower +2'
		    ));
		}
	}
	return true;
}

Actions.prototype.dictate = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Dictate'
	));
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.intelligence.nMod += 2;
			nodes[i].unit.intelligence.set(true);
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'Intelligence +2'
		    ));
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
		data.dmg = 10;
	}
	var radius = Math.floor(1+unit.intelligence.value/10);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, data.txt
	));
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage(data.dmgType,Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),data[Enums.ACTIONDATA]);
	}
	return true;
}

Actions.prototype.flareGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'heat';
	data.txt = 'Flare Grenade';
	data.dmg = 10;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.cryoGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'cold';
	data.txt = 'Cryo Grenade';
	data.dmg = 10;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.shockGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'elec';
	data.txt = 'Shock Grenade';
	data.dmg = 10;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.bioGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'viral';
	data.txt = 'Bio Grenade';
	data.dmg = 10;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.toxicGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'pois';
	data.txt = 'Toxic Grenade';
	data.dmg = 10;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.empGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'puls';
	data.txt = 'EMP Grenade';
	data.dmg = 10;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.unstableGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'radi';
	data.txt = 'Unstable Grenade';
	data.dmg = 10;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.voidGrenade = function(unit,session,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'grav';
	data.txt = 'Void Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,session,data);
}

Actions.prototype.resUp = function(unit,session,data){
	var Buff = require('./buff.js').Buff;
	//get all units in radius;
	var radius = Math.floor(2);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Resist UP'
	));
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			var percent = unit.willpower.value*4;
			var buffData = session.engine.buffs["buff_resistUp"];
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
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'All res +' + percent + '%'
		    ));
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
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Repair'
	));
	if (!u){return false;}
	value = Math.round(u.maximumHealth.value * ((25+unit.dexterity.value*2)/100));
	u.damage('heal',value,data[Enums.ACTIONDATA]);
	return true;
}

Actions.prototype.bolster = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Bolster'
	));
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.endurance.nMod += 2;
			nodes[i].unit.endurance.set(true);
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'Endurance +2'
		    ));
		}
	}
	return true;
}
Actions.prototype.battlecry = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Battlecry'
	));
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.strength.nMod += 2;
			nodes[i].unit.strength.set(true);
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'Strength +2'
		    ));
		}
	}
	return true;
}

Actions.prototype.instruct = function(unit,session,data){
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Instruct'
	));
	var val = Math.ceil(unit.skill.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	unit.skill.nMod += val;
	unit.skill.set(true);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, unit.id,
        Enums.TEXT, 'Instruct +' + val
    ));
	return true;
}

Actions.prototype.shout = function(unit,session,data){
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Shout'
	));
	var val = Math.ceil(unit.power.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	unit.power.nMod += val;
	unit.power.set(true);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, unit.id,
        Enums.TEXT, 'Power +' + val
    ));
	return true;
}

Actions.prototype.focus = function(unit,session,data){
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Focus'
	));
	var val = Math.ceil(unit.tactics.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	unit.tactics.nMod += val;
	unit.tactics.set(true);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, unit.id,
        Enums.TEXT, 'Tactics +' + val
    ));
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
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ATTACK,
        Enums.UNITID, data.unit.id,
        Enums.WEAPON, 'Power Shot',
        Enums.DIRECTION, data.d.newDir
    ));
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
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ATTACK,
        Enums.UNITID, data.unit.id,
        Enums.WEAPON, 'Power Attack',
        Enums.DIRECTION, data.d.newDir
    ));
	return true;
}

Actions.prototype.reversal = function(unit,session,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
    data.ablMod = 1+(25+Math.floor(unit.dexterity.value*2))/100;
    data = session.executeAttack(data);
    if (!data){return false;}
    var unitCurrentNode = {q:unit.currentNode.q,r:unit.currentNode.r};
    var targetCurrentNode = {q:data.target.currentNode.q,r:data.target.currentNode.r};
    unit.newNode(session.map.axialMap[targetCurrentNode.q][targetCurrentNode.r]);
    data.target.newNode(session.map.axialMap[unitCurrentNode.q][unitCurrentNode.r]);
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ATTACK,
        Enums.UNITID, data.unit.id,
        Enums.WEAPON, 'Reversal',
        Enums.DIRECTION, data.d.newDir
    ));
    data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.REVERSAL,
        Enums.UNITID, data.unit.id,
        Enums.UNITNEWNODE, unit.engine.createClientData(Enums.Q, unit.currentNode.q, Enums.R, unit.currentNode.r),
        Enums.TARGETNEWNODE, unit.engine.createClientData(Enums.Q, data.target.currentNode.q, Enums.R, data.target.currentNode.r),
        Enums.TARGETID, data.target.id
    ));
	return true;
}

Actions.prototype.slam = function(unit,session,data){
	if (typeof data.target == 'undefined'){
		return false;
	}
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Slam'
	));
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
    		data.target.damage('physical',dmg,data[Enums.ACTIONDATA]);
    		newNode.unit.damage('physical',dmg,data[Enums.ACTIONDATA]);
    		return true;
    	}
    	if (newNode.h-data.target.currentNode.h >= data.target.height){
    		//slam into the wall and take damage, then end
    		var dmg = Math.round(30*(1+unit.tactics.value/50));
    		data.target.damage('physical',dmg,data[Enums.ACTIONDATA]);
    		return true;
    	}else{
    		//move the target to the new node
    		data.target.newNode(newNode);
    		data[Enums.ACTIONDATA].push(unit.engine.createClientData(
	            Enums.ACTION, Enums.SLAM,
	            Enums.UNITID, data.target.id,
	            Enums.X, newNode.x,
	            Enums.Y, newNode.y,
	            Enums.Z, newNode.z
	        ));
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
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ATTACK,
        Enums.UNITID, data.unit.id,
        Enums.WEAPON, 'Heroic Charge',
        Enums.DIRECTION, data.d.newDir
    ));
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
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ATTACK,
        Enums.UNITID, data.unit.id,
        Enums.WEAPON, 'Heroic Leap',
        Enums.DIRECTION, data.d.newDir
    ));
	return true;
}

Actions.prototype.firstAid = function(unit,session,data){
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	if (u.mechanical){
		return false;
	}
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'First Aid'
	));
	if (!u){return false;}
	value = Math.round(u.maximumHealth.value * ((25+unit.charisma.value*2)/100));
	u.damage('heal',value,data[Enums.ACTIONDATA]);
	return true;
}

Actions.prototype.resuscitate = function(unit,session,data){
	var Buff = require('./buff.js').Buff;
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Resuscitate'
	));
	if (!u){return false;}
	if (u.fainted){
		u.fainted = false;
		u.currentHealth = 1;
		u.damage('heal',0,data[Enums.ACTIONDATA]);
	}else{
		return false;
	}
	u.charge = 0;
	data[Enums.ACTIONDATA].pop();
	var speedVal = u.speed.value*((200+unit.agility.value*10+unit.dexterity.value*10)/100);
	var buffData = session.engine.buffs["buff_resuscitate"];
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
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, u.id,
        Enums.TEXT, 'Revived',
        Enums.SHIELDS, u.currentShields,
        Enums.HEALTH, u.currentHealth,
        Enums.FAINTED, u.fainted,
        Enums.TYPE, 'heal',
        Enums.DEAD, u.dead
    ));
	return true;
}

Actions.prototype.healingField = function(unit,session,data){
    var node = session.map.axialMap[data.q][data.r];
    if (node.unit){
    	return false;
    }
    data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.UNITID, unit.id,
        Enums.TEXT, 'Healing Field'
    ));
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
    session.queueData(Enums.ADDUNIT,unit.engine.createClientData(Enums.UNITINFO, hField.getLessClientData()));

    unit.owner.identifiedUnits[hField.id] = true;
	unit.owner.session.queuePlayer(unit.owner,Enums.UPDATEUNITINFO,unit.engine.createClientData(
        Enums.UNITID, hField.id,
        Enums.UNITINFO, hField.getClientData()
	));
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
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.UNITID, unit.id,
        Enums.TEXT, 'Sprint',
    ));
	return true;
}

Actions.prototype.influence = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Influence'
	));
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.charisma.nMod += 2;
			nodes[i].unit.charisma.set(true);
			data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		        Enums.ACTION, Enums.DAMAGETEXT,
		        Enums.UNITID, nodes[i].unit.id,
		        Enums.TEXT, 'Charisma +2'
		    ));
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
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ATTACK,
        Enums.UNITID, data.unit.id,
        Enums.WEAPON, 'Precision Strike',
        Enums.DIRECTION, data.d.newDir
    ));
    data.node.unit.healMod.nMod -= unit.strength.value*2;
    if (data.node.unit.healMod.value < -100){
    	data.node.unit.healMod.value = -100;
    }
    data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, data.node.unit.id,
        Enums.TEXT, 'Healing -' + unit.strength.value*2 + '%'
    ));
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
    data[Enums.ACTIONDATA].splice(0,0,unit.engine.createClientData(
        Enums.ACTION, Enums.ATTACK,
        Enums.UNITID, data.unit.id,
        Enums.WEAPON, 'Cripple',
        Enums.DIRECTION, data.d.newDir
    ));
    data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, data.node.unit.id,
        Enums.TEXT, 'Move -' + Math.floor(1+unit.dexterity.value/5)
    ));
	return true;
}

Actions.prototype.shieldBoost = function(unit,session,data){
	var Buff = require('./buff.js').Buff;
	if (typeof data.target == 'undefined'){
		return false;
	}
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Shield Boost'
	));
	var current = data.target.maximumShields.value;
	var percent = (20+unit.willpower.value*5);
	var buffData = session.engine.buffs["buff_shieldBoost"];
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
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, data.target.id,
        Enums.TEXT, 'Shields +' + percent + '%',
        Enums.SHIELDS, data.target.currentShields
    ));
	return true;
}

Actions.prototype.concentrate = function(unit,session,data){
	var Buff = require('./buff.js').Buff;

	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Concentrate'
	));
	var percent = (125+unit.willpower.value*10);
	var buffData = session.engine.buffs["buff_concentrate"];
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
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, data.unit.id,
        Enums.TEXT, 'Casting speed +' + percent + '%'
    ));
	return true;
}
Actions.prototype.gunner = function(unit,session,data){
	var Buff = require('./buff.js').Buff;

	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
		Enums.UNITID, unit.id,
        Enums.ACTION, Enums.ACTIONBUBBLE,
        Enums.TEXT, 'Concentrate'
	));
	var percent = (125+unit.willpower.value*10);
	var buffData = session.engine.buffs["buff_concentrate"];
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
	data[Enums.ACTIONDATA].push(unit.engine.createClientData(
        Enums.ACTION, Enums.DAMAGETEXT,
        Enums.UNITID, data.unit.id,
        Enums.TEXT, 'Casting speed +' + percent + '%'
    ));
	return true;
}
Actions.prototype.preparedShot = function(unit,session,data){
	var Buff = require('./buff.js').Buff;
	//add prepared shot buff
	unit.addBuff("buff_preparedShot");
	return true;
}

Actions.prototype.getAbility = function(a){
	console.log('getting ability <' + a + '>');
	switch(a){
		case AbilityEnums.TestAbility:
			return this.testAbility;
			break;
		//scout abilities
		case AbilityEnums.Agitate:
			return this.agitate;
			break;
		case AbilityEnums.Cheer:
			return this.cheer;
			break;
		case AbilityEnums.Flare:
			return this.flare;
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
		case AbilityEnums.Climber:
			return this.climber;
			break;
		case AbilityEnums.Dodge:
			return this.dodge;
			break;
		case AbilityEnums.Guile:
			return this.guile;
			break;
		case AbilityEnums.CounterAttack:
			return this.counterAttack;
			break;
		case AbilityEnums.Evasion:
			return this.evasion;
			break;
		//tech abilities
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
		//soldier abilities
		case AbilityEnums.Bolster:
			return this.bolster;
			break;
		case AbilityEnums.Battlecry:
			return this.battlecry;
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
		case AbilityEnums.Reversal:
			return this.reversal;
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
		case AbilityEnums.Center:
			return this.center;
			break;
		case AbilityEnums.Dictate:
			return this.dictate;
			break;

		case AbilityEnums.PreparedShot:
			return this.preparedShot;
			break;
		default:
			return this.testAbility;
			break;
	}
}

exports.Actions = new Actions();
