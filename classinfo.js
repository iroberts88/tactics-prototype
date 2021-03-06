

var ClassInfo = function(){
	this.unit = null; //the unit which owns this classInfo

	this.currentClass = null;
	this.baseClass = null;
	this.baseId = null;
	this.classId = null;
	this.allClassAbilities = null;

	this.learnedAbilities = null;
	this.equippedAbilities = null;
	this.ap = null;
}

ClassInfo.prototype.init = function(data){
	this.unit = data.unit;
	if (typeof data.learned != 'undefined'){
		this.learnedAbilities = data.learned;
	}else{
		this.learnedAbilities = {};
	}
	if (typeof data.equipped != 'undefined'){
		this.equippedAbilities = data.equipped;
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
	dbObj.baseId = this.baseId;
	dbObj.classId = this.classId;
	dbObj.learnedAbilities = this.learnedAbilities;
	dbObj.equippedAbilities = this.equippedAbilities;
	dbObj.ap = this.ap;
	return dbObj;
}
ClassInfo.prototype.setClass = function(c){
	try{
		//TODO reduce attributes from old class?

		var charClass = this.unit.owner.gameEngine.classes[c]
		this.classId = c;
		this.currentClass = charClass.classid;
		for (var stat in charClass.attributes){
			this.unit[stat].nMod += charClass.attributes[stat];
			this.unit[stat].set();
		}
		if (typeof this.ap[charClass.classid] == 'undefined'){
			this.ap[charClass.classid] = 100;
		}
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
		var charClass = this.unit.owner.gameEngine.classes[c];
		this.baseClass = charClass.classid;
		this.baseId = c;
		this.allClassAbilities[charClass.classid] = charClass.abilities;
		for (var stat in charClass.baseAttr){
			this.unit[stat].nMod += charClass.baseAttr[stat];
			this.unit[stat].set();
		}
		if (typeof this.ap[charClass.classid] == 'undefined'){
			this.ap[charClass.classid] = 100;
		}
	}catch(e){
		console.log("ERROR: unable to set base class");
		console.log(e.stack);
	}
}

exports.ClassInfo = ClassInfo;