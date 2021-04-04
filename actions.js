//actions.js
var Buff = require('./buff.js').Buff,
    ClassInfo = require('./classinfo.js').ClassInfo,
    ClientActions = require('./clientActions.js').ClientActions,
    Utils = require('./utils.js').Utils,
    Enums = require('./enums.js').Enums;

ActionEnums = {
	AlterStat: 'alterStat',
	AlterStatPercent: 'alterStatPercent',
	AlterCurrentEnergy: 'alterCurrentEnergy',
	AlterHealthByPercent: 'alterHealthByPercent',
	SetHidden: 'setHidden',
	AddOnAttack: 'addOnAttack',
	AddOnEnemyMove: 'addOnEnemyMove',
	AddAfterEnemyMove: 'addAfterEnemyMove',
	Poison: 'poison',
	HealingFieldEffect: 'healingFieldEffect',
	CheckStealthRemove: 'checkStealthRemove',
	PreparedShotAttack: 'preparedShotAttack',

	CounterAttackEffect: 'counterAttackEffect',
	EvasionEffect: 'evasionEffect',
	DodgeEffect: 'dodgeEffect',
	GunnerEffect: 'gunnerEffect',

	//items
	HealingCompound: 'healingCompound',
	VigorCompound: 'vigorCompound'
};

AbilityEnums = {
	TestAbility: 'testAbility',
	//scout abilities
	Agitate: 'agitate',
	Cheer: 'cheer',
	Climber: 'climber',
	CounterAttack: 'counterAttack',
	Dodge: 'dodge',
	Evasion: 'evasion',
	Flare: 'flare',
	Guile: 'guile',
	Interrupt: 'interrupt',
	PoisonWeapon: 'poisonWeapon',
	QuickAttack: 'quickAttack',
	Stealth: 'stealth',
	//tech
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
	Battlecry: 'battlecry',
	HeroicLeap: 'heroicLeap',
	HeroicCharge: 'heroicCharge',
	PowerShot: 'powerShot',
	PowerAttack: 'powerAttack',
	Reversal: 'reversal',
	Hardy: 'hardy',
	Vengeance: 'vengeance',
	Slam: 'slam',
	Opportunity: 'opportunity',
	QuickDraw: 'quickDraw',
	Momentum: 'momentum',
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
	Gunner: 'gunner',
	PreparedShot: 'preparedShot',
	Aim: 'aim',
	Scan: 'scan',
	ExpertSighting: 'expertSighting',

	//commando abilities
	Instruct: 'instruct',
	Shout: 'shout',
	Focus: 'focus',
	Energize: 'energize',
	Bolster: 'bolster',
	Rest: 'rest',
	//splicer abilities
	Center: 'center',
	FireBreath: 'fireBreath',
	IceShards: 'iceShards',
	Detonate: 'detonate',
	ThunderCross: 'thunderCross',
	ViralCloud: 'viralCloud',
	Empoison: 'empoison',
	EnergyBlast: 'enrgyBlast',
	GammaTendrils: 'gammaTendrils',
	VoidScream: 'voidScream',
	AcidSpit: 'acidSpit'

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
	data[Enums.ACTIONDATA] = unit.damage({
		damageType: data.type,
		value: Math.ceil(unit.maximumHealth.value*data['val']),
		actionData: data[Enums.ACTIONDATA],
		source: unit,
		attackType: 'ability'
	});
	return false;
}

