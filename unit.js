var Attribute = require('./attribute.js').Attribute;
    Item = require('./item.js').Item,
    UnitAI = require('./unitai.js').UnitAI;

var Unit = function(){
    this.id = null;
    this.owner = null;
    this.engine = null;
    this.session = null;
    this.name = null;
    this.sex = null;
    //Unit Stats
    //health
    this.maximumHealth = null;
    //energy
    this.maximumEnergy = null;

    this.move = null;
    this.moveLeft = null;
    this.jump = null;

    this.power = null;
    this.skill = null;
    this.tactics = null;

    this.abilitySlots = null;
    this.usedAbilitySlots = null;
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

    this.healMod = null

    this.mechanical = null; //a mechanical unit
    this.human = null; //a human unit

    this.usedAbilitySlots = null;

    //shields
    this.maximumShields = null;
    this.shieldDelay = null;
    this.shieldRecharge = null;
    

    //stuff that gets reset before game start
    this.currentShields = null;
    this.currentEnergy = null;
    this.currentHealth = null;

    this.hidden = false;
    //Map
    this.currentNode = null;
    this.direction = null;

    //death
    this.dead = null;
    this.down = null;

    //buffs
    this.buffs = null;

    this.charge = null;

    this.height = 2;

    this.casting = false;
    this.isCastTimer = false;

    this.ai = null;
    this.aiInfo = null;

    this.actionUsed = false;
    this.moveUsed = false;

    this.fainted = false;

    this.onTakeDamage = []; //list of effects when the unit takes damage
    this.onAttack = []; //list of effects when the unit makes a weapon attack
    this.onMove = []; //list of effects when the unit moves
    this.onEnemyMove = [] //list of effects when an enemy unit moves
    this.onTurnEnd = [];
    this.onTargetFaint = [];
    this.onTargetKill = [];
    this.onFaint = [];
    this.onKill = [];
    this.onTurnStart = [];

    this.fists = new Item();
    this.fists.init({
        amount:1,
        classes:"ALL",
        description:"Hand to hand combat",
        eqData:{range: 1, damage: 10},
        itemID:"weapon_fists",
        name:"Fists",
        type:"weapon",
        weight:0
    });
}

Unit.prototype.reset = function(){
    //things that reset with each new game
    this.moveLeft = 0;
    //shields
    this.currentShields = this.maximumShields.value;

    //health and energy
    this.currentEnergy = this.maximumEnergy.value;
    this.currentHealth = this.maximumHealth.value;

    //death
    this.dead = false;
    this.down = false;

    this.hidden = false;

    //charge
    this.charge = Math.random();
    //buffs initialize
    this.buffs = [];
}

