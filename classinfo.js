
var	Enums = require('./enums.js').Enums,
    Ability = require('./ability.js').Ability;

var ClassInfo = function(){
	this.unit = null; //the unit which owns this classInfo
	this.engine = null;
	this.currentClass = null;
	this.baseClass = null;
	this.baseid = null;
	this.classid = null; 	
	this.allClassAbilities = {};

	//set on init
	this.learnedAbilities = {};
	this.equippedAbilities = {};
	this.ap = {};
	this.totalAPValues = {};
	this.abilities = {};
	this.allClassAbilities = {};
}

ClassInfo.prototype.init = function(data){
	if (typeof data.learned != 'undefined'){
		for (var i in data.learned){
			for (var j in this.allClassAbilities){
				for (var k = 0; k < this.allClassAbilities[j].length;k++){
					if (this.allClassAbilities[j][k]['id'] == i){
						var d = {};
						d[Enums.CLASSID] = j;
						d[Enums.ABILITYID] = i;
						this.learnAbility(d,false);
					}
				}
			}
		}
	}
	if (typeof data.equipped != 'undefined'){
		for (var i in data.equipped){
			for (var j in this.allClassAbilities){
				for (var k = 0; k < this.allClassAbilities[j].length;k++){
					if (this.allClassAbilities[j][k]['id'] == i){
						var d = {};
						d[Enums.CLASSID] = j;
						d[Enums.ABILITYID] = i;
						this.equipAbility(d,false);
					}
				}
			}
		}
		//cehck for passives and reactions
	}
	if (typeof data.allClassAbilities != 'undefined'){
		this.allClassAbilities = data.allClassAbilities;
	}
	if (typeof data.ap != 'undefined'){
		this.ap = data.ap;
	}
	if (typeof data.totalAPValues != 'undefined'){
		this.totalAPValues = data.totalAPValues;
	}
}

ClassInfo.prototype.learnAbility = function(data,updateClient = true){
    var cID = data[Enums.CLASSID];
    var aID = data[Enums.ABILITYID];
    //get the ability
    var abl;
    for (var a = 0; a < this.allClassAbilities[cID].length;a++){
        if (aID == this.allClassAbilities[cID][a].id){
            abl = this.allClassAbilities[cID][a];
        }
    }
    //check available AP
    if (this.ap[cID] < abl.ApCost){
        return false;
    }
    //check if ability is already learned
    if (this.learnedAbilities[aID]){
        return false;
    }
    //ability can be learned. reduce AP and add to learned abilities list
    this.ap[cID] -= abl.ApCost;
    this.learnedAbilities[aID] = true;
    this.abilities[aID] = new Ability();
    this.abilities[aID].init(abl);
    //update client
    if (updateClient){
	    data[Enums.APCOST] = abl.ApCost;
	    this.engine.queuePlayer(this.unit.owner,Enums.LEARNABILITY,data);
	}
}
ClassInfo.prototype.equipAbility = function(data,updateClient = true){
    var cID = data[Enums.CLASSID];
    var aID = data[Enums.ABILITYID];

    //get the ability
    if (!this.learnedAbilities[aID]){
        return false;
    }
    var abl;
    for (var a = 0; a < this.allClassAbilities[cID].length;a++){
        if (aID == this.allClassAbilities[cID][a].id){
            abl = this.abilities[aID];
        }
    }
    //check available SLOTS
    if (this.unit.abilitySlots.value - this.unit.usedAbilitySlots < abl.sCost){
        return false;
    }
    //check if ability is already equipped
    if (this.equippedAbilities[aID]){
        return false;
    }
    //ability can be equipped. add current slots and add to learned abilities list

    //check if ability is passive/reaction
    if (abl.type == 'passive' || abl.type == 'reaction'){
        let aFunc = this.engine.actions.getAbility(abl.id);
        abl.reverse = false;
        let success = aFunc(this.unit,abl);
        if (!success){return false;}
    }

    this.equippedAbilities[aID] = true;
    this.unit.setAbilitySlots();

    //update client
    if (updateClient){
	    data[Enums.SCOST] = abl.sCost;
	    this.engine.queuePlayer(this.unit.owner,Enums.EQUIPABILITY,data);
	}
}
ClassInfo.prototype.unEquipAbility = function(data,updateClient = true){
    var cID = data[Enums.CLASSID];
    var aID = data[Enums.ABILITYID];
    //get the ability
    var abl;
    for (var a = 0; a < this.allClassAbilities[cID].length;a++){
        if (aID == this.allClassAbilities[cID][a].id){
            abl = this.abilities[aID];
        }
    }
    //check if ability is already not equipped
    if (typeof this.equippedAbilities[aID] == 'undefined'){
        return false;
    }

    //check if ability is passive/reaction
    if (abl.type == 'passive' || abl.type == 'reaction'){
        let aFunc = this.engine.actions.getAbility(abl.id);
        abl.reverse = true;
        let success = aFunc(this.unit,abl);
        if (!success){return false;}
    }
    //ability can be un-equipped.
    delete this.equippedAbilities[aID];
    this.unit.setAbilitySlots();
    //update client
    if (updateClient){
	    data[Enums.SCOST] = abl.sCost;
	    this.engine.queuePlayer(this.unit.owner,Enums.UNEQUIPABILITY,data);
	}
}

ClassInfo.prototype.getClientData = function(){
	cData = {};
	cData[Enums.CURRENTCLASS] = this.currentClass;
	cData[Enums.BASECLASS] = this.baseClass;
	cData[Enums.BASEID] = this.baseid;
	cData[Enums.CLASSID] = this.classid;
	cData[Enums.AP] = this.ap;
	cData[Enums.TOTALAPVALUES] = this.totalAPValues;

	cData[Enums.LEARNEDABILITIES] = {};
	for (var i in this.learnedAbilities){
		cData[Enums.LEARNEDABILITIES][i] = true;
	}
	cData[Enums.EQUIPPEDABILITIES] = {};
	for (var i in this.equippedAbilities){
		cData[Enums.EQUIPPEDABILITIES][i] = true;
	}
	cData[Enums.ALLCLASSABILITIES] = {};
	for (var i in this.allClassAbilities){
		cData[Enums.ALLCLASSABILITIES][i] = [];
		for (var j = 0; j < this.engine.classes[i]['abilities'].length;j++){
			var ability = this.engine.abilities[this.engine.classes[i]['abilities'][j]['id']];
			cData[Enums.ALLCLASSABILITIES][i].push(ability.cData);
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
		
		var charClass = this.engine.classes[c]
		this.classid = c;
		this.currentClass = charClass.classid;
		//TODO this should be enums
		for (var stat in charClass.attributes){
			this.unit[stat].base += charClass.attributes[stat];
			this.unit[stat].set();
		}
		if (typeof this.ap[charClass.classid] == 'undefined'){
			this.ap[charClass.classid] = 100;
			this.totalAPValues[charClass.classid] = 100;
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
		var charClass = this.engine.classes[c];
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
ClassInfo.prototype.setUnit = function(u){
	this.unit = u;
	this.engine = this.unit.engine;
}

exports.ClassInfo = ClassInfo;