//items
Actions.prototype.healingCompound = function(unit,data){
	data[Enums.ACTIONDATA] = unit.damage({
		damageType: 'heal',
		value: data['value'],
		actionData: data[Enums.ACTIONDATA],
		source: unit,
		attackType: 'ability'
	});
	return true;
}
Actions.prototype.vigorCompound = function(unit,data){
	unit.currentEnergy += data['value'];
	if (unit.currentEnergy > unit.maximumEnergy.value){
		unit.currentEnergy = unit.maximumEnergy.value;
	}
	data[Enums.ACTIONDATA].push(ClientActions.damageText(unit.id,"Energy +" + data['value']));
	data[Enums.ACTIONDATA].push(ClientActions.setEnergy(unit.id,unit.currentEnergy));
	return true;
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
	cData[Enums.ACTIONDATA] = [ClientActions.damageText(data.target.id,"Poisoned")];
	unit.owner.session.queueData(Enums.ACTION,cData);
	return false;
}
Actions.prototype.addOnAttack = function(unit,data){
	if (data['reverse']){
		unit.removeFromEffectArray(unit.onAttack,data['name']);
	}else{
		unit.addToEffectArray(unit.onAttack,data['effect'])
	}
	return false;
}
Actions.prototype.addOnEnemyMove = function(unit,data){
	console.log(data);
	if (data['reverse']){
		unit.removeFromEffectArray(unit.onEnemyMove,data['name']);
	}else{
		unit.addToEffectArray(unit.onEnemyMove,data['effect'])
	}
	return false;
}
Actions.prototype.addAfterEnemyMove = function(unit,data){
	console.log(data);
	if (data['reverse']){
		unit.removeFromEffectArray(unit.afterEnemyMove,data['name']);
	}else{
		unit.addToEffectArray(unit.afterEnemyMove,data['effect'])
	}
	return false;
}
Actions.prototype.gunnerEffect = function(unit,data){
	unit.speed.pMod -= data['spval'];
	unit.maximumHealth.pMod -= data['hpval'];
	if (!unit.inventory.hasWeapon()){
		data['hpval'] = 0.1;
		data['spval'] = 0.1;
	}else{
		data['hpval'] = 0;
		data['spval'] = 0;
	}
	unit.speed.pMod += data['spval'];
	unit.maximumHealth.pMod += data['hpval'];
	unit.speed.set(true);
	unit.maximumHealth.set(true);
	return false;
}
Actions.prototype.alterCurrentEnergy = function(unit,data){
	var value = unit.owner.session.parseStringCode(unit,data.val);
	if (unit.currentEnergy >= value){
		unit.currentEnergy -= value;
	}else{
		var cData = {};
		cData[Enums.ACTIONDATA] = [ClientActions.damageText(unit.id,"NOT ENOUGH ENERGY")];
		unit.owner.session.queueData(Enums.ACTION,cData);
		return true;
	}
	var cData = {};
	cData[Enums.ACTIONDATA] = [ClientActions.setEnergy(unit.id,unit.currentEnergy)];
	unit.owner.session.queueData(Enums.ACTION,cData);
	return false;
}

Actions.prototype.setHidden = function(unit,data){
	if (data.reverse){
		if (unit.hidden){
			unit.hidden = false;
			var cData = {};
			cData[Enums.ACTIONDATA] = [
				ClientActions.reveal(unit.id,unit.direction,unit.currentNode.q,unit.currentNode.r),
				ClientActions.log(unit.id,' - ' + unit.name + ' has been revealed!')
			];
			unit.owner.session.queueData(Enums.ACTION,cData);
		}
	}else{
		unit.hidden = true;
		var cData = {};
		cData[Enums.ACTIONDATA] = [ClientActions.hide(unit.id)];
		unit.owner.session.queueData(Enums.ACTION,cData);
	}
	return false;
}

