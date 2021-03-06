
var	ENUMS = require('./enums.js').Enums;

var ClassInfo = function(){
	this.unit = null; //the unit which owns this classInfo
	this.engine = null;
	this.currentClass = null;
	this.baseClass = null;
	this.baseid = null;
	this.classid = null;
	this.allClassAbilities = null;

	this.learnedAbilities = null;
	this.equippedAbilities = null;
	this.ap = null;
	this.totalAPValues = null;
}

ClassInfo.prototype.init = function(data){
	this.unit = data.unit;
	this.engine = this.unit.engine;
	if (typeof data.learned != 'undefined'){
		this.learnedAbilities = data.learned;
	}else{
		this.learnedAbilities = {};
	}
	if (typeof data.equipped != 'undefined'){
		this.equippedAbilities = data.equipped;
		//cehck for passives and reactions
	}else{
		this.equippedAbilities = {};
	}
	if (typeof data.allClassAbilities != 'undefined'){
		this.allClassAbilities = data.allClassAbilities;
	}else{
		this.allClassAbilities = {};
	}
	if (typeof data.ap != 'undefined'){
		this.ap = data.ap;
	}else{
		this.ap = {};
	}
	if (typeof data.totalAPValues != 'undefined'){
		this.totalAPValues = data.totalAPValues;
	}else{
		this.totalAPValues = {};
	}
}
ClassInfo.prototype.getClientData = function(){
	cData = {};
	cData[ENUMS.CURRENTCLASS] = this.currentClass;
	cData[ENUMS.BASECLASS] = this.baseClass;
	cData[ENUMS.BASEID] = this.baseid;
	cData[ENUMS.CLASSID] = this.classid;
	cData[ENUMS.AP] = this.ap;
	cData[ENUMS.TOTALAPVALUES] = this.totalAPValues;

	cData[ENUMS.LEARNEDABILITIES] = {};
	for (var i in this.learnedAbilities){
		cData[ENUMS.LEARNEDABILITIES][i] = true;
	}
	cData[ENUMS.EQUIPPEDABILITIES] = {};
	for (var i in this.equippedAbilities){
		cData[ENUMS.EQUIPPEDABILITIES][i] = true;
	}
	cData[ENUMS.ALLCLASSABILITIES] = {};
	for (var i in this.allClassAbilities){
		cData[ENUMS.ALLCLASSABILITIES][i] = [];
		for (var j = 0; j < this.engine.classes[i]['abilities'].length;j++){
			var ability = this.engine.abilities[this.engine.classes[i]['abilities'][j]['id']];
			cData[ENUMS.ALLCLASSABILITIES][i].push(ability.cData);
		}
	}
	return cData;
}
ClassInfo.prototype.getDBObj = function(){
	dbObj = {};
	dbObj['currentClass'] = this.currentClass;
	dbObj['baseClass'] = this.baseClass;
	dbObj['baseid'] = this.baseid;
	dbObj['classid'] = this.classid;
	dbObj['learnedAbilities'] = this.learnedAbilities;
	dbObj['equippedAbilities'] = this.equippedAbilities;
	dbObj['ap'] = this.ap;
	dbObj['totalAPValues'] = this.totalAPValues;
	return dbObj;
}
ClassInfo.prototype.setClass = function(c){
	try{
		//TODO reduce attributes from old class?
		
		var charClass = this.unit.owner.engine.classes[c]
		this.classid = c;
		this.currentClass = charClass.classid;
		//TODO this should be enums
		for (var stat in charClass.attributes){
			this.unit[stat].base += charClass.attributes[stat];
			this.unit[stat].set();
		}
		/*if (typeof this.ap[charClass.classid] == 'undefined'){
			this.ap[charClass.classid] = 100;
			this.totalAPValues[charClass.classid] = 100;
		}*/
			this.ap[charClass.classid] = 500;
			this.totalAPValues[charClass.classid] = 500;
		if (typeof this.allClassAbilities[charClass.classid] == 'undefined'){
			//changed to a new class, set abilities
			this.allClassAbilities[charClass.classid] = {
				ablArray: charClass.abilities
			}
		}

		//TODO send new class info to the client
	}catch(e){
		console.log("ERROR: unable to set class");
		console.log(e.stack);
	}
	this.unit.setAbilitySlots();
}

ClassInfo.prototype.setBaseClass = function(c){
	try{
		var charClass = this.unit.owner.engine.classes[c];
		this.baseClass = charClass.classid;
		this.baseid = c;
		this.allClassAbilities[charClass.classid] = charClass.abilities;
		for (var stat in charClass.baseAttr){
			this.unit[stat].nMod += charClass.baseAttr[stat];
			this.unit[stat].set();
		}
		if (typeof this.ap[charClass.classid] == 'undefined'){
			this.ap[charClass.classid] = 100;
			this.totalAPValues[charClass.classid] = 100;
		}
	}catch(e){
		console.log("ERROR: unable to set base class");
		console.log(e.stack);
	}
}

exports.ClassInfo = ClassInfo;