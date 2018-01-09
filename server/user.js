//----------------------------------------------------------------
//user.js
//container for user info
//----------------------------------------------------------------

var mongo = require('mongodb').MongoClient,
    Inventory = require('./inventory.js').Inventory,
    Unit = require('./unit.js').Unit,
    ClassInfo = require('./classinfo.js').ClassInfo;

function User() {
    
    return {
        userData: null,
        owner: null,
        characters: null,
        inventory: null,
        init: function(data){
            this.userData = {
                userName: 'guest',
                password: 'guest',
                chatLog: [],
                admin: false,
                createDate: Date.now(),
                lastLogin: Date.now(),
                lock: true
            };
            if (typeof data.userName != 'undefined'){
                this.userData.userName = data.userName;
            }
            if (typeof data.password != 'undefined'){
                this.userData.password = data.password;
            }
            if (typeof data.chatLog != 'undefined'){
                this.userData.chatLog = data.chatLog;
            }
            if (typeof data.admin != 'undefined'){
                this.userData.admin = data.admin;
            }
            if (typeof data.createDate != 'undefined'){
                this.userData.createDate = data.createDate;
            }

            this.inventory = new Inventory();
            this.inventory.init({
                owner: this.owner
            });
            this.characters = [];
            this.inventory.setGameEngine(this.owner.gameEngine);
            try{
                if (typeof data.tactics.inventory != 'undefined'){
                    for (var i = 0; i < data.tactics.inventory.length;i++){
                        this.inventory.addItem(data.tactics.inventory[i][0],data.tactics.inventory[i][1],true);
                    }
                }
                if (typeof data.tactics.characters != 'undefined'){
                    for (var i = 0; i < data.tactics.characters.length; i++){
                        var char = new Unit();
                        //init unit
                        data.tactics.characters[i].owner = this.owner;
                        data.tactics.characters[i].id = this.owner.gameEngine.getId();
                        char.init(data.tactics.characters[i]);
                        char.classInfo = new ClassInfo();
                        char.classInfo.init({unit: char, 
                            learned: data.tactics.characters[i].classInfo.learnedAbilities,
                            equipped: data.tactics.characters[i].classInfo.equippedAbilities,
                            ap: data.tactics.characters[i].classInfo.ap});
                        char.classInfo.setBaseClass(data.tactics.characters[i].classInfo.baseId);
                        char.classInfo.setClass(data.tactics.characters[i].classInfo.classId);
                        this.owner.gameEngine.queuePlayer(this.owner,'addNewUnit', {'unit': char.getClientData()});
                        this.characters.push(char);
                    }
                }
            }catch(e){
            }

            try{
                if (data.guest){
                    //add random units
                    var classes = ['medic','tech','soldier','scout'];
                    for (var i = 0; i < 5; i++){
                        var char = new Unit();
                        //init unit
                        var sexes = ['male','female'];
                        char.init({
                            owner: this.owner,
                            id: this.owner.gameEngine.getId(),
                            abilitySlots: 999,
                            name: 'Test Character ' + (i+1),
                            sex: sexes[Math.floor(Math.random()*sexes.length)],
                            inventory: ['weapon_combatKnife','gun_sidearm','accessory_focus','shield_shield'],
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
                        var unitClass = classes[i];
                        if (i == 4){
                            unitClass = classes[Math.floor(Math.random()*classes.length)];
                        }
                        var learned = {};
                        var equipped = {}; 
                        var ap = {};
                        switch(unitClass){
                            case 'medic':
                                learned = { "firstAid" : true, "resuscitate" : true, "healingField" : true, "recovery" : true, "sprint" : true, "precisionStrike" : true, "cripple" : true, "shieldBoost" : true, "concentrate" : true };
                                equipped = { "firstAid" : true, "resuscitate" : true, "healingField" : true, "recovery" : true, "sprint" : true, "precisionStrike" : true, "cripple" : true, "shieldBoost" : true, "concentrate" : true };
                                ap = {'Medic': 9999};
                                break;
                            case 'tech':
                                learned = { "grenade" : true, "scan" : true, "repair" : true, "resUp" : true, "mechCloak" : true, "flareGrenade" : true, "cryoGrenade" : true, "shockGrenade" : true, "corrosiveGrenade" : true, "poisonGrenade" : true, "empGrenade" : true, "uraniumGrenade" : true, "voidGrenade" : true, "cybLegs" : true, "cybArms" : true, "cybBrain" : true, "cybEyes" : true, "cybLungs" : true, "cybHeart" : true };
                                equipped = { "grenade" : true, "scan" : true, "repair" : true, "resUp" : true, "mechCloak" : true, "flareGrenade" : true, "cryoGrenade" : true, "shockGrenade" : true, "corrosiveGrenade" : true, "poisonGrenade" : true, "empGrenade" : true, "uraniumGrenade" : true, "voidGrenade" : true, "cybLegs" : true, "cybArms" : true, "cybBrain" : true, "cybEyes" : true, "cybLungs" : true, "cybHeart" : true };
                                ap = {'Tech': 9999};
                                break;
                            case 'soldier':
                                learned = { "bolster" : true, "focus" : true, "heroicLeap" : true, "heroicCharge" : true, "powerAttack" : true, "powerShot" : true, "hardy" : true, "vengeance" : true, "reversal" : true, "charge" : true, "opportunity" : true, "quickDraw" : true };
                                equipped = { "bolster" : true, "focus" : true, "heroicLeap" : true, "heroicCharge" : true, "powerAttack" : true, "powerShot" : true, "hardy" : true, "vengeance" : true, "reversal" : true, "charge" : true, "opportunity" : true, "quickDraw" : true };
                                ap = {'Soldier': 9999};
                                break;
                            case 'scout':
                                learned = { "stealth" : true, "flare" : true, "dodge" : true, "evasion" : true, "quickAttack" : true, "agitate" : true, "climber" : true, "momentum" : true, "counterAttack" : true, "guile" : true, "poisonWeapon" : true, "interrupt" : true };
                                equipped = { "stealth" : true, "flare" : true, "dodge" : true, "evasion" : true, "quickAttack" : true, "agitate" : true, "climber" : true, "momentum" : true, "counterAttack" : true, "guile" : true, "poisonWeapon" : true, "interrupt" : true };
                                ap = {'Scout': 9999}
                                break;
                        }
                        char.classInfo = new ClassInfo();
                        char.classInfo.init({unit: char, 
                            learned: learned,
                            equipped: equipped,
                            ap: ap});
                        char.classInfo.setBaseClass(unitClass);
                        char.classInfo.setClass(unitClass);
                        this.owner.gameEngine.queuePlayer(this.owner,'addNewUnit', {'unit': char.getClientData()});
                        this.characters.push(char);
                    }
                }
            }catch(e){
                console.log(e);
            }

        },
        
        setLastLogin: function(date){
            //TODO this should change the actual mongodb lastLogin
            var ge = this.owner.gameEngine;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].lastLogin = date;
            }
        },
        lock: function(){
            //TODO this should change the actual mongodb lock
            var ge = this.owner.gameEngine;
            this.userData.lock = true;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].lock = true;
                try{
                    var d = this.userData;
                    mongo.connect('mongodb://127.0.0.1/lithiumAve', function(err, db) {
                        db.collection('users').update({userName: d.userName},{$set: {
                            lock: true,
                        }});
                        db.close();
                    });
                }catch(e){
                    console.log("DB ERROR - Unable lock user");
                    console.log(e);
                }
            }
        },
        unlock: function(){
            //TODO this should change the actual mongodb lock
            var ge = this.owner.gameEngine;
            this.userData.lock = false;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].lock = false;
                try{
                    var d = this.userData;
                    mongo.connect('mongodb://127.0.0.1/lithiumAve', function(err, db) {
                        db.collection('users').update({userName: d.userName},{$set: {
                            lock: false,
                        }});
                        db.close();
                    });
                }catch(e){
                    console.log("DB ERROR - Unable lock user");
                    console.log(e);
                }
            }
        },
        updateDB: function(){
            var ge = this.owner.gameEngine;
            if (this.userData.userName != 'guest'){
                //Player is not a guest - update DB
                try{

                    var d = this.userData;
                    var c = [];
                    for (var i = 0; i < this.characters.length;i++){
                       c.push(this.characters[i].getDBObj());
                    }
                    var inv = [];
                    for (var i = 0; i < this.inventory.items.length;i++){
                       inv.push([this.inventory.items[i].itemID,this.inventory.items[i].amount]);
                    }
                    mongo.connect('mongodb://127.0.0.1/lithiumAve', function(err, db) {
                        db.collection('users').update({userName: d.userName},{$set: {
                            tactics: {
                                characters: c,
                                inventory: inv
                            },
                            chatLog: d.chatLog,
                            lastLogin: d.lastLogin
                        }});
                        db.close();
                    });
                }catch(e){
                    console.log("DB ERROR - Unable to update user data");
                    console.log(e);
                }
            }
        },
        setOwner: function(o) {
            this.owner = o;
            var ge = this.owner.gameEngine;

        }

    }
}

exports.User = User;