Actions.prototype.healingFieldEffect = function(unit,data){
	//get all units in radius;
	let radius = data.radius;
	let node = unit.currentNode
	let nodes = unit.owner.session.map.getUnitsInRadius(node,radius);

	data[Enums.ACTIONDATA].push(ClientActions.actionBubble(unit.id,'Healing Field'));

	for (var i = 0; i < nodes.length;i++){
		node = nodes[i];
		if (node.unit){
			if (node.unit.owner == unit.owner){
				data[Enums.ACTIONDATA] = node.unit.damage({
					damageType: 'heal',
					value: data.value,
					actionData: data[Enums.ACTIONDATA],
					source: unit,
					attackType: 'aoe'
				});
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
Actions.prototype.preparedShotAttack = function(unit,data){
	var atData = {};
	atData.unit = unit;
	atData.weapon = unit.getWeapon();
	if (atData.weapon.type != 'gun'){
        return false;
    }
    atData.q = data.target.currentNode.q;
    atData.r = data.target.currentNode.r;
    atData[Enums.ACTIONDATA] = data.actionData;
    var newAttack = unit.owner.session.unitAttack(atData);
    if (newAttack){
    	data.actionData = newAttack[Enums.ACTIONDATA];
		data.actionData.push(ClientActions.log(' - ' + unit.name + ' fires a prepared shot!!'));
		unit.removeBuff('buff_preparedShot');
		return data;
	}
	return false;
};

Actions.prototype.evasionEffect = function(unit,data){
	console.log(data.value);
    if (data.attackType == 'aoe'){
    	if (unit.reaction > 0){
    		unit.reaction -= 1;
			data.aData.push(ClientActions.log(' - ' + unit.name + ' evades!'));
			data.value = Math.ceil(data.value * (1-(unit.agility.value*4/100)));
    		return data;
    	}
    }
    return false;
};
Actions.prototype.dodgeEffect = function(unit,data){
	console.log(data.value);
    if (data.attackType == 'attack'){
    	if (unit.reaction > 0){
    		unit.reaction -= 1;
			data.aData.push(ClientActions.log(' - ' + unit.name + ' dodges!'));
			data.value = Math.ceil(data.value * (1-(unit.agility.value*4/100)));
			return data;
    	}
    }
    return false;
};
Actions.prototype.counterAttackEffect = function(unit,data){
    if (data.attackType == 'attack'){
    	if (unit.reaction > 0){
    		var atData = {};
    		atData.unit = unit;
    		atData.weapon = unit.getWeapon();
    		if (atData.weapon.type != 'weapon'){
                return false;
            }
            atData.q = data.source.currentNode.q;
            atData.r = data.source.currentNode.r;
		    atData[Enums.ACTIONDATA] = data.aData;
		    var newAttack = unit.owner.session.unitAttack(atData);
            if (newAttack){
            	data.aData = newAttack[Enums.ACTIONDATA];
				data.aData.push(ClientActions.actionBubble(unit.id,'Counterattack'));
				data.aData.push(ClientActions.log(' - ' + unit.name + ' counters the attack!!'));
    			unit.reaction -= 1;
				return data;
    		}
    	}
    }
    return false;
};

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
		case ActionEnums.AddOnAttack:
			return this.addOnAttack;
			break;
		case ActionEnums.AddOnEnemyMove:
			return this.addOnEnemyMove;
			break;
		case ActionEnums.AddAfterEnemyMove:
			return this.addAfterEnemyMove;
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
		case ActionEnums.GunnerEffect:
			return this.gunnerEffect;
			break;
		case ActionEnums.CounterAttackEffect:
			return this.counterAttackEffect;
			break
		//items
		case ActionEnums.HealingCompound:
			return this.healingCompound;
			break
		case ActionEnums.VigorCompound:
			return this.vigorCompound;
			break
	}
}


//-----------------------------------------------------------------------------------------------|
//                                    Unit Ability Functions                                     |
//-----------------------------------------------------------------------------------------------|

Actions.prototype.testAbility = function(unit,data){
	console.log('test ability!!!');
	return true;
}

Actions.prototype.stealth = function(unit,data){
	var Buff = require('./buff.js').Buff;
	//first, check team
	var pass = false;
	var session = unit.owner.session;
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
        "value": -(41-unit.agility.value*2)/100
	});
	buff.actionsOnEnd.push({
        "action": "alterStatPercent",
        "stat": "speed",
        "value": (41-unit.agility.value*2)/100
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

	return true;
}

Actions.prototype.flare = function(unit,data){
	//get all units in radius
	var radius = Math.floor(1+unit.intelligence.value/3);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		//reveal and set new direction
		var nextUnit = nodes[i].unit;
		var d = unit.owner.session.map.getDMod(node,nextUnit.currentNode);
		if (d.newDir){
			nextUnit.direction = d.newDir;
		}else{
			d.newDir = nextUnit.direction
		}
		data[Enums.ACTIONDATA].push(ClientActions.face(nextUnit.id,d.newDir));
    	if (nextUnit.hidden){
			nextUnit.removeBuffsWithTag('stealth');
	    }
	}
	return true;
}
Actions.prototype.quickAttack = function(unit,data){
    data = unit.owner.session.unitAttack(data);
    if (!data){return false;}
    unit.charge += unit.owner.session.chargeMax*(0.3+Math.round(unit.agility.value*1.5)/100);
	return true;
}
Actions.prototype.guile = function(unit,abl){
    if (abl.reverse){
    	unit.charisma.nMod -= 3;
    }else{
    	unit.charisma.nMod += 3;
    }
    unit.charisma.set(true);
	return true;
}
Actions.prototype.climber = function(unit,abl){
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
    	});
    }
    unit.jump.set(true);
	return true;
}
Actions.prototype.dodge = function(unit,abl){
    if (abl.reverse){
    	unit.removeFromEffectArray(unit.onTakeDamage,'dodgeEffect');
    }else{
    	unit.addToEffectArray(unit.onTakeDamage,{
    		'name': 'dodgeEffect'
    	});
    }
	return true;
}
Actions.prototype.evasion = function(unit,abl){
    if (abl.reverse){
    	unit.removeFromEffectArray(unit.onTakeDamage,'evasionEffect');
    }else{
    	unit.addToEffectArray(unit.onTakeDamage,{
    		'name': 'evasionEffect'
    	});
    }
	return true;
}
Actions.prototype.counterAttack = function(unit,abl){
    if (abl.reverse){
    	unit.removeFromEffectArray(unit.onTakeDamage,'counterAttackEffect');
    }else{
    	unit.addToEffectArray(unit.onTakeDamage,{
    		'name': 'counterAttackEffect'
    	})
    }
	return true;
}
Actions.prototype.agitate = function(unit,data){
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var u = node.unit;
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
Actions.prototype.cheer = function(unit,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.agility.nMod += 2;
			nodes[i].unit.agility.set(true);
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'Agility +2'));
		}
	}
	return true;
}
Actions.prototype.interrupt = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
    data = unit.owner.session.executeAttack(data);
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Interrupt',data.d.newDir));
    data.node.unit.charge -= unit.owner.session.chargeMax*((10+unit.agility.value)/100);
    if (data.node.unit.charge < 0){
    	data.node.unit.charge = 0;
    }
    //reduce any casting timers!
    for (var i in unit.owner.session.allUnits){
    	if (unit.owner.session.allUnits[i].isCastTimer && unit.owner.session.allUnits[i].unitid == data.node.unit.id){
    		unit.owner.session.allUnits[i].charge -= unit.owner.session.chargeMax*((20+unit.agility.value*2)/100);
    	}
    }
	return true;
}

