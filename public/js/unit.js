
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
        //the unit's current Inventory
        this.inventory = null;
        //game stats (games won; damage/healing done etc)
        this.gameInfo = null;

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

        this.usedAbilitySlots = 0;
    };

    Unit.prototype.init = function(data) {
        //Set up all stats and attributes
        this.maximumHealth = data.maximumHealth;
        this.maximumEnergy = data.maximumEnergy;
        //shields stay at null until a shield is equipped?

        this.move = data.move;
        this.jump = data.jump;
        this.power = data.power;
        this.skill = data.skill;
        this.speed = data.speed;
        this.abilitySlots = data.abilitySlots;
        this.strength = data.strength;
        this.endurance = data.endurance;
        this.agility = data.agility;
        this.dexterity = data.dexterity;
        this.willpower = data.willpower;
        this.intelligence = data.intelligence;
        this.charisma = data.charisma;

        this.physicalRes = data.physicalRes;
        this.heatRes = data.heatRes;
        this.coldRes = data.coldRes;
        this.acidRes = data.acidRes;
        this.poisonRes = data.poisonRes;
        this.electricRes = data.electricRes;
        this.pulseRes = data.pulseRes;
        this.radiationRes = data.radiationRes;
        this.gravityRes = data.gravityRes;

        this.name = data.name;
        this.sex = data.sex;
        this.id = data.id;
        this.inventory = new Inventory();
        this.inventory.init(data.inventory);
        this.level = data.level;
        this.exp = data.exp;
        this.classInfo = data.classInfo;

        this.weapon = data.weapon;
        this.shield = data.shield;
        this.accessory = data.accessory;

        this.usedAbilitySlots = data.usedAbilitySlots;
    };

    Unit.prototype.equip = function(index) {
        var item = this.inventory.items[index];
        if (item.type == 'weapon' || item.type == 'gun'){
            this.weapon = index;
        }else if (item.type == 'shield'){
            this.shield = index;
        }else if (item.type == 'accessory'){
            this.accessory = index;
        }
    };
    Unit.prototype.unEquip = function(index) {
        var item = this.inventory.items[index];
        if (item.type == 'weapon' || item.type == 'gun'){
            this.weapon = null;
        }else if (item.type == 'shield'){
            this.shield = null;
        }else if (item.type == 'accessory'){
            this.accessory = null;
        }
    };
    Unit.prototype.setStat = function(id,amt){
        try{
            switch(id){
                case 'sh':
                    this.maximumShields = amt;
                    break;
                case 'shdel':
                    this.shieldDelay = amt;
                    break;
                case 'shrec':
                    this.shieldRecharge = amt;
                    break;
                case 'absl':
                    this.abilitySlots = amt;
                    break;
                case 'str':
                    this.strength = amt;
                    break;
                case 'end':
                    this.endurance = amt;
                    break;
                case 'agi':
                    this.agility = amt;
                    break;
                case 'dex':
                    this.dexterity = amt;
                    break;
                case 'int':
                    this.intelligence = amt;
                    break;
                case 'wil':
                    this.willpower = amt;
                    break;
                case 'char':
                    this.charisma = amt;
                    break;
                case 'hp':
                    this.maximumHealth = amt;
                    break;
                case 'energy':
                    this.maximumEnergy = amt;
                    break;
                case 'pwr':
                    this.power = amt;
                    break;
                case 'skl':
                    this.skill = amt;
                    break;
                case 'mov':
                    this.move = amt;
                    break;
                case 'jmp':
                    this.jump = amt;
                    break;
                case 'spd':
                    this.speed = amt;
                    break;
                case 'pRes':
                    this.physicalRes = amt;
                    break;
                case 'hres':
                    this.heatRes = amt;
                    break;
                case 'cRes':
                    this.coldRes = amt;
                    break;
                case 'aRes':
                    this.acidRes = amt;
                    break;
                case 'eRes':
                    this.electricRes = amt;
                    break;
                case 'poRes':
                    this.poisonRes = amt;
                    break;
                case 'puRes':
                    this.pulseRes = amt;
                    break;
                case 'rRes':
                    this.radiationRes = amt;
                    break;
                case 'gRes':
                    this.gravityRes = amt;
                    break;
                case 'wgt':
                    this.inventory.maxWeight = amt;
                    break;
            }
        }catch(e){
            console.log("unable to get stat " + id);
            console.log(e);
        }
    };

    window.Unit = Unit;
})(window);
