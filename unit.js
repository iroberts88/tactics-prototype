var User = require('./user.js').User,
    Utils = require('./utils.js').Utils,
    Attribute = require('./attribute.js').Attribute,
    Actions = require('./actions.js').Actions,
    Buff = require('./buff.js').Buff,
    Item = require('./item.js').Item,
    UnitAI = require('./unitai.js').UnitAI,
    Enums = require('./enums.js').Enums;

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

    this.vision = null;

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
    this.viralRes = null,

    this.healMod = null

    this.synthetic = null; //% of the unit that is synthetic

    this.usedAbilitySlots = null;

    //shields
    this.maximumShields = null;
    this.shieldDelay = null;
    this.shieldRecharge = null;
    
    this.ignoreLOSBlock = false;
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

    this.reaction = 1;

    this.fists = new Item();
    this.fists.init({
        amount:1,
        classes:"ALL",
        description:"Hand to hand combat",
        eqData:{range: 1, damage: 10},
        id:"weapon_fists",
        name:"Fists",
        type:"weapon",
        weight:0
    });

    //trigger arrays
    this.onTakeDamage = []; //triggers before the unit takes damage
    this.onAfterTakeDamage = []; //triggers after the unit takes damage
    this.onAction = [];
    this.onAttack = [];
    this.onMove = []; //triggers when the unit moves
    this.onEnemyMove = [] //triggers before an enemy unit moves
    this.afterEnemyMove = [] //triggers after an enemy unit moves
    this.onTurnEnd = [];
    this.onTurnStart = [];
    this.onFaint = [];
    this.onDeath = [];
    this.onInventoryChange = []; //triggers when items are added/removed from inventory
    this.currentNode = null;
    this.currentSession = null;
    this.aiTurnInfo = null;
}

Unit.prototype.getAiTurnInfo = function(){
    this.aiTurnInfo = {};
    //get each movable node (including not moving)
    let map = this.owner.session.map;
    let possibleNodes = this.getMoveNodes();
    let possibleActions = [];
    let node = null;
    let tUnit = null;
    let losData = null;
    let weapon = this.getWeapon();
    //check each action on each movable node and assign them a value
    for (let i = 0; i < possibleNodes.length;i++){
        node = possibleNodes[i];
        //check attack from this node
        for (let j in this.owner.session.allUnits){
            tUnit = this.owner.session.allUnits[j];
            if (tUnit.owner == this.owner || tUnit.dead || tUnit.fainted || tUnit.isCastTimer){
                continue;
            }
            //if unit is in range from this node
            losData = this.owner.session.checkLos({unit: this,currentNode: node,node: tUnit.currentNode,weapon: weapon});
            //get attack value
            if (losData.valid){
                possibleActions.push({
                    moveNode: node,
                    attackNode: tUnit.currentNode,
                    value: tUnit.currentHealth - Math.round((weapon.eqData.damage*losData.tMod)*losData.losMod*losData.d.dMod)
                })
            }
        }
        //check ability from this node

        //check item from this node

        //check remaining move

        //assign value based on ending position
    }
    this.aiTurnInfo.actions = [];
    this.aiTurnInfo.time = Math.random()*2 + 1 + (Math.round(Math.random()) ? 0 : Math.random()*2);
    let lowest = null;
    for (let j = 0; j < possibleActions.length;j++){
        if (lowest){
            if (possibleActions[j].value < lowest.value){
                lowest = possibleActions[j]
            }
        }else{
            lowest = possibleActions[j];
        }
    }
    //value is modified by unit owner ai type (also slight randomization?)

    if (!lowest){
        this.aiTurnInfo.actions.push({
            action: 'move',
            node: possibleNodes[Math.floor(Math.random()*possibleNodes.length)]
        });
    }else{
        this.aiTurnInfo.actions.push({
            action: 'move',
            node: lowest.moveNode
        });
        this.aiTurnInfo.actions.push({
            action: 'attack',
            node: lowest.attackNode
        });
    }
    this.aiTurnInfo.actions.push({
        action: 'end',
        direction: map.cardinalDirections[Math.floor(Math.random()*map.cardinalDirections.length)]
    });
    //assign the highest value action to aiTurnInfo
    return;
}
Unit.prototype.getMoveNodes = function(){
    let unit = this;
    let map = this.owner.session.map;
    let possibleNodes = map.cubeSpiral(unit.currentNode,unit.moveLeft);
    let start;
    let end;
    let pathArr;
    let returnNodes = [];
    for(let i = 0; i < possibleNodes.length;i++){
        start = unit.currentNode;
        end = possibleNodes[i];
        if (end.unit){
            continue;
        }
        pathArr = map.findPath(start,end,{maxJump:unit.jump,startingUnit:unit});
        if(pathArr.length != 0 && pathArr.length <= unit.moveLeft+1){
            returnNodes.push(possibleNodes[i]);
        }
    }
    returnNodes.push(unit.currentNode);
    return returnNodes;
}
Unit.prototype.addToEffectArray = function(arr,obj){
    if (typeof obj.name == 'undefined'){
        console.log('no name? addOnDeath');
        console.log(obj);
    }
    arr.push(obj);
}
Unit.prototype.removeFromEffectArray = function(arr,n){
    for (let i = 0;i < arr.length;i++){
        if (arr[i]['name'] == n){
            arr.splice(i,1);
            return;
        }
    }
}
Unit.prototype.hasEffectInArray = function(arr,n){
    for (let i = 0;i < arr.length;i++){
        if (arr[i]['name'] == n){
            return true;
        }
    }
    return false;
}
Unit.prototype.getEffectInArray = function(arr,n){
    for (let i = 0;i < arr.length;i++){
        if (arr[i]['name'] == n){
            return arr[i];
        }
    }
    return false;
}

