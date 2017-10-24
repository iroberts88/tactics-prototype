//----------------------------------------------------------------
//user.js
//container for user info
//----------------------------------------------------------------

var mongo = require('mongodb').MongoClient;

function User() {
    
    return {
        userData: null,
        owner: null,
        init: function(data){
            this.userData = {
                userName: 'guest',
                password: 'guest',
                characters: [],
                inventory: [],
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
            if (typeof data.characters != 'undefined'){
                this.userData.characters = data.characters;
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
                    mongo.connect('mongodb://127.0.0.1/lithiumAve', function(err, db) {
                        db.collection('users').update({userName: d.userName},{$set: {
                            characters: d.characters,
                            inventory: d.inventory,
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
