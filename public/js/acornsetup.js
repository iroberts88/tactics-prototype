(function(window) {

    AcornSetup = {
        
        baseStyle: {
            font: '64px Verdana',
            fill: Graphics.pallette.color1,
            align: 'left',
            stroke: '#000000',
            strokeThickness: 2,
        },

        baseStyle2: {
            font: '32px Verdana',
            fill: '#AACCDD',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 2,
        },

        baseStyle3: {
            font: '18px Sigmar One',
            fill: '#AACCDD',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 2,
        },

        net: function() {
            Acorn.Net.on(ENUMS.CONNINFO, function (data) {
                console.log('Connected to server: Info Received');
                MapGen.mapNames = data[ENUMS.MAPNAMES];
                Acorn.Net.ready = true;
                window.playerID = data[ENUMS.ID];
                checkReady();
            });

            Acorn.Net.on(ENUMS.MAPINFO, function(data) {
                console.log(data);
                //init in-game state
                window.currentMapState = 'game';
                Game.map = new Map();
                Game.map.init(data);
                if(Acorn.changeState('inGame')){
                    //game state change successful
                    //emit ready for full game info
                    Acorn.Net.socket_.emit(ENUMS.PLAYERUPDATE,Utils.createServerData(ENUMS.COMMAND, ENUMS.READY, ENUMS.VALUE, true));
                }else{
                    Acorn.Net.socket_.emit(ENUMS.PLAYERUPDATE,Utils.createServerData(ENUMS.COMMAND, ENUMS.READY, ENUMS.VALUE, false));
                }

            });

            Acorn.Net.on(ENUMS.ENDGAME, function (data) {
                Game.endGame = true;
                Game.won = data[ENUMS.WON];
            });

            Acorn.Net.on(ENUMS.NEWTURNORDER, function(data) {
                //get the new turn order at the beginning of each turn
                console.log(data);
                Game.turnList = data[ENUMS.TURNLIST];
                for (var i = 0;i<data[ENUMS.TURNPERCENT].length;i++){
                    if (Game.units[Game.turnList[i]].isCastTimer){
                        Game.units[Game.turnList[i]].charge = data[ENUMS.TURNPERCENT][i];
                    }else{
                        Game.units[Game.turnList[i]].setChargePercent(data[ENUMS.TURNPERCENT][i]);
                    }
                }
                Game.newTurnOrder(data[ENUMS.TURNLIST]);
            });

            Acorn.Net.on(ENUMS.ADDCASTTIMER, function(data) {
                //get the new turn order at the beginning of each turn
                var castTimer = {};
                castTimer.id = data[ENUMS.ID];
                castTimer.isCastTimer = data[ENUMS.ISCASTTIMER]
                castTimer.unit = data[ENUMS.UNIT];
                castTimer.name = data[ENUMS.NAME];
                castTimer.speed = data[ENUMS.SPEED];
                castTimer.charge = data[ENUMS.CHARGE];
                Game.units[castTimer.id] = castTimer;
            });

            Acorn.Net.on(ENUMS.UNITINFO, function(data) {
                //get the data for the units on the map
                console.log(data);
                Game.turnList = data[ENUMS.TUNRLIST];
                Game.units = {};
                for(var i = 0; i < data[ENUMS.MYUNITS].length;i++){
                    var unit = new Unit();
                    unit.init(data[ENUMS.MYUNITS][i]);
                    Game.units[unit.id] = unit;
                }
                for(var i = 0; i < data[ENUMS.OTHERUNITS].length;i++){
                    var unit = new Unit();
                    unit.init(data[ENUMS.OTHERUNITS][i]);
                    Game.units[unit.id] = unit;
                    unit.sprite.tint = 0xfcfcfc;
                }
                for (var i = 0;i<data[ENUMS.TURNPERCENT].length;i++){
                    Game.units[Game.turnList[i]].setChargePercent(data[ENUMS.TURNPERCENT][i]);
                }
                Game.initUI();
            });

            Acorn.Net.on(ENUMS.STARTGAME, function(data) {
                //Game has started!
                Game.timePerTurn = data[ENUMS.TIMEPERTURN];
                Game.delayBetweenStates = data[ENUMS.DELAY];
                Player.inGame = true;
                Game.startGame();
            });

            Acorn.Net.on('editMap', function (data) {
                console.log(data);
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
                }else{
                    Acorn.Net.socket_.emit('confirmMapSave',{c:false});
                }
            });

            Acorn.Net.on('mapSaved', function (data) {
                //new map has been saved, set name
                MapGen.mapName = data.name;
            });


            Acorn.Net.on(ENUMS.LOGIN, function (data) {
              console.log(data);
              Player.userData = {};
              Player.userData.username = data[ENUMS.USERNAME];
              Player.userData.stats = data[ENUMS.STATS];
              Settings.toggleCredentials(false);
              Acorn.changeState('mainMenu');
            });

            Acorn.Net.on(ENUMS.LOGOUT, function (data) {
              Player.userData = null;
              Acorn.changeState('loginScreen');
            });

            Acorn.Net.on(ENUMS.LEARNABILITY, function (data) {
                LearnAbilities.learnAbility(data);
            });

            Acorn.Net.on(ENUMS.EQUIPABILITY, function (data) {
                EquipAbilities.equipAbility(data);
            });

            Acorn.Net.on(ENUMS.UNEQUIPABILITY, function (data) {
                EquipAbilities.unEquipAbility(data);
            });

            Acorn.Net.on(ENUMS.CLEARABILITIES, function (data) {
                EquipAbilities.clearAbilities(data);
            });

            Acorn.Net.on(ENUMS.SETLOGINERRORTEXT, function (data) {
              try{
                var state = Acorn.states['loginScreen'];
                switch(data[ENUMS.TEXT]){
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
                    case 'nvd':
                        state.loginErrorText.text = 'Invalid Login Info.';
                        break;
                }
              }catch(e){}
            });

            Acorn.Net.on(ENUMS.ADDNEWUNIT, function (data) {
                console.log('adding new unit')
                console.log(data);
                Player.addNewUnit(data[ENUMS.UNITID]);
            });
            Acorn.Net.on(ENUMS.ADDITEMTOUNIT, function (data) {
                //adds an item to unit inventory
                console.log('adding new item to unit inventory')
                console.log(data);
                for (var i = 0; i < Player.units.length; i++){
                    if (data[ENUMS.UNITID] == Player.units[i].id){
                        var item = new Item();
                        item.init(data[ENUMS.ITEM]);
                        Player.units[i].inventory.items.push(item);
                        Player.units[i].inventory.currentWeight = data[ENUMS.WEIGHT];
                    }
                }
                if (Acorn.currentState == 'unitInventoryMenu'){
                    UnitInventory.clear();
                    UnitInventory.draw();
                }
            });
            Acorn.Net.on(ENUMS.ADDITEMTOPLAYER, function (data) {
                //adds an item to player inventory
                console.log('adding item to player inventory')
                console.log(data);
                if (typeof data[ENUMS.ITEM] != 'string'){
                    //new item - add
                    var item = new Item();
                    item.init(data[ENUMS.ITEM]);
                    Player.inventory.push(item);
                }else{
                    //existing item, find and add
                    for (var i = 0; i < Player.inventory.length;i++){
                        if (Player.inventory[i].itemID == data[ENUMS.ITEM]){
                            Player.inventory[i].amount += data[ENUMS.AMOUNT];
                        }
                    }
                }
                if (Acorn.currentState == 'unitInventoryMenu'){
                    UnitInventory.clear();
                    UnitInventory.draw();
                }
            });
            Acorn.Net.on(ENUMS.REMOVEITEMUNIT, function (data) {
                //Removes an item from unit inventory
                console.log('removing item from unit inventory')
                console.log(data);
                for (var i = 0; i < Player.units.length; i++){
                    if (data[ENUMS.UNITID] == Player.units[i].id){
                        var unit = Player.units[i];
                        unit.inventory.items.splice(data[ENUMS.INDEX],1);
                        unit.inventory.currentWeight = data[ENUMS.WEIGHT];
                        if (unit.weapon > data[ENUMS.INDEX]){
                            unit.weapon -= 1;
                        }else if (unit.weapon == data[ENUMS.INDEX]){
                            unit.weapon = null;
                        }
                        if (unit.shield > data[ENUMS.INDEX]){
                            unit.shield -= 1;
                        }else if (unit.shield == data[ENUMS.INDEX]){
                            unit.shield = null;
                        }
                        if (unit.accessory > data[ENUMS.INDEX]){
                            unit.accessory -= 1;
                        }else if (unit.accessory == data[ENUMS.INDEX]){
                            unit.accessory = null;
                        }
                    }
                }
                if (Acorn.currentState == 'unitInventoryMenu'){
                    UnitInventory.clear();
                    UnitInventory.draw();
                }
            });
            Acorn.Net.on(ENUMS.REMOVEITEM, function (data) {
                //remove an item from player inventory
                console.log('removing item from player inventory')
                console.log(data);
                if (Player.inventory[data[ENUMS.INDEX]].amount > data[ENUMS.AMOUNT]){
                    Player.inventory[data[ENUMS.INDEX]].amount -= data[ENUMS.AMOUNT];
                }else{
                    Player.inventory.splice(data[ENUMS.INDEX],1);
                }
                if (Acorn.currentState = 'unitInventoryMenu'){
                    UnitInventory.clear();
                    UnitInventory.draw();
                }
                if (Acorn.currentState == 'unitInventoryMenu'){
                    UnitInventory.clear();
                    UnitInventory.draw();
                }
            });
            Acorn.Net.on(ENUMS.EQUIPITEM, function(data) {
                console.log('equipping item');
                console.log(data);
                Player.equipItem(data);
            });
            Acorn.Net.on(ENUMS.UNEQUIPITEM, function(data) {
                console.log('Un-Equipping item');
                console.log(data);
                Player.unEquipItem(data);
            });
            Acorn.Net.on(ENUMS.DELETEUNIT, function (data) {
                console.log('deleting unit');
                console.log(data);
                Player.deleteUnit(data);
            });
            Acorn.Net.on(ENUMS.SETUNITSTAT, function (data) {
                try{
                    if (Player.inGame){
                        Game.units[data[ENUMS.UNITID]].setStat(data[ENUMS.STAT],data[ENUMS.AMOUNT])
                    }else{
                        Player.setUnitStat(data);
                    }
                }catch(e){
                    console.log("Unit stat error");
                    console.log(e);
                    console.log(data);
                }
            });
            Acorn.Net.on(ENUMS.MODAP, function (data) {
                for (var i = 0; i < Player.units.length; i++){
                    if (data[ENUMS.UNITID] == Player.units[i].id){
                        for (var j in Player.units[i].classInfo.ap){
                            if (j == data[ENUMS.CLASSID]){
                                Player.units[i].classInfo.ap[j] = data[ENUMS.VALUE];
                            }
                        }
                    }
                }
            });

            Acorn.Net.on(ENUMS.ACTION, function (data) {
                console.log('Perform battle action!');
                console.log(data);
                var action = new Actions();
                action.init(data[ENUMS.ACTIONDATA]);
                Game.actions.push(action);
            });

            Acorn.Net.on(ENUMS.ADDBUFF, function (data) {
                console.log('adding buff!');
                console.log(data);
            });

            Acorn.Net.on(ENUMS.HIDEUNIT, function (data) {
                console.log(data);
                if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
                    if (Game.units[data[ENUMS.UNITID]].owner == mainObj.playerID){
                        Game.units[data[ENUMS.UNITID]].sprite.alpha = 0.5;
                    }else{
                        var t = 1;
                        if (!(Game.map.currentRotation%2)){t = 2}
                        Game.map['container'+t].removeChild(Game.units[data[ENUMS.UNITID]].sprite);
                        Game.units[data[ENUMS.UNITID]].visible = false;
                        Game.units[data[ENUMS.UNITID]].currentNode.unit = null;
                        Game.units[data[ENUMS.UNITID]].currentNode = null;
                    }
                }
            });

            Acorn.Net.on(ENUMS.REMOVEUNIT, function (data) {
                console.log(data);
                if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
                    if (Game.units[data[ENUMS.UNITID]].isCastTimer){
                        delete Game.units[data[ENUMS.UNITID]];
                    }
                }
            });

            Acorn.Net.on(ENUMS.ADDUNIT, function(data) {
                //get the data for the units on the map
                console.log(data);
                var unit = new Unit();
                unit.init(data[ENUMS.UNITINFO]);
                Game.units[unit.id] = unit;
                Game.addUnit(unit);
            });

            Acorn.Net.on(ENUMS.UNITFAINTED, function (data) {
                console.log(data);
                if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
                    if (!Game.units[data[ENUMS.UNITID]].isCastTimer){
                        Game.units[data[ENUMS.UNITID]].setFainted();
                    }
                }
            });

            Acorn.Net.on(ENUMS.REVEALUNIT, function (data) {
                console.log(data);
                if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
                    if (!Game.units[data[ENUMS.UNITID]].visible){
                        var t = 1;
                        if (!(Game.map.currentRotation%2)){t = 2}
                        Game.map['container'+t].addChild(Game.units[data[ENUMS.UNITID]].sprite);
                        Game.units[data[ENUMS.UNITID]].visible = true;
                    }
                    Game.units[data[ENUMS.UNITID]].sprite.alpha = 1;
                    Game.units[data[ENUMS.UNITID]].setCurrentNode(data[ENUMS.Q],data[ENUMS.R],Game.map);
                    Game.units[data[ENUMS.UNITID]].setNewDirection(data[ENUMS.DIRECTION]);
                    Game.updateUnitsBool = true;
                }
            });

            Acorn.Net.on(ENUMS.UPDATEUNITINFO, function (data) {
                console.log(data);
                if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
                    Game.units[data[ENUMS.UNITID]].updateInfo(data[ENUMS.UNITINFO]);
                    Game.units[data[ENUMS.UNITID]].infoPane = Game.getUnitInfoPane(data[ENUMS.UNITID]);
                }
            });

            Acorn.Net.on(ENUMS.SETMOVELEFT, function (data) {
                if (!Game.units){
                    return;
                }
                if (typeof Game.units[data[ENUMS.UNITID]] != 'undefined'){
                    Game.units[data[ENUMS.UNITID]].moveLeft = data[ENUMS.VALUE];
                }
                console.log(data);
            });

            Acorn.Net.on('debug', function (data) {
                console.log('sever ERROR debug');
                console.log(data);
            });

            Acorn.Net.on(ENUMS.PING, function (data) {
              Settings.stats.pingReturn();
            });
        },

        states: function(){
            //Set up all states
            //-----------------------------------------------------------------------------------------------|
            //                              Game States (Acorn.states)                                       |
            //-----------------------------------------------------------------------------------------------|

            //Initial State
            Acorn.addState({
                stateId: 'loginScreen',
                init: function(){
                    Player.init();
                    Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
                    console.log('Initializing login screen');
                    document.body.style.cursor = 'default';
                    this.logo = Graphics.makeUiElement({
                        text: 'Tactics Prototype',
                        style: this.baseStyle,
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
                            Acorn.Net.socket_.emit(ENUMS.LOGINATTEMPT,Utils.createServerData(ENUMS.GUEST, true));
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
                                Acorn.Net.socket_.emit(ENUMS.LOGINATTEMPT,Utils.createServerData(ENUMS.USERNAME, document.getElementById('usrInput').value,ENUMS.PASSWORD,document.getElementById('pwInput').value));
                            }else if (Settings.credentials.getType() == 'new'){
                                Acorn.Net.socket_.emit(ENUMS.CREATEUSER,Utils.createServerData(ENUMS.USERNAME, document.getElementById('usrInput').value,ENUMS.PASSWORD,document.getElementById('pwInput').value));
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
                    Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
                    //The Main Menu Logo
                    this.logo = Graphics.makeUiElement({
                        text: 'Tactics Prototype',
                        style: AcornSetup.baseStyle,
                        position: [(Graphics.width/2),(Graphics.height/6)],
                    });
                    this.logo.style.fontSize = 100;
                    Graphics.uiContainer.addChild(this.logo);
                    //create map button
                    this.createButton = Graphics.makeUiElement({
                        text: 'Create New Map',
                        style: AcornSetup.baseStyle,
                        position: [(Graphics.width/5),(Graphics.height/1.5)],
                        interactive: true,
                        buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(){
                            Acorn.changeState('MapGenInit');
                        }
                    });
                    this.createButton.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.createButton);

                    //create map button
                    this.loadMapButton = Graphics.makeUiElement({
                        text: 'Edit Map',
                        style: AcornSetup.baseStyle,
                        position: [(Graphics.width/5),(Graphics.height/1.2)],
                        interactive: true,buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(){
                            var s = "Enter map name: \n";
                            for (var i = 0;i < MapGen.mapNames.length;i++){
                                s = s + ' <' + MapGen.mapNames[i] + '> ';
                            }
                            var name = prompt(s, 'noname');
                            if (name){
                                Acorn.Net.socket_.emit('editMap',{name: name});
                            }else{
                                return;
                            }
                            MapGen.mapName = name;
                            Graphics.showLoadingMessage(true);
                        }
                    });
                    this.loadMapButton.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.loadMapButton);

                    this.joinButton = Graphics.makeUiElement({
                        text: 'Join (Test)',
                        style: AcornSetup.baseStyle,
                        position: [(Graphics.width*0.8),(Graphics.height/1.35)],
                        interactive: true,buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(){
                            if (Player.units.length <5){
                                return;
                            }
                            Acorn.Net.socket_.emit(ENUMS.PLAYERUPDATE,Utils.createServerData(ENUMS.COMMAND, ENUMS.TESTGAME));
                            Acorn.changeState('loader');
                        }
                    });
                    this.joinButton.style.fontSize = 48;
                    Graphics.uiContainer.addChild(this.joinButton);

                    this.userName = Graphics.makeUiElement({
                        text: "Welcome " + Player.userData.username + '!',
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
                            Acorn.Net.socket_.emit(ENUMS.PLAYERUPDATE,Utils.createServerData(ENUMS.COMMAND, ENUMS.LOGOUT));
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
                stateId: 'learnAbilitiesMenu',
                init: function(){
                    document.body.style.cursor = 'default';
                    LearnAbilities.init();
                },
                update: function(dt){
                    LearnAbilities.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'equipAbilitiesMenu',
                init: function(){
                    document.body.style.cursor = 'default';
                    EquipAbilities.init();
                },
                update: function(dt){
                    EquipAbilities.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'unitInventoryMenu',
                init: function(){
                    document.body.style.cursor = 'default';
                    UnitInventory.init();
                },
                update: function(dt){
                    UnitInventory.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'loader',
                init: function(){
                    document.body.style.cursor = 'default';
                    Loader.init();
                },
                update: function(dt){
                    Loader.update(dt);
                }
            });
            Acorn.addState({
                stateId: 'inGame',
                init: function(){
                    document.body.style.cursor = 'default';
                    Game.init();
                },
                update: function(dt){
                    Game.update(dt);
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
                    Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
                    var style = AcornSetup.baseStyle;
                    style.fontsize = 100;
                    
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
                            state.hexagon.style.fill = Graphics.pallette.color1;
                            state.triangle.style.fill = Graphics.pallette.color1;
                            state.rhombus.style.fill = Graphics.pallette.color1;
                            state.hexagon.defaultFill = Graphics.pallette.color1;
                            state.triangle.defaultFill = Graphics.pallette.color1;
                            state.rhombus.defaultFill = Graphics.pallette.color1;
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
                            state.hexagon.style.fill = Graphics.pallette.color1;
                            state.rectangle.style.fill = Graphics.pallette.color1;
                            state.rhombus.style.fill = Graphics.pallette.color1;
                            state.hexagon.defaultFill = Graphics.pallette.color1;
                            state.rectangle.defaultFill = Graphics.pallette.color1;
                            state.rhombus.defaultFill = Graphics.pallette.color1;
                            state.triangle.style.fill = 'gray';
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
                            state.hexagon.style.fill = 'gray';
                            state.rectangle.style.fill = Graphics.pallette.color1;
                            state.triangle.style.fill = Graphics.pallette.color1;
                            state.rhombus.style.fill = Graphics.pallette.color1;
                            state.rectangle.defaultFill = Graphics.pallette.color1;
                            state.triangle.defaultFill = Graphics.pallette.color1;
                            state.rhombus.defaultFill = Graphics.pallette.color1;
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
                            state.hexagon.style.fill = Graphics.pallette.color1;
                            state.triangle.style.fill = Graphics.pallette.color1;
                            state.rectangle.style.fill = Graphics.pallette.color1;
                            state.hexagon.defaultFill = Graphics.pallette.color1;
                            state.triangle.defaultFill = Graphics.pallette.color1;
                            state.rectangle.defaultFill = Graphics.pallette.color1;
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
                        text: 'Size: ',
                        style: style,
                        position: [0,(Graphics.height / 2)],
                    });
                    this.sizeText.style.fontSize = 48;
                    this.sizeText.position.x = (Graphics.width / 2) - this.sizeBar.width/2 - this.sizeText.width/2;
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
                try{
                    if (Acorn.Input.buttons[2]){
                        var mX = Acorn.Input.mouse.X - Acorn.Input.mouse.prevX;
                        var mY = Acorn.Input.mouse.Y - Acorn.Input.mouse.prevY;
                        window.currentGameMap.move(mX,mY);
                    }
                }catch(e){
                    //TODO handle mousemove for all game states
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