Actions.prototype.poisonWeapon = function(unit,data){
	var Buff = require('./buff.js').Buff;
    //get the units weapon
    var weapon = unit.getWeapon();
    if (weapon.type == 'weapon'){
    	//add poison on hit!
		var buffData = unit.owner.session.engine.buffs["buff_poisonedWeapon"];
		var buff = new Buff(buffData);
		buff.actionsOnImmediate.push({
	        "action": "addOnAttack",
	        "effect": {
	        	'name': "poison",
	        	'instances': 1+Math.floor(unit.intelligence.value/4),
	        }
		});
		buff.actionsOnEnd.push({
			"action": "addOnAttack",
	        "reverse": true,
	        "name": "poison"
		});
		buff.init({
		    unit: unit //the buff will perform actions on this object
		})
    }else{
    	return false;
    }
	return true;
}

Actions.prototype.scan = function(unit,data){
	//get all units in radius
	var radius = Math.floor(1+unit.intelligence.value/4);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
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


Actions.prototype.aim = function(unit,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.dexterity.nMod += 2;
			nodes[i].unit.dexterity.set(true);
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'Dexterity +2'));
		}
	}
	return true;
}
Actions.prototype.center = function(unit,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.willpower.nMod += 2;
			nodes[i].unit.willpower.set(true);
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'Willpower +2'));
		}
	}
	return true;
}

Actions.prototype.dictate = function(unit,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.intelligence.nMod += 2;
			nodes[i].unit.intelligence.set(true);
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'Intelligence +2'));
		}
	}
	return true;
}

Actions.prototype.grenade = function(unit,data){
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
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}

Actions.prototype.flareGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'heat';
	data.txt = 'Flare Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.cryoGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'cold';
	data.txt = 'Cryo Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.shockGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'elec';
	data.txt = 'Shock Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.bioGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'viral';
	data.txt = 'Bio Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.toxicGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'pois';
	data.txt = 'Toxic Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.empGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'puls';
	data.txt = 'EMP Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.unstableGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'radi';
	data.txt = 'Unstable Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.voidGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'grav';
	data.txt = 'Void Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}
Actions.prototype.corrosiveGrenade = function(unit,data){
	Actions = require('./actions.js').Actions
	data.dmgType = 'acid';
	data.txt = 'Corrosive Grenade';
	data.dmg = 15;
	return Actions.grenade(unit,data);
}

Actions.prototype.resUp = function(unit,data){
	var Buff = require('./buff.js').Buff;
	//get all units in radius;
	var radius = Math.floor(2);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			var percent = unit.willpower.value*4;
			var buffData = unit.owner.session.engine.buffs["buff_resistUp"];
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
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'All res +' + percent + '%'));
		}
	}
	return true;
}

Actions.prototype.repair = function(unit,data){
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var u = node.unit;
	if (u.human){
		return false;
	}
	if (!u){return false;}
	value = Math.round(u.maximumHealth.value * ((25+unit.dexterity.value*2)/100));
	u.damage.damage({
		damageType: 'heal',
		value: value,
		actionData: data[Enums.ACTIONDATA],
		source: unit,
		attackType: 'aoe'
	});
	return true;
}

Actions.prototype.bolster = function(unit,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.endurance.nMod += 2;
			nodes[i].unit.endurance.set(true);
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'Endurance +2'));
		}
	}
	return true;
}
Actions.prototype.battlecry = function(unit,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.strength.nMod += 2;
			nodes[i].unit.strength.set(true);
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'Strength +2'));
		}
	}
	return true;
}

