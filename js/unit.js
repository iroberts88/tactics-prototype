
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

                level: null,

                exp: null,

                physicalRes: null,
                heatRes: null,
                coldRes: null,
                corrosiveRes: null,
                poisonRes: null,
                electricRes: null,
                pulseRes: null,
                radiationRes: null,
                gravityRes: null,

                init: function(data) {
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

                    //strength directly increases melee damage
                    //also increases jump at increments of 150
                    //heavy weapons may have penalty for being below a certain str threshold
                    this.strength = Attribute.getNewAttribute();
                    this.strength.init({
                        'id': 'str',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                    //endurance directly increase max health and max energy
                    this.endurance = Attribute.getNewAttribute();
                    this.endurance.init({
                        'id': 'end',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                    //directly increases initiative order
                    //also increases move at increments of 150
                    this.agility = Attribute.getNewAttribute();
                    this.agility.init({
                        'id': 'agi',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                    //directly increases ballistic damage
                    this.dexterity = Attribute.getNewAttribute();
                    this.dexterity.init({
                        'id': 'dex',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                    //directly increases resistances to all types of damage
                    this.willpower = Attribute.getNewAttribute();
                    this.willpower.init({
                        'id': 'wil',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                    //increases the amount of abilities you can have active at a time
                    //each ability has a base cost, non class abilities cost 3x
                    this.intelligence = Attribute.getNewAttribute();
                    this.intelligence.init({
                        'id': 'int',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                    //directly increases support ability effectiveness
                    this.charisma = Attribute.getNewAttribute();
                    this.charisma.init({
                        'id': 'cha',
                        'owner': this,
                        'value': 100,
                        'min': 1,
                        'max': 999
                    });
                },

                update: function(dt) {

                },
            }
        }
    }
    window.Unit = Unit;
})(window);
