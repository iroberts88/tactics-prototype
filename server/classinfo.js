

var ClassInfo = function(){
	this.unit = null; //the unit which owns this classInfo
	this.currentClass = null;
	this.classAbilities = null;
	this.learnedAbilities = null;

	this.baseClass = null;
	this.baseClassAbilities = null;

	this.ap = null;
}

ClassInfo.prototype.init = function(data){
	this.unit = data.unit;
	if (typeof data.learnedAbilities != 'undefined'){
		this.learnedAbilities = data.learnedAbilities;
	}else{
		this.learnedAbilities = {};
	}
	if (typeof data.ap != 'undefined'){
		this.ap = data.ap;
	}else{
		this.ap = {};
	}
}

ClassInfo.prototype.setClass = function(c){
	try{
		//TODO reduce attributes from old class?

		var charClass = this.unit.owner.gameEngine.classes[c]
		this.currentClass = charClass.name;
		this.classAbilities = charClass.abilities;
		for (var stat in charClass.attributes){
			this.unit[stat].nMod += charClass.attributes[stat];
			this.unit[stat].set();
		}
		if (typeof this.ap[charClass.name] == 'undefined'){
			this.ap[charClass.name] = 0;
		}
		//TODO send new class info to the client
	}catch(e){
		console.log("ERROR: unable to set class");
		console.log(e.stack);
	}
}

ClassInfo.prototype.setBaseClass = function(c){
	try{
		var charClass = this.unit.owner.gameEngine.classes[c]
		this.baseClass = charClass.name;
		this.baseClassAbilities = charClass.abilities;
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