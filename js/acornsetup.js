(function(window) {

    AcornSetup = {
        
        baseStyle: {
            font: '64px Orbitron', 
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
        },

        net: function() {
            Acorn.Net.on('connInfo', function (data) {
              console.log('Connected to server: Info Received');
              MapGen.mapNames = data.mapNames;
              Acorn.Net.ready = true;
              checkReady();
            });
            
            Acorn.Net.on('editMap', function (data) {
                if (data.found){
                  MapGen.data = data;
                  Acorn.changeState('MapGen');
                }else{
                    Graphics.showLoadingMessage(false);
                }
            });

            Acorn.Net.on('confirmMapSave', function (data) {
                if (confirm('Overwrite map "' + data.name + '"?') == true) {
                    Acorn.Net.socket_.emit('confirmMapSave',{c:true});
                } else {
                    Acorn.Net.socket_.emit('confirmMapSave',{c:false});
                }
            });

            Acorn.Net.on('mapSaved', function (data) {
                //new map has been saved, set name
                MapGen.mapName = data.name;
            });

            Acorn.Net.on('loggedIn', function (data) {
              Player.userData = data;
              Player.init(data);
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
            Acorn.Net.on('addNewUnit', function (data) {
                console.log(data);
                Player.addNewUnit(data.unit);
            });
            Acorn.Net.on('deleteUnit', function (data) {
                console.log(data);
                Player.deleteUnit(data);
            });
            Acorn.Net.on('setUnitStat', function (data) {
                console.log(data);
                Player.setUnitStat(data);
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

            //Initial State
            Acorn.addState({
                stateId: 'loginScreen',
                init: function(){
                    console.log('Initializing login screen');
                    document.body.style.cursor = 'default';
                    this.logo = Graphics.makeUiElement({
                        text: 'Tactics Prototype',
                        style: AcornSetup.baseStyle,
                        position: [(Graphics.width / 2),(Graphics.height / 8)]
                    });
                    this.logo.style.fontSize = 100;
                    Graphics.uiContainer.addChild(this.logo);

                    this.guestText = Graphics.makeUiElement({
                        text: 'PLAY AS GUEST',
                        style: AcornSetup.baseStyle,
                        interactive: true,buttonMode: true,buttonGlow: true,
                        position: [0,(Graphics.height * .75)],
                        clickFunc: function onClick(){
                            Acorn.Net.socket_.emit('loginAttempt',{guest: true});
                        }
                    });
                    this.guestText.style.fontSize = 48;
                    this.guestText.position.x = (Graphics.width / 2 - this.guestText.width);
                    Graphics.uiContainer.addChild(this.guestText);

                    this.loginText = Graphics.makeUiElement({
                        text: '          LOGIN          ',
                        style: AcornSetup.baseStyle,
                        interactive: true,buttonMode: true,buttonGlow: true,
                        position: [0,(Graphics.height * .75)],
                        clickFunc: function onClick(){
                            var state = Acorn.states['loginScreen'];
                            Graphics.uiContainer.removeChild(state.newUser);
                            Graphics.uiContainer.removeChild(state.loginText);
                            Graphics.uiContainer.removeChild(state.guestText);
                            Graphics.uiContainer.addChild(state.cancelButton);
                            Graphics.uiContainer.addChild(state.submitButton);
                            Settings.credentials.setType('login');
                            Settings.toggleCredentials(true);
                            state.loginClicked = true;
                            document.getElementById('usrInput').focus();
                            try{
                                Graphics.uiContainer.removeChild(state.loginText.glowSprite2);
                            }catch(e){}
                        }
                    });
                    this.loginText.style.fontSize = 48;
                    this.loginText.position.x = (Graphics.width / 2 + this.loginText.width);
                    Graphics.uiContainer.addChild(this.loginText);

                    this.newUser = Graphics.makeUiElement({
                        text: '     New User     ',
                        style: AcornSetup.baseStyle,
                        interactive: true,buttonMode: true,buttonGlow: true,
                        position: [(Graphics.width / 2),(Graphics.height * .9)],
                        clickFunc: function onClick(){
                            var state = Acorn.states['loginScreen'];
                            Graphics.uiContainer.removeChild(state.newUser);
                            Graphics.uiContainer.removeChild(state.loginText);
                            Graphics.uiContainer.removeChild(state.guestText);
                            Graphics.uiContainer.addChild(state.cancelButton);
                            Graphics.uiContainer.addChild(state.submitButton);
                            Settings.credentials.setType('new');
                            Settings.toggleCredentials(true);
                            state.loginClicked = true;
                            document.getElementById('usrInput').focus();
                            try{
                                Graphics.uiContainer.removeChild(state.newUser.glowSprite2);
                            }catch(e){}
                        }
                    });
                    this.newUser.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.newUser);

                    this.loginErrorText = Graphics.makeUiElement({
                        text: '',
                        style: AcornSetup.baseStyle,
                        position: [(Graphics.width / 2),(Graphics.height * .65)]
                    });
                    Graphics.uiContainer.addChild(this.loginErrorText);

                    this.submitButton = Graphics.makeUiElement({
                        text: '     Submit     ',
                        style: AcornSetup.baseStyle,
                        interactive: true,buttonMode: true,buttonGlow: true,
                        position: [(Graphics.width / 4),(Graphics.height * .75)],
                        clickFunc: function onClick(){
                            if (Settings.credentials.getType() == 'login'){
                                Acorn.Net.socket_.emit('loginAttempt',{sn: document.getElementById('usrInput').value,pw:document.getElementById('pwInput').value});
                            }else if (Settings.credentials.getType() == 'new'){
                                Acorn.Net.socket_.emit('createUser',{sn: document.getElementById('usrInput').value,pw:document.getElementById('pwInput').value});
                            }
                        }
                    });
                    this.submitButton.style.fontSize = 64;
                    Graphics.uiContainer.addChild(this.submitButton);

                    this.cancelButton = Graphics.makeUiElement({
                        text: '     Cancel     ',
                        style: AcornSetup.baseStyle,
                        interactive: true,buttonMode: true,buttonGlow: true,
                        position: [(Graphics.width / 1.5),(Graphics.height * .75)],
                        clickFunc: function onClick(){
                            var state = Acorn.states['loginScreen'];
                            Graphics.uiContainer.addChild(state.newUser);
                            Graphics.uiContainer.addChild(state.loginText);
                            Graphics.uiContainer.addChild(state.guestText);
                            Graphics.uiContainer.removeChild(state.cancelButton);
                            Graphics.uiContainer.removeChild(state.submitButton);
                            Settings.toggleCredentials(false);
                            state.loginClicked = false;
                            state.loginErrorText.text = '';
                            try{
                                Graphics.uiContainer.removeChild(state.cancelButton.glowSprite2);
                            }catch(e){}
                        }
                    });
                    this.cancelButton.style.fontSize = 64;
                    Graphics.uiContainer.addChild(this.cancelButton);

                    this.loginClicked = false;
                    Graphics.uiContainer.removeChild(this.submitButton);
                    Graphics.uiContainer.removeChild(this.cancelButton);

                },
                update: function(dt){
                    Graphics.uiPrimitives2.clear();
                    if (this.loginClicked){
                        Graphics.drawBoxAround(this.cancelButton,Graphics.uiPrimitives2,{});
                        Graphics.drawBoxAround(this.submitButton,Graphics.uiPrimitives2,{});
                    }else{
                        Graphics.drawBoxAround(this.loginText,Graphics.uiPrimitives2,{});
                        Graphics.drawBoxAround(this.newUser,Graphics.uiPrimitives2,{});
                        Graphics.drawBoxAround(this.guestText,Graphics.uiPrimitives2,{});
                    }
                    if (Acorn.Input.isPressed(Acorn.Input.Key.BACKSPACE)){
                        if (Settings.credentialsOn){
                            if (document.activeElement.id == 'usrInput'){
                                document.getElementById('usrInput').value = document.getElementById('usrInput').value.substring(0, document.getElementById('usrInput').value.length-1);
                            }else if (document.activeElement.id == 'pwInput'){
                                document.getElementById('pwInput').value = document.getElementById('pwInput').value.substring(0, document.getElementById('pwInput').value.length-1);
                            }
                        }
                        Acorn.Input.setValue(Acorn.Input.Key.BACKSPACE, false);
                    }
                    ChatConsole.update(dt);
                }
            });

            Acorn.addState({
                stateId: 'mainMenu',
                init: function(){
                    console.log('Initializing main menu');
                    document.body.style.cursor = 'default';
                    Graphics.drawBG();
                    //The Main Menu Logo
                    this.logo = Graphics.makeUiElement({
                        text: 'Tactics Prototype',
                        position: [(Graphics.width/2),(Graphics.height/6)],
                    });
                    this.logo.style.fontSize = 100;
                    Graphics.uiContainer.addChild(this.logo);
                    //create map button
                    this.createButton = Graphics.makeUiElement({
                        text: 'Create New Map',
                        position: [(Graphics.width/5),(Graphics.height/1.5)],
                        interactive: true,
                        buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(){
                            Acorn.changeState('MapGenInit');
                        }
                    });
                    Graphics.uiContainer.addChild(this.createButton);

                    //create map button
                    this.loadMapButton = Graphics.makeUiElement({
                        text: 'Edit Map',
                        position: [(Graphics.width/5),(Graphics.height/1.2)],
                        interactive: true,buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(){
                            var s = "Enter map name: \n";
                            for (var i = 0;i < MapGen.mapNames.length;i++){
                                s = s + ' <' + MapGen.mapNames[i] + '> ';
                            }
                            var name = prompt(s, '');
                            Acorn.Net.socket_.emit('editMap',{name: name});
                            MapGen.mapName = name;
                            Graphics.showLoadingMessage(true);
                        }
                    });
                    Graphics.uiContainer.addChild(this.loadMapButton);

                    this.userName = Graphics.makeUiElement({
                        text: "Welcome " + Player.userData.name + '!',
                        style: AcornSetup.baseStyle,
                        position: [10,10],
                        anchor: [0,0]
                    });
                    this.userName.style.fontSize = 24;
                    Graphics.uiContainer.addChild(this.userName);

                    this.charButton = Graphics.makeUiElement({
                        text: 'My Characters',
                        style: AcornSetup.baseStyle,
                        position: [10,this.userName.position.y + 10 + this.userName.height],
                        anchor: [0,0],
                        interactive: true,buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(){
                            Acorn.changeState('charScreen');
                        }
                    });
                    this.charButton.style.fontSize = 32;
                    Graphics.uiContainer.addChild(this.charButton);

                    this.settingsButton = Graphics.makeUiElement({
                        text: 'Settings',
                        style: AcornSetup.baseStyle,
                        position: [10,this.charButton.position.y + 10 + this.charButton.height],
                        anchor: [0,0],
                        interactive: true,buttonMode: true,buttonGlow: true,
                    });
                    this.settingsButton.style.fontSize = 32;
                    Graphics.uiContainer.addChild(this.settingsButton);

                    this.logoutButton = Graphics.makeUiElement({
                        text: 'Logout',
                        style: AcornSetup.baseStyle,
                        position: [10,this.settingsButton.position.y + 10 + this.settingsButton.height],
                        anchor: [0,0],
                        interactive: true,buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(){
                            if (confirm('<' + Player.userData.name + '>, Are you sure you want to log out?') == true) {
                                Acorn.Net.socket_.emit('playerUpdate',{logout: true});
                            }
                        }
                    });
                    this.logoutButton.style.fontSize = 32;
                    Graphics.uiContainer.addChild(this.logoutButton);

                },
                update: function(dt){
                    Graphics.uiPrimitives2.clear();
                    Graphics.drawBoxAround(this.logoutButton,Graphics.uiPrimitives2,{pos: [this.logoutButton.position.x + this.logoutButton.width/2,this.logoutButton.position.y + this.logoutButton.height/2]});
                    Graphics.drawBoxAround(this.settingsButton,Graphics.uiPrimitives2,{pos: [this.settingsButton.position.x + this.settingsButton.width/2,this.settingsButton.position.y + this.settingsButton.height/2]});
                    Graphics.drawBoxAround(this.charButton,Graphics.uiPrimitives2,{pos: [this.charButton.position.x + this.charButton.width/2,this.charButton.position.y + this.charButton.height/2]});
                    Graphics.drawBoxAround(this.createButton,Graphics.uiPrimitives2,{});
                    Graphics.drawBoxAround(this.loadMapButton,Graphics.uiPrimitives2,{});
                }
            });
            Acorn.addState({
                stateId: 'MapGen',
                init: function(){
                    document.body.style.cursor = 'default';
                    MapGen.init();
                },
                update: function(dt){
                    MapGen.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'charScreen',
                init: function(){
                    document.body.style.cursor = 'default';
                    Characters.init();
                },
                update: function(dt){
                    Characters.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'charDisplay',
                init: function(){
                    document.body.style.cursor = 'default';
                    CharDisplay.init();
                },
                update: function(dt){
                    CharDisplay.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'createUnit',
                init: function(){
                    document.body.style.cursor = 'default';
                    CreateUnit.init();
                },
                update: function(dt){
                    CreateUnit.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'MapGenInit',
                init: function(){
                    console.log('Initializing Map Type Selection');
                    document.body.style.cursor = 'default';
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
                    this.select = Graphics.makeUiElement({
                        text: 'Select Map Type',
                        style: style,
                        position: [(Graphics.width / 2),(Graphics.height / 8)]
                    });
                    Graphics.uiContainer.addChild(this.select);

                    //rectangle
                    this.rectangle = Graphics.makeUiElement({
                        text: 'Rectangle',
                        style: style,
                        position: [(Graphics.width/3),(Graphics.height/4)],
                        interactive: true,
                        buttonMode: true,buttonGlow: true,
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
                    this.triangle = Graphics.makeUiElement({
                        text: 'Triangle',
                        style: style,
                        position: [(Graphics.width*0.66),(Graphics.height/4)],
                        interactive: true,
                        buttonMode: true,buttonGlow: true,
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
                    this.hexagon = Graphics.makeUiElement({
                        text: 'Hexagon',
                        style: style,
                        position: [(Graphics.width/3),(Graphics.height/3)],
                        interactive: true,
                        buttonMode: true,buttonGlow: true,
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
                    this.rhombus = Graphics.makeUiElement({
                        text: 'Rhombus',
                        style: style,
                        position: [(Graphics.width*0.66),(Graphics.height/3)],
                        interactive: true,
                        buttonMode: true,buttonGlow: true,
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
                    this.sizeBar = Graphics.makeUiElement({
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

                    this.sizeBar2 = Graphics.makeUiElement({
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
                    this.sizeText = Graphics.makeUiElement({
                        text: 'Size :',
                        style: style,
                        position: [0,(Graphics.height / 2)],
                    });
                    this.sizeText.position.x = (Graphics.width / 2) - this.sizeBar.width/2 - this.sizeText.width/2;
                    this.sizeText.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.sizeText);
                    //size number next to bar 1
                    this.sizeNum = Graphics.makeUiElement({
                        text: '0',
                        style: style,
                        position: [(Graphics.width / 2) + this.sizeBar.width/2 + 15,(Graphics.height / 2)],
                        anchor: [0,0.5],
                    });
                    this.sizeNum.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.sizeNum);
                    //create map button
                    this.createButton = Graphics.makeUiElement({
                        text: 'Create',
                        style: style,
                        position: [(Graphics.width / 2),(Graphics.height - 150)],
                        anchor: [0.5,0.5],
                        interactive: true,
                        buttonMode: true,buttonGlow: true,
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
                            console.log(MapGen.size);
                            Acorn.changeState('MapGen');
                        }
                    });
                    this.createButton.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.createButton);

                },
                update: function(dt){
                    Graphics.uiPrimitives2.clear();
                    Graphics.drawBoxAround(this.rectangle,Graphics.uiPrimitives2,{});
                    Graphics.drawBoxAround(this.triangle,Graphics.uiPrimitives2,{});
                    Graphics.drawBoxAround(this.hexagon,Graphics.uiPrimitives2,{});
                    Graphics.drawBoxAround(this.rhombus,Graphics.uiPrimitives2,{});
                    Graphics.drawBoxAround(this.createButton,Graphics.uiPrimitives2,{});
                    if (this.typeSelected == 'r' || this.typeSelected == 'rh'){
                        this.sizeBar2.visible = true;
                        Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.6);
                        Graphics.uiPrimitives2.drawRect(this.sizeBar2.position.x - this.sizeBar2.width/2,
                                                  this.sizeBar2.position.y - this.sizeBar2.height/2,
                                                  this.sizePercent2*this.sizeBar2.width,
                                                  this.sizeBar2.height);
                        Graphics.uiPrimitives2.endFill();
                        Graphics.drawBoxAround(this.sizeBar2,Graphics.uiPrimitives2,{});
                        Graphics.drawBoxAround(this.sizeBar2,Graphics.uiPrimitives2,{color: '0x000000',xbuffer:-2,ybuffer:-2});
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
                    Graphics.uiPrimitives2.lineStyle(1,0xFFFFFF,0.6);
                    Graphics.uiPrimitives2.beginFill(0xFFFFFF,0.6);
                    Graphics.uiPrimitives2.drawRect(this.sizeBar.position.x - this.sizeBar.width/2,
                                              this.sizeBar.position.y - this.sizeBar.height/2,
                                              this.sizePercent*this.sizeBar.width,
                                              this.sizeBar.height);
                    Graphics.uiPrimitives2.endFill();
                    Graphics.drawBoxAround(this.sizeBar,Graphics.uiPrimitives2,{});
                    Graphics.drawBoxAround(this.sizeBar,Graphics.uiPrimitives2,{color: '0x000000',xbuffer:-2,ybuffer:-2});
                }
            });

            Acorn.addState({
                stateId: 'game',
                init: function(){
                    //document.body.style.cursor = 'none';
                    Map.init({width: 25,height: 25,startAt: 300,iso: 0,size: 10});
                },
                update: function(dt){
                    //update chat console
                    ChatConsole.update(dt);
                    //update map
                    Map.update(dt);
                }
            });
        },

        input: function(){
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
                    MapGen.map.move(mX,mY);
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
        }
        
    }
    window.AcornSetup = AcornSetup;
})(window);