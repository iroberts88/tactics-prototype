
(function(window) {
    Unit = {
        getNewUnit: function(){
            return {
                id: null,
                
                //Unit Stats
                //health
                currentHealth: null,
                maximumHealth: null,
                //energy
                currentEnergy: null,
                maximumEnergy: null,

                move: null,
                jump: null,
                power: null,
                skill: null,
                abilitySlots: null,
                //shields
                currentShields: null,
                maximumShields: null,
                shieldDelay: null,
                shieldRecharge: null,
                //attributes
                strength: null,
                intelligence: null,
                endurance: null,
                willpower: null,
                agility: null,
                dexterity: null,
                charisma: null,

                //level and class stuff?
                level: null,
                exp: null,
                classInfo: null,

                physicalRes: null,
                heatRes: null,
                coldRes: null,
                acidRes: null,
                poisonRes: null,
                electricRes: null,
                pulseRes: null,
                radiationRes: null,
                gravityRes: null,

                init: function(data) {
                    //Set up all stats and attributes
                    this.maximumHealth = Attribute.getNewAttribute();
                    this.maximumHealth.init({
                        'id': 'maxHealth',
                        'owner': this,
                        'value': 1000,
                        'min': 1,
                        'max': 9999
                    });
                    this.maximumEnergy = Attribute.getNewAttribute();
                    this.maximumEnergy.init({
                        'id': 'maxEnergy',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                    //shields stay at null until a shield is equipped?

                    this.move = Attribute.getNewAttribute();
                    this.move.init({
                        'id': 'mov',
                        'owner': this,
                        'value': 3,
                        'min': 0,
                        'max': 99
                    });
                    this.jump = Attribute.getNewAttribute();
                    this.jump.init({
                        'id': 'jum',
                        'owner': this,
                        'value': 2,
                        'min': 0,
                        'max': 99
                    });
                    this.power = Attribute.getNewAttribute();
                    this.power.init({
                        'id': 'pow',
                        'owner': this,
                        'value': 10,
                        'min': 0,
                        'max': 9999
                    });
                    this.skill = Attribute.getNewAttribute();
                    this.skill.init({
                        'id': 'ski',
                        'owner': this,
                        'value': 10,
                        'min': 0,
                        'max': 9999
                    });
                    this.speed = Attribute.getNewAttribute();
                    this.speed.init({
                        'id': 'spe',
                        'owner': this,
                        'value': 100,
                        'min': 0,
                        'max': 9999
                    });
                    this.abilitySlots = Attribute.getNewAttribute();
                    this.abilitySlots.init({
                        'id': 'absl',
                        'owner': this,
                        'value': 20,
                        'min': 0,
                        'max': 999
                    });
                    this.strength = Attribute.getNewAttribute();
                    this.strength.init({
                        'id': 'str',
                        'owner': this,
                        'value': 1,
                        'min': 1,
                        'max': 999
                    });
                    this.endurance = Attribute.getNewAttribute();
                    this.endurance.init({
                        'id': 'end',
                        'owner': this,
                        'value': 1,
                        'min': 1,
                        'max': 999
                    });
                    this.agility = Attribute.getNewAttribute();
                    this.agility.init({
                        'id': 'agi',
                        'owner': this,
                        'value': 1,
                        'min': 1,
                        'max': 999
                    });
                    this.dexterity = Attribute.getNewAttribute();
                    this.dexterity.init({
                        'id': 'dex',
                        'owner': this,
                        'value': 1,
                        'min': 1,
                        'max': 999
                    });
                    this.willpower = Attribute.getNewAttribute();
                    this.willpower.init({
                        'id': 'wil',
                        'owner': this,
                        'value': 1,
                        'min': 1,
                        'max': 999
                    });
                    this.intelligence = Attribute.getNewAttribute();
                    this.intelligence.init({
                        'id': 'int',
                        'owner': this,
                        'value': 1,
                        'min': 1,
                        'max': 999
                    });
                    this.charisma = Attribute.getNewAttribute();
                    this.charisma.init({
                        'id': 'cha',
                        'owner': this,
                        'value': 1,
                        'min': 1,
                        'max': 999
                    });

                    this.physicalRes = Attribute.getNewAttribute();
                    this.physicalRes.init({
                        'id': 'phyRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.heatRes = Attribute.getNewAttribute();
                    this.heatRes.init({
                        'id': 'heaRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.coldRes = Attribute.getNewAttribute();
                    this.coldRes.init({
                        'id': 'colRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.acidRes = Attribute.getNewAttribute();
                    this.acidRes.init({
                        'id': 'aciRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.poisonRes = Attribute.getNewAttribute();
                    this.poisonRes.init({
                        'id': 'poiRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.electricRes = Attribute.getNewAttribute();
                    this.electricRes.init({
                        'id': 'eleRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.pulseRes = Attribute.getNewAttribute();
                    this.pulseRes.init({
                        'id': 'pulRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.radiationRes = Attribute.getNewAttribute();
                    this.radiationRes.init({
                        'id': 'radRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                    this.gravityRes = Attribute.getNewAttribute();
                    this.gravityRes.init({
                        'id': 'graRes',
                        'owner': this,
                        'value': 0,
                        'min': 0,
                        'max': 100
                    });
                },

                update: function(dt) {

                },
            }
        }
    }
    window.Unit = Unit;
})(window);