Actions.prototype.instruct = function(unit,data){
	var val = Math.ceil(unit.skill.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	data.target.skill.nMod += val;
	data.target.skill.set(true);
	data[Enums.ACTIONDATA].push(ClientActions.damageText(data.target.id,'Skill +' + val));
	return true;
}

Actions.prototype.shout = function(unit,data){
	var val = Math.ceil(unit.power.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	data.target.power.nMod += val;
	data.target.power.set(true);
	data[Enums.ACTIONDATA].push(ClientActions.damageText(data.target.id,'Power +' + val));
	return true;
}

Actions.prototype.focus = function(unit,data){
	var val = Math.ceil(unit.tactics.value*(unit.willpower.value/100)) + unit.willpower.value*2;
	data.target.tactics.nMod += val;
	data.target.tactics.set(true);
	data[Enums.ACTIONDATA].push(ClientActions.damageText(data.target.id,'Tactics +' + val));
	return true;
}
Actions.prototype.energize = function(unit,data){
	let value = Math.round(Math.min(unit.currentEnergy,unit.maximumEnergy.value*(unit.endurance.value*4)/100));
	unit.currentEnergy -= value;
	data.target.currentEnergy += value;
	if (data.target.currentEnergy > data.target.maximumEnergy){
		data.target.currentEnergy = data.target.maximumEnergy;
	}
	data[Enums.ACTIONDATA].push(ClientActions.setEnergy(unit.id,unit.currentEnergy));
	data[Enums.ACTIONDATA].push(ClientActions.setEnergy(data.target.id,data.target.currentEnergy));
	return true;
}
Actions.prototype.rest = function(unit,data){
	let envalue = Math.round((5+unit.willpower.value/2)*(1+unit.tactics.value/100));
	let hvalue = Math.round((15+unit.endurance.value)*(1+unit.tactics.value/100));
	unit.currentEnergy += envalue;
	if (unit.currentEnergy > unit.maximumEnergy.value){
		unit.currentEnergy = unit.maximumEnergy.value;
	}
	unit.damage({
		damageType: 'heal',
		value: hvalue,
		actionData: data[Enums.ACTIONDATA],
		source: unit,
		attackType: 'ability'
	});
	data[Enums.ACTIONDATA].push(ClientActions.setEnergy(unit.id,unit.currentEnergy));
	return true;
}

Actions.prototype.powerShot = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'gun'){
    	return false;
    }
    data.ablMod = 1+(25+Math.floor(unit.strength.value*2))/100;
    data = unit.owner.session.executeAttack(data);
    if (!data){return false;}
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Power Shot',data.d.newDir));
	return true;
}

Actions.prototype.powerAttack = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
    data.ablMod = 1+(25+Math.floor(unit.dexterity.value*2))/100;
    data = unit.owner.session.executeAttack(data);
    if (!data){return false;}
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Power Attack',data.d.newDir));
	return true;
}

Actions.prototype.reversal = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
    data.ablMod = 1+(25+Math.floor(unit.dexterity.value*2))/100;
    data = unit.owner.session.executeAttack(data);
    if (!data){return false;}
    var unitCurrentNode = {q:unit.currentNode.q,r:unit.currentNode.r};
    var targetCurrentNode = {q:data.target.currentNode.q,r:data.target.currentNode.r};
    unit.newNode(unit.owner.session.map.axialMap[targetCurrentNode.q][targetCurrentNode.r]);
    data.target.newNode(unit.owner.session.map.axialMap[unitCurrentNode.q][unitCurrentNode.r]);
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Reversal',data.d.newDir));
    data[Enums.ACTIONDATA].push(ClientActions.reversal(
    	data.unit.id,
    	unit.engine.createClientData(Enums.Q, unit.currentNode.q, Enums.R, unit.currentNode.r),
    	data.target.id,
    	unit.engine.createClientData(Enums.Q, data.target.currentNode.q, Enums.R, data.target.currentNode.r)
    ));
	return true;
}

Actions.prototype.slam = function(unit,data){
	if (typeof data.target == 'undefined'){
		return false;
	}
    var dir = unit.owner.session.map.getNewDirectionAxial(data.target.currentNode,unit.currentNode);
    var m = Math.floor(1+unit.strength.value/5);
    for (var i = 0; i < m;i++){
    	//get node
    	var newNode = unit.owner.session.map.getAxialNeighbor(data.target.currentNode,dir);
    	while(newNode.deleted){
    		i+=1;
    		if (i >= m){
    			//can't hit onto a deleted node
    			return true;
    		}
    		newNode = unit.owner.session.map.getAxialNeighbor(newNode,dir);
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
    		data.target.damage({
				damageType: 'physical',
				value: dmg,
				actionData: data[Enums.ACTIONDATA],
				source: unit,
				attackType: 'ability'
			});
    		newNode.unit.damage({
				damageType: 'physical',
				value: dmg,
				actionData: data[Enums.ACTIONDATA],
				source: unit,
				attackType: 'ability'
			});
    		return true;
    	}
    	if (newNode.h-data.target.currentNode.h >= data.target.height){
    		//slam into the wall and take damage, then end
    		var dmg = Math.round(30*(1+unit.tactics.value/50));
    		data.target.damage({
				damageType: 'physical',
				value: dmg,
				actionData: data[Enums.ACTIONDATA],
				source: unit,
				attackType: 'ability'
			});
    		return true;
    	}else{
    		//move the target to the new node
    		data.target.newNode(newNode);
    		data[Enums.ACTIONDATA].push(ClientActions.slam(data.target.id,x,y,z));
    	}
    }
	return true;
}

