//----------------------------------------------------------------
//user.js
//container for user info
//----------------------------------------------------------------

var Inventory = require('./inventory.js').Inventory,
    Unit = require('./unit.js').Unit,
    Utils = require('./utils.js').Utils,
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
            this.inventory.setGameEngine(this.owner.gameEngine);

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
                            try{
                                var c = data.Item.characters;
                                var inv = data.Item.inventory;
                                if (typeof inv != 'undefined'){
                                    for (var i = 0; i < inv.length;i++){
                                        that.inventory.addItem(inv[i][0],inv[i][1],true);
                                    }
                                }
                                if (typeof c != 'undefined'){
                                    for (var i = 0; i < c.length; i++){
                                        var char = new Unit();
                                        //init unit
                                        c[i].owner = that.owner;
                                        c[i].id = that.owner.gameEngine.getId();
                                        char.init(c[i]);
                                        char.classInfo = new ClassInfo();
                                        char.classInfo.init({unit: char, 
                                            learned: c[i].classInfo.learnedAbilities,
                                            equipped: c[i].classInfo.equippedAbilities,
                                            ap: c[i].classInfo.ap});
                                        char.classInfo.setBaseClass(c[i].classInfo.baseId);
                                        char.classInfo.setClass(c[i].classInfo.classId);
                                        that.owner.gameEngine.queuePlayer(that.owner,'addNewUnit', {'unit': char.getClientData()});
                                        that.characters.push(char);
                                    }
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
                    var classes = ['medic','tech','soldier','scout'];
                    for (var i = 0; i < 5; i++){
                        var char = new Unit();
                        //init unit
                        var sexes = ['male','female'];
                        var sex = sexes[Math.floor(Math.random()*sexes.length)];
                        var nT = sex;
                        var options = {
                            'male': ['male','male2','romanMale','romanLastM','egyptian'],
                            'female': ['female','female2','romanFemale','romanLastF','egyptian']
                        }
                        var thing = options[sex][Math.floor(Math.random()*options[sex].length)];
                        var name = '' + Utils.generateName(thing);
                        char.init({
                            owner: this.owner,
                            id: this.owner.gameEngine.getId(),
                            abilitySlots: 999,
                            name: name,
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
                        //var unitClass = 'soldier';
                        var learned = {};
                        var equipped = {}; 
                        var ap = {};
                        switch(unitClass){
                            case 'medic':
                                learned = {'influence': true, "firstAid" : true, "resuscitate" : true, "healingField" : true, "recovery" : true, "sprint" : true, "precisionStrike" : true, "cripple" : true, "shieldBoost" : true, "concentrate" : true };
                                equipped = {'influence': true, "firstAid" : true, "resuscitate" : true, "healingField" : true, "recovery" : true, "sprint" : true, "precisionStrike" : true, "cripple" : true, "shieldBoost" : true, "concentrate" : true };
                                ap = {'Medic': 9999};
                                break;
                            case 'tech':
                                learned = {'instruct': true, "grenade" : true, "scan" : true, "repair" : true, "resUp" : true, "mechCloak" : true, "flareGrenade" : true, "cryoGrenade" : true, "shockGrenade" : true, "corrosiveGrenade" : true, "poisonGrenade" : true, "empGrenade" : true, "unstableGrenade" : true, "voidGrenade" : true, "cybLegs" : true, "cybArms" : true, "cybBrain" : true, "cybEyes" : true, "cybLungs" : true, "cybHeart" : true };
                                equipped = {'instruct': true, "grenade" : true, "scan" : true, "repair" : true, "resUp" : true, "mechCloak" : true, "flareGrenade" : true, "cryoGrenade" : true, "shockGrenade" : true, "corrosiveGrenade" : true, "poisonGrenade" : true, "empGrenade" : true, "unstableGrenade" : true, "voidGrenade" : true, "cybLegs" : true, "cybArms" : true, "cybBrain" : true, "cybEyes" : true, "cybLungs" : true, "cybHeart" : true };
                                ap = {'Tech': 9999};
                                break;
                            case 'soldier':
                                learned = { "momentum" : true,"aim": true,"shout": true, "bolster" : true, "focus" : true, "heroicLeap" : true, "heroicCharge" : true, "powerAttack" : true, "powerShot" : true, "hardy" : true, "vengeance" : true, "reversal" : true, "slam" : true, "opportunity" : true, "quickDraw" : true };
                                equipped = { "momentum" : true,"aim": true,"shout": true, "bolster" : true, "focus" : true, "heroicLeap" : true, "heroicCharge" : true, "powerAttack" : true, "powerShot" : true, "hardy" : true, "vengeance" : true, "reversal" : true, "slam" : true, "opportunity" : true, "quickDraw" : true };
                                ap = {'Soldier': 9999};
                                break;
                            case 'scout':
                                learned = {'cheer': true, "stealth" : true, "flare" : true, "dodge" : true, "evasion" : true, "quickAttack" : true, "agitate" : true, "climber" : true, "counterAttack" : true, "guile" : true, "poisonWeapon" : true, "interrupt" : true };
                                equipped = {'cheer': true, "stealth" : true, "flare" : true, "dodge" : true, "evasion" : true, "quickAttack" : true, "agitate" : true, "climber" : true, "counterAttack" : true, "guile" : true, "poisonWeapon" : true, "interrupt" : true };
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
                        for (var j = 0; j <19;j++){
                            char.levelUp(false);
                        }
                        this.owner.gameEngine.queuePlayer(this.owner,'addNewUnit', {'unit': char.getClientData()});
                        this.characters.push(char);
                    }

                    for (var i in this.owner.gameEngine.items){
                        this.inventory.addItem(this.owner.gameEngine.items[i].itemid,5, true);
                    }
                }
            }catch(e){
                console.log(e);
            }

        },
        
        setLastLogin: function(date){
            //TODO this should change the actual mongodb lastLogin
            var ge = this.owner.gameEngine;
            if (this.userData.username != 'guest'){
                ge.users[ge._userIndex[this.userData.username]].lastLogin = date;
            }
        },
        lock: function(){
            var ge = this.owner.gameEngine;
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
            var ge = this.owner.gameEngine;
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
            var ge = this.owner.gameEngine;
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
                       inv.push([this.inventory.items[i].itemID,this.inventory.items[i].amount]);
                    }
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
                        UpdateExpression: "set characters = :c, inventory = :i",
                        ExpressionAttributeValues: {
                            ":c": c,
                            ":i": inv
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
            var ge = this.owner.gameEngine;

        }

    }
}

exports.User = User;