Unit.prototype.reset = function(){
    //things that reset with each new game
    this.moveLeft = this.move.value;
    //shields
    this.currentShields = this.maximumShields.value;

    //health and energy
    this.currentEnergy = this.maximumEnergy.value;
    this.currentHealth = this.maximumHealth.value;

    //death
    this.dead = false;
    this.down = false;

    this.hidden = false;

    this.reaction = 1;
    //charge
    this.charge = Math.random();
    //buffs initialize
    this.buffs = [];
}

Unit.prototype.init = function(data) {
    //Set up all stats and attributes
    this.name = data['name'];
    this.sex = data['sex'];
    this.owner = data.owner;
    this.engine = data.owner.engine;
    this.id = data.id;

    this.level = (typeof data.level == 'undefined') ? 1 : data['level'];
    this.exp = (typeof data.exp == 'undefined') ? 0 : data['exp'];
    

    this.ai = (typeof data.ai == 'undefined') ? false : data.ai;
    this.aiInfo = data.aiInfo;

    //the maximum shield value
    this.maximumShields = new Attribute();
    this.maximumShields.init({
        'id': Enums.MAXSHIELDS,
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
        'id': Enums.SHIELDRECHARGE,
        'owner': this,
        'value': 0,
        'min': -100,
        'max': 100
    });
    //the number of turns before shield recharge takes effect
    this.shieldDelay = new Attribute();
    this.shieldDelay.init({
        'id': Enums.SHIELDDELAY,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 99
    });
    this.maximumHealth = new Attribute();
    this.maximumHealth.init({
        'id': Enums.MAXHEALTH,
        'owner': this,
        'value': 100,
        'min': 1,
        'max': 99999
    });
    this.maximumEnergy = new Attribute();
    this.maximumEnergy.init({
        'id': Enums.MAXENERGY,
        'owner': this,
        'value': 100,
        'min': 1,
        'max': 999
    });
    //shields stay at null until a shield is equipped?

    this.move = new Attribute();
    this.move.init({
        'id': Enums.MOVE,
        'owner': this,
        'value': 3,
        'min': 0,
        'max': 99
    });
    this.jump = new Attribute();
    this.jump.init({
        'id': Enums.JUMP,
        'owner': this,
        'value': 2,
        'min': 0,
        'max': 99
    });
    this.vision = new Attribute();
    this.vision.init({
        'id': Enums.VISION,
        'owner': this,
        'value': 10,
        'min': 0,
        'max': 99
    });
    this.power = new Attribute();
    this.power.init({
        'id': Enums.POWER,
        'owner': this,
        'value': 25,
        'min': 0,
        'max': 9999
    });
    this.skill = new Attribute();
    this.skill.init({
        'id': Enums.SKILL,
        'owner': this,
        'value': 25,
        'min': 0,
        'max': 9999
    });

    this.tactics = new Attribute();
    this.tactics.init({
        'id': Enums.TACTICS,
        'owner': this,
        'value': 25,
        'min': 0,
        'max': 9999
    });
    this.speed = new Attribute();
    this.speed.init({
        'id': Enums.SPEED,
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
        'id': Enums.ABILITYSLOTS,
        'owner': this,
        'value': 25,
        'min': 0,
        'max': 999, //TODO should check if current absl are too high, possibly resetting abilities

        formula: function(){
            return Math.round((this.base+this.nMod)*this.pMod);
        }
    });
    this.strength = new Attribute();
    this.strength.init({
        'id': Enums.STRENGTH,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20,
        next: function(uc){
            try{this.owner.inventory.maxWeight.set(uc);}catch(e){}
        }
    });
    this.endurance = new Attribute();
    this.endurance.init({
        'id': Enums.ENDURANCE,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.agility = new Attribute();
    this.agility.init({
        'id': Enums.AGILITY,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.dexterity = new Attribute();
    this.dexterity.init({
        'id': Enums.DEXTERITY,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.willpower = new Attribute();
    this.willpower.init({
        'id': Enums.WILLPOWER,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20,
        next: function(uc){
            try{
                this.owner.physicalRes.set(uc);
                this.owner.heatRes.set(uc);
                this.owner.coldRes.set(uc);
                this.owner.acidRes.set(uc);
                this.owner.poisonRes.set(uc);
                this.owner.electricRes.set(uc);
                this.owner.pulseRes.set(uc);
                this.owner.viralRes.set(uc);
                this.owner.radiationRes.set(uc);
                this.owner.gravityRes.set(uc);
            }catch(e){}
        }
    });
    this.intelligence = new Attribute();
    this.intelligence.init({
        'id': Enums.INTELLIGENCE,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });
    this.charisma = new Attribute();
    this.charisma.init({
        'id': Enums.CHARISMA,
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
    });

    this.physicalRes = new Attribute();
    this.physicalRes.init({
        'id': Enums.RESISTANCEPHYSICAL,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 75,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.heatRes = new Attribute();
    this.heatRes.init({
        'id': Enums.RESISTANCEHEAT,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.coldRes = new Attribute();
    this.coldRes.init({
        'id': Enums.RESISTANCECOLD,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.acidRes = new Attribute();
    this.acidRes.init({
        'id': Enums.RESISTANCEACID,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.poisonRes = new Attribute();
    this.poisonRes.init({
        'id': Enums.RESISTANCEPOISON,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.electricRes = new Attribute();
    this.electricRes.init({
        'id': Enums.RESISTANCEELECTRIC,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.pulseRes = new Attribute();
    this.pulseRes.init({
        'id': Enums.RESISTANCEPULSE,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 75,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.viralRes = new Attribute();
    this.viralRes.init({
        'id': Enums.RESISTANCEVIRAL,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 75,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.radiationRes = new Attribute();
    this.radiationRes.init({
        'id': Enums.RESISTANCERADIATION,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 75,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.gravityRes = new Attribute();
    this.gravityRes.init({
        'id': Enums.RESISTANCEGRAVITY,
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 75,
        formula: function(){
            return Math.round((this.base+this.nMod+this.owner.willpower.value)*this.pMod);
        }
    });
    this.healMod = new Attribute();
    this.healMod.init({
        'id': Enums.HEALMOD,
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


    this.synthetic = new Attribute();
    this.synthetic.init({
        'id': Enums.SYNTHETIC,
        'owner': this,
        'value': (typeof data.synthetic == 'undefined') ? 0 : data['synthetic'],
        'min': 0,
        'max': 1,
        formula: function(){
            return Math.round(((this.base+this.nMod)*this.pMod)*100)/100;
        }
    });

    var Inventory = require('./inventory.js').Inventory;
    this.inventory = new Inventory();
    this.inventory.init({
        owner: this
    });
    this.inventory.setGameEngine(this.owner.engine);
    if (typeof data['inventory'] != 'undefined'){
        for (var i = 0; i < data['inventory'].length;i++){
            this.inventory.addItemUnit(data['inventory'][i]);
        }
    }
    if (data['weapon'] != null){
        this.inventory.equip(data['weapon']);
    }if (data['shield'] != null){
        this.inventory.equip(data['shield']);
    }if (data['accessory'] != null){
        this.inventory.equip(data['accessory']);
    }
    if (typeof data['strength'] != 'undefined'){
        this.strength.base = data['strength'];
        this.endurance.base = data['endurance'];
        this.agility.base = data['agility'];
        this.dexterity.base = data['dexterity'];
        this.intelligence.base = data['intelligence'];
        this.willpower.base = data['willpower'];
        this.charisma.base = data['charisma'];
        this.move.base = data['move'];
        this.power.base = data['power'];
        this.skill.base = data['skill'];
        this.tactics.base = data['tactics'];
        this.maximumHealth.base = data['maximumHealth'];
        this.maximumEnergy.base = data['maximumEnergy'];
        this.speed.base = data['speed'];
        this.abilitySlots.base = data['abilitySlots'];
        this.heatRes.base = data['heatRes'];
        this.coldRes.base = data['coldRes'];
        this.electricRes.base = data['electricRes'];
        this.acidRes.base = data['acidRes'];
        this.poisonRes.base = data['poisonRes'];
        this.gravityRes.base = data['gravityRes'];
        this.radiationRes.base = data['radiationRes'];
        this.pulseRes.base = data['pulseRes'];
        this.viralRes.base = data['viralRes'];
        this.exp = data['exp'];
        this.level = data['level'];
    }
    for (var i in this){
        if (this[i] instanceof Attribute){
            this[i].set();
        }
    }
    this.inventory.maxWeight.set();

    this.reset();
};
Unit.prototype.endTurn = function(){
    console.log('end turn!!!');
    if (this.moveUsed){ 
        this.charge -= this.owner.session.chargeMax*this.owner.session.moveChargePercent;
        this.moveUsed = false;
    }
    if (this.actionUsed){
        this.charge -= this.owner.session.chargeMax*this.owner.session.actionChargePercent;
        this.actionUsed = false;
    }
    this.charge -= this.owner.session.chargeMax*this.owner.session.waitChargePercent;
    this.endedTurn = false;

    //tick all buffs
    for (var i = 0; i < this.buffs.length;i++){
        if (!this.buffs[i].tickBeforeTurn){
            this.buffs[i].tick();
            console.log("Buff ticking -end- " + this.buffs[i].name);
            if (this.buffs[i].buffEnded){
                this.buffs.splice(i,1);
                i -= 1;
            }
        }
    }
    this.setMoveLeft(this.move.value);
    this.reaction = 1;
    this.actionUsed = false;
    this.aiTurnInfo = null;
};
Unit.prototype.beginTurn = function(){
    //tick all buffs
    console.log("Turn Start! -- " + this.name)
    for (var i = 0; i < this.buffs.length;i++){
        if (this.buffs[i].tickBeforeTurn){
            this.buffs[i].tick();
            console.log("Buff ticking -start- " + this.buffs[i].name);
            if (this.buffs[i].buffEnded){
                this.buffs.splice(i,1);
                i -= 1;
            }
        }
    }
};
Unit.prototype.damage = function(data){
    //damage based on type
    var type = Utils.udCheck(data.damageType,null,data.damageType);
    var value = Utils.udCheck(data.value,null,data.value);
    var aData = Utils.udCheck(data.actionData,[],data.actionData);
    var source = Utils.udCheck(data.source,null,data.source);
    var attackType = Utils.udCheck(data.attackType,'attack',data.attackType);

    if (source){
        if (this.owner != source.owner){
            for (let i = 0; i < this.onTakeDamage.length;i++){
                let aFunc = Actions.getAction(this.onTakeDamage[i]['name']);
                this.onTakeDamage[i].type = type;
                this.onTakeDamage[i].value = value;
                this.onTakeDamage[i].aData = aData;
                this.onTakeDamage[i].source = source;
                this.onTakeDamage[i].attackType = attackType;
                let success = aFunc(this,this.onTakeDamage[i]);
                if (success){
                    console.log('success - ' + this.onTakeDamage[i]['name'])
                    type = success.type;
                    value = success.value;
                    aData = success.aData;
                    source = source;
                    attackType = success.attackType;
                }
            }
        }
        console.log(value);
    }
    let v = 0;
    switch(type){
        case this.engine.dmgTypeEnums.Gravity:
            //does extra damage based on unit weight
            value -= Math.round(value*(this.gravityRes.value/100));
            var mod = 8/(60/this.inventory.currentWeight);
            value = Math.ceil(value*mod);
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Electric:
            //does double damage to shields
            value -= Math.round(value*(this.electricRes.value/100));
            if (this.currentShields > 0){
                if (value*2 <= this.currentShields){
                    value = value*2;
                }else{
                    value += this.currentShields/2;
                }
            }
            value = Math.round(value);
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Poison:
            //ignores shields
            console.log('poison damage!')
            value -= Math.round(value*(this.poisonRes.value/100));
            this.currentHealth -= value;
            break;
        case this.engine.dmgTypeEnums.Viral:
            //cannot damage shielded targets
            value -= Math.round(value*(this.viralRes.value/100));
            if (this.currentShields){
                value = 0;
            }
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Heat:
            //25% more dmg to organics
            value -= Math.round(value*(this.heatRes.value/100));
            v = 1+(1-this.synthetic.value)*0.25
            value = Math.round(value*v);
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Acid:
            //25% more dmg to synthetics
            value -= Math.round(value*(this.acidRes.value/100));
            v = 1+(this.synthetic.value)*0.25
            value = Math.round(value*v);
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Cold:
            value -= Math.round(value*(this.coldRes.value/100));
            //reduces move by 1
            this.setMoveLeft(this.moveLeft - 1);
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Radiation:
            //+50% dmg to organics, 0 to synthetics
            value -= Math.round(value*(this.radiationRes.value/100));
            v = (1-this.synthetic.value)*1.5
            value = Math.round(value*v);
            this._damage(value);
            break;
        case this.engine.dmgTypeEnums.Pulse:
            //+50% dmg to synthetics, 0 to organics
            value -= Math.round(value*(this.pulseRes.value/100));
            v = (this.synthetic.value)*1.5
            value = Math.round(value*v);
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
                    if (data.revive){
                        this.fainted = false;
                    }else{
                        this.currentHealth = 0;
                    }
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
    var cData = {};
    cData[Enums.ACTION] = Enums.DAMAGETEXT;
    cData[Enums.UNITID] = this.id;
    cData[Enums.TEXT] = txt;
    cData[Enums.CURRENTSHIELDS] = this.currentShields;
    cData[Enums.CURRENTHEALTH] = this.currentHealth;
    cData[Enums.FAINTED] = this.fainted;
    cData[Enums.DEAD] = this.dead;
    cData[Enums.TYPE] = type;
    aData.push(cData);

    if (source){
        if (this.owner != source.owner){
            console.log(this.onAfterTakeDamage)
            for (let i = 0; i < this.onAfterTakeDamage.length;i++){
                let aFunc = Actions.getAction(this.onAfterTakeDamage[i].name);
                this.onAfterTakeDamage[i].type = type;
                this.onAfterTakeDamage[i].value = value;
                this.onAfterTakeDamage[i].aData = aData;
                this.onAfterTakeDamage[i].source = source;
                this.onAfterTakeDamage[i].attackType = attackType;
                let success = aFunc(this,this.onAfterTakeDamage[i]);
                if (success){
                    console.log('success - ' + this.onAfterTakeDamage[i].name)
                    type = success.type;
                    value = success.value;
                    aData = success.aData;
                    source = source;
                    attackType = success.attackType;
                }
            }
        }
    }
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
    this.moveLeft = val;
    if (this.moveLeft < 0){
        this.moveLeft = 0;
    }
    var cData = {};
    cData[Enums.UNIT] = this.id;
    cData[Enums.VALUE] = this.moveLeft;
    this.owner.session.queueData(Enums.SETMOVELEFT,cData);
};
Unit.prototype.levelUp = function(update){
    //TODO save the values per level just in case the numbers change?
    if (this.level == 30){return;}
    this.level += 1;
    this.power.base += 18;
    this.power.base += this.strength.base*4.5;
    this.power.base += this.charisma.base*0.9;
    this.skill.base += 18;
    this.skill.base += this.dexterity.base*4.5;
    this.skill.base += this.charisma.base*0.9;
    this.tactics.base += 18;
    this.tactics.base += this.intelligence.base*6;
    this.tactics.base += this.charisma.base*1.2;
    this.power.set(update);
    this.tactics.set(update);
    this.skill.set(update);
    this.maximumHealth.base += 15;
    this.maximumHealth.base += this.endurance.base*3.52;
    this.maximumHealth.base += this.charisma.base*0.75;
    this.maximumHealth.set(update);
    this.abilitySlots.base += 2;
    this.abilitySlots.base += this.intelligence.base*0.3;
    this.abilitySlots.base += this.charisma.base*0.06;
    this.abilitySlots.set(update);
    this.speed.base += 5;
    this.speed.base += this.agility.base;
    this.speed.base += this.charisma.base*0.18;
    this.speed.set(update);
    //this.maximumEnergy.base += 1;
    this.maximumEnergy.base += this.willpower.base*0.5;
    this.maximumEnergy.base += this.charisma.base*0.08;
    this.maximumEnergy.set(update);

    var resTypes = ['physical','heat','cold','acid','poison','gravity','electric','radiation', 'pulse'];

    for (var i = 0; i < resTypes.length;i++){
        this[resTypes[i] + 'Res'].base += 0.1;
        this[resTypes[i] + 'Res'].base += this.willpower.base*0.12;
        this[resTypes[i] + 'Res'].base += this.charisma.base*0.021;
        this[resTypes[i] + 'Res'].set(update);
    }

    this.maximumShields.set(update);
}

Unit.prototype.getDBObj = function(){
    var dbObj = {};
    dbObj['name'] = this.name;
    dbObj['sex'] = this.sex;
    dbObj['maximumHealth'] = this.maximumHealth.base;
    dbObj['maximumEnergy'] = this.maximumEnergy.base;
    dbObj['move'] = this.move.base;
    dbObj['jump'] = this.jump.base;
    dbObj['power'] = this.power.base;
    dbObj['skill'] = this.skill.base;
    dbObj['tactics'] = this.tactics.base;
    dbObj['speed'] = this.speed.base;
    dbObj['abilitySlots'] = this.abilitySlots.base;
    //attributes
    dbObj['strength'] = this.strength.base;
    dbObj['intelligence'] = this.strength.base;
    dbObj['endurance'] = this.endurance.base;
    dbObj['willpower'] = this.willpower.base;
    dbObj['agility'] = this.agility.base;
    dbObj['dexterity'] = this.dexterity.base;
    dbObj['charisma'] = this.charisma.base;

    //level and class stuff?
    dbObj['level'] = this.level;
    dbObj['exp'] = this.exp;

    //all the information about the unit's class
    dbObj['classInfo'] = this.classInfo.getDBObj();
    //game stats (games won; damage/healing done etc)
    dbObj['gameStats'] = this.gameStats;

    dbObj['inventory'] = [];
    for (var i = 0; i < this.inventory.items.length;i++){
        dbObj['inventory'].push(this.inventory.items[i].id);
    }

    dbObj['weapon'] = this.weapon;
    dbObj['shield'] = this.shield;
    dbObj['accessory'] = this.accessory;

    dbObj['physicalRes'] = this.physicalRes.base;
    dbObj['heatRes'] = this.heatRes.base;
    dbObj['coldRes'] = this.coldRes.base;
    dbObj['acidRes'] = this.acidRes.base;
    dbObj['poisonRes'] = this.poisonRes.base;
    dbObj['electricRes'] = this.electricRes.base;
    dbObj['pulseRes'] = this.pulseRes.base;
    dbObj['radiationRes'] = this.radiationRes.base;
    dbObj['gravityRes'] = this.gravityRes.base;

    dbObj['synthetic'] = this.synthetic.value;

    dbObj['usedAbilitySlots'] = this.usedAbilitySlots;
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
    var d = {};
    d[Enums.Q] = this.currentNode.q;
    d[Enums.R] = this.currentNode.r;
    return d;
}
Unit.prototype.getClientData = function(less = false){
    //create object to send to the client
    var data = {};

    data[Enums.MAXHEALTH] = this.maximumHealth.value;
    data[Enums.MAXSHIELDS] = this.maximumShields.value;
    data[Enums.MAXENERGY] = this.maximumEnergy.value;

    data[Enums.FULL] = true; //get full data;
    data[Enums.OWNER] = this.owner.id;
    data[Enums.NAME] = this.name;
    data[Enums.SEX] = this.sex
    data[Enums.ID] = this.id;
    data[Enums.USEDABILITYSLOTS] = this.usedAbilitySlots;
    data[Enums.LEVEL] = this.level;
    data[Enums.CURRENTHEALTH] = this.currentHealth;
    data[Enums.CURRENTENERGY] = this.currentEnergy;
    data[Enums.CURRENTSHIELDS] = this.currentShields;
    data[Enums.CURRENTNODE] = this.minCurrentNode();
    data[Enums.DIRECTION] = this.direction;
    data[Enums.SPEED] = this.speed.value;
    //data.ai = this.ai;

    if (less){
        data[Enums.CHARGE] = this.charge;
        data[Enums.FULL] = false;
        data[Enums.CLASS] = this.classInfo.currentClass;
        data[Enums.CLASSINFO] = {};
        data[Enums.CLASSINFO][Enums.CURRENTCLASS] = this.classInfo.currentClass;
        return data;
    }

    data[Enums.WEAPON] = this.weapon;
    data[Enums.SHIELD] = this.shield;
    data[Enums.ACCESSORY] = this.accessory;
    data[Enums.MOVE] = this.move.value;
    data[Enums.JUMP] = this.jump.value;
    data[Enums.ABILITYSLOTS] = this.abilitySlots.value;
    data[Enums.STRENGTH] = this.strength.value;
    data[Enums.ENDURANCE] = this.endurance.value;
    data[Enums.AGILITY] = this.agility.value;
    data[Enums.DEXTERITY] = this.dexterity.value;
    data[Enums.INTELLIGENCE] = this.intelligence.value;
    data[Enums.WILLPOWER] = this.willpower.value;
    data[Enums.CHARISMA] = this.charisma.value;
    data[Enums.POWER] = this.power.value;
    data[Enums.SKILL] = this.skill.value;
    data[Enums.TACTICS] = this.tactics.value;
    data[Enums.INVENTORY] = {};
    data[Enums.INVENTORY][Enums.ITEMS] = [];
    data[Enums.INVENTORY][Enums.CURRENTWEIGHT] = this.inventory.currentWeight;
    data[Enums.INVENTORY][Enums.MAXITEMPILE] = this.inventory.maxItemPile;
    data[Enums.CLASSINFO] = this.classInfo.getClientData();
    for (var i = 0; i < this.inventory.items.length;i++){
        data[Enums.INVENTORY][Enums.ITEMS].push(this.inventory.items[i].getClientData());
    }
    data[Enums.INVENTORY][Enums.MAXWEIGHT] = this.inventory.maxWeight.value;
    return data;
}

Unit.prototype.getLessClientData = function(noNode = false){
    var data = this.getClientData(true);
    if (noNode){
        //This unit is not in LOS
        data[Enums.CURRENTNODE] = null;
    }
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
        var ab = this.owner.engine.abilities[ability];
        if (typeof ab.sCost != 'undefined'){
            s += ab.sCost;
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
    var classid = (typeof data.classid == 'undefined') ? null : data.classid;
    if (!classid){return;}
    var mod = (typeof data.mod == 'undefined') ? 1 : data.mod;
    var amt = (typeof data.amt == 'undefined') ? Math.floor(Math.min(99,Math.max(10,Math.pow(this.classInfo.totalAPValues[classid],0.48))*mod)) : data.amt;
    var updateClient = (typeof data.updateClient == 'undefined') ? false : data.updateClient;

    try{
        this.classInfo.ap[classid] += amt;
        this.classInfo.totalAPValues[classid] += amt;
        if (this.classInfo.ap[classid] > 9999){
            this.classInfo.ap[classid] = 9999;
        }
        if (updateClient){
            this.owner.engine.queuePlayer(this.owner,Enums.MODAP,Utils.createClientData(
                Enums.UNITID, this.id,
                Enums.CLASSID, classid,
                Enums.VALUE, this.classInfo.ap[classid]
            ));
        }
    }catch(e){
        console.log("unable to mod ap");
        console.log(e);
        return 0;
    }
    return amt;
}
Unit.prototype.addBuff = function(buffid, source = this){
    let buffData = this.owner.session.engine.buffs[buffid];
    let buff = new Buff(buffData);
    buff.init({
        unit: this, //the buff will perform actions on this object
        source: source
    });
}
Unit.prototype.removeBuff = function(buffid){
    console.log('trying to remove ' + buffid);
    for(var i = 0;i < this.buffs.length;i++){
        var buff = this.buffs[i];
        if (buff.buffid == buffid){
            buff.ticker = buff.duration;
            buff.end();
            this.buffs.splice(i,1);
            break;
        }
    }
}
Unit.prototype.newNode = function(node){
    console.log(node.q + ', ' + node.r)
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