Actions.prototype.heroicCharge = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
	data.unit = unit;
    var player = data.unit.owner.id;
    var endingNode = unit.owner.session.map.getCube(data);
    data.path = unit.owner.session.map.findPath(unit.owner.session.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:unit.jump.value});
    if (data.path.length > (unit.move.value + Math.floor(unit.agility.value/3)+1) || data.path.length <=2){
    	console.log("invalid Path on heroic charge...");
    	console.log(data.path);
    	return false;
    }
    data.isAMove = false;
    data = unit.owner.session.executeMove(data);
    data.ablMod = 1+(15+Math.floor(unit.charisma.value))/100;
    //get all within weapon range
    var nodes = weapon.getWeaponNodes(unit.owner.session.map,unit.currentNode);
    for (var i = 0; i < nodes.length;i++){
    	if (nodes[i].unit){
    		if (nodes[i].unit.owner != unit.owner){
    			data.q = nodes[i].q;
    			data.r = nodes[i].r;
    			data = unit.owner.session.executeAttack(data);
    		}
    	}
    }
    if (!data){return false;}
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Heroic Charge',data.d.newDir));
	return true;
}

Actions.prototype.heroicLeap = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
	data.unit = unit;
    var player = data.unit.owner.id;
    var endingNode = unit.owner.session.map.getCube(data);
    data.path = unit.owner.session.map.findPath(unit.owner.session.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:(unit.jump.value + Math.floor(unit.strength.value/2))});
    if (data.path.length != 2 || data.path[data.path.length-1].h - unit.currentNode.h < 3){
    	console.log("invalid Path on heroic leap...");
    	console.log('height 1: ' + unit.currentNode.h);
    	console.log("height 2: " + data.path[data.path.length-1].h);
    	console.log(data.path);
    	return false;
    }
    data.isAMove = false;
    data = unit.owner.session.executeMove(data);
    data.ablMod = 1+(15+Math.floor(unit.charisma.value))/100;
    //get all within weapon range
    //should check unit first?
    var nodes = weapon.getWeaponNodes(unit.owner.session.map,unit.currentNode);
    for (var i = 0; i < nodes.length;i++){
    	if (nodes[i].unit){
    		if (nodes[i].unit.owner != unit.owner){
    			data.q = nodes[i].q;
    			data.r = nodes[i].r;
    			data = unit.owner.session.executeAttack(data);
    		}
    	}
    }
    if (!data){return false;}
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Heroic Leap',data.d.newDir));
	return true;
}

Actions.prototype.firstAid = function(unit,data){
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var u = node.unit;
	if (!u){return false;}
	value = Math.round(u.maximumHealth.value * ((25+unit.charisma.value*2)/100));

	if (u.synthetic.value > 0){
		value = Math.floor(value -(value*u.synthetic.value));
	}
	u.damage({
		damageType: 'heal',
		value: value,
		actionData: data[Enums.ACTIONDATA],
		source: unit,
		attackType: 'ability'
	});
	return true;
}

Actions.prototype.resuscitate = function(unit,data){
	var Buff = require('./buff.js').Buff;
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var u = node.unit;
	if (!u){return false;}
	if (u.fainted){
		u.fainted = false;
		u.currentHealth = 1;
		u.damage({
			damageType: 'heal',
			value: 0,
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'ability'
		});
	}else{
		return false;
	}
	u.charge = 0;
	data[Enums.ACTIONDATA].pop();
	var speedVal = u.speed.value*((200+unit.agility.value*10+unit.dexterity.value*10)/100);
	var buffData = unit.owner.session.engine.buffs["buff_resuscitate"];
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
	data[Enums.ACTIONDATA].push(ClientActions.damageText(u.id,'Revived',u.currentShields,u.currentHealth,u.fainted,'heal',u.dead));
	return true;
}

