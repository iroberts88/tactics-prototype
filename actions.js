//actions.js
var Buff = require('./buff.js').Buff;

ActionEnums = {
	AlterStat: 'alterStat',
	AlterStatPercent: 'alterStatPercent',
	AlterCurrentEnergy: 'alterCurrentEnergy',
	SetHidden: 'setHidden'
};

AbilityEnums = {
	TestAbility: 'testAbility',
	Stealth: 'stealth',
	Flare: 'flare',
	QuickAttack: 'quickAttack',
	Agitate: 'agitate',
	Cheer: 'cheer'
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
	console.log(data);
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
		case ActionEnums.SetHidden:
			return this.setHidden;
			break;
	}
}


//-----------------------------------------------------------------------------------------------|
//                                    Unit Ability Functions                                     |
//-----------------------------------------------------------------------------------------------|

Actions.prototype.testAbility = function(unit,session,data){
	console.log('test ability!!!');
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
	    unit: unit, //the buff will perform actions on this object
	    id: session.gameEngine.getId()
	})
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Stealth'
	})
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
		nextUnit.direction = d.newDir;
		data.actionData.push({
	        action: session.clientActionEnums.Face,
	        unitid: nextUnit.id,
	        direction: d.newDir
    	});
    	if (nextUnit.hidden){
			nextUnit.hidden = false;
	    	data.actionData.push({
		        action: session.clientActionEnums.Reveal,
		        unitid: nextUnit.id,
		        direction: d.newDir,
		        q: nextUnit.currentNode.q,
		        r: nextUnit.currentNode.r
	    	});
	    }
	}
}
Actions.prototype.quickAttack = function(unit,session,data){
    data = session.executeAttack(data);
    if (!data){return;}
    data.actionData.push({
        action: session.clientActionEnums.Attack,
        unitid: data.unit.id,
        weapon: 'Quick Attack',
        newDir: data.d.newDir,
        unitInfo: [
            {
                target: data.node.unit.id,
                newHealth: data.node.unit.currentHealth,
                newShields: data.node.unit.currentShields,
                fainted: data.node.unit.fainted,
                dead: data.node.unit.dead
            }
        ]
    });
    unit.charge += session.chargeMax*(0.3+Math.round(unit.agility.value*1.5)/100);
}
Actions.prototype.agitate = function(unit,session,data){
	var node = session.map.axialMap[data.q][data.r];
	var u = node.unit;
	data.actionData.push({
		unitid: unit.id,
        action: session.clientActionEnums.ActionBubble,
        text: 'Agitate'
	});
	if (!u){return;}
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
}
Actions.prototype.cheer = function(unit,session,data){
	//get all units in radius;
	var radius = Math.floor(unit.charisma.value/5);
	var node = session.map.axialMap[data.q][data.r];
	console.log(radius);
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
		case AbilityEnums.Stealth:
			return this.stealth;
			break;
		default:
			return this.testAbility;
			break;
	}
}

exports.Actions = new Actions();
