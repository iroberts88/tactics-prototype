//unitai.js
var Buff = require('./buff.js').Buff,
	Actions = require('./actions.js').Actions;

aiEnums = {
	SimpleAction: 'simpleAction'
};

var UnitAI = function(){}

//-----------------------------------------------------------------------------------------------|
//                                      Item/Buff Functions                                      |
//-----------------------------------------------------------------------------------------------|

UnitAI.prototype.simpleAction = function(unit,session,data,actionData){
    var aFunc = Actions.getAction(data.action);
    data.actionData = actionData;
    aFunc(unit,data);
	return data.actionData;
}

UnitAI.prototype.getAction = function(a){
	switch(a){
		case aiEnums.SimpleAction:
			return this.simpleAction;
			break;
	}
}

exports.UnitAI = new UnitAI();
