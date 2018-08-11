
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
        this.moveLeft = null;
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

        this.sprite = null;

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

        this.turnSprite = null;
        this.infoPane = null;

        this.visible = null;

        this.chargePercent = null;

        this.height = 2;
    };

    Unit.prototype.init = function(data) {
        //Set up all stats and attributes
        this.maximumHealth = data.maximumHealth;
        this.maximumEnergy = data.maximumEnergy;
        this.maximumShields = data.maximumShields;
        //shields stay at null until a shield is equipped?

        this.full = data.full;
        this.visible = (typeof data.visible == 'undefined') ? true : data.visible;
        this.direction = data.direction;
        if (data.currentNode){
            this.currentNode = Game.map.axialMap[data.currentNode.q][data.currentNode.r];
        }else{
            this.currentNode = data.currentNode;
        }
        this.currentHealth = data.health;
        this.currentEnergy = data.energy;
        this.currentShields = data.shields;
        this.move = data.move;
        this.moveLeft = data.move;
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

        this.chargePercent = 0;

        this.physicalRes = data.physicalRes;
        this.heatRes = data.heatRes;
        this.coldRes = data.coldRes;
        this.acidRes = data.acidRes;
        this.poisonRes = data.poisonRes;
        this.electricRes = data.electricRes;
        this.pulseRes = data.pulseRes;
        this.radiationRes = data.radiationRes;
        this.gravityRes = data.gravityRes;

        this.owner = data.owner;
        this.name = data.name;
        this.sex = data.sex;
        this.id = data.id;
        if (data.inventory){
            this.inventory = new Inventory();
            this.inventory.init(data.inventory);
        }else{
            this.inventory = null;
        }
        this.level = data.level;
        this.exp = data.exp;
        this.classInfo = data.classInfo;
        if (data.direction){
            //initialize the sprite
            var dir = '';
            dir = window.currentGameMap.dirArray[(window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations];
            this.sprite = Graphics.getSprite('unit_base_'+ dir + '_');
            this.sprite.unitID = this.id;
            this.sprite.pSprite = true;
            this.sprite.scale.x = 0.6;
            this.sprite.scale.y = 0.6;
            var p = (window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations;
            if (p >= 1 && p <= 5){
                this.sprite.scale.x = -0.6;
            }
            this.sprite.anchor.x = 0.5;
            this.sprite.anchor.y = 0.85;
            var colors = {
                'tech': 0xFFFF00,
                'soldier': 0xFF0000,
                'medic': 0x00FF00,
                'scout': 0x42f1f4
            };
            this.sprite.tint = colors[this.classInfo.currentClass.toLowerCase()];
            this.sprite.gotoAndPlay(Math.floor(Math.random()*8))
        }
        this.weapon = data.weapon;
        this.shield = data.shield;
        this.accessory = data.accessory;

        this.usedAbilitySlots = data.usedAbilitySlots;
    };
    Unit.prototype.setChargePercent = function(val){
        if (val > 1){
            val = 1;
        }
        this.chargePercent = Math.round(val*100)
    }
    Unit.prototype.setNewDirection = function(direction){
        var frame = this.sprite.currentFrame;
        this.direction = direction;
        var dir = window.currentGameMap.dirArray[(window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations];
        this.sprite.textures = Graphics.getResource('unit_base_'+ dir + '_');
        this.sprite.scale.x = 0.6 * window.currentGameMap.ZOOM_SETTINGS[window.currentGameMap.currentZoomSetting];
        this.sprite.scale.y = 0.6 * window.currentGameMap.ZOOM_SETTINGS[window.currentGameMap.currentZoomSetting];
        var p = (window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations
        if (p >= 1 && p <= 5){
            this.sprite.scale.x = -0.6 * window.currentGameMap.ZOOM_SETTINGS[window.currentGameMap.currentZoomSetting];
        }
        this.sprite.gotoAndPlay(frame)
    };
    Unit.prototype.setCurrentNode = function(q,r,map){
        this.currentNode = map.axialMap[q][r];
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
