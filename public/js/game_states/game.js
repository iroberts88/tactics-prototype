


(function(window) {
    Game = {
        chargeMax: 1000000,
        timePerTurn: null,
        delayBetweenStates: null,
        betweenStateTicker: 0,
        turnTicker: Date.now(),
        currentState: 'idle',
        states: {
            Idle: 'idle',
            BetweenStates: 'betweenStates',
            Turn: 'turn',
        },
        ALStyle: null,
        currentNode: null,
        outlineFilterRed: new PIXI.filters.OutlineFilter(2, 0xff9999),
        filtersOn: function (e) {
            if (Game.selectedUnit || Game.units[e.currentTarget.unitid].isCastTimer){
                return;
            }
            Game.resetTint();
            Game.units[e.currentTarget.unitid].sprite.filters = [Game.outlineFilterRed];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            if (Game.units[e.currentTarget.unitid].currentNode){
                Game.setNewHoveredNode = Game.units[e.currentTarget.unitid].currentNode['sprite' + t];
                Game.currentlyMousedOver = Game.units[e.currentTarget.unitid].currentNode['sprite' + t];
            }else{
                Game.setNewHoveredUnit = Game.units[e.currentTarget.unitid];
            }
        },

        filtersOff: function(e) {
            if (Game.selectedUnit || Game.units[e.currentTarget.unitid].isCastTimer){
                return;
            }
            Game.resetTint();
            Game.units[e.currentTarget.unitid].sprite.filters = [];
        },

        map: null,
        setNewHoveredNode: null, //set a new hovered over node
        setNewHoveredUnit: null, //set a new hovered over unit
        currentlyMousedOver: null,

        selectedUnit: null,
        currentInfoPane: null,

        units: null,
        turnList: null,

        updateUnitsBool: null,

        turnListSprites: null,
        compass: null,
        timeDisplay: null,
        mainMenu: null,
        tilePane: null,
        infoPane: null,
        turnMenu: null,

        pointerSprite: null,

        currentTurnArrow: null,
        turnArrowStartY: null,

        nodeText: null,
        nodeInfo: null,

        losAngle: 1e-6,

        moveNodesActive: [], //contains the currently SHOWN move sprites
        moveActive: false,//movement active?
        movePathDrawn: false,

        attackActive: false,
        attackNodesActive: [],

        abilityActive: false,
        abilityInfo: null,
        abilityNodes: {},
        abilityRadiusNodes: [],
        uiWindows: [], //array containing active UI components?
        currentActionData: null,
        actions: [],
        compass: null,
        compassComponents: [],
        overlaySprites: {},
        currentConfirmWindow: null,
        currentToolTip: null,
        endGame: null,
        won: null,

        activityLog: null,

        init: function() {
            //init variables
            this.timePerTurn = null;
            this.delayBetweenStates = null;
            this.betweenStateTicker = 0;
            this.turnTicker = Date.now();
            this.currentState = 'idle';
            this.currentNode = null;
            this.setNewHoveredNode = null; //set a new hovered over node
            this.setNewHoveredUnit = null; //set a new hovered over unit
            this.currentlyMousedOver = null;
            this.selectedUnit = null;
            this.currentInfoPane = null;
            this.updateUnitsBool = null;
            this.turnListSprites = null;
            this.compass = null;
            this.timeDisplay = null;
            this.mainMenu = null;
            this.tilePane = null;
            this.infoPane = null;
            this.turnMenu = null;
            this.currentTurnArrow = null;
            this.turnArrowStartY = null;
            this.nodeText = null;
            this.nodeInfo = null;
            this.losAngle = 1e-6;
            this.moveNodesActive = []; //contains the currently SHOWN move sprites
            this.moveActive = false;//movement active?
            this.movePathDrawn = false;
            this.attackActive = false;
            this.attackNodesActive = [];
            this.abilityActive = false;
            this.abilityInfo = null;
            this.abilityNodes = {};
            this.abilityRadiusNodes = [];
            this.uiWindows = []; //array containing active UI components?
            this.currentActionData = null;
            this.actions = [];
            this.compass = null;
            this.compassComponents = [];
            this.overlaySprites = {};
            this.currentConfirmWindow = null;
            this.currentToolTip = null;
            this.endGame = null;
            this.won = null;

            this.pointerSprite = new PIXI.Sprite(Graphics.pointerTexture);
            this.pointerSprite.anchor.x = 0.5;
            this.pointerSprite.anchor.y = 1;
            this.pointerSprite.scale.x = 0.5;
            this.pointerSprite.scale.y = 0.5;
            this.pointerSprite.tint = 0x44bf28;
            this.pointerSprite.filters = [Game.map.outlineFilter];
            this.pointerSprite.alpha = 0.8;
            this.pointerSprite.startingPos = 0;


            this.ALStyle = {
                font: '16px Roboto',
                fill: '#AACCDD',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 1,
                wordWrap: true,
                wordWrapWidth: Graphics.width*0.2
            };

            this.drawBG();
            Graphics.worldContainer.addChild(this.map.container2);
            var style = AcornSetup.baseStyle;
            style.fontSize = 24;

            this.rotateText = Graphics.makeUiElement({
                text: 'Rotate (A,D)',
                style: style,
            });
            this.rotateText.style.fontSize = 20;
            this.rotateText.position.x = Graphics.width/2;
            this.rotateText.position.y = this.rotateText.height/2;
            Graphics.uiContainer.addChild(this.rotateText);

            this.turnOrderText = Graphics.makeUiElement({
                text: 'Turn Order',
                style: style,
            });
            this.turnOrderText.style.fontSize = 14;
            this.turnOrderText.position.x = 100;
            this.turnOrderText.position.y = 10;
            Graphics.uiContainer.addChild(this.turnOrderText);

            this.rotateLeft = Graphics.makeUiElement({
                text: '◄',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.Input.setValue(Acorn.Input.Key.ROTATE1, true);
                }
            });
            this.rotateLeft.style.fontSize = 40;
            this.rotateLeft.position.x = Graphics.width/2 - this.rotateLeft.width/2;
            this.rotateLeft.position.y = this.rotateLeft.height/2 + this.rotateText.height/2+5;
            Graphics.uiContainer.addChild(this.rotateLeft);
            this.rotateRight = Graphics.makeUiElement({
                text: '►',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.Input.setValue(Acorn.Input.Key.ROTATE2, true);
                }
            });
            this.rotateRight.style.fontSize = 40;
            this.rotateRight.position.x = Graphics.width/2 + this.rotateRight.width/2;
            this.rotateRight.position.y = this.rotateRight.height/2 + this.rotateText.height/2+5;
            Graphics.uiContainer.addChild(this.rotateRight);

            this.zoomText = Graphics.makeUiElement({
                text: 'Zoom (mwheel)',
                style: style,
            });
            this.zoomText.style.fontSize = 20;
            this.zoomText.position.x = Graphics.width/1.5;
            this.zoomText.position.y = this.zoomText.height/2;
            Graphics.uiContainer.addChild(this.zoomText);

            this.zoomUp = Graphics.makeUiElement({
                text: '+',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Settings.zoom('in');
                }
            });
            this.zoomUp.style.fontSize = 40;
            this.zoomUp.position.x = Graphics.width/1.5 - this.zoomUp.width/2 - 20;
            this.zoomUp.position.y = this.zoomUp.height/2 + this.zoomText.height/2+5;
            Graphics.uiContainer.addChild(this.zoomUp);
            this.zoomDown = Graphics.makeUiElement({
                text: '-',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Settings.zoom('out');
                }
            });
            this.zoomDown.style.fontSize = 40;
            this.zoomDown.position.x = Graphics.width/1.5 + this.zoomDown.width/2 + 20;
            this.zoomDown.position.y = this.zoomDown.height/2 + this.zoomText.height/2+5;
            Graphics.uiContainer.addChild(this.zoomDown);

            this.nodeText = new PIXI.Text("Node Info",style);
            this.nodeInfo = new PIXI.Text('',style);
            this.nodeInfo.anchor.x = 1;
            this.nodeInfo.anchor.y = 1;
            this.nodeText.anchor.x = 0.5;
            this.nodeText.anchor.y = 1;
            this.nodeInfo.position.x = Graphics.width - 20;
            this.nodeInfo.position.y = Graphics.height - 20;
            this.nodeText.visible = false;
            this.nodeInfo.visible = false;
            Graphics.uiContainer.addChild(this.nodeText);
            Graphics.uiContainer.addChild(this.nodeInfo);

            this.battleStartText = new PIXI.Text("BATTLE START",style);
            this.battleStartText.style.fontSize = 120;
            this.battleStartText.anchor.x = 0.5;
            this.battleStartText.anchor.y = 0.5;
            this.battleStartText.position.x = Graphics.width/2;
            this.battleStartText.position.y = Graphics.height/2;
            Graphics.uiContainer.addChild(this.battleStartText);
            this.battleStartText.visible = false;

            this.endButton = Graphics.makeUiElement({
                text: 'EXIT',
                style: style,
                interactive: true,
                buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.changeState('mainMenu');
                }
            });
            this.endButton.style.fontSize = 40;
            this.endButton.anchor.x = 1.0;
            this.endButton.anchor.y = 0;
            this.endButton.position.x = Graphics.width-15;
            this.endButton.position.y = 15;
            Graphics.uiContainer.addChild(this.endButton);
            this.endButton.visible = false;

            window.currentGameMap = this.map;

            Graphics.showLoadingMessage(false);

            this.activityLog = new PIXI.Container();
            this.activityLogArr = [];
            this.activityLog.position.x = Graphics.width*.20;
            this.activityLog.position.y = Graphics.height*0.8;
            Graphics.uiContainer.addChild(this.activityLog);
        },
        activityLogMsg: function(string){
            var txt = new PIXI.Text(string,this.ALStyle);
            txt.anchor.x = 0;
            txt.anchor.y = 0;
            for (let i = 0;i < this.activityLogArr.length;i++){
                this.activityLogArr[i].position.y += (txt.height + 3);
            }
            this.activityLog.addChild(txt);
            this.activityLogArr.push(txt);
            if (this.activityLogArr.length > 20){
                this.activityLog.removeChild(this.activityLogArr[0]);
                this.activityLogArr[0].destroy();
                this.activityLogArr.shift();
            }
        },
        addUnit: function(unit){
            var x = 0;
            var y = 0;
            var t = 1;
            if (!(this.map.currentRotation%2)){t = 2}
            var cont = 'container' + t;
            var sp = 'sprite' + t;
            if (unit.visible){
                //SET CURRENT NODE
                var node = this.map.axialMap[unit.currentNode.q][unit.currentNode.r];
                unit.setCurrentNode(unit.currentNode.q,unit.currentNode.r,this.map);
                node.unit = unit;
                unit.sprite.position.x = node[sp].position.x;
                unit.sprite.position.y = node[sp].position.y-this.map.TILE_HEIGHT*(node.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                this.map[cont].addChildAt(unit.sprite,this.map[cont].getChildIndex(node[sp])+1);
            }
            unit.infoPane = this.getUnitInfoPane(unit.id);
            var overFunc = function(e){
                if (Game.units[e.currentTarget.unitid].isCastTimer){return;}
                Game.selectUnit(Game.units[e.currentTarget.unitid]);
                if (Game.attackActive){
                    Game.tryToAttack(Game.units[e.currentTarget.unitid].currentNode);
                }
                if (Game.abilityActive){
                    Game.tryToAbility(Game.units[e.currentTarget.unitid].currentNode);
                }
            }
            if (!unit.visible){
                unit.sprite.visible = false;
            }
        },
        initUI: function(){
            //initialize the units and every UI element
            for (var i in this.units){
                if (this.units[i].isCastTimer){
                    continue;
                }
                this.addUnit(this.units[i])
            }

            //UI Elements

            //Turn order
            this.turnListSprites = [];
            for (var i = 0; i < this.turnList.length;i++){
                //create box
                if (i > 9){break;}
                var sprite = this.getTurnBox(this.turnList[i]);
                sprite.position.x = 25;
                sprite.position.y = 25 + i*75;
                Graphics.uiContainer.addChild(sprite);
                this.turnListSprites.push(sprite);
                sprite.on('pointerover', Game.filtersOn);
                sprite.on('pointerout', Game.filtersOff);

                var num = new PIXI.Text(i+1,AcornSetup.baseStyle);
                num.style.fontSize = 14
                num.anchor.y = 0.5;
                num.position.y = sprite.position.y + 37;
                num.position.x = 2;
                Graphics.uiContainer.addChild(num);
            }

            //Current Turn window

            //Compass
            this.compass = new PIXI.Container();
            this.compass.position.x = Graphics.width/12;
            this.compass.position.y = Graphics.height*0.9;
            Graphics.uiContainer.addChild(this.compass);
            this.compassComponents = [];
            var scale = 2.3;
            for (var i = 0; i < this.map.cardinalDirections.length;i++){
                var cont = {};
                var extra = 1.15;
                cont.sprite = Graphics.getSprite('overlay2');
                this.compass.addChild(cont.sprite);
                //get rotated positions?
                var startX = this.map.TILE_SIZE*scale * 1.5 * this.map.cubeDirections[i][0]*extra;
                var startY = this.map.TILE_SIZE*scale * Math.sqrt(3) * (this.map.cubeDirections[i][1]+this.map.cubeDirections[i][0]/2)*extra;
                cont.sprite.position.x = startX;
                cont.sprite.position.y = startY;
                cont.sprite.scale.x = scale;
                cont.sprite.scale.y = scale;
                cont.sprite.anchor.x = 0.5;
                cont.sprite.anchor.y = 0.5;
                cont.sprite.tint = '0xADADAD';
                cont.rotatedPositions = {};
                cont.text = new PIXI.Text(this.map.cardinalDirectionsAbrv[i],AcornSetup.baseStyle2);
                cont.text.anchor.x = 0.5;
                cont.text.anchor.y = 0.5;
                cont.text.position.x = startX;
                cont.text.position.y = startY-this.map.TILE_HEIGHT*scale;
                cont.text.cDir = i;
                cont.text.interactive = true;
                cont.text.buttonMode = true;
                var overFunc = function(e){
                    Game.tryToEnd(Game.map.cardinalDirections[e.currentTarget.cDir]);
                }
                cont.text.on('pointerdown',overFunc);
                this.compass.addChild(cont.text);
                var flatCube = [this.map.cubeDirections[i][0],this.map.cubeDirections[i][1],this.map.cubeDirections[i][2]];
                var pointCube = [this.map.cubeDirections[i][0],this.map.cubeDirections[i][1],this.map.cubeDirections[i][2]];
                for (var j = 0; j < 12;j++){
                    if (j%2 == 0){
                        cont.rotatedPositions[j] = {
                            x: this.map.TILE_SIZE*scale * 1.5 * flatCube[0]*extra,
                            y: this.map.TILE_SIZE*scale * Math.sqrt(3) * (flatCube[1]+flatCube[0]/2)*extra
                        }
                        flatCube = [-flatCube[2],-flatCube[0],-flatCube[1]];
                    }else{
                        cont.rotatedPositions[j] = {
                            x:this.map.TILE_SIZE*scale * Math.sqrt(3) * (pointCube[0]+(pointCube[1]/2))*extra,
                            y:this.map.TILE_SIZE*scale * 1.5 * pointCube[1]*extra
                        }
                        pointCube = [-pointCube[2],-pointCube[0],-pointCube[1]];
                    }
                }
                this.compassComponents.push(cont);
            }
            //Time/player turn
            this.timeText = Graphics.makeUiElement({
                text: '',
                style: AcornSetup.baseStyle
            });
            this.timeText.anchor.x = 0;
            this.timeText.position.x = Graphics.width/4;
            this.timeText.position.y = 10;
            Graphics.uiContainer.addChild(this.timeText);
            this.timeText.visible = false;

            //Menu

            Graphics.worldPrimitives.position.x = Graphics.width/2;
            Graphics.worldPrimitives.position.y = Graphics.height/2;
        },
        updateCompass: function(){
            for (var i = 0; i < this.compassComponents.length;i++){
                var cr = this.map.currentRotation;
                var component = this.compassComponents[i];
                var t = 1;
                if (!(cr%2)){t = 2}
                component.sprite.texture = Graphics.getResource('overlay' + t);
                component.sprite.position.x = component.rotatedPositions[cr].x;
                component.sprite.position.y = component.rotatedPositions[cr].y;
                component.text.position.x = component.rotatedPositions[cr].x;
                component.text.position.y = component.rotatedPositions[cr].y-this.map.TILE_HEIGHT*2.3;
            }
        },
        startGame: function(){
            //the first turn starts
            this.betweenStateTicker = 0;
            this.turnTicker = Date.now();
            this.currentState = this.states.BetweenStates;
            this.battleStartText.visible = true;
            this.resetTurnMenu();
            this.units[this.turnList[0]].sprite.addChild(this.pointerSprite);
            this.pointerSprite.startingPos = -1* this.units[this.turnList[0]].sprite.height-this.map.TILE_HEIGHT;
            this.pointerSprite.moveTicker = 0;
            this.pointerSprite.moveTime = 0.25;
            this.pointerSprite.moveDir = -1;
            this.pointerSprite.moveSpeed = 40;
            this.pointerSprite.position.y = this.pointerSprite.startingPos;
            //this.getLineOfSight();
        },
        resetTurnMenu: function(){
            if (this.turnMenu){
                if (this.turnMenu.parent == Graphics.uiContainer){
                    Graphics.uiContainer.removeChild(this.turnMenu);
                }
            }
            this.turnMenu = this.getTurnMenu();
            this.turnMenu.position.x = 180;
            this.turnMenu.position.y = 25;
            Graphics.uiContainer.addChild(this.turnMenu);
        },

        newTurnOrder: function(arr){
            //set timer
            if (this.pointerSprite.parent){
                this.pointerSprite.parent.removeChild(this.pointerSprite);
            }
            this.timeText.visible = false;
            this.betweenStateTicker = 0;
            this.turnTicker = Date.now();
            this.currentState = this.states.BetweenStates;
            Graphics.uiContainer.removeChild(this.turnMenu);

            for (var i = 0; i < this.turnListSprites.length;i++){
                Graphics.uiContainer.removeChild(this.turnListSprites[i]);
            }
            if (this.abilityActive){
                Graphics.uiContainer.removeChild(this.abilityMenu);
            }
            var turnList = [];
            var unitList = [];
            for (var i in this.units){
                if (this.units[i].actionUsed){
                    this.units[i].actionUsed = false;
                }
                unitList.push({
                    id: this.units[i].id,
                    spd: this.units[i].speed,
                    cr: this.units[i].cr
                });
            }
            //TODO get the actual turn list...

            this.turnListSprites = [];
            for (var i = 0; i < this.turnList.length;i++){
                //create box
                if (i > 9){break;}
                var sprite = this.getTurnBox(this.turnList[i]);
                sprite.position.x = 25;
                sprite.position.y = 25 + i * 75;
                Graphics.uiContainer.addChild(sprite);
                this.turnListSprites.push(sprite);
                var overFunc = function(e){
                    if (Game.units[e.currentTarget.unitid].isCastTimer){return;}
                    Game.selectUnit(Game.units[e.currentTarget.unitid]);
                    if (Game.attackActive){
                        Game.tryToAttack(Game.units[e.currentTarget.unitid].currentNode);
                    }
                }
                sprite.on('pointerdown',overFunc);
                sprite.on('pointerover', Game.filtersOn);
                sprite.on('pointerout', Game.filtersOff);
            }
            //set new pointer position
            this.units[this.turnList[0]].sprite.addChild(this.pointerSprite);
            this.pointerSprite.position.y = this.pointerSprite.startingPos;
            this.resetTurnMenu()
            this.clearOverlaySprites();
            Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
        },

        update: function(deltaTime){
            this.map.update(deltaTime);
            //update pointer
            this.pointerSprite.position.y += (deltaTime*this.pointerSprite.moveSpeed*this.pointerSprite.moveDir);
            if (this.pointerSprite.position.y > this.pointerSprite.startingPos){
                this.pointerSprite.position.y = this.pointerSprite.startingPos;
            }
            if (this.pointerSprite.position.y < this.pointerSprite.startingPos-this.pointerSprite.speed*this.pointerSprite.moveTime){
                this.pointerSprite.position.y = this.pointerSprite.startingPos-this.pointerSprite.speed*this.pointerSprite.moveTime;
            }
            this.pointerSprite.moveTicker += deltaTime;
            if (this.pointerSprite.moveTicker > this.pointerSprite.moveTime){
                this.pointerSprite.moveTicker -= this.pointerSprite.moveTime;
                this.pointerSprite.moveDir*= -1;
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.CANCEL)){
                this.setNewHoveredNode = null;
                this.setNewHoveredUnit = null;
                if (this.abilityMenu){
                    if (this.abilityMenu.parent == Graphics.uiContainer){
                        Graphics.uiContainer.removeChild(this.abilityMenu);
                        this.abilityMenu = null;
                    }
                }
                if (this.selectedUnit){
                    this.selectedUnit.sprite.filters = [];
                    var node = Game.map.axialMap[this.selectedUnit.currentNode.q][this.selectedUnit.currentNode.r];
                    node.sprite1.filters = [];
                    node.sprite2.filters = [];
                    Graphics.uiContainer.removeChild(this.currentInfoPane);
                    this.currentInfoPane = null;
                    this.selectedUnit = null;
                }
                this.clearOverlaySprites();
                for (var i = 0; i < this.uiWindows.length;i++){
                    Graphics.uiContainer.removeChild(this.uiWindows[i]);
                    this.uiWindows.splice(i,1);
                }
                if (this.currentConfirmWindow){
                    Graphics.uiContainer.removeChild(this.currentConfirmWindow);
                    this.currentConfirmWindow = null;
                }
                if (this.currentToolTip){
                    Graphics.uiContainer2.removeChild(this.currentToolTip);
                    this.currentToolTip = null;
                }
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, false);
            }

            if (Acorn.Input.isPressed(Acorn.Input.Key.INTERACT)){
                if (this.currentConfirmWindow){
                    var e = {currentTarget: this.currentConfirmWindow.confirmButton};
                    this.currentConfirmWindow.confirmButton.clickFunc(e);
                }
                Acorn.Input.setValue(Acorn.Input.Key.INTERACT, false);
            }

            if (this.endGame){
                this.battleStartText.visible = true;
                if (this.won){
                    this.battleStartText.text = 'YOU WON!';
                }else{
                    this.battleStartText.text = 'You LOSE...';
                }
                this.battleStartText.alpha = 1.0;
                this.endButton.visible = true;
                Graphics.drawBoxAround(this.endButton,Graphics.uiPrimitives);
                return;
            }
            if (this.battleStartText.visible){
                this.battleStartText.alpha = this.battleStartText.alpha * 0.97;
                if (this.battleStartText.alpha <= 0.01){
                    this.battleStartText.visible = false;
                    this.battleStartText.alpha = 1.0;
                }
            }
            if (!this.map.rotateData){
                //set the new currently selected node after mouseover
                try{

                    if (this.updateUnitsBool || this.map.changedZoom){
                        this.updateUnits();
                    }
                    if (this.setNewHoveredNode && this.selectedUnit == null){
                        this.setHoveredNode();
                    }else if(this.setNewHoveredUnit && this.selectedUnit == null){
                        this.setHoveredUnit();
                    }
                }catch(e){
                    console.log(e)
                }
            }else{
                this.updateUnitsBool = true;
            }
            if (this.actions.length){
                Game.turnMenu.visible = false;
                this.actions[0].update(deltaTime);
                if (this.actions[0].end || this.actions[0].actions.length == 0){
                    this.actions.splice(0,1);
                    if (this.actions.length == 0){
                        Game.resetTurnMenu();
                        Game.turnMenu.visible = true;
                    }
                }
            }
            for (var i in this.units){
                if (this.units[i].isCastTimer){
                    continue;
                }
                try{
                    if (!this.units[i].sprite.parent.parent){
                        //units havent updated properly...
                        this.updateUnitsBool = true;
                        return;
                    }
                }catch(e){}
                this.units[i].update(deltaTime);
                if (this.units[i].dead && this.units[i].damageText.length == 0 && !this.units[i].actionBubble){
                    delete this.units[i];
                }else if (this.units[i].updateInfoPane){
                    this.units[i].infoPane = this.getUnitInfoPane(i);
                    this.units[i].updateInfoPane = false;
                }
            }
            //update timers
            switch (this.currentState){
                case this.states.Idle:
                    break;
                case this.states.BetweenStates:
                    this.betweenStateTicker += deltaTime;
                    if (this.betweenStateTicker >= this.delayBetweenStates){
                        this.timeText.visible = true;
                        this.currentState = this.states.Turn;
                    }
                    break;
                case this.states.Turn:
                    var time = Math.floor((Date.now() - this.turnTicker) / 1000);
                    this.timeText.text = 'Time left: ' + (this.timePerTurn - time);
                    if (time >= this.timePerTurn){
                        this.currentState = this.states.Idle;
                        this.timeText.visible = false;
                    }
                    break;
            }
            
        },

        tryToMove: function(node){
            //check if the move is actually valid
            var valid = false;
            if (this.moveActive){
                for (var i = 0; i < this.moveNodesActive.length;i++){
                    if (node.q == Game.moveNodesActive[i].q && node.r == Game.moveNodesActive[i].r){
                        valid = true;
                    }
                }
            }
            if (!valid){
                return;
            }
            
            var text = "Move " + this.units[this.turnList[0]].name + ' to node ' + node.q + ',' + node.r + '?';
            var y = function(){
                console.log('Send Move!!');
                if (!Game.moveActive){
                    return;
                }
                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,Utils.createServerData(
                    Enums.COMMAND, Enums.MOVE,
                    Enums.Q, node.q,
                    Enums.R, node.r
                ));
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var n = function(){
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var s = this.getConfirmationWindow(text,y,n,node);
            Graphics.uiContainer.addChild(s);
            this.uiWindows.push(s);
        },
        tryToAttack: function(node){
            //check if the attack is actually valid
            var valid = false;
            if (this.attackActive){
                for (var i = 0; i < this.attackNodesActive.length;i++){
                    if (node.q == Game.attackNodesActive[i].q && node.r == Game.attackNodesActive[i].r && Game.attackNodesActive[i].unit){
                        valid = true;
                    }
                }
            }
            if (!valid){
                return;
            }
            
            var text = "Attack " + node.unit.name + ' with ' + this.units[this.turnList[0]].getWeapon().name + '?';
            var y = function(){
                console.log('Send attack!!');
                if (!Game.attackActive){
                    return;
                }
                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,Utils.createServerData(
                    Enums.COMMAND, Enums.ATTACK,
                    Enums.Q, node.q,
                    Enums.R, node.r
                ));
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
                Game.attackActive = false;
            }
            var n = function(){
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var s = this.getConfirmationWindow(text,y,n,node);
            Graphics.uiContainer.addChild(s);
            this.uiWindows.push(s);
        },
        tryToAbility: function(node){
            //check if the attack is actually valid
            var valid = false;
            if (this.abilityActive){
                if (this.abilityNodes[node.id]){
                    valid = true;
                    //test target type here?
                    switch(Game.abilityInfo.type){
                        case 'anyhex':
                            //always valid
                            break;
                        case 'singleunit':
                            if (!node.unit){
                                valid = false;
                            }
                            break;
                        case 'openhex':
                            if (node.unit){
                                valid = false;
                            }
                            break;
                        default:
                            return;
                    }
                }
            }
            if (!valid){
                return;
            }
            
            var text = "Use " + Game.abilityInfo.name + ' on the selected node?';
            var y = function(){
                console.log('Send ability!!');
                if (!Game.abilityActive){
                    return;
                }
                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,Utils.createServerData(
                    Enums.COMMAND, Enums.ABILITY,
                    Enums.ABILITYID, Game.abilityInfo.id,
                    Enums.Q, node.q,
                    Enums.R, node.r
                ));
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var n = function(){
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var s = this.getConfirmationWindow(text,y,n,node);
            Graphics.uiContainer.addChild(s);
            this.uiWindows.push(s);
        },

        tryToItem: function(pos, text){

            var y = function(){
                console.log('Send item!!');
                if (!Game.abilityActive){
                    return;
                }
                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,Utils.createServerData(
                    Enums.COMMAND, Enums.ITEM,
                    Enums.ITEM, pos
                ));
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var n = function(){
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var s = this.getConfirmationWindow(text,y,n);
            Graphics.uiContainer.addChild(s);
            this.uiWindows.push(s);
        },

        tryToEnd: function(dir){
            //check if its your unit
            if (this.units[this.turnList[0]].owner != window.playerID){
                return;
            }
            
            var text = "End " + this.units[this.turnList[0]].name + '\'s turn facing ' + dir + '?';
            var y = function(){
                console.log('Send end command!!');
                Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,Utils.createServerData(
                    Enums.COMMAND, Enums.ENDTURN,
                    Enums.DIRECTION, dir,
                ));
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var n = function(){
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
            }
            var s = this.getConfirmationWindow(text,y,n,null);
            Graphics.uiContainer.addChild(s);
            this.uiWindows.push(s);
        },

        getConfirmationWindow: function(text,yesFunc,noFunc,node = null){
            //get the confirmatin window for move/attack/end etc.
            //text is the text above the window
            //yesFunc is the click function for Confirm
            //noFunc is the click function for Cancel
            var h = 5;
            var w = 400;

            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0xFFFFFF;
            var style  = AcornSetup.baseStyle2;
            scene.addChild(gfx);
            scene.addChild(cont);

            var text = new PIXI.Text(text, style);
            text.anchor.x = 0.5;
            text.position.x = w*0.5;
            text.position.y = h;
            text.style.fill = 'red';
            text = Graphics.fitText(text,w-5);
            cont.addChild(text);
            h += text.height + 5;
      
            scene.confirmButton = Graphics.makeUiElement({
                text: 'Yes',
                style: style,
                interactive: true,
                buttonMode: true,
                anchor: [0.5,0],
                position: [w/4,h],
                clickFunc: yesFunc
            });
            scene.confirmButton.node = node;
            cont.addChild(scene.confirmButton);

            var cancelButton = Graphics.makeUiElement({
                text: 'No',
                style: style,
                interactive: true,
                buttonMode: true,
                anchor: [0.5,0],
                position: [w*0.75,h],
                clickFunc: noFunc
            });
            cont.addChild(cancelButton); 
            h += cancelButton.height + 10;
              
            gfx.beginFill(color,0.3);
            gfx.drawRect(0,0,w,h);
            gfx.endFill();
            gfx.lineStyle(3,color,1);
            gfx.moveTo(2,2);
            gfx.lineTo(w-2,2);
            gfx.lineTo(w-2,h-2);
            gfx.lineTo(2,h-2);
            gfx.lineTo(2,2);
            this.drawBoxAround(scene.confirmButton,gfx);
            this.drawBoxAround(cancelButton,gfx);
``
            //add it to uiWindows
            scene.position.x = Graphics.width/2-w/2;
            scene.position.y = Graphics.height/4-h/2;
            this.currentConfirmWindow = scene;
            return scene;
        },

        getTurnMenu: function(){
            var h = 5;
            var w = 325;

            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0xFFFFFF;
            var style  = AcornSetup.baseStyle2;
            scene.addChild(gfx);
            scene.addChild(cont);
            scene.turnMenuElements = {

            }
            var unit = this.units[this.turnList[0]];
            if (unit.owner != window.playerID){
                var name = new PIXI.Text("Enemy Turn", style);
                name.anchor.x = 0.5;
                name.position.x = w*0.5;
                name.position.y = h;
                name.style.fill = 'red';
                name = Graphics.fitText(name,w-5);
                cont.addChild(name);
                scene.turnMenuElements.name = name;
                h += name.height + 5;
            }else{
                var name = new PIXI.Text(unit.name + '\'s turn!', style);
                name.style.fill = 'blue';
                name.anchor.x = 0.5;
                name.position.x = w*0.5;
                name.position.y = h;
                name = Graphics.fitText(name,w-5);
                scene.turnMenuElements.name = name;
                cont.addChild(name);
                h += name.height + 5;

                //action buttons!

                //Move button
                if (!unit.moveLeft){
                    var moveButton = Graphics.makeUiElement({
                        text: 'Move',
                        style: style,
                        anchor: [0.5,0],
                        position: [w/4,h]
                    });
                    moveButton.style.fill = 'red';
                }else{
                    var moveButton = Graphics.makeUiElement({
                        text: 'Move',
                        style: style,
                        interactive: true,
                        buttonMode: true,
                        anchor: [0.5,0],
                        position: [w/4,h],
                        clickFunc: function onClick(){
                            Game.clearOverlaySprites();
                            Game.moveActive = true;
                            Game.getMoveNodes();
                        }
                    });
                }
                scene.turnMenuElements.moveButton = moveButton;
                cont.addChild(moveButton);  
                //Move text
                var t = (unit.moveLeft == null) ? 'Moves left: ???' : 'Moves left: ' + unit.moveLeft;
                var moveText = new PIXI.Text(t, style);
                moveText.anchor.x = 0.5;
                moveText.position.x = w*0.75;
                moveText.position.y = h;
                moveText = Graphics.fitText(moveText,w/2-5);
                cont.addChild(moveText);
                scene.turnMenuElements.moveText = moveText;
                h += moveButton.height + 10;
                //Attack button
                if (unit.actionUsed){
                    var attackButton = Graphics.makeUiElement({
                        text: 'Attack',
                        style: style,
                        anchor: [0.5,0],
                        position: [w/4,h]
                    });
                    attackButton.style.fill = 'red';
                }else{
                    var attackButton = Graphics.makeUiElement({
                        text: 'Attack',
                        style: style,
                        interactive: true,
                        buttonMode: true,
                        anchor: [0.5,0],
                        position: [w/4,h],
                        clickFunc: function onClick(){
                            Game.clearOverlaySprites();
                            Game.attackActive = true;
                            Game.getAttackNodes();
                        }
                    });
                }
                scene.turnMenuElements.attackButton = attackButton;
                cont.addChild(attackButton); 
                //weapon name text
                var t = (unit.weapon == null) ? 'Unarmed' : unit.inventory.items[unit.weapon].name;
                var attackText = new PIXI.Text(t, style);
                attackText.anchor.x = 0.5;
                attackText.position.x = w*0.75;
                attackText.position.y = h;
                attackText = Graphics.fitText(attackText,w/2-5);
                cont.addChild(attackText);
                scene.turnMenuElements.attackText = attackText;
                h += attackButton.height + 10;
                //Action button
                if (unit.actionUsed){
                    var actionButton = Graphics.makeUiElement({
                        text: 'Action',
                        style: style,
                        anchor: [0.5,0],
                        position: [w/2,h]
                    });
                    actionButton.style.fill = 'red';
                }else{
                    var actionButton = Graphics.makeUiElement({
                        text: 'Action',
                        style: style,
                        interactive: true,
                        buttonMode: true,
                        anchor: [0.5,0],
                        position: [w/2,h],
                        clickFunc: function onClick(){
                            Game.clearOverlaySprites();
                            if (Game.abilityMenu){
                                Graphics.uiContainer.removeChild(Game.abilityMenu);
                                Game.abilityMenu.destroy({children: true});
                                Game.abilityMenu = null;
                            }
                            Game.abilityActive = true;
                            Game.abilityMenu = Game.getAbilityMenu(Game.units[Game.turnList[0]]);
                            Game.abilityMenu.position.x = Game.turnMenu.position.x;
                            Game.abilityMenu.position.y = Game.turnMenu.position.y + 10 + Game.turnMenu.height;
                            Graphics.uiContainer.addChild(Game.abilityMenu);
                        }
                    });
                }
                scene.turnMenuElements.actionButton = actionButton;
                cont.addChild(actionButton);
                h += actionButton.height + 10;
                //Inventory Button
                if (unit.actionUsed){
                    var inventoryButton = Graphics.makeUiElement({
                        text: 'Inventory',
                        style: style,
                        anchor: [0.5,0],
                        position: [w/2,h]
                    });
                    inventoryButton.style.fill = 'red';
                }else{
                    var inventoryButton = Graphics.makeUiElement({
                        text: 'Inventory',
                        style: style,
                        interactive: true,
                        buttonMode: true,
                        anchor: [0.5,0],
                        position: [w/2,h],
                        clickFunc: function onClick(){
                            Game.clearOverlaySprites();
                            if (Game.abilityMenu){
                                Graphics.uiContainer.removeChild(Game.abilityMenu);
                                Game.abilityMenu.destroy({children: true});
                                Game.abilityMenu = null;
                            }
                            Game.abilityActive = true;
                            Game.abilityMenu = Game.getItemMenu(Game.units[Game.turnList[0]]);
                            Game.abilityMenu.position.x = Game.turnMenu.position.x;
                            Game.abilityMenu.position.y = Game.turnMenu.position.y + 10 + Game.turnMenu.height;
                            Graphics.uiContainer.addChild(Game.abilityMenu);
                        }
                    });
                }
                scene.turnMenuElements.inventoryButton = inventoryButton;
                cont.addChild(inventoryButton);
                h += inventoryButton.height + 10;
                //Wait button
                var waitButton = Graphics.makeUiElement({
                    text: 'Click a direction on the compass to end your turn early!',
                    wrap: w*0.9,
                    fontSize: 14,
                    style: style,
                    anchor: [0.5,0],
                    position: [w/2,h],
                });
                scene.turnMenuElements.waitButton = waitButton;
                cont.addChild(waitButton);
                h += waitButton.height + 10;
                //CR%?
            }

            gfx.beginFill(color,0.3);
            gfx.drawRect(0,0,w,h);
            gfx.endFill();
            gfx.lineStyle(3,color,1);
            gfx.moveTo(2,2);
            gfx.lineTo(w-2,2);
            gfx.lineTo(w-2,h-2);
            gfx.lineTo(2,h-2);
            gfx.lineTo(2,2);

            if (unit.owner == window.playerID){
                this.drawBoxAround(moveButton,gfx);
                this.drawBoxAround(attackButton,gfx);
                this.drawBoxAround(actionButton,gfx);
                this.drawBoxAround(inventoryButton,gfx);
            }
            //create and render the texture and sprite
            return scene;
        },
        drawBoxAround: function(button,gfx){
            gfx.moveTo(button.position.x - button.width/2-2,button.position.y-2);
            gfx.lineTo(button.position.x + button.width/2+2,button.position.y-2);
            gfx.lineTo(button.position.x + button.width/2+2,button.position.y+button.height+2);
            gfx.lineTo(button.position.x - button.width/2-2,button.position.y+button.height+2);
            gfx.lineTo(button.position.x - button.width/2-2,button.position.y-2);
        },

        getMoveNodes: function(){
            var unit = this.units[this.turnList[0]];
            var possibleNodes = this.map.cubeSpiral(unit.currentNode,unit.moveLeft);
            var start;
            var end;
            var pathArr;
            for(var i = 0; i < possibleNodes.length;i++){
                start = unit.currentNode;
                end = possibleNodes[i];
                if (end.unit != null){
                    continue;
                }
                pathArr = this.map.findPath(start,end,{maxJump:unit.jump,startingUnit:unit});
                if(pathArr.length != 0 && pathArr.length <= unit.moveLeft+1){
                    this.moveNodesActive.push(end);
                    end.setOverlaySprites(0x0FFFF0);
                    this.overlaySprites[end.id] = end;
                    this.addOverlaySprites();
                }
            }
        },
        getAttackNodes: function(){
            var unit = this.units[this.turnList[0]];
            var weapon = unit.getWeapon();
            var possibleNodes = this.getWeaponNodes(unit,weapon);
            for(var i = 0; i < possibleNodes.length;i++){
                //TODO calculate possible nodes here??
                this.attackNodesActive.push(possibleNodes[i]);
                possibleNodes[i].setOverlaySprites(0xFF0000);
                this.overlaySprites[possibleNodes[i].id] = possibleNodes[i];
                this.addOverlaySprites();
            }
        },
        getWeaponNodes: function(unit,weapon){
            let possibleNodes = null;
            if (typeof weapon.eqData.range == 'number'){
                possibleNodes = this.map.cubeSpiral(unit.currentNode,weapon.eqData.range);
                for (var i = possibleNodes.length-1; i >= 0;i--){
                    if (this.map.cubeDistance(possibleNodes[i],unit.currentNode) < weapon.eqData.range){
                        possibleNodes.splice(i,1);
                    }
                }
            }else{
                possibleNodes = this.map.cubeSpiral(unit.currentNode,weapon.eqData.rangeMax);
                for (var i = possibleNodes.length-1; i >= 0;i--){
                    if (this.map.cubeDistance(possibleNodes[i],unit.currentNode) < weapon.eqData.rangeMin){
                        possibleNodes.splice(i,1);
                    }
                }
            }
            return possibleNodes;
        },
        
        getAbilityNodes: function(ability){
            var unit = this.units[this.turnList[0]];
            var possibleNodes = [];
            var selfNode = null;
            switch(ability.range){
                case 'self':
                    //this should pop up a confirm window immediately?
                    var selfNode = unit.currentNode;
                    possibleNodes = [unit.currentNode];
                    break;
                case 'melee':
                    var weapon = unit.getWeapon();
                    if (weapon.type == 'gun'){
                        return;
                    }
                    possibleNodes = this.getWeaponNodes(unit,weapon);
                    break;
                case 'ranged':
                    var weapon = unit.getWeapon();
                    if (weapon.type == 'weapon'){
                        return;
                    }
                    possibleNodes = this.getWeaponNodes(unit,weapon);
                    break;
                case 'weapon':
                    var weapon = unit.getWeapon();
                    possibleNodes = this.getWeaponNodes(unit,weapon);
                    break;
                default:
                    //range is a special string, parse for ability distance
                    var range = Utils.parseRange(unit,ability.range);
                    if (range.m){
                        //must be a move path
                        var pNodes = this.map.cubeSpiral(unit.currentNode,range.d);
                        for(var i = 0; i < pNodes.length;i++){
                            start = unit.currentNode;
                            end = pNodes[i];
                            if (end.unit != null){
                                continue;
                            }
                            var path = this.map.findPath(start,end,{maxJump:range.h,startingUnit:unit});
                            if(path.length != 0 && path.length <= range.d+1){
                                possibleNodes.push(end);
                            }
                        }
                    }else{
                        possibleNodes = this.map.cubeSpiral(unit.currentNode,range.d);
                    }
                    console.log(range);
                    for (var i = 0; i < possibleNodes.length;i++){
                        if (ability.projectile){
                            if (possibleNodes[i].h - unit.currentNode.h > range.h || (unit.currentNode == possibleNodes[i] && !range.s)){
                                possibleNodes.splice(i,1);
                                i -= 1;
                            }
                        }else{
                            if (Math.abs(unit.currentNode.h - possibleNodes[i].h) > range.h || (unit.currentNode == possibleNodes[i] && !range.s)){
                                possibleNodes.splice(i,1);
                                i -= 1;
                            }
                        }
                    }
                    if (possibleNodes.length == 1){
                        var selfNode = possibleNodes[0];
                    }
                    break;
            }
            Game.abilityActive = true;
            Game.abilityInfo = ability;
            for(var i = 0; i < possibleNodes.length;i++){
                //TODO calculate possible nodes here??
                var axial = possibleNodes[i];
                this.abilityNodes[axial.q + ',' + axial.r] = axial;
                axial.setOverlaySprites(0x0FFFF0);
                this.overlaySprites[axial.id] = axial;
                this.addOverlaySprites();

                //now find the possible radius nodes and add them to axial.mouseOverNodes
                axial.mouseOverNodes = [];
                if (!ability.radius){
                    axial.mouseOverNodes.push(axial);
                    continue;
                }
                var n = Utils.getRadiusN(unit,ability.radius);
                var type = Utils.getRadiusType(ability.radius);
                switch (type){
                    case 'circle':
                        var mONodes = this.map.cubeSpiral(axial,n-1);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'circle2':
                        var mONodes = this.map.cubeSpiral2(axial,n-1);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;

                    case 'line':
                        var mONodes = this.map.line1Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line2':
                        var mONodes = this.map.line2Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line3':
                        var mONodes = this.map.line3Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line4':
                        var mONodes = this.map.line4Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line5':
                        var mONodes = this.map.line5Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line6':
                        var mONodes = this.map.line6Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line7':
                        var mONodes = this.map.line7Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line8':
                        var mONodes = this.map.line8Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'line9':
                        var mONodes = this.map.line9Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;

                    case 'cone':
                        var mONodes = this.map.cone1Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'cone2':
                        var mONodes = this.map.cone2Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'cone3':
                        var mONodes = this.map.cone3Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'cone4':
                        var mONodes = this.map.cone4Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'cone5':
                        var mONodes = this.map.cone5Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'cone6':
                        var mONodes = this.map.cone6Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'cone7':
                        var mONodes = this.map.cone7Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;

                    case 'diag':
                        var mONodes = this.map.diag1Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'diag2':
                        var mONodes = this.map.diag2Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'diag3':
                        var mONodes = this.map.diag3Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'diag4':
                        var mONodes = this.map.diag4Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'diag5':
                        var mONodes = this.map.diag5Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'diag6':
                        var mONodes = this.map.diag6Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'diag7':
                        var mONodes = this.map.diag7Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    case 'diag8':
                        var mONodes = this.map.diag8Nodes(unit.currentNode,axial,n);
                        for (var j = 0; j < mONodes.length;j++){
                            axial.mouseOverNodes.push(mONodes[j]);
                        }
                        break;
                    default:
                        break;
                }
            }
            if (selfNode){
                //immediately do the node action
                Game.setNewHoveredNode = selfNode;
                var t = 1;
                if (!(this.map.currentRotation%2)){t = 2}
                Game.currentlyMousedOver = selfNode['sprite' + t];
                Game.tryToAbility(selfNode);
            }
        },
        getAbilityMenu: function(unit){
            //return a ui window for the given unit's ability list
            var h = 5;
            var w = 325;
            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0xFFFFFF;
            var style  = AcornSetup.baseStyle2;
            scene.addChild(gfx);
            scene.addChild(cont);
            if (!unit.classInfo.equippedAbilities){
                //you dont have the full info for this unit. No ability menu available
                return null;
            }
            var abText = new PIXI.Text('Choose an ability!', style);
            abText.style.fill = 'blue';
            abText.anchor.x = 0.5;
            abText.position.x = w*0.5;
            abText.position.y = h;
            abText = Graphics.fitText(abText,w-5);
            cont.addChild(abText);
            h += abText.height + 5;
            cont.uiElements = [];
            for (var ability in unit.classInfo.equippedAbilities){
                var aInfo = null
                for (var cl in unit.classInfo.allClassAbilities){
                    for (var i = 0; i < unit.classInfo.allClassAbilities[cl].length;i++){
                        if (unit.classInfo.allClassAbilities[cl][i].id == ability){
                            aInfo = unit.classInfo.allClassAbilities[cl][i]
                        }
                    }
                }
                if (!aInfo){
                    console.log('couldnt find ability: ' + ability);
                }else{
                    //do stuff with ability here
                    if (aInfo.type == 'passive' || aInfo.type == 'reaction'){
                        continue;
                    }
                    var clickFunc = function(e){
                        console.log('clicked! ' + e.currentTarget.abilityInfo.name);
                        Game.clearOverlaySprites();
                        Game.getAbilityNodes(e.currentTarget.abilityInfo);
                        if (e.currentTarget.tooltipAdded){
                            Graphics.uiContainer2.removeChild(e.currentTarget.tooltip.sprite);
                            Game.currentToolTip = null;
                            e.currentTarget.tooltipAdded = false;
                        }
                    }
                    var ablButton = Graphics.makeUiElement({
                        text: aInfo.name,
                        style: style,
                        interactive: true,
                        buttonMode: true,
                        anchor: [0.5,0],
                        position: [w/2,h],
                        clickFunc: clickFunc

                    });
                    while(ablButton.width > w - 10){
                        ablButton.scale.x = ablButton.scale.x*0.95;
                        ablButton.scale.y = ablButton.scale.y*0.95;
                    }
                    ablButton.tooltip = new Tooltip();
                    ablButton.tooltip.setAbilityTooltip(ablButton,aInfo,unit);
                    ablButton.abilityInfo = aInfo;
                    ablButton.toolTipShown = false;
                    cont.addChild(ablButton);
                    cont.uiElements.push(ablButton);
                    h += ablButton.height + 10;
                }
            }
            

            gfx.beginFill(color,0.3);
            gfx.drawRect(0,0,w,h);
            gfx.endFill();
            gfx.lineStyle(3,color,1);
            gfx.moveTo(2,2);
            gfx.lineTo(w-2,2);
            gfx.lineTo(w-2,h-2);
            gfx.lineTo(2,h-2);
            gfx.lineTo(2,2);

            //create and render the texture and sprite
            return scene;
        },
        getItemMenu: function(unit){
            //return a ui window for the given unit's ability list
            var h = 5;
            var w = 325;

            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0xFFFFFF;
            var style  = AcornSetup.baseStyle2;
            scene.addChild(gfx);
            scene.addChild(cont);
            //
            if (!unit.inventory){
                //you dont have the full info for this unit. No item menu available
                return null;
            }

            var abText = new PIXI.Text('Choose an Item!', style);
            abText.style.fill = 'blue';
            abText.anchor.x = 0.5;
            abText.position.x = w*0.5;
            abText.position.y = h;
            abText = Graphics.fitText(abText,w-5);
            cont.addChild(abText);
            h += abText.height + 5;
            cont.uiElements = [];
            for (var i = 0; i < unit.inventory.items.length;i++){
                let item = unit.inventory.items[i];
                let clickFunc = function(e){
                    console.log('clicked! ' + e.currentTarget.itemInfo.name);
                    let t = '';
                    switch(e.currentTarget.itemInfo.type){
                        case 'weapon':
                            if (e.currentTarget.unit.inventory.items[e.currentTarget.unit.weapon] != e.currentTarget.itemInfo){
                                t = "Equip " + e.currentTarget.itemInfo.name + '?';
                            }else{
                                t = "Unequip " + e.currentTarget.itemInfo.name + '?';
                            }
                            Game.tryToItem(e.currentTarget.ipos, t);
                            break;
                        case 'gun':
                            if (e.currentTarget.unit.inventory.items[e.currentTarget.unit.weapon] != e.currentTarget.itemInfo){
                                t = "Equip " + e.currentTarget.itemInfo.name + '?';
                            }else{
                                t = "Unequip " + e.currentTarget.itemInfo.name + '?';
                            }
                            Game.tryToItem(e.currentTarget.ipos, t);
                            break;
                        case 'shield':
                            if (e.currentTarget.unit.inventory.items[e.currentTarget.unit.shield] != e.currentTarget.itemInfo){
                                t = "Equip " + e.currentTarget.itemInfo.name + '?';
                            }else{
                                t = "Unequip " + e.currentTarget.itemInfo.name + '?';
                            }
                            Game.tryToItem(e.currentTarget.ipos, t);
                            break;
                        case 'accessory':
                            if (e.currentTarget.unit.inventory.items[e.currentTarget.unit.accessory] != e.currentTarget.itemInfo){
                                t = "Equip " + e.currentTarget.itemInfo.name + '?';
                            }else{
                                t = "Unequip " + e.currentTarget.itemInfo.name + '?';
                            }
                            Game.tryToItem(e.currentTarget.ipos, t);
                            break;
                        case 'compound':
                            Game.tryToItem(e.currentTarget.ipos, "Use " + e.currentTarget.itemInfo.name + '?');
                            break;
                    }
                }
                let mOverFunc = function(e){
                    console.log('moused over!! ' + e.currentTarget.itemInfo.name);
                }
                let txt = ((unit.weapon == i || unit.accessory == i || unit.shield == i) ? ' (E) ' : '') + item.name;
                console.log(txt);
                var iButton = Graphics.makeUiElement({
                    text: txt,
                    style: style,
                    interactive: true,
                    buttonMode: true,
                    anchor: [0.5,0],
                    position: [w/2,h],
                    clickFunc: clickFunc,
                    mOverFunc: mOverFunc
                });
                while(iButton.width > w - 10){
                    iButton.scale.x = iButton.scale.x*0.95;
                    iButton.scale.y = iButton.scale.y*0.95;
                }
                iButton.tooltip = new Tooltip();
                iButton.tooltip.getItemTooltip(iButton,item);
                iButton.itemInfo = item;
                iButton.unit = unit;
                iButton.ipos = i;
                cont.addChild(iButton);
                cont.uiElements.push(iButton);
                h += iButton.height + 10;
            }
            

            gfx.beginFill(color,0.3);
            gfx.drawRect(0,0,w,h);
            gfx.endFill();
            gfx.lineStyle(3,color,1);
            gfx.moveTo(2,2);
            gfx.lineTo(w-2,2);
            gfx.lineTo(w-2,h-2);
            gfx.lineTo(2,h-2);
            gfx.lineTo(2,2);

            //create and render the texture and sprite
            return scene;
        },
        addOverlaySprites(){
            //add the overlay sprites to the map, setting the correct scale and position   
            for (var i in this.overlaySprites){
                var node = this.map.axialMap[this.overlaySprites[i].q][this.overlaySprites[i].r];
                node.overlaySprite1.scale.x = this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                node.overlaySprite1.scale.y = this.map.YSCALE_SETTINGS[this.map.currentYScaleSetting]*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                node.overlaySprite1.position.x = node.sprite1.position.x;
                node.overlaySprite1.position.y = (Game.map.TILE_HEIGHT*this.map.YSCALE_SETTINGS[this.map.currentYScaleSetting]*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting]) + node.sprite1.position.y-Game.map.TILE_HEIGHT*(node.h+1)*0.8*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting];
                node.overlaySprite2.scale.x = this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                node.overlaySprite2.scale.y = this.map.YSCALE_SETTINGS[this.map.currentYScaleSetting]*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                node.overlaySprite2.position.x = node.sprite2.position.x;
                node.overlaySprite2.position.y = (Game.map.TILE_HEIGHT*this.map.YSCALE_SETTINGS[this.map.currentYScaleSetting]*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting]) + node.sprite2.position.y-Game.map.TILE_HEIGHT*(node.h+1)*0.8*Game.map.ZOOM_SETTINGS[Game.map.currentZoomSetting];
                this.map.container1.addChildAt(node.overlaySprite1,(this.map.container1.getChildIndex(node.sprite1)+1));
                this.map.container2.addChildAt(node.overlaySprite2,(this.map.container2.getChildIndex(node.sprite2)+1));
            }
        },
        removeOverlaySprites(){
            //remove overlay sprites, but keep them in the node ect
            for (var i in this.overlaySprites){
                var node = this.map.axialMap[this.overlaySprites[i].q][this.overlaySprites[i].r];
                this.map.container1.removeChild(node.overlaySprite1);
                this.map.container2.removeChild(node.overlaySprite2);
            }
        },
        clearOverlaySprites(){
            //remove all
            this.moveActive = false;
            this.moveNodesActive = [];
            this.attackActive = false;
            this.attackNodesActive = [];
            if (Game.abilityActive){
                Graphics.uiContainer.removeChild(Game.abilityMenu);
            }
            this.abilityActive = false;
            this.abilityNodes = {};
            this.abilityRadiusNodes = [];
            Graphics.worldPrimitives.clear();
            for (var i in this.overlaySprites){
                var node = this.map.axialMap[this.overlaySprites[i].q][this.overlaySprites[i].r];
                this.map.container1.removeChild(node.overlaySprite1);
                this.map.container2.removeChild(node.overlaySprite2);
                node.overlaySprite1 = null;
                node.overlaySprite2 = null;
                node.mouseOverNodes = null;
            }
            this.overlaySprites = {};
        },
        getTurnBox: function(id){
            var h = 75;
            var w = 150;
            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0x0000FF;
            var style  = {
                font: '32px Roboto',
                fill: 'white',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2,
            }
            if (this.units[id].isCastTimer){
                if (this.units[this.units[id].unitid].owner != window.playerID){
                    color = 0xFF0000;
                }
            }else if (this.units[id].owner != window.playerID){
                color = 0xFF0000;
            }
            gfx.beginFill(color,0.3);
            gfx.drawRect(0,0,w,h);
            gfx.endFill();
            scene.addChild(gfx);
            scene.addChild(cont);

            //draw outline
            gfx.lineStyle(3,color,1);
            gfx.moveTo(2,2);
            gfx.lineTo(w-2,2);
            gfx.lineTo(w-2,h-2);
            gfx.lineTo(2,h-2);
            gfx.lineTo(2,2);

            var txt1 = '';
            var txt2 = '';
            var txt3 = '';
            var cPer = 0;
            var color = Graphics.pallette.color1
            if (this.units[id].isCastTimer){
                txt1 = Game.units[id].name;
                txt2 = '(' +Game.units[Game.units[id].unitid].name + ')';
                cPer = (Game.units[id].charge/Game.chargeMax);
                if (cPer > 1){
                    cPer = 1
                }
                txt3 = Math.round(cPer*100) + ' %';
                if (cPer < 0){
                    cPer = 0;
                }
                color = 0xffea84;
            }else{
                txt1 = Game.units[id].name;
                txt2 = 'L' + Game.units[id].level + ' ' + Game.units[id].classInfo.currentClass.charAt(0).toUpperCase() + Game.units[id].classInfo.currentClass.substr(1);
                txt3 = Game.units[id].chargePercent + ' %';
                cPer = (Game.units[id].chargePercent/100);
            }
            var text = new PIXI.Text(txt1, style);
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;
            text.position.x = w*0.5;
            text.position.y = h*0.33;
            text.style.fill = color;
            text = Graphics.fitText(text,w-5);
            cont.addChild(text);

            var text2 = new PIXI.Text(txt2, style);
            text2.anchor.x = 0.5;
            text2.anchor.y = 0.5;
            text2.position.x = w*0.5;
            text2.position.y = h*0.64;
            text2.style.fontSize = 12;
            text2.style.fill = Graphics.pallette.color1;
            text2 = Graphics.fitText(text2,w-5);
            cont.addChild(text2);

            //charge text
            var hPer = 0.85;
            var chargeStr = Game.units[id].chargePercent + ' %';
            var chargeText = new PIXI.Text(txt3, style);
            chargeText.anchor.x = 0.5;
            chargeText.anchor.y = 0.5;
            chargeText.position.x = w*0.5;
            chargeText.position.y = h*hPer-3;
            chargeText.style.fill = Graphics.pallette.color1;
            chargeText.style.fontSize = 14;
            cont.addChild(chargeText);

            //draw charge bar
            var hPer = 0.85;
            gfx.lineStyle(1,0x00BA00,1);
            gfx.beginFill(0x00BA00,1);
            gfx.drawRect(5,h*hPer - 6,(w-10)*cPer,12);
            gfx.endFill();
            gfx.lineStyle(1,0x000000,1);
            gfx.moveTo(5,h*hPer - 6);
            gfx.lineTo(w-5,h*hPer - 6);
            gfx.lineTo(w-5,h*hPer + 6);
            gfx.lineTo(5,h*hPer + 6);
            gfx.lineTo(5,h*hPer - 6);

            //create and render the texture and sprite
            var texture = PIXI.RenderTexture.create(w,h);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(scene,texture);
            var sprite = new PIXI.Sprite(texture);
            sprite.interactive = true;
            sprite.buttonMode = true;
            sprite.unitid = id;

            var overFunc = function(e){
                if (Game.units[e.currentTarget.unitid].isCastTimer){return;}
                Game.selectUnit(Game.units[e.currentTarget.unitid]);
                if (Game.attackActive){
                    Game.tryToAttack(node);
                    Game.units[e.currentTarget.unitid].currentNode
                }
            }
            sprite.on('pointerdown',overFunc);

            return sprite;
        },

        getUnitInfoPane: function(id){
            var h = 800;
            var w = 400;
            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0xFFFFFF;
            var style = AcornSetup.baseStyle;
            gfx.lineStyle(3,color,1);
            gfx.beginFill(color,0.3);
            gfx.drawRect(0,0,w,h);
            gfx.endFill();
            scene.addChild(gfx);
            scene.addChild(cont);

            //draw outline
            gfx.moveTo(2,2);
            gfx.lineTo(w-2,2);
            gfx.lineTo(w-2,h-2);
            gfx.lineTo(2,h-2);
            gfx.lineTo(2,2);

            var unit = Game.units[id];
            //NAME
            var nameText = new PIXI.Text(unit.name, style);
            nameText.anchor.x = 0.5;
            nameText.style.fill = Graphics.pallette.color1;
            nameText = Graphics.fitText(nameText,w-100);
            nameText.position.x = w*0.5;
            nameText.position.y = 5;
            cont.addChild(nameText);

            //LEVEL AND CLASS
            var str = unit.classInfo.currentClass.charAt(0).toUpperCase() + unit.classInfo.currentClass.substr(1);
            var n = 'Level ' + unit.level + ' ' + str;
            if (unit.classInfo.baseClass){
                var str = unit.classInfo.baseClass.charAt(0).toUpperCase() + unit.classInfo.baseClass.substr(1);
                n += ' (' + str + ')';
            }
            var lvlClassText = new PIXI.Text(n, style);
            lvlClassText.anchor.x = 0.5;
            lvlClassText.style.fill = Graphics.pallette.color1;
            lvlClassText = Graphics.fitText(lvlClassText,w-100);
            lvlClassText.position.x = w*0.5;
            lvlClassText.position.y = 10 + nameText.height;
            cont.addChild(lvlClassText);

            //HEALTH, ENERGY , SHIELDS
            var barHeight = 30;
            var hY = lvlClassText.position.y + lvlClassText.height + 25;
            var eY = hY + barHeight + 5;
            var sY = eY + barHeight + 5;
            gfx.lineStyle(3,0xFF0000,0);
            gfx.beginFill(0xFF0000,0.5);
            var percentage = unit.currentHealth/unit.maximumHealth;
            gfx.drawRect(10,hY-barHeight/2,(w-20)*percentage,barHeight);
            gfx.endFill();
            gfx.lineStyle(3,0xFFFF00,0);
            gfx.beginFill(0xFFFF00,0.5);
            var percentage = unit.currentEnergy/unit.maximumEnergy;
            gfx.drawRect(10,eY-barHeight/2,(w-20)*percentage,barHeight);
            gfx.endFill();
            gfx.lineStyle(3,0x00D0FF,0);
            gfx.beginFill(0x00D0FF,0.5);
            var percentage = unit.currentShields/unit.maximumShields;
            gfx.drawRect(10,sY-barHeight/2,(w-20)*percentage,barHeight);
            gfx.endFill();
            gfx.lineStyle(1,0xFFFFFF,1);
            gfx.drawRect(10,hY-barHeight/2,w-20,barHeight);
            gfx.drawRect(10,eY-barHeight/2,w-20,barHeight);
            gfx.drawRect(10,sY-barHeight/2,w-20,barHeight);

            var hpText = new PIXI.Text('Health: ' + unit.currentHealth + '/' + unit.maximumHealth, style);
            hpText.anchor.x = 0.5;
            hpText.anchor.y = 0.5;
            hpText.style.fill = Graphics.pallette.color1;
            hpText = Graphics.fitText(hpText,w/2);
            hpText.position.x = w*0.5;
            hpText.position.y = hY;
            cont.addChild(hpText);
            var enText = new PIXI.Text('Energy: ' + unit.currentEnergy + '/' + unit.maximumEnergy, style);
            enText.anchor.x = 0.5;
            enText.anchor.y = 0.5;
            enText.style.fill = Graphics.pallette.color1;
            enText = Graphics.fitText(enText,w/2);
            enText.position.x = w*0.5;
            enText.position.y = eY;
            cont.addChild(enText);
            var shText = new PIXI.Text('Shields: ' + unit.currentShields + '/' + unit.maximumShields, style);
            shText.anchor.x = 0.5;
            shText.anchor.y = 0.5;
            shText.style.fill = Graphics.pallette.color1;
            shText = Graphics.fitText(shText,w/2);
            shText.position.x = w*0.5;
            shText.position.y = sY;
            cont.addChild(shText);

            var style2 = {
                font: '20px Roboto',
                fill: Graphics.pallette.color1,
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2,
            };
            //MOVE
            var n = (!unit.move) ? 'Move: ???' : 'Move: ' + unit.move;
            var movText = new PIXI.Text(n, style2);
            movText = Graphics.fitText(movText,w/3-5);
            movText.position.x = 10;
            movText.position.y = sY + barHeight/2 + 20;
            cont.addChild(movText);

            //JUMP
            var n = (!unit.jump) ? 'Jump: ???' : 'Jump: ' + unit.jump;
            var jmpText = new PIXI.Text(n, style2);
            jmpText = Graphics.fitText(jmpText,w/3-5);
            jmpText.position.x = 10;
            jmpText.position.y = movText.position.y + movText.height;
            cont.addChild(jmpText);

            //SPEED
            var n = (!unit.speed) ? 'Speed: ???' : 'Speed: ' + unit.speed;
            var spdText = new PIXI.Text(n, style2);
            spdText = Graphics.fitText(spdText,w/3-5);
            spdText.position.x = 10;
            spdText.position.y = jmpText.position.y + jmpText.height;
            cont.addChild(spdText);

            //POWER
            var n = (!unit.power) ? 'Power: ???' : 'Power: ' + unit.power;
            var powText = new PIXI.Text(n, style2);
            powText = Graphics.fitText(powText,w/3-5);
            powText.position.x = 10;
            powText.position.y = spdText.position.y + spdText.height*2;
            cont.addChild(powText);

            //SKILL
            var n = (!unit.skill) ? 'Skill: ???' : 'Skill: ' + unit.skill;
            var sklText = new PIXI.Text(n, style2);
            sklText = Graphics.fitText(sklText,w/3-5);
            sklText.position.x = 10;
            sklText.position.y = powText.position.y + powText.height;
            cont.addChild(sklText);

            //TACTICS
            var n = (!unit.tactics) ? 'Tactics: ???' : 'Tactics: ' + unit.tactics;
            var tacText = new PIXI.Text(n, style2);
            tacText = Graphics.fitText(tacText,w/3-5);
            tacText.position.x = 10;
            tacText.position.y = sklText.position.y + sklText.height;
            cont.addChild(tacText);

            //STRENGTH
            var n = (!unit.strength) ? 'STR: ???' : 'STR: ' + unit.strength;
            var strText = new PIXI.Text(n, style2);
            strText = Graphics.fitText(strText,w/3-5);
            strText.position.x = 10;
            strText.position.y = tacText.position.y + tacText.height*2;
            cont.addChild(strText);

            //ENDURANCE
            var n = (!unit.endurance) ? 'END: ???' : 'END: ' + unit.endurance;
            var endText = new PIXI.Text(n, style2);
            endText = Graphics.fitText(endText,w/3-5);
            endText.position.x = 10;
            endText.position.y = strText.position.y + strText.height;
            cont.addChild(endText);

            //DEXTERITY
            var n = (!unit.dexterity) ? 'DEX: ???' : 'DEX: ' + unit.dexterity;
            var dexText = new PIXI.Text(n, style2);
            dexText = Graphics.fitText(dexText,w/3-5);
            dexText.position.x = 10;
            dexText.position.y = endText.position.y + endText.height;
            cont.addChild(dexText);

            //AGILITY
            var n = (!unit.agility) ? 'AGI: ???' : 'AGI: ' + unit.agility;
            var agiText = new PIXI.Text(n, style2);
            agiText = Graphics.fitText(agiText,w/3-5);
            agiText.position.x = 10;
            agiText.position.y = dexText.position.y + dexText.height;
            cont.addChild(agiText);

            //INTELLIGENCE
            var n = (!unit.intelligence) ? 'INT: ???' : 'INT: ' + unit.intelligence;
            var intText = new PIXI.Text(n, style2);
            intText = Graphics.fitText(intText,w/3-5);
            intText.position.x = 10;
            intText.position.y = agiText.position.y + agiText.height;
            cont.addChild(intText);

            //WILLPOWER
            var n = (!unit.willpower) ? 'WIL: ???' : 'WIL: ' + unit.willpower;
            var wilText = new PIXI.Text(n, style2);
            wilText = Graphics.fitText(wilText,w/3-5);
            wilText.position.x = 10;
            wilText.position.y = intText.position.y + intText.height;
            cont.addChild(wilText);

            //CHARISMA
            var n = (!unit.charisma) ? 'CHA: ???' : 'CHA: ' + unit.charisma;
            var chaText = new PIXI.Text(n, style2);
            chaText = Graphics.fitText(chaText,w/3-5);
            chaText.position.x = 10;
            chaText.position.y = wilText.position.y + wilText.height;
            cont.addChild(chaText);

            //create and render the texture and sprite
            var texture = PIXI.RenderTexture.create(w,h);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(scene,texture);
            var sprite = new PIXI.Sprite(texture);
            sprite.unitid = id;

            return sprite;
        },

        drawBG: function(){
            Graphics.bgContainer.clear();
            var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
            Graphics.drawBG('#689aff', '#c9deff');

        },
        
        setTurnArrow: function(){
            /*//set scale
            this.currentTurnArrow.scale.x = 0.4 * this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
            this.currentTurnArrow.scale.y = 0.4 * this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
            //set position
            var t = 1;
            if (!(this.map.currentRotation%2)){t = 2}
            var cont = 'container' + t;

            var sp = this.units[this.turnList[0]].sprite;
            this.currentTurnArrow.position.x = sp.position.x + this.map[cont].position.x;
            this.currentTurnArrow.position.y = sp.position.y + this.map[cont].position.y - sp.height/2 - this.currentTurnArrow.height/1.5;
            this.turnArrowStartY = this.currentTurnArrow.position.y;
            Graphics.worldContainer.addChild(this.currentTurnArrow);*/
        },

        setHoveredNode: function(){
            Game.resetTint();
            this.selectedSprite = this.currentlyMousedOver;
            this.setNodeText(Game.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z]);
            if (Game.abilityActive){
                var node = Game.map.axialMap[this.selectedSprite.axialCoords.q][this.selectedSprite.axialCoords.r];
                if (node.mouseOverNodes){
                    for (var i = 0; i < Game.abilityRadiusNodes.length;i++){
                        //remove any ability nodes that are NOT part of the selection nodes
                        //reset the color of the ones that are
                        var n = Game.abilityRadiusNodes[i];
                        if (Game.abilityNodes[n.id]){
                            Game.abilityNodes[n.id].overlaySprite1.tint = 0x0FFFF0;
                            Game.abilityNodes[n.id].overlaySprite2.tint = 0x0FFFF0;
                        }else{
                            this.map.container1.removeChild(n.overlaySprite1);
                            this.map.container2.removeChild(n.overlaySprite2);
                            n.overlaySprite1 = null;
                            n.overlaySprite2 = null;
                            delete this.overlaySprites[n.id];
                        }
                    }
                    Game.abilityRadiusNodes = [];
                    //set new abilityRadiusNodes
                    this.removeOverlaySprites();
                    for (var i = 0; i < node.mouseOverNodes.length;i++){
                        var n = node.mouseOverNodes[i];
                        if (!n){continue;}
                        if (Game.abilityNodes[n.q+','+n.r]){
                            n.overlaySprite1.tint = 0xFF0000;
                            n.overlaySprite2.tint = 0xFF0000;
                        }else{
                            n.setOverlaySprites(0xFF0000);
                            this.overlaySprites[n.id] = n;
                        }
                        Game.abilityRadiusNodes.push(n);
                    }
                    this.addOverlaySprites();
                }
            }
            this.setNewHoveredNode = 0;
        },
        setHoveredUnit: function(){
            Game.resetTint();
            this.setNewHoveredUnit.infoPane.position.x = Graphics.width - 10 - this.setNewHoveredUnit.infoPane.width;
            this.setNewHoveredUnit.infoPane.position.y = this.nodeText.position.y - 50 - this.setNewHoveredUnit.infoPane.height;
            Graphics.uiContainer.addChild(this.setNewHoveredUnit.infoPane);
            this.currentInfoPane = this.setNewHoveredUnit.infoPane;
            this.setNewHoveredUnit = 0;
        },
          
        resetTint: function(){
            if (this.selectedUnit != null){return;}
            if (this.currentNode){
                this.currentNode.sprite1.filters = [];
                this.currentNode.sprite2.filters = [];
            }
            if (this.currentInfoPane != null){
                Graphics.uiContainer.removeChild(this.currentInfoPane);
                this.currentInfoPane = null;
            }
            this.nodeText.visible = false;
            this.nodeInfo.visible = false;
        },

        setNodeText: function(node){
            var a = this.map.getAxial(node);
            this.currentNode = a;

            var t = 1;
            if (!(this.map.currentRotation%2)){t = 2}
            var s = a['sprite' + t];
            a.sprite1.filters = [Game.map.outlineFilter];
            a.sprite2.filters = [Game.map.outlineFilter];
            //set node info text
            var t = '<Node ' + a.q + ',' + a.r + '>  <LOS: ' +a.los + '> ' ;
            this.nodeText.visible = true;
            this.nodeInfo.visible = true;
            this.nodeInfo.text = t + ' <Height: ' + a.h + '>  <Type: ' + a.tile + '>';
            this.nodeText.position.x = this.nodeInfo.position.x - this.nodeInfo.width/2;
            this.nodeText.position.y = this.nodeInfo.position.y - this.nodeInfo.height - 25;
            //find units, set unit text
            if (this.currentInfoPane != null){
                Graphics.uiContainer.removeChild(this.currentInfoPane);
                this.currentInfoPane = null;
            }
            if (a.unit == null){return;}
            a.unit.infoPane.position.x = Graphics.width - 10 - a.unit.infoPane.width;
            a.unit.infoPane.position.y = this.nodeText.position.y - 50 - a.unit.infoPane.height;
            Graphics.uiContainer.addChild(a.unit.infoPane);
            this.currentInfoPane = a.unit.infoPane;
        },

        selectUnit: function(u){
            Game.resetTint();
            if (this.currentInfoPane != null){
                Graphics.uiContainer.removeChild(this.currentInfoPane);
                this.currentInfoPane = null;
                this.selectedSprite.filters = [];
                this.selectedUnit.currentNode.sprite1.filters = [];
                this.selectedUnit.currentNode.sprite2.filters = [];
            }
            if (u.currentNode){
                Game.setNodeText(u.currentNode);
                u.sprite.filters = [Game.outlineFilterRed];
            }else{
                u.infoPane.position.x = Graphics.width - 10 - u.infoPane.width;
                u.infoPane.position.y = this.nodeText.position.y - 50 - u.infoPane.height;
                Graphics.uiContainer.addChild(u.infoPane);
                this.currentInfoPane = u.infoPane;
            }
            this.selectedUnit = u;
            this.selectedSprite = u.sprite;
        },

        updateUnits: function(){
            for (var i in this.units){
                if (this.units[i].isCastTimer){
                    continue;
                }
                var sprite = this.units[i].sprite;
                var unit = this.units[i];
                if (!unit.visible){
                    continue;
                }
                var frame = sprite.currentFrame;
                //set correct facing
                var dir = '';
                dir = this.map.dirArray[(this.map.spriteStartingDirections[unit.direction] + this.map.currentRotation) % this.map.totalRotations];
                sprite.textures = Graphics.getResource('unit_base_'+ dir + '_');
                sprite.scale.x = 0.6 * this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                sprite.scale.y = 0.6 * this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                var p = (this.map.spriteStartingDirections[unit.direction] + this.map.currentRotation) % this.map.totalRotations
                if (p >= 1 && p <= 5){
                    sprite.scale.x = -0.6 * this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                }
                //set correct container index and position
                var node = this.map.axialMap[unit.currentNode.q][unit.currentNode.r];
                var t = 1;
                if (!(this.map.currentRotation%2)){t = 2}
                var cont = 'container' + t;
                var sp = 'sprite' + t;
                var ol = 'overlaySprite' + t;
                sprite.position.x = node[sp].position.x;
                sprite.position.y = node[sp].position.y-this.map.TILE_HEIGHT*(node.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                if (node[ol]){
                    this.map[cont].addChildAt(sprite,this.map[cont].getChildIndex(node[ol])+1);
                }else{
                    this.map[cont].addChildAt(sprite,this.map[cont].getChildIndex(node[sp])+1);
                }
                if (unit.fainted){
                    unit.setFainted(true);
                }else{
                    sprite.gotoAndPlay(frame);
                }
                this.updateUnitsBool = false;
                this.map.changedZoom = false;
            }
        },
        getLineOfSight: function(){
            for (var i in this.map.cubeMap){
                for (var j in this.map.cubeMap[i]){
                    for (var k in this.map.cubeMap[i][j]){
                        //set node to 
                        this.getLosOfNode(this.map.cubeMap[i][j][k]);
                    }
                }
            }
        },
        getLosOfNode: function(aNode){
            aNode.los = 'none';
            aNode.sprite1.tint = this.map.noLosTint;
            aNode.sprite2.tint = this.map.noLosTint;
            var aH = aNode.h+2;
            var endingHeight = 2;
            for (var u in this.units){
                if (this.units[u].owner != window.playerID){continue;}
                var c = this.units[u].currentNode;

                if (this.map.cubeDistance(aNode,c) > 10){
                    continue;
                }
                var cPos = {
                    x: c.x + this.losAngle,
                    y: c.y + this.losAngle,
                    z: c.z + -this.losAngle*2,
                }
                var cNeg = {
                    x: c.x + -this.losAngle,
                    y: c.y + -this.losAngle,
                    z: c.z + this.losAngle*2,
                }
                var r1 = this.map.cubeLineDraw(aNode,cPos); //route 1
                var r2 = this.map.cubeLineDraw(aNode,cNeg); //route 2
                var blocked1 = false;
                var blocked2 = false;
                var highestAngle = 0;
                for (var j = 1; j < r1.length;j++){
                    var a = this.map.getAxial(r1[j]);
                    var h = (j==(r1.length-1)) ? (a.h+endingHeight) : a.h; //TODO actual unit height?
                    var angle = 0;
                    if (h > aH){
                        angle = 90 + (180/Math.PI)*Math.atan((h-aH)/j);
                    }else if (h < aH){
                        angle = (180/Math.PI)*Math.atan(j/(aH-h));
                    }else{
                        angle = 90;
                    }
                    if (highestAngle < angle){
                        highestAngle = angle;
                        blocked1 = false;
                    }else{
                        if (angle < highestAngle){
                            blocked1 = true;
                        }else{
                            blocked1 = false;
                        }
                    }
                }
                highestAngle = 0;
                for (var j = 1; j < r2.length;j++){
                    var a = this.map.getAxial(r2[j]);
                    var h = (j==(r2.length-1)) ? (a.h+endingHeight) : a.h; //TODO actual unit height?
                    var angle = 0;
                    if (h > aH){
                        angle = 90 + (180/Math.PI)*Math.atan((h-aH)/j);
                    }else if (h < aH){
                        angle = (180/Math.PI)*Math.atan(j/(aH-h));
                    }else{
                        angle = 90;
                    }
                    if (highestAngle < angle){
                        highestAngle = angle;
                        blocked2 = false;
                    }else{
                        if (angle < highestAngle){
                            blocked2 = true;
                        }else{
                            blocked2 = false;
                        }
                    }
                }
                aNode.sprite1.tint = this.map.noLosTint;
                aNode.sprite2.tint = this.map.noLosTint;

                if (blocked1 && blocked2){
                    //NO LOS
                    aNode.los = 'none';
                }else if ((!blocked1 && !blocked2) == false){
                    //PARTIAL LOS
                    aNode.sprite1.tint = this.map.partialTint;
                    aNode.sprite2.tint = this.map.partialTint;
                    aNode.los = 'partial';
                }else{
                    //FULL LOS AND BREAK
                    aNode.sprite1.tint = 0xFFFFFF;
                    aNode.sprite2.tint = 0xFFFFFF;
                    aNode.los = 'full';
                    return;
                }
            }
        },
        resetColors: function(){
        }
    }
    window.Game = Game;
})(window);


//Game UI Elements