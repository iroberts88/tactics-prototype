//actions.js
var Buff = require('./buff.js').Buff;

ActionEnums = {
	AlterStat: 'alterStat',
	AlterStatPercent: 'alterStatPercent',
	SetHidden: 'setHidden'
};

AbilityEnums = {
	TestAbility: 'testAbility',
	Stealth: 'stealth',
	Flare: 'flare'
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
}

Actions.prototype.alterStatPercent = function(unit,data){
	console.log(data.value);
	if (data.reverse){
		unit.modStatPercent(data.stat,data.value*-1);
	}else{
		unit.modStatPercent(data.stat,data.value);
	}
}

Actions.prototype.setHidden= function(unit,data){
	if (data.reverse){
		if (unit.hidden){
			unit.hidden = false;
			unit.owner.gameSession.queueData('action',{
		        actionData: [{
		        	action: 'hide',
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
		        action: 'hide',
		        unitid: unit.id
		    }]
    	});
	}
}

Actions.prototype.getAction = function(a){
	switch(a){
		case ActionEnums.AlterStat:
			return this.alterStat;
			break;
		case ActionEnums.AlterStatPercent:
			return this.alterStatPercent;
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
	console.log('stealth');
	//set the unit as stealthed and reduce speed
	var buffData = session.gameEngine.buffs["buff_stealth"];

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
	buff.init({
	    unit: unit, //the buff will perform actions on this object
	    id: session.gameEngine.getId()
	})
	data.actionData.push({
		unitid: unit.id,
        action: 'actionBubble',
        text: 'Stealth'
	})
}

Actions.prototype.flare = function(unit,session,data){
	console.log('flare');
	//get all units in radius;
	var radius = Math.floor(1+unit.intelligence.value/3);
	var node = session.map.axialMap[data.q][data.r];
	var nodes = session.map.getUnitsInRadius(node,radius);
	data.actionData.push({
		unitid: unit.id,
        action: 'actionBubble',
        text: 'Flare'
	});
	for (var i = 0; i < nodes.length;i++){
		//reveal and set new direction
		var nextUnit = nodes[i].unit;
		var d = session.map.getDMod(nextUnit.currentNode,node);
		nextUnit.direction = d.newDir;
		data.actionData.push({
	        action: 'face',
	        unitid: nextUnit.id,
	        direction: d.newDir
    	});
    	if (nextUnit.hidden){
			nextUnit.hidden = false;
	    	data.actionData.push({
		        action: 'reveal',
		        unitid: nextUnit.id,
		        direction: d.newDir,
		        q: nextUnit.currentNode.q,
		        r: nextUnit.currentNode.r
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
		case AbilityEnums.Stealth:
			return this.stealth;
			break;
		case AbilityEnums.Flare:
			return this.flare;
			break;
		default:
			return this.testAbility;
			break;
	}
}

exports.Actions = new Actions();