Actions.prototype.healingField = function(unit,data){
    var node = unit.owner.session.map.axialMap[data.q][data.r];
    if (node.unit){
    	return false;
    }
    var hField = new Unit();
    hField.init({
	    name: 'Healing Field Bot',
	    sex: 'none',
	    owner: unit.owner,
	    engine: unit.engine,
	    id: unit.owner.session.getId(),
	    synthetic: 1.0,
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
    hField.classInfo.setUnit(unit);
    hField.classInfo.setBaseClass('');
    hField.classInfo.setClass('');
    hField.classInfo.init({unit: unit});
    hField.setCurrentNode(node);
    hField.direction = 'North'
    unit.owner.session.allUnits[hField.id] = hField;
    unit.owner.session.queueData(Enums.ADDUNIT,unit.engine.createClientData(Enums.UNITINFO, hField.getLessClientData()));

    unit.owner.identifiedUnits[hField.id] = true;
	unit.owner.session.queuePlayer(unit.owner,Enums.UPDATEUNITINFO,unit.engine.createClientData(
        Enums.UNITID, hField.id,
        Enums.UNITINFO, hField.getClientData()
	));
	return true;
}

Actions.prototype.sprint = function(unit,data){
	data.unit = unit;
    var endingNode = unit.owner.session.map.getCube(data);
    data.path = unit.owner.session.map.findPath(unit.owner.session.map.getCube(unit.currentNode),endingNode,{startingUnit: unit,maxJump:unit.jump.value});
    if (data.path[data.path.length-1] > Math.floor(unit.agility.value/2)){
    	console.log("invalid Path on sprint...");
    	console.log('height 1: ' + unit.currentNode.h);
    	console.log("height 2: " + data.path[data.path.length-1].h);
    	console.log(data.path);
    	return false;
    }
    data.isAMove = false;
    data = unit.owner.session.executeMove(data);
	return true;
}

Actions.prototype.influence = function(unit,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = unit.owner.session.map.axialMap[data.q][data.r];
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		if (nodes[i].unit && nodes[i].unit.owner == unit.owner){
			nodes[i].unit.charisma.nMod += 2;
			nodes[i].unit.charisma.set(true);
			data[Enums.ACTIONDATA].push(ClientActions.damageText(nodes[i].unit.id,'Charisma +2'));
		}
	}
	return true;
}

Actions.prototype.precisionStrike = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'weapon'){
    	return false;
    }
    data = unit.owner.session.executeAttack(data);
    if (!data){return false;}
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Precision Strike',data.d.newDir));
    data.node.unit.healMod.nMod -= unit.strength.value*2;
    if (data.node.unit.healMod.value < -100){
    	data.node.unit.healMod.value = -100;
    }
    data[Enums.ACTIONDATA].push(ClientActions.damageText(data.node.unit.id,'Healing -' + unit.strength.value*2 + '%'));
    data.node.unit.healMod.set();
	return true;
}

Actions.prototype.cripple = function(unit,data){
    var weapon = unit.getWeapon();
    if (weapon.type != 'gun'){
    	return false;
    }
    data = unit.owner.session.executeAttack(data);
    if (!data){return false;}
    data.node.unit.setMoveLeft(data.node.unit.moveLeft - Math.floor(1+unit.dexterity.value/5));
    data[Enums.ACTIONDATA].splice(0,0,ClientActions.attack(data.unit.id,'Cripple',data.d.newDir));
    data[Enums.ACTIONDATA].push(ClientActions.damageText(data.node.unit.id,'Move -' + Math.floor(1+unit.dexterity.value/5)));
	return true;
}

Actions.prototype.shieldBoost = function(unit,data){
	var Buff = require('./buff.js').Buff;
	if (typeof data.target == 'undefined'){
		return false;
	}
	var current = data.target.maximumShields.value;
	var percent = (20+unit.willpower.value*5);
	var buffData = unit.owner.session.engine.buffs["buff_shieldBoost"];
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
    data[Enums.ACTIONDATA].push(ClientActions.damageText(data.target.id,'Shields +' + percent + '%',data.target.currentShields));
	return true;
}

Actions.prototype.concentrate = function(unit,data){
	var Buff = require('./buff.js').Buff;

	var percent = (125+unit.willpower.value*10);
	var buffData = unit.owner.session.engine.buffs["buff_concentrate"];
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
    data[Enums.ACTIONDATA].push(ClientActions.damageText(data.unit.id,'Casting speed +' + percent + '%'));
	return true;
}
Actions.prototype.gunner = function(unit,abl){
    if (abl.reverse){
    	let eff = unit.getEffectInArray('gunnerEffect');
    	unit.maximumHealth.pMod -= eff['hpval'];
    	unit.speed.pMod -= eff['spval'];;
    	unit.removeFromEffectArray(unit.onInventoryChange,'gunnerEffect');
    }else{
    	let effect = {};
    	let spval = 0;
    	let hpval = 0;
    	if (!unit.inventory.hasWeapon()){
    		spval = 0.1;
    		hpval = 0.1;
    	}
    	effect['name'] = 'gunnerEffect';
    	effect['spval'] = spval;
    	effect['hpval'] = hpval;
    	unit.maximumHealth.pMod += hpval;
    	unit.speed.pMod += spval;
    	unit.addToEffectArray(unit.onInventoryChange,effect);
    }
	unit.speed.set(true);
	unit.maximumHealth.set(true);
	return true;
}
Actions.prototype.expertSighting = function(unit,abl){
    if (abl.reverse){
    	unit.ignoreLOSBlock = false;
    }else{
    	unit.ignoreLOSBlock = true;
    }
	return true;
}
Actions.prototype.preparedShot = function(unit,data){
	var Buff = require('./buff.js').Buff;
	//add prepared shot buff
	unit.addBuff("buff_preparedShot");
	unit.setMoveLeft(0);
	return true;
}


