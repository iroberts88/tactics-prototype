

var ClassInfo = function(){
	this.unit = null; //the unit which owns this classInfo

	this.currentClass = null;
	this.baseClass = null;

	this.allClassAbilities = null;

	this.learnedAbilities = null;
	this.equippedAbilities = null;
	this.ap = null;
}

ClassInfo.prototype.init = function(data){
	this.unit = data.unit;
	if (typeof data.learnedAbilities != 'undefined'){
		this.learnedAbilities = data.learnedAbilities;
	}else{
		this.learnedAbilities = {};
	}
	if (typeof data.equippedAbilities != 'undefined'){
		this.equippedAbilities = data.equippedAbilities;
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
}
ClassInfo.prototype.getDBObj = function(){
	dbObj = {};
	dbObj.currentClass = this.currentClass;
	dbObj.baseClass = this.baseClass;

	dbObj.allClassAbilities = this.allClassAbilities;

	dbObj.learnedAbilities = this.learnedAbilities;
	dbObj.equippedAbilities = this.equippedAbilities;
	dbObj.ap = this.ap;
	return dbObj;
}
ClassInfo.prototype.setClass = function(c){
	try{
		//TODO reduce attributes from old class?

		var charClass = this.unit.owner.gameEngine.classes[c]
		this.currentClass = charClass.name;
		for (var stat in charClass.attributes){
			this.unit[stat].nMod += charClass.attributes[stat];
			this.unit[stat].set();
		}
		if (typeof this.ap[charClass.name] == 'undefined'){
			this.ap[charClass.name] = 100;
		}
		if (typeof this.allClassAbilities[charClass.name] == 'undefined'){
			//changed to a new class, set abilities
			this.allClassAbilities[charClass.name] = {
				ablArray: charClass.abilities
			}
		}

		//TODO send new class info to the client
	}catch(e){
		console.log("ERROR: unable to set class");
		console.log(e.stack);
	}
}

ClassInfo.prototype.setBaseClass = function(c){
	try{
		var charClass = this.unit.owner.gameEngine.classes[c];
		this.baseClass = charClass.name;
		this.allClassAbilities[charClass.name] = charClass.abilities;
		for (var stat in charClass.baseAttr){
			this.unit[stat].base += charClass.baseAttr[stat];
			this.unit[stat].set();
		}
		if (typeof this.ap[charClass.name] == 'undefined'){
			this.ap[charClass.name] = 100;
		}
	}catch(e){
		console.log("ERROR: unable to set base class");
		console.log(e.stack);
	}
}

exports.ClassInfo = ClassInfo;