var Attribute = require('./attribute.js').Attribute,
    Inventory = require('./inventory.js').Inventory;

var Unit = function(){
    this.id = null;
    
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
    this.gameInfo = null;

    this.inventory = null;

    this.weapon = null;
    this.shield = null;

    this.physicalRes = null;
    this.heatRes = null;
    this.coldRes = null;
    this.acidRes = null;
    this.poisonRes = null;
    this.electricRes = null;
    this.pulseRes = null;
    this.radiationRes = null;
    this.gravityRes = null;
}

Unit.prototype.init = function(data) {
    //Set up all stats and attributes
    this.maximumHealth = new Attribute();
    this.maximumHealth.init({
        'id': 'maxHealth',
        'owner': this,
        'value': 1000,
        'min': 1,
        'max': 9999
    });
    this.maximumEnergy = new Attribute();
    this.maximumEnergy.init({
        'id': 'maxEnergy',
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
        'id': 'spe',
        'owner': this,
        'value': 100,
        'min': 0,
        'max': 9999
    });
    this.abilitySlots = new Attribute();
    this.abilitySlots.init({
        'id': 'absl',
        'owner': this,
        'value': 20,
        'min': 0,
        'max': 999
    });
    this.strength = new Attribute();
    this.strength.init({
        'id': 'str',
        'owner': this,
        'value': 1,
        'min': 1,
        'max': 20
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
        'id': 'phyRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.heatRes = new Attribute();
    this.heatRes.init({
        'id': 'heaRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.coldRes = new Attribute();
    this.coldRes.init({
        'id': 'colRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.acidRes = new Attribute();
    this.acidRes.init({
        'id': 'aciRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.poisonRes = new Attribute();
    this.poisonRes.init({
        'id': 'poiRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.electricRes = new Attribute();
    this.electricRes.init({
        'id': 'eleRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.pulseRes = new Attribute();
    this.pulseRes.init({
        'id': 'pulRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.radiationRes = new Attribute();
    this.radiationRes.init({
        'id': 'radRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });
    this.gravityRes = new Attribute();
    this.gravityRes.init({
        'id': 'graRes',
        'owner': this,
        'value': 0,
        'min': 0,
        'max': 100
    });

    this.inventory = new Inventory();
    this.inventory.init({
        owner: this
    })
};

Unit.prototype.update = function(dt) {

}

exports.Unit = Unit;