Actions.prototype.fireBreath = function(unit,data){

    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'heat';
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}

Actions.prototype.iceShards = function(unit,data){

    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'cold';
	console.log('len:' + nodes.length)
	for (var i = 0; i < nodes.length;i++){
		console.log('damaging??')
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'ability'
		});
	}
	return true;
}
Actions.prototype.detonate = function(unit,data){
	if (typeof data.dmgType == 'undefined'){
		data.dmgType = 'expl';
	}
	if (typeof data.txt == 'undefined'){
		data.txt = 'Detonate';
	}if (typeof data.dmg == 'undefined'){
		data.dmg = 25 + unit.willpower.value;
	}
	var radius = Math.floor(2+unit.intelligence.value/6);
	var node = unit.currentNode;
	var nodes = unit.owner.session.map.getUnitsInRadius(node,radius);
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}

Actions.prototype.thunderCross = function(unit,data){

    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'elec';
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}

Actions.prototype.viralCloud = function(unit,data){

    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'viral';
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}
Actions.prototype.empoison = function(unit,data){

	let node = unit.owner.session.map.axialMap[data.q][data.r];
	data.dmg = 30 + unit.willpower.value;
	data.dmgType = 'poison';
	if (node.unit){
		data[Enums.ACTIONDATA] = node.unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'ability'
		});
	}
	return true;
}

Actions.prototype.energyBlast = function(unit,data){

    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'pulse';
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}

Actions.prototype.gammaTendrils = function(unit,data){

    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'radi';
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}

Actions.prototype.voidScream = function(unit,data){

    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'grav';
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
	return true;
}

Actions.prototype.acidSpit = function(unit,data){
    let n = Utils.getRadiusN(unit,data.ability.radius);
    let type = Utils.getRadiusType(data.ability.radius);
	let node = unit.owner.session.map.axialMap[data.q][data.r];
	let nodes = unit.owner.session.map.getNodesInRadius(unit.currentNode,node,n,type);
	data.dmg = 25 + unit.willpower.value;
	data.dmgType = 'acid';
	for (var i = 0; i < nodes.length;i++){
		data[Enums.ACTIONDATA] = nodes[i].unit.damage({
			damageType: data.dmgType,
			value: Math.round(data.dmg+(data.dmg*unit.tactics.value/100)),
			actionData: data[Enums.ACTIONDATA],
			source: unit,
			attackType: 'aoe'
		});
	}
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
		case AbilityEnums.Battlecry:
			return this.battlecry;
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
		//medic abilities
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
		case AbilityEnums.Dictate:
			return this.dictate;
			break;
		//marksman abilities
		case AbilityEnums.PreparedShot:
			return this.preparedShot;
			break;
		case AbilityEnums.Scan:
			return this.scan;
			break;
		case AbilityEnums.Aim:
			return this.aim;
			break;
		case AbilityEnums.Gunner:
			return this.gunner;
			break;
		case AbilityEnums.ExpertSighting:
			return this.expertSighting;
			break;
		//commando abilities
		case AbilityEnums.Instruct:
			return this.instruct;
			break;
		case AbilityEnums.Focus:
			return this.focus;
			break;
		case AbilityEnums.Energize:
			return this.energize;
			break;
		case AbilityEnums.Bolster:
			return this.bolster;
			break;
		case AbilityEnums.Rest:
			return this.rest;
			break;
		case AbilityEnums.Shout:
			return this.shout;
			break;
		//splicer abilities
		case AbilityEnums.Center:
			return this.center;
			break;
		case AbilityEnums.FireBreath:
			return this.fireBreath;
			break;
		case AbilityEnums.IceShards:
			return this.iceShards;
			break;
		case AbilityEnums.Detonate:
			return this.detonate;
			break;
		case AbilityEnums.ThunderCross:
			return this.thunderCross;
			break;
		case AbilityEnums.ViralCloud:
			return this.viralCloud;
			break;
		case AbilityEnums.Empoison:
			return this.empoison;
			break;
		case AbilityEnums.EnergyBlast:
			return this.energyBlast;
			break;
		case AbilityEnums.GammaTendrils:
			return this.gammaTendrils;
			break;
		case AbilityEnums.VoidScream:
			return this.voidScream;
			break;
		case AbilityEnums.AcidSpit:
			return this.acidSpit;
			break;

		default:
			return this.testAbility;
			break;
	}
}

exports.Actions = new Actions();
