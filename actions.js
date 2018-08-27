//actions.js
var Buff = require('./buff.js').Buff;

ActionEnums = {
	AlterStat: 'alterStat',
	AlterStatPercent: 'alterStatPercent',
	Hide: 'hide'
};

AbilityEnums = {
	TestAbility: 'testAbility',
	Stealth: 'stealth'
};

var Actions = function(){}

//-----------------------------------------------------------------------------------------------|
//                                   Item On-Equip Functions                                     |
//-----------------------------------------------------------------------------------------------|

Actions.prototype.alterStat = function(unit,data){
	if (data.reverse){
		unit.modStat(data.stat,data.value*-1);
	}else{
		unit.modStat(data.stat,data.value);
	}
}

Actions.prototype.alterStatPercent = function(unit,data){
	if (data.reverse){
		unit.modStatPercent(data.stat,data.value*-1);
	}else{
		unit.modStatPercent(data.stat,data.value);
	}
}

//-----------------------------------------------------------------------------------------------|
//                                     Unit Buff Functions                                       |
//-----------------------------------------------------------------------------------------------|


Actions.prototype.getAction = function(a){
	switch(a){
		case ActionEnums.AlterStat:
			return this.alterStat;
			break;
		case ActionEnums.AlterStatPercent:
			return this.alterStatPercent;
			break;
		case ActionEnums.Hide:
			return this.hide;
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
	var buffData = session.engine.buffs["buff_stealth"];

	var buff = new Buff(buffData);
	buff.actionsOnImmediate.push({
        "action": "alterStatePercent",
        "stat": "speed"
        "value": -(50-unit.agility*2)/100
	});
	buff.actionsOnEnd.push({
        "action": "alterStatePercent",
        "stat": "speed"
        "value": (50-unit.agility*2)/100
	});
	buff.init({
	    player: unit, //the buff will perform actions on this object
	    id: session.engine.getId();
	})
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
		default:
			return this.testAbility;
			break;
	}
}

exports.Actions = new Actions();