Unit.prototype.init = function(data) {
    //Set up all stats and attributes
    this.name = data.name;
    this.sex = data.sex;
    this.owner = data.owner;
    this.engine = data.owner.engine;
    this.id = data.id;

    this.level = (typeof data.level == 'undefined') ? 1 : data.level;
    this.exp = (typeof data.exp == 'undefined') ? 0 : data.exp;
    
    this.mechanical = (typeof data.mechanical == 'undefined') ? false : data.mechanical;
    this.human = (typeof data.human == 'undefined') ? true : data.human;

    this.ai = (typeof data.ai == 'undefined') ? false : data.ai;
    this.aiInfo = data.aiInfo;

    //the maximum shield value
    this.maximumShields = new Attribute();
    this.maximumShields.init({
        'id': 'sh',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 99999,
        formula: function(){
            if (this.owner.shield == null){
                return 0;
            }else{
                var shield = this.owner.inventory.items[this.owner.shield];
                this.base = Math.ceil(((10*shield.weight) + (100+this.owner.level*5)) * (20/(shield.eqData.recharge+30)) *((shield.eqData.delay-1)*(0.25*(1+shield.eqData.delay/5))+0.2));
            }
            return Math.round((this.base+this.nMod)*this.pMod);
        }
    });
    //the amount a shield is recharged per turn
    this.shieldRecharge = new Attribute();
    this.shieldRecharge.init({
        'id': 'shrec',
        'owner': this,
        'value': 0,
        'min': -100,
        'max': 100
    });
    //the number of turns before shield recharge takes effect
    this.shieldDelay = new Attribute();
    this.shieldDelay.init({
        'id': 'shdel',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 99
    });
    this.maximumHealth = new Attribute();
    this.maximumHealth.init({
        'id': 'hp',
        'owner': this,
        'value': 100,
        'min': 1,
        'max': 99999
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
        'value': 4,
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

    this.tactics = new Attribute();
    this.tactics.init({
        'id': 'tac',
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
        'min': 10,
        'max': 999,
        formula: function(){
            //Speed is reduced by 10% per weight over limit
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
        'value': 25,
        'min': 0,
        'max': 999 //TODO should check if current absl are too high, possibly resetting abilities
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
        'max': 75
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
        'max': 75
    });
    this.radiationRes = new Attribute();
    this.radiationRes.init({
        'id': 'rRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 75
    });
    this.gravityRes = new Attribute();
    this.gravityRes.init({
        'id': 'gRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 75
    });
    this.healMod = new Attribute();
    this.healMod.init({
        'id': 'hMod',
        'owner': this,
        'value': 0,
        'min': -100,
        'max': 100
    });

    this.expMod = new Attribute();
    this.expMod.init({
        'id': 'expMod',
        'owner': this,
        'value': 1,
        'min': 0,
        'max': 10,
        'clientUpdate': false
    });
    this.castingSpeedMod = new Attribute();
    this.castingSpeedMod.init({
        'id': 'cSpeedMod',
        'owner': this,
        'value': 1,
        'min': 0,
        'max': 10,
        'clientUpdate': false
    });

    var Inventory = require('./inventory.js').Inventory;
    this.inventory = new Inventory();
    this.inventory.init({
        owner: this
    });
    this.inventory.setGameEngine(this.owner.engine);
    if (typeof data.inventory != 'undefined'){
        for (var i = 0; i < data.inventory.length;i++){
            this.inventory.addItemUnit(data.inventory[i]);
        }
    }

    this.inventory.equip(data.weapon);
    this.inventory.equip(data.shield);
    this.inventory.equip(data.accessory);

    for (var i in data){
        if (this[i] instanceof Attribute){
            this[i].base = data[i];
            this[i].set();
        }
    }
    this.inventory.maxWeight.set();

    this.reset();
};
Unit.prototype.endTurn = function(){
    //tick all buffs
    for (var i = 0; i < this.buffs.length;i++){
        this.buffs[i].tick();
        if (this.buffs[i].buffEnded){
            this.buffs.splice(i,1);
            i -= 1;
        }
    }
    this.moveLeft = 0;
};

Unit.prototype.damage = function(type,value,aData){
    //damage based on type
    if (typeof aData == 'undefined'){
        aData = [];
    }
    switch(type){
        case this.engine.dmgTypeEnums.Gravity:
            value -= Math.round(value*(this.gravityRes.value/100));
            var mod = 8/(60/this.inventory.currentWeight);
            value = Math.ceil(value*mod);
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Electric:
            value -= Math.round(value*(this.electricRes.value/100));
            if (this.currentShields > 0){
                value = value*2;
            }
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Poison:
            value -= Math.round(value*(this.poisonRes.value/100));
            this.currentHealth -= value;
            break;
        case this.engine.dmgTypeEnums.Corrosive:
            value -= Math.round(value*(this.acidRes.value/100));
            if (this.mechanical){
                value = value*2;
            }
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Heat:
            value -= Math.round(value*(this.heatRes.value/100));
            if (this.human){
                value = value*2;
            }
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Cold:
            value -= Math.round(value*(this.coldRes.value/100));
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Radiation:
            value -= Math.round(value*(this.radiationRes.value/100));
            if (this.mechanical){
                value = 0;
            }
            if (this.human){
                value = value*3;
            }
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Pulse:
            value -= Math.round(value*(this.pulseRes.value/100));
            if (this.mechanical){
                value = value*3;
            }
            if (this.human){
                value = 0;
            }
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Explosive:
            value -= Math.round(value*(this.physicalRes.value/200));
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Healing:
            value += Math.round(value*(this.healMod.value/100));
            if (this.currentHealth <= 0){
                this.currentHealth += value;
                if (this.currentHealth > 0){
                    this.currentHealth = 0;
                }
            }else{
                this.currentHealth += value;
            }
            if (this.currentHealth > this.maximumHealth.value){
                this.currentHealth = this.maximumHealth.value;
            }
            break;
        default:
            value -= Math.round(value*(this.physicalRes.value/100));
            this._damage(value);
            break;
    }
    if (this.currentHealth <= 0 && !this.fainted){
        //death = < -50% hp
        if (this.currentHealth <= this.maximumHealth.value/-2){
            this.currentNode.unit = null;
            this.dead = true;
        }
        this.fainted = true;
        this.owner.session.checkEnd();
    }
    var txt = '-' + value;
    if (type == this.engine.dmgTypeEnums.Healing){
        txt = '+' + value;
    }
    aData.push({
        action: this.owner.session.clientActionEnums.DmgText,
        unitid: this.id,
        text: txt,
        newShields: this.currentShields,
        newHealth: this.currentHealth,
        fainted: this.fainted,
        type: type,
        dead:this.dead
    });
    return aData;
};
Unit.prototype._damage = function(value){
    if (this.currentShields < value){
        value -= this.currentShields;
        this.currentShields = 0;
    }else{
        this.currentShields -= value;
        value = 0;
    }
    this.currentHealth -= value;
}
Unit.prototype.setMoveLeft = function(val){
    this.moveLeft += val;
    if (this.moveLeft < 0){
        this.moveLeft = 0;
    }
    this.owner.session.queueData('setMoveLeft',{unit: this.id,val: this.moveLeft});
};
Unit.prototype.levelUp = function(update){
    //TODO save the values per level just in case the numbers change?
    if (this.level == 100){return;}
    this.level += 1;
    this.power.base += 6;
    this.power.base += this.strength.base*1.5;
    this.power.base += this.charisma.base*0.3;
    this.skill.base += 6;
    this.skill.base += this.dexterity.base*1.5;
    this.skill.base += this.charisma.base*0.3;
    this.tactics.base += 6;
    this.tactics.base += this.intelligence.base*2;
    this.tactics.base += this.charisma.base*0.3;
    this.power.set(update);
    this.tactics.set(update);
    this.skill.set(update);
    this.maximumHealth.base += 5;
    this.maximumHealth.base += this.endurance.base*0.84;
    this.maximumHealth.base += this.charisma.base*0.13;
    this.maximumHealth.set(update);
    this.abilitySlots.base += 1;
    this.abilitySlots.base += this.intelligence.base*0.1;
    this.abilitySlots.base += this.charisma.base*0.02;
    this.abilitySlots.set(update);
    this.speed.base += 2;
    this.speed.base += this.agility.base*0.32;
    this.speed.base += this.charisma.base*0.06;
    this.speed.set(update);
    //this.maximumEnergy.base += 1;
    this.maximumEnergy.base += this.willpower.base*0.1;
    this.maximumEnergy.base += this.charisma.base*0.025;
    this.maximumEnergy.set(update);

    var resTypes = ['physical','heat','cold','acid','poison','radiation','gravity','pulse','electric'];

    for (var i = 0; i < resTypes.length;i++){
        this[resTypes[i] + 'Res'].base += 0.2;
        this[resTypes[i] + 'Res'].base += this.willpower.base*0.04;
        this[resTypes[i] + 'Res'].base += this.charisma.base*0.01;
        this[resTypes[i] + 'Res'].set(update);
    }

    this.maximumShields.set(update);
}

Unit.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj.name = this.name;
    dbObj.sex = this.sex;
    dbObj.maximumHealth = this.maximumHealth.base;
    dbObj.maximumEnergy = this.maximumEnergy.base;
    dbObj.move = this.move.base;
    dbObj.jump = this.jump.base;
    dbObj.power = this.power.base;
    dbObj.skill = this.skill.base;
    dbObj.tactics = this.tactics.base;
    dbObj.speed = this.speed.base;
    dbObj.abilitySlots = this.abilitySlots.base;
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

    dbObj.weapon = this.weapon;
    dbObj.shield = this.shield;
    dbObj.accessory = this.accessory;

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
    return dbObj;
}
Unit.prototype.setCurrentNode = function(node){
    if (this.currentNode){
        this.currentNode.unit = null;
    }
    this.currentNode = node;
    node.unit = this;
}
Unit.prototype.minCurrentNode = function(){
    if (this.currentNode == null){
        return null;
    }
    return {
        q:this.currentNode.q, //q coord
        r:this.currentNode.r, //r coord
    }
}
Unit.prototype.getClientData = function(){
    //create object to send to the client
    var data = {}
    for (var a in this){
        if (this[a] instanceof Attribute){
            data[a] = this[a].value;
        }
    }
    data.full = true; //get full data;
    data.owner = this.owner.id;
    data.name = this.name;
    data.sex = this.sex
    data.id = this.id;
    data.usedAbilitySlots = this.usedAbilitySlots;
    data.level = this.level;
    data.health = this.currentHealth;
    data.energy = this.currentEnergy;
    data.shields = this.currentShields;
    data.currentNode = this.minCurrentNode();
    data.direction = this.direction
    data.classInfo = {};
    data.weapon = this.weapon;
    data.shield = this.shield;
    data.accessory = this.accessory;
    data.ai = this.ai;
    for (var cI in this.classInfo){
        if (cI != 'unit'){data.classInfo[cI] = this.classInfo[cI]}
    }
    data.inventory = {};
    data.inventory.items = [];
    data.inventory.currentWeight = this.inventory.currentWeight;
    data.inventory.maxItemPile = this.inventory.maxItemPile;
    for (var i = 0; i < this.inventory.items.length;i++){
        data.inventory.items.push(this.inventory.items[i].getClientData());
    }
    data.inventory.maxWeight = this.inventory.maxWeight.value;
    return data;
}

Unit.prototype.getLessClientData = function(){
    var data = {}
    data.full = false; //reduced data (unidentified unit)
    data.owner = this.owner.id;
    data.name = this.name;
    data.sex = this.sex;
    data.level = this.level;
    data.id = this.id;
    data.health = this.currentHealth;
    data.energy = this.currentEnergy;
    data.shields = this.currentShields;
    data.move = this.move.value;
    data.jump = this.jump.value;
    data.speed = this.speed.value;
    data.maximumHealth = this.maximumHealth.value;
    data.maximumShields = this.maximumShields.value;
    data.maximumEnergy = this.maximumEnergy.value;
    data.charge = this.charge;
    data.currentNode = this.minCurrentNode();
    data.direction = this.direction;
    data.classInfo = {currentClass: this.classInfo.currentClass};
    data.weapon = this.weapon;
    data.shield = this.shield;
    data.accessory = this.accessory;
    data.class = this.classInfo.currentClass;
    data.ai = this.ai;
    return data;

}
Unit.prototype.setClass = function(c){
    try{
        this.setAbilitySlots();
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

Unit.prototype.setAbilitySlots = function(){
    var s = 0;
    for (var ability in this.classInfo.equippedAbilities){
        var abArr = this.owner.engine.abilityIndex[ability];
        if (typeof this.classInfo.allClassAbilities[abArr[0]][abArr[1]].sCost != 'undefined'){
            s += this.classInfo.allClassAbilities[abArr[0]][abArr[1]].sCost;
        }
    }
    this.usedAbilitySlots = s;
};

Unit.prototype.getStat = function(id){
    try{
        switch(id){
            case 'sh':
                return this.maximumShields;
                break;
            case 'shdel':
                return this.shieldDelay;
                break;
            case 'shrec':
                return this.shieldRecharge;
                break;
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
            case 'tactics':
                return this.tactics;
                break;
            case 'tac':
                return this.tactics;
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
            case 'hRes':
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
            case 'radiationRes':
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
            case 'expMod':
                return this.expMod;
                break;
            case 'cSpeedMod':
                return this.castingSpeedMod;
                break;
        }
    }catch(e){
        console.log("unable to get stat " + id);
        console.log(e);
    }
};

Unit.prototype.modStat = function(id,amt){
    try{
        this.getStat(id).nMod += amt;
        this.getStat(id).set(true);
    }catch(e){
        console.log("unable to mod stat " + id);
        console.log(e);
    }
};
Unit.prototype.modStatPercent = function(id,amt){
    try{
        this.getStat(id).pMod += amt;
        this.getStat(id).set(true);
    }catch(e){
        console.log("unable to mod stat " + id);
        console.log(e);
    }
};
Unit.prototype.addAp = function(data){
    var classID = (typeof data.classID == 'undefined') ? null : data.classID;
    if (!classID){return;}
    var mod = (typeof data.mod == 'undefined') ? 1 : data.mod;
    var amt = (typeof data.amt == 'undefined') ? Math.floor(Math.min(99,Math.max(10,Math.pow(this.classInfo.totalAPValues[classID],0.48))*mod)) : data.amt;
    var updateClient = (typeof data.updateClient == 'undefined') ? false : data.updateClient;
    try{
        this.classInfo.ap[classID] += amt;
        this.classInfo.totalAPValues[classID] += amt;
        if (this.classInfo.ap[classID] > 9999){
            this.classInfo.ap[classID] = 9999;
        }
        if (updateClient){
            this.owner.engine.queuePlayer(this.owner,'modAp',{
                'unitID': this.id,
                'classID': classID,
                'value': this.classInfo.ap[classID]
            });
        }
    }catch(e){
        console.log("unable to mod ap");
        console.log(e);
        return 0;
    }
    return amt;
}
Unit.prototype.addBuff = function(buffData){
    try{
        this.classInfo.ap[classID] += amt;
        if (this.classInfo.ap[classID] > 9999){
            this.classInfo.ap[classID] = 9999;
        }
        this.owner.engine.queuePlayer(this.owner,'modAp',{
            'unitID': this.id,
            'classID': classID,
            'value': this.classInfo.ap[classID]
        })
    }catch(e){
        console.log("unable to mod ap");
        console.log(e);
    }
}
Unit.prototype.newNode = function(node){
    this.currentNode.unit = null;
    this.currentNode = node;
    this.currentNode.unit = this;
}
Unit.prototype.getWeapon = function(){
    if (this.weapon != null){
        return this.inventory.items[this.weapon];
    }else{
        return this.fists;
    }
};

Unit.prototype.getAbility = function(str){
    if (!this.classInfo.equippedAbilities[str] || typeof this.classInfo.equippedAbilities[str] == 'undefined'){
        return null;
    }
    return this.engine.abilities[str];
};

Unit.prototype.removeBuffsWithTag = function(tag){
    for(var i = 0;i < this.buffs.length;i++){
        var buff = this.buffs[i];
        for (var j = 0; j < buff.tags.length;j++){
            if (buff.tags[j] == tag){
                console.log('removing...')
                buff.ticker = buff.duration;
                buff.end();
                continue;
            }
        }
        if (buff.buffEnded){
            this.buffs.splice(i,1);
            i -= 1;
        }
    }
};

Unit.prototype.update = function(dt) {

}

exports.Unit = Unit;