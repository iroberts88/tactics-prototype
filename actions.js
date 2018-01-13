//actions.js

ActionEnums = {
	AlterStat: 'alterStat'
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

Actions.prototype.getAction = function(a){
	switch(a){
		case ActionEnums.AlterStat:
			return this.alterStat;
			break;
	}
}

exports.Actions = new Actions();
