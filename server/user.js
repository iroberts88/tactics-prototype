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
                stats: {
                    soloGamesPlayed : 0,
                    coopGamesPlayed : 0,
                    coopLevelRecord: 0,
                    vsGamesPlayed : 0,
                    starsGamesPlayed : 0,
                    soloHighScore : 0,
                    coopHighScore : 0,
                    vsGamesWon : 0,
                    starsLongestGame : 0,
                    soloLevelRecord : 0
                },
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
            if (typeof data.stats != 'undefined'){
                this.userData.stats = data.stats;
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
        
        soloGamePlayed: function(){
            var ge = this.owner.gameEngine;
            this.userData.stats.soloGamesPlayed += 1;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].stats.soloGamesPlayed += 1;
            }
        },
        coopGamePlayed: function(){
            var ge = this.owner.gameEngine;
            this.userData.stats.coopGamesPlayed += 1;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].stats.coopGamesPlayed += 1;
            }
        },
        vsGamePlayed: function(){
            var ge = this.owner.gameEngine;
            this.userData.stats.vsGamesPlayed += 1;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].stats.vsGamesPlayed += 1;
            }
        },
        starGamePlayed: function(){
            var ge = this.owner.gameEngine;
            this.userData.stats.starsGamesPlayed += 1;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].stats.starsGamesPlayed += 1;
            }
        },
        vsGameWon: function(){
            var ge = this.owner.gameEngine;
            this.userData.stats.vsGamesWon += 1;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].stats.vsGamesWon += 1;
            }
        },
        checkSoloHighScore: function(s){
            //check personal high score
            var ge = this.owner.gameEngine;
            if (this.userData.stats.soloHighScore < s){
                this.userData.stats.soloHighScore = s;
                if (this.userData.userName != 'guest'){
                    ge.users[ge._userIndex[this.userData.userName]].stats.soloHighScore = s;
                }
            }
            //then check global high score
        },
        checkCoopHighScore: function(s){
            var ge = this.owner.gameEngine;
            if (this.userData.stats.coopHighScore < s){
                this.userData.stats.coopHighScore = s;
                if (this.userData.userName != 'guest'){
                    ge.users[ge._userIndex[this.userData.userName]].stats.coopHighScore = s;
                }
            }
        },
        checkCoopLevelRecord: function(s){
            var ge = this.owner.gameEngine;
            if (this.userData.stats.coopLevelRecord < s){
                this.userData.stats.coopLevelRecord = s;
                if (this.userData.userName != 'guest'){
                    ge.users[ge._userIndex[this.userData.userName]].stats.coopLevelRecord = s;
                }
            }
        },
        checkStarsLongestGame: function(s){
            var ge = this.owner.gameEngine;
            if (this.userData.stats.starsLongestGame < s){
                this.userData.stats.starsLongestGame = s;
                if (this.userData.userName != 'guest'){
                    ge.users[ge._userIndex[this.userData.userName]].stats.starsLongestGame = s;
                }
            }
        },
        checkSoloLevelRecord: function(s){
            var ge = this.owner.gameEngine;
            if (this.userData.stats.soloLevelRecord < s){
                this.userData.stats.soloLevelRecord = s;
                if (this.userData.userName != 'guest'){
                    ge.users[ge._userIndex[this.userData.userName]].stats.soloLevelRecord = s;
                }
            }
        },
        addToChatLog: function(str){
            var ge = this.owner.gameEngine;
            if (this.userData.userName != 'guest'){
                this.userData.chatLog.push(str);
                ge.users[ge._userIndex[this.userData.userName]].chatLog.push(str);
            }
        },
        setLastLogin: function(t){
            var ge = this.owner.gameEngine;
            if (this.userData.userName != 'guest'){
                //Player is not a guest - update last login Time
                this.userData.lastLogin = t;
                ge.users[ge._userIndex[this.userData.userName]].lastLogin = t;
            }
        },

        lock: function(){
            var ge = this.owner.gameEngine;
            this.userData.lock = true;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].lock = true;
            }
        },
        unlock: function(){
            var ge = this.owner.gameEngine;
            this.userData.lock = false;
            if (this.userData.userName != 'guest'){
                ge.users[ge._userIndex[this.userData.userName]].lock = false;
            }
        },
        updateDB: function(){
            var ge = this.owner.gameEngine;
            if (this.userData.userName != 'guest'){
                //Player is not a guest - update last login Time
                try{
                    var d = this.userData;
                    mongo.connect('mongodb://127.0.0.1/wisp', function(err, db) {
                        db.collection('users').update({userName: d.userName},{$set: {
                            stats: d.stats,
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
