var Attribute = require('./attribute.js').Attribute;

var Unit = function(){
    this.id = null;
    this.owner = null;
    this.name = null;
    this.sex = null;
    //Unit Stats
    //health
    this.currentHealth = null;
    this.maximumHealth = null;
    //energy
    this.currentEnergy = null;
    this.maximumEnergy = null;

    this.move = null;
    this.jump = null;
    this.power = null;
    this.skill = null;
    this.abilitySlots = null;
    this.usedAbilitySlots = null;
    //shields
    this.currentShields = null;
    this.maximumShields = null;
    this.shieldDelay = null;
    this.shieldRecharge = null;
    //attributes
    this.strength = null;
    this.intelligence = null;
    this.endurance = null;
    this.willpower = null;
    this.agility = null;
    this.dexterity = null;
    this.charisma = null;

    //level and class stuff?
    this.level = null;
    this.exp = null;

    //all the information about the unit's class
    this.classInfo = null;
    //game stats (games won; damage/healing done etc)
    this.gameStats = null;

    this.inventory = null;

    this.weapon = null;
    this.shield = null;
    this.accessory = null;

    this.physicalRes = null;
    this.heatRes = null;
    this.coldRes = null;
    this.acidRes = null;
    this.poisonRes = null;
    this.electricRes = null;
    this.pulseRes = null;
    this.radiationRes = null;
    this.gravityRes = null;

    this.mechanical = null; //a mechanical unit
    this.human = null; //a human unit

    this.usedAbilitySlots = null;
}

