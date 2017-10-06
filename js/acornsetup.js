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
                stateId: 'mainMenu',
                init: function(){
                    console.log('Initializing main menu');
                    document.body.style.cursor = 'default';
                    Graphics.clear();
                    Graphics.drawBG();
                    //The Main Menu Logo
                    this.logo = AcornSetup.makeButton({
                        text: 'Tactics Prototype',
                        position: [(Graphics.width/2),(Graphics.height/6)],
                    });
                    this.logo.style.fontSize = 100;
                    Graphics.uiContainer.addChild(this.logo);
                    //create map button
                    this.createButton = AcornSetup.makeButton({
                        text: 'Create New Map',
                        position: [(Graphics.width/5),(Graphics.height/1.5)],
                        interactive: true,
                        buttonMode: true,
                        clickFunc: function onClick(){
                            Acorn.changeState('MapGenInit');
                        }
                    });
                    Graphics.uiContainer.addChild(this.createButton);

                },
                update: function(dt){
                }
            });
            Acorn.addState({
                stateId: 'MapGen',
                init: function(){
                    document.body.style.cursor = 'default';
                    Graphics.clear();
                    MapGen.init();
                },
                update: function(dt){
                    MapGen.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'MapGenInit',
                init: function(){
                    console.log('Initializing Map Type Selection');
                    document.body.style.cursor = 'default';
                    Graphics.clear();
                    var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
                    Graphics.drawBG(colors[Math.floor(Math.random()*colors.length)], colors[Math.floor(Math.random()*colors.length)]);
                    var style = {
                        font: '100px Orbitron', 
                        fill: 'white', 
                        align: 'left', 
                        dropShadow: true,
                        dropShadowColor: '#000000',
                        stroke: '#000000',
                        strokeThickness: 5,
                        dropShadow: true,
                        dropShadowColor: '#000000',
                        dropShadowBlur: 4,
                        dropShadowAngle: Math.PI / 6,
                        dropShadowDistance: 6
                    };
                    this.typeSelected = 'r';
                    this.mapSizes = {
                        'r': {min: 10, max: 60},
                        'rh': {min: 10, max: 60},
                        'h': {min: 5, max: 30},
                        't': {min: 10, max: 60}
                    }
                    this.size = 10;
                    this.sizePercent = 0;
                    this.sizePercent2 = 0;

                    //Select Map Type Text
                    this.select = AcornSetup.makeButton({
                        text: 'Select Map Type',
                        style: style,
                        position: [(Graphics.width / 2),(Graphics.height / 8)]
                    });
                    Graphics.uiContainer.addChild(this.select);

                    //rectangle
                    this.rectangle = AcornSetup.makeButton({
                        text: 'Rectangle',
                        style: style,
                        position: [(Graphics.width/3),(Graphics.height/4)],
                        interactive: true,
                        buttonMode: true,
                        clickFunc: function onClick(){
                            var state = Acorn.states['MapGenInit'];
                            state.typeSelected = 'r';
                            state.rectangle.style.fill = 'gray';
                            state.hexagon.style.fill = 'white';
                            state.triangle.style.fill = 'white';
                            state.rhombus.style.fill = 'white';
                        }
                    });
                    this.rectangle.style.fontSize = 64;
                    this.rectangle.style.fill = 'gray';
                    Graphics.uiContainer.addChild(this.rectangle);

                    //triangle
                    this.triangle = AcornSetup.makeButton({
                        text: 'Triangle',
                        style: style,
                        position: [(Graphics.width*0.66),(Graphics.height/4)],
                        interactive: true,
                        buttonMode: true,
                        clickFunc: function onClick(){
                            var state = Acorn.states['MapGenInit'];
                            state.typeSelected = 't';
                            state.rectangle.style.fill = 'white';
                            state.hexagon.style.fill = 'white';
                            state.triangle.style.fill = 'gray';
                            state.rhombus.style.fill = 'white';
                        }
                    });
                    this.triangle.style.fontSize = 64;
                    Graphics.uiContainer.addChild(this.triangle);
                    
                    //hexagon
                    this.hexagon = AcornSetup.makeButton({
                        text: 'Hexagon',
                        style: style,
                        position: [(Graphics.width/3),(Graphics.height/3)],
                        interactive: true,
                        buttonMode: true,
                        clickFunc: function onClick(){
                            var state = Acorn.states['MapGenInit'];
                            state.typeSelected = 'h';
                            state.rectangle.style.fill = 'white';
                            state.hexagon.style.fill = 'gray';
                            state.triangle.style.fill = 'white';
                            state.rhombus.style.fill = 'white';
                        }
                    });
                    this.hexagon.style.fontSize = 64;
                    Graphics.uiContainer.addChild(this.hexagon);

                    //rhombus
                    this.rhombus = AcornSetup.makeButton({
                        text: 'Rhombus',
                        style: style,
                        position: [(Graphics.width*0.66),(Graphics.height/3)],
                        interactive: true,
                        buttonMode: true,
                        clickFunc: function onClick(){
                            var state = Acorn.states['MapGenInit'];
                            state.typeSelected = 'rh';
                            state.rectangle.style.fill = 'white';
                            state.hexagon.style.fill = 'white';
                            state.triangle.style.fill = 'white';
                            state.rhombus.style.fill = 'gray';
                        }
                    });
                    this.rhombus.style.fontSize = 64;
                    Graphics.uiContainer.addChild(this.rhombus);

                    var barStyle = {font: '50px Verdana', fill: 'hsla(93, 100%, 50%, 0)', align: 'left'}
                    this.sizeBar = AcornSetup.makeButton({
                        text: '____________________',
                        style: barStyle,
                        position: [(Graphics.width/2),(Graphics.height/2)],
                        interactive: true,
                        buttonMode: true
                    });
                    Graphics.uiContainer.addChild(this.sizeBar);
                    Graphics.setSlideBar(this.sizeBar, function setPercent(p){
                        var state = Acorn.states['MapGenInit'];
                        state.sizePercent = p;
                    });

                    this.sizeBar2 = AcornSetup.makeButton({
                        text: '____________________',
                        style: barStyle,
                        position: [(Graphics.width/2),(Graphics.height/2 + 75)],
                        interactive: true,
                        buttonMode: true
                    });
                    Graphics.uiContainer.addChild(this.sizeBar2);
                    Graphics.setSlideBar(this.sizeBar2, function setPercent(p){
                        var state = Acorn.states['MapGenInit'];
                        state.sizePercent2 = p;
                    });

                    //size text
                    this.sizeText = AcornSetup.makeButton({
                        text: 'Size :',
                        style: style,
                        position: [0,(Graphics.height / 2)],
                    });
                    this.sizeText.position.x = (Graphics.width / 2) - this.sizeBar.width/2 - this.sizeText.width/2;
                    this.sizeText.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.sizeText);
                    //size number next to bar 1
                    this.sizeNum = AcornSetup.makeButton({
                        text: '0',
                        style: style,
                        position: [(Graphics.width / 2) + this.sizeBar.width/2 + 15,(Graphics.height / 2)],
                        anchor: [0,0.5],
                    });
                    this.sizeNum.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.sizeNum);
                    //create map button
                    this.createButton = AcornSetup.makeButton({
                        text: 'Create',
                        style: style,
                        position: [(Graphics.width / 2),(Graphics.height - 150)],
                        anchor: [0,0.5],
                        interactive: true,
                        buttonMode: true,
                        clickFunc: function onClick(){
                            var state = Acorn.states['MapGenInit'];
                            var s;
                            MapGen.type = state.typeSelected;
                            if (MapGen.type == 't'){
                                var min = state.mapSizes[state.typeSelected].min;
                                var max = state.mapSizes[state.typeSelected].max;
                                s = Math.round(min + state.sizePercent*(max-min));
                            }else if (MapGen.type == 'h'){
                                var min = state.mapSizes[state.typeSelected].min;
                                var max = state.mapSizes[state.typeSelected].max;
                                s = Math.round(min + state.sizePercent*(max-min));
                            }else{
                                var min = state.mapSizes[state.typeSelected].min;
                                var max = state.mapSizes[state.typeSelected].max;
                                s = [Math.round(min + state.sizePercent*(max-min)), Math.round(min + state.sizePercent2*(max-min))];
                            }
                            MapGen.size = s;
                            Acorn.changeState('MapGen');
                        }
                    });
                    this.createButton.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.createButton);

                },
                update: function(dt){
                    Graphics.worldPrimitives.clear();
                    if (this.typeSelected == 'r' || this.typeSelected == 'rh'){
                        this.sizeBar2.visible = true;
                        Graphics.worldPrimitives.beginFill(0xFFFFFF,0.6);
                        Graphics.worldPrimitives.drawRect(this.sizeBar2.position.x - this.sizeBar2.width/2,
                                                  this.sizeBar2.position.y - this.sizeBar2.height/2,
                                                  this.sizePercent2*this.sizeBar2.width,
                                                  this.sizeBar2.height);
                        Graphics.worldPrimitives.endFill();
                        Graphics.drawBoxAround(this.sizeBar2,Graphics.worldPrimitives,'0xFFFFFF',2);
                        Graphics.drawBoxAround(this.sizeBar2,Graphics.worldPrimitives,'0x000000',2,-2,-2);
                        var min = this.mapSizes[this.typeSelected].min;
                        var max = this.mapSizes[this.typeSelected].max;
                        this.sizeNum.text = Math.round(min + this.sizePercent*(max-min)) + ' x ' + Math.round(min + this.sizePercent2*(max-min));
                    }else if (this.typeSelected == 't'){
                        this.sizeBar2.visible = false;
                        var min = this.mapSizes[this.typeSelected].min;
                        var max = this.mapSizes[this.typeSelected].max;
                        var n = Math.round(min + this.sizePercent*(max-min));
                        this.sizeNum.text = '' + n;
                    }else{
                        this.sizeBar2.visible = false;
                        var min = this.mapSizes[this.typeSelected].min;
                        var max = this.mapSizes[this.typeSelected].max;
                        this.sizeNum.text = '' + Math.round(min + this.sizePercent*(max-min));
                    }
                    Graphics.worldPrimitives.lineStyle(1,0xFFFFFF,0.6);
                    Graphics.worldPrimitives.beginFill(0xFFFFFF,0.6);
                    Graphics.worldPrimitives.drawRect(this.sizeBar.position.x - this.sizeBar.width/2,
                                              this.sizeBar.position.y - this.sizeBar.height/2,
                                              this.sizePercent*this.sizeBar.width,
                                              this.sizeBar.height);
                    Graphics.worldPrimitives.endFill();
                    Graphics.drawBoxAround(this.sizeBar,Graphics.worldPrimitives,'0xFFFFFF',2);
                    Graphics.drawBoxAround(this.sizeBar,Graphics.worldPrimitives,'0x000000',2,-2,-2);
                }
            });

            Acorn.addState({
                stateId: 'game',
                init: function(){
                    //document.body.style.cursor = 'none';
                    Graphics.clear();
                    Map.init({width: 25,height: 25,startAt: 300,iso: 0,size: 10});
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
                if (e.deltaY < 0){
                    Settings.zoom('in');
                }else{
                    Settings.zoom('out');
                }
            });

            Acorn.Input.onMouseMove(function(e) {
                
                if (Acorn.Input.buttons[2]){
                    var mX = Acorn.Input.mouse.X - Acorn.Input.mouse.prevX;
                    var mY = Acorn.Input.mouse.Y - Acorn.Input.mouse.prevY;
                    MapGen.move(mX,mY);
                }
                
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
        },
        makeButton: function(data){
            // OPTIONAL data.text - the text on the button
            if (typeof data.text == 'undefined'){
                data.text = ' ';
            }
            // OPTIONAL data.style style property for PIXI Text
            if (typeof data.style == 'undefined'){
                data.style  = {
                    font: '48px Orbitron', 
                    fill: 'white', 
                    align: 'left',
                    dropShadow: true,
                    dropShadowColor: '#000000',
                    stroke: '#000000',
                    strokeThickness: 5,
                    dropShadow: true,
                    dropShadowColor: '#000000',
                    dropShadowBlur: 4,
                    dropShadowAngle: Math.PI / 6,
                    dropShadowDistance: 6
                }
            }
            // OPTIONAL data.position
            if (typeof data.position == 'undefined'){
                data.position = [0,0];
            }
            // OPTIONAL data.anchor
            if (typeof data.anchor == 'undefined'){
                data.anchor = [0.5,0.5];
            }
            if (typeof data.sprite != 'undefined'){
                var button = Graphics.getSprite(data.sprite);
                button.position.x = data.position[0];
                button.position.y = data.position[1];
                button.anchor.x = data.anchor[0];
                button.anchor.y = data.anchor[1];
            }else{
                var button = new PIXI.Text(data.text,data.style)
                button.position.x = data.position[0];
                button.position.y = data.position[1];
                button.anchor.x = data.anchor[0];
                button.anchor.y = data.anchor[1];
            }

            // OPTIONAL data.interactive
            if (typeof data.interactive != 'undefined'){
                button.interactive = data.interactive;
            }
            // OPTIONAL data.buttonMode
            if (typeof data.buttonMode != 'undefined'){
                button.buttonMode = data.buttonMode;
            }
            // OPTIONAL data.clickFunc
            if (typeof data.clickFunc != 'undefined'){
                button.on('tap', data.clickFunc);
                button.on('click', data.clickFunc);
            }
            if (typeof data.mOverFunc != 'undefined'){
                button.on('pointerover', data.mOverFunc);
                button.on('touchmove', data.mOverFunc);
            }
            if (typeof data.mOutFunc != 'undefined'){
                button.on('touchend', data.mOutFunc);
                button.on('touchendoutside', data.mOutFunc);
                button.on('pointerout', data.mOutFunc);
            }
            return button
        }
    }
    window.AcornSetup = AcornSetup;
})(window);