//----------------------------------------------------------------
//aiplayer.js
//----------------------------------------------------------------
var Attribute = require('./attribute.js').Attribute,
    Ability = require('./ability.js').Ability,
    Actions = require('./actions.js').Actions,
    Enums = require('./enums.js').Enums,
    Inventory = require('./inventory.js').Inventory,
    Unit = require('./unit.js').Unit,
    Utils = require('./utils.js').Utils,
    ClassInfo = require('./classinfo.js').ClassInfo;


var AiPlayer = function(){
    this.MAX_UNITS = 30;
    this.engine = null;
    this.session = null;
    this.mapData = null;

    this.ready = null;

    //game variables
    this.identifiedUnits = {};
    this.unitsNotInLos = {};
    this.myUnits = {};
};

AiPlayer.prototype.init = function (data) {
    this.ready = false;

    //AI Types

    //aggressive - offensive actions are weighed more
    //defensive - defensive actions are weighed more
    //tactical - supportive actions are weighed more
    //balanced - all actions are weighed equally
    //x elemental - actions with a certain element are favored

    //reputations

    //neutral - base
    //benevolant - will generally spare your unit instead of killing them, less money reward
    //merciful - will generally spare your unit instead of killing them, less money reward
    this.type = data.type;

    if (data.units){
        //supply specific units
    }else{
        //randomize units
        //add random units
        var classes = ['medic','tech','soldier','scout', 'commando', 'splicer', 'marksman'];
        for (var i = 0; i < 5; i++){
            var char = new Unit();
            //init unit
            var sexes = ['male','female'];
            var sex = sexes[Math.floor(Math.random()*sexes.length)];
            var nT = sex;
            var options = {
                'male': ['male','male2','romanMale','male3'],
                'female': ['female','female2','romanFemale','female3']
            }
            var thing = options[sex][Math.floor(Math.random()*options[sex].length)];
            var name = '' + Utils.generateName(thing) + ' ' + Utils.generateName('last');
            char.init({
                owner: this,
                id: this.engine.getId(),
                abilitySlots: 999,
                name: name,
                sex: sexes[Math.floor(Math.random()*sexes.length)],
                inventory: ['weapon_combatKnife','gun_sidearm','accessory_focus','shield_shield', 'compound_healing'],
                weapon: Math.floor(Math.random()*2),
                shield: 3,
                accessory: 2
            });
            var stats = ['strength','endurance','agility','dexterity','willpower','intelligence','charisma'];
            for (var j = 0;j < 20;j++){
                var randStat = stats[Math.floor(Math.random()*stats.length)];
                char[randStat].base += 1;
                char[randStat].set();
            }
            var unitClass = classes[Math.floor(Math.random()*classes.length)];
            if (i == 4){
                unitClass = classes[Math.floor(Math.random()*classes.length)];
            }
            var abilities = {};
            var learned = {};
            var equipped = {}
            switch(unitClass){
                case 'medic':
                    abilities = ['influence', "firstAid" , "resuscitate" , "healingField" , "recovery" , "sprint" , "precisionStrike" , "cripple" , "shieldBoost" , "concentrate"  ];
                    break;
                case 'tech':
                    abilities = ['dictate', "grenade" , "repair" , "resUp" , "mechCloak" , "corrosiveGrenade", "flareGrenade" , "cryoGrenade" , "shockGrenade" , "viralGrenade" , "poisonGrenade" , "empGrenade" , "unstableGrenade" , "voidGrenade" , "cybLegs" , "cybArms" , "cybBrain" , "cybEyes" , "cybLungs" , "cybHeart"  ];
                    break;
                case 'soldier':
                    abilities = [ "momentum" , "battlecry" , "heroicLeap" , "heroicCharge" , "powerAttack" , "powerShot" , "hardy" , "vengeance" , "reversal" , "slam" , "opportunity" , "quickDraw"  ];
                    break;
                case 'scout':
                    abilities = ['cheer', "stealth" , "flare" , "dodge" , "evasion" , "quickAttack" , "agitate" , "climber" , "counterAttack" , "guile" , "poisonWeapon" , "interrupt"  ];
                    break;
                case 'splicer':
                    abilities = ["acidSpit", "center", "fireBreath", "iceShards", "detonate", 'thunderCross', 'viralCloud', 'empoison', 'energyBlast', 'gammaTendrils', 'voidScream'];
                    break;
                case 'commando':
                    abilities = ["instruct", 'shout', 'focus', 'bolster', 'energize', 'rest'];
                    break;
                case 'marksman':
                    abilities = [ "scan" , "aim", 'preparedShot', 'gunner', 'expertSighting'];
                    break;
            }

            for (var k = 0; k < Math.ceil(Math.random()*4);k++){
                let randAb = abilities[Math.floor(Math.random()*abilities.length)]
                learned[randAb] = true;
                equipped[randAb] = true;
            }
            char.classInfo = new ClassInfo();
            char.classInfo.setUnit(char);
            char.classInfo.setBaseClass(unitClass);
            char.classInfo.setClass(unitClass);
            char.classInfo.init({unit: char, 
                learned: learned,
                equipped: equipped});
            char.levelUp();
            char.level -= 1;
            this.myUnits.push(char);
        }
    }

};
    
AiPlayer.prototype.getUnit = function(id){
    //returns a unit with the given ID
    return null;
}
AiPlayer.prototype.tick = function(deltaTime){
   
};


AiPlayer.prototype.hasUnit = function(id){
    return false;
}

AiPlayer.prototype.getUnitsNotInLos = function(){
    for (var i in this.session.players){
        if (this.session.players[i] == this){
            continue;
        }
        var enemyPlayer = this.session.players[i];
        for (var u in enemyPlayer.myUnits){
            //default to NO LOS
            var los = 1;
            for (var mu in this.myUnits){
                //check if the unit is out of vision distance
                if (this.session.map.cubeDistance(enemyPlayer.myUnits[u].currentNode,this.myUnits[mu].currentNode) > this.myUnits[mu].vision.value){
                    continue;
                }
                //check if the unit is within LOS
                los = this.session.map._getLOS(enemyPlayer.myUnits[u].currentNode,this.myUnits[mu].currentNode);
                if (los != 1){break;}
            }
            if (los == 1){
                this.unitsNotInLos[u] = true;
            }else{
                this.unitsNotInLos[u] = false;
            }
        }
    }
};

AiPlayer.prototype.setEngine = function(engine){
    this.engine = engine;
}

AiPlayer.prototype.setSession = function(session){
    this.session = session;
}

exports.AiPlayer = AiPlayer;