Unit.prototype.init = function(data) {
    //Set up all stats and attributes
    this.name = data.name;
    this.sex = data.sex;
    this.owner = data.owner;
    this.id = data.id;

    this.level = 1;
    this.exp = 0;

    this.usedAbilitySlots = 0;
    
    this.mechanical = false;
    this.human = true;

    this.maximumHealth = new Attribute();
    this.maximumHealth.init({
        'id': 'hp',
        'owner': this,
        'value': 1000,
        'min': 1,
        'max': 9999
    });
    this.maximumEnergy = new Attribute();
    this.maximumEnergy.init({
        'id': 'energy',
        'owner': this,
        'value': 100,
        'min': 1,
        'max': 999
    });
    //shields stay at null until a shield is equipped?

    this.move = new Attribute();
    this.move.init({
        'id': 'mov',
        'owner': this,
        'value': 3,
        'min': 0,
        'max': 99
    });
    this.jump = new Attribute();
    this.jump.init({
        'id': 'jum',
        'owner': this,
        'value': 2,
        'min': 0,
        'max': 99
    });
    this.power = new Attribute();
    this.power.init({
        'id': 'pow',
        'owner': this,
        'value': 10,
        'min': 0,
        'max': 9999
    });
    this.skill = new Attribute();
    this.skill.init({
        'id': 'ski',
        'owner': this,
        'value': 10,
        'min': 0,
        'max': 9999
    });
    this.speed = new Attribute();
    this.speed.init({
        'id': 'spd',
        'owner': this,
        'value': 100,
        'min': 0,
        'max': 999,
        formula: function(){
            //Speed is reduced by 10*
            var mod = 1.0;
            if (this.owner.inventory.currentWeight > this.owner.inventory.maxWeight.value){
                for (var i = 0; i < this.owner.inventory.currentWeight-this.owner.inventory.maxWeight.value;i++){
                    mod = mod*.9;
                }
            }
            return Math.round((this.base*this.pMod*mod)+this.nMod);
        }
    });
    this.abilitySlots = new Attribute();
    this.abilitySlots.init({
        'id': 'absl',
        'owner': this,
        'value': 50,
        'min': 0,
        'max': 999
    });
    this.strength = new Attribute();
    this.strength.init({
        'id': 'str',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20,
        next: function(){
            try{this.owner.inventory.maxWeight.set();}catch(e){}
        }
    });
    this.endurance = new Attribute();
    this.endurance.init({
        'id': 'end',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.agility = new Attribute();
    this.agility.init({
        'id': 'agi',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.dexterity = new Attribute();
    this.dexterity.init({
        'id': 'dex',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.willpower = new Attribute();
    this.willpower.init({
        'id': 'wil',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.intelligence = new Attribute();
    this.intelligence.init({
        'id': 'int',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.charisma = new Attribute();
    this.charisma.init({
        'id': 'cha',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });

    this.physicalRes = new Attribute();
    this.physicalRes.init({
        'id': 'pRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.heatRes = new Attribute();
    this.heatRes.init({
        'id': 'hRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.coldRes = new Attribute();
    this.coldRes.init({
        'id': 'cRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.acidRes = new Attribute();
    this.acidRes.init({
        'id': 'aRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.poisonRes = new Attribute();
    this.poisonRes.init({
        'id': 'poRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.electricRes = new Attribute();
    this.electricRes.init({
        'id': 'eRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.pulseRes = new Attribute();
    this.pulseRes.init({
        'id': 'puRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.radiationRes = new Attribute();
    this.radiationRes.init({
        'id': 'rRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.gravityRes = new Attribute();
    this.gravityRes.init({
        'id': 'gRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });

    var Inventory = require('./inventory.js').Inventory;
    this.inventory = new Inventory();
    this.inventory.init({
        owner: this
    });
    this.inventory.setGameEngine(this.owner.gameEngine);
};

Unit.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.id = this.id;
    dbObj.name = this.name;
    dbObj.sex = this.sex;
    dbObj.maximumHealth = this.maximumHealth.base;
    dbObj.maximumEnergy = this.maximumEnergy.base;
    dbObj.move = this.move.base;
    dbObj.jump = this.jump.base;
    dbObj.power = this.power.base;
    dbObj.skill = this.skill.base;
    dbObj.abilitySlots = this.abilitySlots.base;
    dbObj.usedAbilitySlots = this.usedAbilitySlots;
    //attributes
    dbObj.strength = this.strength.base;
    dbObj.intelligence = this.strength.base;
    dbObj.endurance = this.endurance.base;
    dbObj.willpower = this.willpower.base;
    dbObj.agility = this.agility.base;
    dbObj.dexterity = this.dexterity.base;
    dbObj.charisma = this.charisma.base;

    //level and class stuff?
    dbObj.level = this.level;
    dbObj.exp = this.exp;

    //all the information about the unit's class
    dbObj.classInfo = this.classInfo.getDBObj();
    //game stats (games won; damage/healing done etc)
    dbObj.gameStats = this.gameStats;

    dbObj.inventory = [];
    for (var i = 0; i < this.inventory.items.length;i++){
        dbObj.inventory.push(this.inventory.items[i].itemID);
    }

    dbObj.weapon = 'None';
    dbObj.shield = 'None';
    dbObj.accessory = 'None';

    dbObj.physicalRes = this.physicalRes.base;
    dbObj.heatRes = this.heatRes.base;
    dbObj.coldRes = this.coldRes.base;
    dbObj.acidRes = this.acidRes.base;
    dbObj.poisonRes = this.poisonRes.base;
    dbObj.electricRes = this.electricRes.base;
    dbObj.pulseRes = this.pulseRes.base;
    dbObj.radiationRes = this.radiationRes.base;
    dbObj.gravityRes = this.gravityRes.base;

    dbObj.mechanical = this.mechanical; //a mechanical unit
    dbObj.human = this.human; //a human unit

    dbObj.usedAbilitySlots = this.usedAbilitySlots;
    return dbObj
}
Unit.prototype.setClass = function(c){
    try{

    }catch(e){
        console.log("unable to set class");
        console.log(e);
    }
};

Unit.prototype.setStat = function(id,amt){
    try{
        this.getStat(id).base = amt;
        this.getStat(id).set(true);
    }catch(e){
        console.log("unable to set stat " + id);
        console.log(e);
    }
};

Unit.prototype.getStat = function(id){
    try{
        switch(id){
            case 'absl':
                return this.abilitySlots;
                break;
            case 'strength':
                return this.strength;
                break;
            case 'str':
                return this.strength;
                break;
            case 'endurance':
                return this.endurance;
                break;
            case 'end':
                return this.endurance;
                break;
            case 'agility':
                return this.agility;
                break;
            case 'agi':
                return this.agility;
                break;
            case 'dexterity':
                return this.dexterity;
                break;
            case 'dex':
                return this.dexterity;
                break;
            case 'intelligence':
                return this.intelligence;
                break;
            case 'int':
                return this.intelligence;
                break;
            case 'willpower':
                return this.willpower;
                break;
            case 'wil':
                return this.willpower;
                break;
            case 'charisma':
                return this.charisma;
                break;
            case 'char':
                return this.charisma;
                break;
            case 'maximumHealth':
                return this.maximumHealth;
                break;
            case 'hp':
                return this.maximumHealth;
                break;
            case 'maximumEnergy':
                return this.maximumEnergy;
                break;
            case 'energy':
                return this.maximumEnergy;
                break;
            case 'power':
                return this.power;
                break;
            case 'pwr':
                return this.power;
                break;
            case 'skill':
                return this.skill;
                break;
            case 'skl':
                return this.skill;
                break;
            case 'move':
                return this.move;
                break;
            case 'mov':
                return this.move;
                break;
            case 'jump':
                return this.jump;
                break;
            case 'jmp':
                return this.jump;
                break;
            case 'speed':
                return this.speed;
                break;
            case 'spd':
                return this.speed;
                break;
            case 'physicalRes':
                return this.physicalRes;
                break;
            case 'pRes':
                return this.physicalRes;
                break;
            case 'heatRes':
                return this.heatRes;
                break;
            case 'hres':
                return this.heatRes;
                break;
            case 'coldRes':
                return this.coldRes;
                break;
            case 'cRes':
                return this.coldRes;
                break;
            case 'acidRes':
                return this.acidRes;
                break;
            case 'aRes':
                return this.acidRes;
                break;
            case 'electricRes':
                return this.electricRes;
                break;
            case 'eRes':
                return this.electricRes;
                break;
            case 'poisonRes':
                return this.poisonRes;
                break;
            case 'poRes':
                return this.poisonRes;
                break;
            case 'pulseRes':
                return this.pulseRes;
                break;
            case 'puRes':
                return this.pulseRes;
                break;
            case 'readiationRes':
                return this.radiationRes;
                break;
            case 'rRes':
                return this.radiationRes;
                break;
            case 'gravityRes':
                return this.gravityRes;
                break;
            case 'gRes':
                return this.gravityRes;
                break;
            case 'maxWeight':
                return this.inventory.maxWeight;
                break;
            case 'wgt':
                return this.inventory.maxWeight;
                break;
        }
    }catch(e){
        console.log("unable to get stat " + id);
        console.log(e);
    }
};

Unit.prototype.modStat = function(id,amt){
    try{
        this.getStat(id).base += amt;
        this.getStat(id).set(true);
    }catch(e){
        console.log("unable to mod stat " + id);
        console.log(e);
    }
};
Unit.prototype.addAp = function(classID,amt){
    try{
        this.classInfo.ap[classID] += amt;
        if (this.classInfo.ap[classID] > 9999){
            this.classInfo.ap[classID] = 9999;
        }
        this.owner.gameEngine.queuePlayer(this.owner,'modAp',{
            'unitID': this.id,
            'classID': classID,
            'value': this.classInfo.ap[classID]
        })
    }catch(e){
        console.log("unable to mod ap");
        console.log(e);
    }
}
Unit.prototype.update = function(dt) {

}

exports.Unit = Unit;