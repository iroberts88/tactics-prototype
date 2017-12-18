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
            this.inventory.setGameEngine(this.owner.gameEngine);
            if (typeof data.tactics.inventory != 'undefined'){
                for (var i = 0; i < data.tactics.inventory.length;i++){
                    this.inventory.addItem(data.tactics.inventory[i][0],data.tactics.inventory[i][1],true);
                }
            }
            this.characters = [];
            if (typeof data.tactics.characters != 'undefined'){
                for (var i = 0; i < data.tactics.characters.length; i++){
                    var char = new Unit();
                    //init unit
                    data.tactics.characters[i].owner = this.owner;
                    data.tactics.characters[i].id = this.owner.gameEngine.getId();
                    //init classData
                    //char.classInfo = new ClassInfo();
                    //char.classInfo.init({unit: char, 
                    //    learned: });
                    //char.classInfo.setBaseClass();
                    //char.classInfo.setClass();
                    console.log(char);
                }
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
