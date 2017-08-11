(function(window) {

    AcornSetup = {
    
        net: function() {
            Acorn.Net.on('connInfo', function (data) {
              console.log('Connected to server: Info Received');
              console.log(data);
              Acorn.Net.ready = true;
              checkReady();
            });

            Acorn.Net.on('gameInfo', function (data) {
              console.log('Connected to game session: Info Received');
              console.log(data);
              Acorn.changeState('inGame');
              //Init Player
              mainObj.playerId = data.id;
              Player.init(data);
              Player.id = data.id;
              Party.init();
              Enemies.init();
              for (var i = 0; i < data.players.length; i++){
                if (data.players[i].id != data.playerId){
                    data.players[i].tint = 0xff1924;
                    Party.addNewMember(data.players[i]);
                }
              }

              for (var i = 0; i < data.enemies.length; i++){
                Enemies.addEnemy(data.enemies[i]);
              }
            });

            Acorn.Net.on('addPlayerWisp', function (data) {
              if (data.id != mainObj.playerId){
                data.tint = 0xff1924;
                Party.addNewMember(data);
              }
            });

            Acorn.Net.on('loggedIn', function (data) {
              Player.userData = data;
              Settings.toggleCredentials(false);
              Acorn.changeState('mainMenu');
            });

            Acorn.Net.on('logout', function (data) {
              Player.userData = null;
              Acorn.changeState('loginScreen');
            });

            Acorn.Net.on('setLoginErrorText', function (data) {
              try{
                var state = Acorn.states['loginScreen'];
                switch(data.text){
                    case 'wp':
                        state.loginErrorText.text = 'Username or password incorrect.';
                        break;
                    case 'ple':
                        state.loginErrorText.text = 'Password must be between 8 and 16 characters.';
                        break;
                    case 'ule':
                        state.loginErrorText.text = 'Username must be between 3 and 16 characters.';
                        break;
                    case 'uiu':
                        state.loginErrorText.text = 'Username is already in use.';
                        break;
                    case 'l':
                        state.loginErrorText.text = 'User is already logged in.';
                        break;
                }
              }catch(e){}
            });

            Acorn.Net.on('warning', function (data) {
              Player.addWarning(data.time, data.level);
            });

            Acorn.Net.on('backToMainMenu', function (data) {
                try{
                    Player.userData = data.userData;
                    Acorn.changeState('mainMenu');
                }catch(e){
                    console.log(e);
                }
            });

            Acorn.Net.on('youLose', function (data) {
                if (!Player.gameEnded) {
                    Player.gameEnded = true;
                    var uLost = new PIXI.Text('You Lose', { font: '100px Audiowide', fill: 'white', align: 'left' });
                    uLost.position.x = (Graphics.width / 2);
                    uLost.position.y = (Graphics.height / 4);
                    uLost.anchor.x = 0.5;
                    uLost.anchor.y = 0.5;
                    Graphics.uiContainer.addChild(uLost);
                    if (data.score){
                        var score = new PIXI.Text('Final Score: ' + data.score, { font: '100px Audiowide', fill: 'white', align: 'left' });
                        score.position.x = (Graphics.width / 2);
                        score.position.y = (Graphics.height / 4 + 100);
                        score.anchor.x = 0.5;
                        score.anchor.y = 0.5;
                        Graphics.uiContainer.addChild(score);
                    }
                }
            });

             Acorn.Net.on('youLasted', function (data) {
                if (!Player.gameEnded) {
                    Player.gameEnded = true;
                    var uLost = new PIXI.Text('You Lasted ' + data.time + ' Seconds', { font: '100px Audiowide', fill: 'white', align: 'left' });
                    uLost.position.x = (Graphics.width / 2);
                    uLost.position.y = (Graphics.height / 4);
                    uLost.anchor.x = 0.5;
                    uLost.anchor.y = 0.5;
                    Graphics.uiContainer.addChild(uLost);
                }
            });

            Acorn.Net.on('highScores', function (data) {
                Player.highScores = data;
                Acorn.states['highScoreScreen'].gotHighScores = true;
            });

            Acorn.Net.on('youWin', function (data) {
                if (!Player.gameEnded) {
                    Player.gameEnded = true;
                    var uLost = new PIXI.Text('You Win!', { font: '100px Audiowide', fill: 'white', align: 'left' });
                    uLost.position.x = (Graphics.width / 2);
                    uLost.position.y = (Graphics.height / 4);
                    uLost.anchor.x = 0.5;
                    uLost.anchor.y = 0.5;
                    Graphics.uiContainer.addChild(uLost);
                }
            });

            Acorn.Net.on('disconnect', function (data) {
                if (!Player.gameEnded) {
                    Player.gameEnded = true;
                    var uLost = new PIXI.Text('Disconnect', { font: '100px Audiowide', fill: 'white', align: 'left' });
                    uLost.position.x = (Graphics.width / 2);
                    uLost.position.y = (Graphics.height / 4);
                    uLost.anchor.x = 0.5;
                    uLost.anchor.y = 0.5;
                    Graphics.uiContainer.addChild(uLost);
                }
            });

            Acorn.Net.on('killPlayer', function (data) {
              if (data.id != mainObj.playerId){
                Party.removeMember(data);
              }else{
                //you died!
                var dustAmount = 100;
                for (var i = 0; i < dustAmount; i ++){
                    Dust.addDust({
                        vector: [1,0],
                        pos: [Player.loc.x,Player.loc.y],
                        angle: 180,
                        color: Player.tint
                    })
                }
                Player.kill = true;
                Graphics.worldContainer.removeChild(Player.player);
              }
            });

            Acorn.Net.on('unKillPlayer', function (data) {
                Player.kill = false;
                Graphics.worldContainer.addChild(Player.player);
            });

            Acorn.Net.on('updatePlayerLoc', function (data) {
              //update player position
              try{
                  Party.members[data.playerId].updateLoc(data.newLoc[0], data.newLoc[1]);
              }catch(e){
                //console.log("client error - could not update player location");
                //console.log(e);
              }
            });

            Acorn.Net.on('updateEnemyLoc', function (data) {
              //update player position
              try{
                  Enemies.enemyList[data.id].sprite.position.x = data.newPos[0];
                  Enemies.enemyList[data.id].sprite.position.y = data.newPos[1];
                  Enemies.enemyList[data.id].moveVector.x = data.newDir[0];
                  Enemies.enemyList[data.id].moveVector.y = data.newDir[1];
              }catch(e){
                //console.log("client error - could not update player location");
                //console.log(e);
              }
            });

            Acorn.Net.on('updatePlayerCount', function(data) {
                try{
                    Player.playerCount = data.p;
                }catch(e){
                    console.log(e);
                }
            });
            Acorn.Net.on('say', function (data) {
              if (data.playerId == mainObj.playerId){
                Player.addSayBubble(data.text);
              }else{
                for (var i in Party.members){
                    if (Party.members[i].id == data.playerId){
                        Party.members[i].addSayBubble(data.text);
                    }
                }
              }
            });

            Acorn.Net.on('addEnemies', function (data) {
                if (!Player.gameEnded){
                  for (var i = 0; i < data.data.length; i++){
                    Enemies.addEnemy(data.data[i]);
                  }
                }
            });

            Acorn.Net.on('removeEnemy', function (data) {
                Enemies.killEnemy(data.id);
            });

            Acorn.Net.on('enemyNewTarget', function (data) {
                try{
                    Enemies.enemyList[data.id].behaviour.targetId = data.targetId;
                }catch(e){
                    console.log(e);
                }
            });

            Acorn.Net.on('debug', function (data) {
              console.log(data);
            });

            Acorn.Net.on('ping', function (data) {
              Settings.stats.pingReturn();
            });
        },

        states: function(){
            //Set up all states
            //-----------------------------------------------------------------------------------------------|
            //                              Game States (Acorn.states)
            //-----------------------------------------------------------------------------------------------|

            Acorn.addState({
                stateId: 'game',
                init: function(){
                    //document.body.style.cursor = 'none';
                    Graphics.clear();
                    Map.init({width: 100,height: 100,startAt: 300});
                },
                update: function(dt){
                    //update chat console
                    ChatConsole.update(dt);
                    //update map
                    Map.update(dt);
                }
            });

            Acorn.Input.onMouseClick(function(e) {
                Acorn.Input.mouseDown = true;
            });
            Acorn.Input.onMouseUp(function(e) {
                Acorn.Input.mouseDown = false;
            });

            Acorn.Input.onScroll(function(e) {
                //save the original mouse Location based on bounds of the map
                var mouseX = Math.min(1.0,Math.max(0.1,(Acorn.Input.mouse.X - Graphics.world.position.x) / (Map.bounds[0]*Graphics.world.scale.x)));
                var mouseY = Math.min(1.0,Math.max(0.1,(Acorn.Input.mouse.Y - Graphics.world.position.y) / (Map.bounds[1]*Graphics.world.scale.y)));
                if (e.deltaY < 0){
                    Graphics.world.scale.x = Math.min(1.4,Graphics.world.scale.x+.04);
                    Graphics.world.scale.y = Math.min(1.4,Graphics.world.scale.y+.04);
                }else{
                    Graphics.world.scale.x = Math.max(0.04,Graphics.world.scale.x-.04);
                    Graphics.world.scale.y = Math.max(0.04,Graphics.world.scale.y-.04);
                }
                //reposition the map to stay on mouse point
                Graphics.world.position.x = Acorn.Input.mouse.X - (mouseX*Map.bounds[0]*Graphics.world.scale.x);
                Graphics.world.position.y = Acorn.Input.mouse.Y - (mouseY*Map.bounds[1]*Graphics.world.scale.y);
            });

            Acorn.Input.onMouseMove(function(e) {
                if (Acorn.Input.mouseDown){
                    var mX = Acorn.Input.mouse.X - Acorn.Input.mouse.prevX;
                    var mY = Acorn.Input.mouse.Y - Acorn.Input.mouse.prevY;
                    Graphics.world.position.x = Graphics.world.position.x + mX;
                    Graphics.world.position.y = Graphics.world.position.y + mY;
                    if (Graphics.world.position.x < (-1*Map.bounds[0]*Graphics.world.scale.x)){
                        Graphics.world.position.x = (-1*Map.bounds[0]*Graphics.world.scale.x);
                    }else if (Graphics.world.position.x > Graphics.width - Map.startAt){
                        Graphics.world.position.x = Graphics.width - Map.startAt;
                    }
                    if (Graphics.world.position.y < -1*Map.bounds[1]*Graphics.world.scale.y){
                        Graphics.world.position.y = -1*Map.bounds[1]*Graphics.world.scale.y;
                    }else if (Graphics.world.position.y > Graphics.height - Map.startAt){
                        Graphics.world.position.y = Graphics.height - Map.startAt;
                    }
                }
                //find if a tile is moused over
                var scale = Graphics.world.scale.x;
                var start = [scale * Map.startAt + Graphics.world.position.x,scale * Map.startAt + Graphics.world.position.x];
                
            });

            Acorn.Input.onTouchEvent(function(e) {
                /*var position = e.data.getLocalPosition(e.target);
                mouseX = position.x;
                mouseY = position.y;
                Player.mouseLoc = [mouseX,mouseY];
                try{
                    Player.updateLoc(position.x, position.y);
                    Acorn.Net.socket_.emit('playerUpdate',{newMouseLoc: [position.x,position.y]});
                }catch(e){}*/
            });
        }
    }
    window.AcornSetup = AcornSetup;
})(window);