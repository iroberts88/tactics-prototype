
(function(window) {

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
    /*this.maximumHealth = data.maximumHealth
    this.maximumEnergy = data.
    //shields stay at null until a shield is equipped?

    this.move = data.
    this.jump = data.
    this.power = data.
    this.skill = data.
    this.speed = data.
    this.abilitySlots data.
    this.strength = data.
    this.endurance = data.
    this.agility = data.
    this.dexterity = data.
    this.willpower = data.
    this.intelligence = data.
    this.charisma = data.

    this.physicalRes = data.
    this.heatRes = data.
    this.coldRes = data.
    this.acidRes = data.
    this.poisonRes = data.
    this.electricRes = data.
    this.pulseRes = data.
    this.radiationRes = data.
    this.gravityRes = data. */
}

Unit.prototype.update = function(dt) {

}
    window.Unit = Unit;
})(window);
