//----------------------------------------------------------------
//user.js
//container for user info
//----------------------------------------------------------------

var Inventory = require('./inventory.js').Inventory,
    Unit = require('./unit.js').Unit,
    Utils = require('./utils.js').Utils,
    Enums = require('./enums.js').Enums,
    ClassInfo = require('./classinfo.js').ClassInfo;

var AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

function User() {
    
    return {
        userData: null,
        owner: null,
        characters: null,
        inventory: null,
        init: function(d){
            this.userData = {
                username: 'guest',
                password: 'guest',
                chatLog: [],
                admin: false,
                createDate: new Date().toJSON(),
                lastLogin: new Date().toJSON(),
                loggedin: true
            };
            this.inventory = new Inventory();
            this.inventory.init({
                owner: this.owner
            });
            this.characters = [];
            this.inventory.setGameEngine(this.owner.engine);

            if (typeof d.username != 'undefined'){
                this.userData.username = d.username;
                this.userData.password = d.password;
                this.userData.chatLog = d.chatLog;
                this.userData.admin = d.admin;
                this.userData.createDate = d.createDate;
                try{
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'tactics_userdata',
                        Key: {
                            username: this.userData.username
                        }
                    }
                    var that = this;
                    docClient.get(params, function(err, data) {
                        if (err) {
                            console.error("Unable to find user data. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log(data.Item);
                            try{
                                let char = null;
                                for (var i = 0; i < data.Item['characters'].length;i++){
                                    char = that.owner.addNewUnit(data.Item['characters'][i]);
                                    that.owner.engine.queuePlayer(that.owner,Enums.ADDNEWUNIT, that.owner.engine.createClientData(Enums.UNITID, char.getClientData()));
                                    that.characters.push(char);
                                }

                            }catch(e){
                                console.log(e);
                            }
                        }
                    });
                }catch(e){
                }
            }

            try{
                if (d.guest){
                    //add random units
                    var classes = ['medic','tech','soldier','scout', 'commando', 'splicer', 'marksman'];
                    for (var i = 0; i < 0; i++){
                        var char = new Unit();
                        //init unit
                        var sexes = ['male','female'];
                        var sex = sexes[Math.floor(Math.random()*sexes.length)];
                        var nT = sex;
                        var options = {
                            'male': ['male3'],
                            'female': ['female3']
                        }
                        var nameset = Utils.nameSet[sex+'3'];
                        var thing = options[sex][Math.floor(Math.random()*options[sex].length)];
                        var name = '' + (Math.round(Math.random()) ? nameset[Math.floor(Math.random()*nameset.length)]:Utils.generateName(thing))  + ' ' + Utils.generateName('last');
                        char.init({
                            owner: this.owner,
                            id: this.owner.engine.getId(),
                            abilitySlots: 999,
                            name: name,
                            sex: sex,
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
                        var learned = {};
                        var equipped = {}; 
                        switch(unitClass){
                            case 'medic':
                                learned = {'influence': true, "firstAid" : true, "resuscitate" : true, "healingField" : true, "recovery" : true, "sprint" : true, "precisionStrike" : true, "cripple" : true, "shieldBoost" : true, "concentrate" : true };
                                equipped = {'influence': true, "firstAid" : true, "resuscitate" : true, "healingField" : true, "recovery" : true, "sprint" : true, "precisionStrike" : true, "cripple" : true, "shieldBoost" : true, "concentrate" : true };
                                break;
                            case 'tech':
                                learned = {'dictate': true, "grenade" : true, "repair" : true, "resUp" : true, "mechCloak" : true,"corrosiveGrenade": true, "flareGrenade" : true, "cryoGrenade" : true, "shockGrenade" : true, "viralGrenade" : true, "poisonGrenade" : true, "empGrenade" : true, "unstableGrenade" : true, "voidGrenade" : true, "cybLegs" : true, "cybArms" : true, "cybBrain" : true, "cybEyes" : true, "cybLungs" : true, "cybHeart" : true };
                                equipped = {'dictate': true, "grenade" : true,"repair" : true, "resUp" : true, "mechCloak" : true,"corrosiveGrenade": true,"center": true, "flareGrenade" : true, "cryoGrenade" : true, "shockGrenade" : true, "viralGrenade" : true, "poisonGrenade" : true, "empGrenade" : true, "unstableGrenade" : true, "voidGrenade" : true, "cybLegs" : true, "cybArms" : true, "cybBrain" : true, "cybEyes" : true, "cybLungs" : true, "cybHeart" : true };
                                break;
                            case 'soldier':
                                learned = { "momentum" : true, "battlecry" : true, "heroicLeap" : true, "heroicCharge" : true, "powerAttack" : true, "powerShot" : true, "hardy" : true, "vengeance" : true, "reversal" : true, "slam" : true, "opportunity" : true, "quickDraw" : true };
                                equipped = { "momentum" : true, "battlecry" : true, "heroicLeap" : true, "heroicCharge" : true, "powerAttack" : true, "powerShot" : true, "hardy" : true, "vengeance" : true, "reversal" : true, "slam" : true, "opportunity" : true, "quickDraw" : true };
                                break;
                            case 'scout':
                                learned = {'cheer': true, "stealth" : true, "flare" : true, "dodge" : true, "evasion" : true, "quickAttack" : true, "agitate" : true, "climber" : true, "counterAttack" : true, "guile" : true, "poisonWeapon" : true, "interrupt" : true };
                                equipped = {'cheer': true, "stealth" : true, "flare" : true, "dodge" : true, "evasion" : true, "quickAttack" : true, "agitate" : true, "climber" : true, "counterAttack" : true, "guile" : true, "poisonWeapon" : true, "interrupt" : true };
                                break;
                            case 'splicer':
                                learned = {"acidSpit": true,"center": true, "fireBreath": true, "iceShards": true, "detonate": true,'thunderCross': true, 'viralCloud': true, 'empoison': true, 'energyBlast': true, 'gammaTendrils': true, 'voidScream': true};
                                equipped = {"acidSpit": true,"center": true, "fireBreath": true, "iceShards": true, "detonate": true,'thunderCross': true, 'viralCloud': true, 'empoison': true, 'energyBlast': true, 'gammaTendrils': true, 'voidScream': true};
                                break;
                            case 'commando':
                                learned = {"instruct": true, 'shout': true, 'focus': true, 'bolster': true,'energize': true,'rest': true};
                                equipped = {"instruct": true, 'shout': true, 'focus': true, 'bolster': true,'energize': true,'rest': true};
                                break;
                            case 'marksman':
                                learned = { "scan" : true, "aim": true, 'preparedShot': true,'gunner': true, 'expertSighting': true};
                                equipped = { "scan" : true, "aim": true, 'preparedShot': true,'gunner': true, 'expertSighting': true};
                                break;
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
                        this.owner.engine.queuePlayer(this.owner,Enums.ADDNEWUNIT, this.owner.engine.createClientData(Enums.UNITID, char.getClientData()));
                        this.characters.push(char);
                    }
                    let items = {
                        'gun_sidearm': 5,
                        'weapon_combatKnife': 5
                    }
                    for (var i in items){
                        this.inventory.addItem(i,items[i], true);
                    }
                }
            }catch(e){
                console.log(e);
            }

        },
        
        setLastLogin: function(date){
            //TODO this should change the actual mongodb lastLogin
            var ge = this.owner.engine;
            if (this.userData.username != 'guest'){
                ge.users[ge._userIndex[this.userData.username]].lastLogin = date;
            }
        },
        lock: function(){
            var ge = this.owner.engine;
            this.userData.loggedin = true;
            if (this.userData.username != 'guest'){
                ge.users[ge._userIndex[this.userData.username]].loggedin = true;
                try{
                    var d = this.userData;
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set loggedin = :bool",
                        ExpressionAttributeValues: {
                            ":bool": true
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update loggedin->true succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable lock user");
                    console.log(e);
                }
            }
        },
        unlock: function(){
            var ge = this.owner.engine;
            this.userData.loggedin = false;
            if (this.userData.username != 'guest'){
                ge.users[ge._userIndex[this.userData.username]].loggedin = false;
                try{
                    var d = this.userData;
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set loggedin = :bool",
                        ExpressionAttributeValues: {
                            ":bool": false
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update loggedin->false succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable to unlock user");
                    console.log(e);
                }
            }
        },
        updateDB: function(){
            var ge = this.owner.engine;
            if (this.userData.username != 'guest'){
                //Player is not a guest - update DB
                try{

                    var d = this.userData;
                    var c = [];
                    for (var i = 0; i < this.characters.length;i++){
                       c.push(this.characters[i].getDBObj());
                    }
                    var inv = [];
                    for (var i = 0; i < this.inventory.items.length;i++){
                       inv.push([this.inventory.items[i].id,this.inventory.items[i].amount]);
                    }
                    var credits = this.inventory.credits;
                    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
                    var params = {
                        TableName: 'users',
                        Key:{username: d.username},
                        UpdateExpression: "set lastLogin = :l",
                        ExpressionAttributeValues: {
                            ":l": new Date().toJSON()
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update usrLastLogin succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                    params = {
                        TableName: 'tactics_userdata',
                        Key:{username: d.username},
                        UpdateExpression: "set characters = :c, inventory = :i, credits = :cred",
                        ExpressionAttributeValues: {
                            ":c": c,
                            ":i": inv,
                            ":cred": credits
                        }
                    }
                    docClient.update(params, function(err, data) {
                        if (err) {
                            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("Update usrData succeeded:", JSON.stringify(data, null, 2));
                        }
                    });
                }catch(e){
                    console.log("DB ERROR - Unable to update user data");
                    console.log(e);
                }
            }
        },
        setOwner: function(o) {
            this.owner = o;
            var ge = this.owner.engine;
        },

        getUnit: function(id){
            for (var i = 0; i < this.characters.length;i++){
                if (this.characters[i].id == id){
                    return this.characters[i];
                }
            }
            return null;
        }


    }
}

exports.User = User;
