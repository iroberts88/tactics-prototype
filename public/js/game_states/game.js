
(function(window) {
    Game = {

        timePerTurn: null,
        timePerReaction: null,
        delayBetweenStates: null,

        betweenStateTicker: 0,
        turnTicker: 0,
        reactionTicker: 0,
        currentState: 'idle',
        states: {
            Idle: 'idle',
            BetweenStates: 'BetweenStates',
            Turn: 'turn',
            Reaction: 'reaction'
        },
        currentNode: null,
        outlineFilterRed: new PIXI.filters.OutlineFilter(2, 0xff9999),
        filtersOn: function (e) {
            if (Game.selectedUnit){
                return;
            }
            Game.resetTint();
            Game.units[e.currentTarget.unitID].sprite.filters = [Game.outlineFilterRed];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            if (Game.units[e.currentTarget.unitID].currentNode){
                Game.setNewHoveredNode = Game.units[e.currentTarget.unitID].currentNode['sprite' + t];
                Game.currentlyMousedOver = Game.units[e.currentTarget.unitID].currentNode['sprite' + t];
            }else{
                Game.setNewHoveredUnit = Game.units[e.currentTarget.unitID];
            }
        },

        filtersOff: function(e) {
            if (Game.selectedUnit){
                return;
            }
            Game.resetTint();
            Game.units[e.currentTarget.unitID].sprite.filters = [];
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

        currentTurnArrow: null,
        turnArrowStartY: null,

        nodeText: null,
        nodeInfo: null,

        losAngle: 1e-6,

        moveNodesActive: [], //contains the currently tinted move sprites
        moveActive: false,//movement active?
        movePathDrawn: false,

        uiWindows: [], //array containing active UI components?

        init: function() {
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
            window.currentGameMap = this.map;
            Graphics.showLoadingMessage(false);
        },

        initUI: function(){
            //initialize the units and every UI element
            for (var i in this.units){
                var x = 0;
                var y = 0;
                var t = 1;
                if (!(this.map.currentRotation%2)){t = 2}
                var cont = 'container' + t;
                var sp = 'sprite' + t;
                if (this.units[i].visible){
                    //SET CURRENT NODE
                    var node = this.map.axialMap[this.units[i].currentNode.q][this.units[i].currentNode.r];
                    this.units[i].setCurrentNode(this.units[i].currentNode.q,this.units[i].currentNode.r,this.map);
                    node.unit = this.units[i];
                    this.units[i].sprite.position.x = node[sp].position.x;
                    this.units[i].sprite.position.y = node[sp].position.y-this.map.TILE_HEIGHT*(node.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                    this.map[cont].addChildAt(this.units[i].sprite,this.map[cont].getChildIndex(node[sp])+1);
                }
                this.units[i].sprite.interactive = true;
                this.units[i].sprite.buttonMode = true;
                this.units[i].infoPane = this.getUnitInfoPane(i);
                var overFunc = function(e){
                    Game.selectUnit(Game.units[e.currentTarget.unitID]);
                }
                this.units[i].sprite.on('pointerdown',overFunc);
                this.units[i].sprite.on('pointerover', Game.filtersOn);
                this.units[i].sprite.on('pointerout', Game.filtersOff);
                if (!this.units[i].visible){
                    this.units[i].sprite.visible = false;
                }
            }

            //UI Elements

            //Turn order
            this.turnListSprites = [];
            for (var i = 0; i < this.turnList.length;i++){
                //create box
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

        startGame: function(){
            //the first turn starts
            this.betweenStateTicker = 0;
            this.turnTicker = 0;
            this.reactionTicker = 0;
            this.currentState = this.states.BetweenStates;
            this.battleStartText.visible = true;
            this.turnMenu = this.getTurnMenu();
            this.turnMenu.position.x = 180;
            this.turnMenu.position.y = 25;
            Graphics.uiContainer.addChild(this.turnMenu);
        },
        newTurnOrder: function(arr){
            //set timer
            this.timeText.visible = false
            this.betweenStateTicker = 0;
            this.turnTicker = 0;
            this.reactionTicker = 0;
            this.currentState = this.states.BetweenStates;
            Graphics.uiContainer.removeChild(this.turnMenu);
            for (var i = 0; i < arr.length;i++){
                for (var j = 0; j < this.turnListSprites.length;j++){
                    if (this.turnListSprites[j].unitID == arr[i]){
                        var sprite = this.turnListSprites[j];
                        sprite.position.x = 25;
                        sprite.position.y = 25 + i*75;
                    }
                }
            }
            this.turnMenu = this.getTurnMenu();
            this.turnMenu.position.x = 180;
            this.turnMenu.position.y = 25;
            Graphics.uiContainer.addChild(this.turnMenu);

            if (this.moveActive){
                this.moveActive = false;
                this.moveNodesActive = [];
                Graphics.worldPrimitives.clear();
            }

        },

        update: function(deltaTime){
            this.map.update(deltaTime);
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
            for (var i in this.units){
                try{
                    if (!this.units[i].sprite.parent.parent){
                        //units havent updated properly...
                        this.updateUnitsBool = true;
                        return;
                    }
                }catch(e){}
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
                    this.turnTicker += deltaTime;
                    this.timeText.text = 'Time left: ' + (this.timePerTurn - Math.floor(this.turnTicker));
                    if (this.turnTicker >= this.timePerTurn){
                        this.currentState = this.states.Idle;
                        this.timeText.visible = false;
                        this.turnTicker = 0;
                    }
                    break;
                case this.states.Reaction:
                    this.reactionTicker += deltaTime;
                    break;
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.CANCEL)){
                this.setNewHoveredNode = null;
                this.setNewHoveredUnit = null;
                if (this.selectedUnit){
                    this.selectedUnit.sprite.filters = [];
                    var node = Game.map.axialMap[this.selectedUnit.currentNode.q][this.selectedUnit.currentNode.r];
                    node.sprite1.filters = [];
                    node.sprite2.filters = [];
                    Graphics.uiContainer.removeChild(this.currentInfoPane);
                    this.currentInfoPane = null;
                    this.selectedUnit = null;
                }
                if (this.moveActive){
                    this.moveActive = false;
                    this.moveNodesActive = [];
                    Graphics.worldPrimitives.clear();
                }
                for (var i = 0; i < this.uiWindows.length;i++){
                    Graphics.uiContainer.removeChild(this.uiWindows[i]);
                    this.uiWindows.splice(i,1);
                }
                Acorn.Input.setValue(Acorn.Input.Key.CANCEL, false);
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
            //add the move confirmation window
            var h = 5;
            var w = 400;

            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0xFFFFFF;
            var style  = AcornSetup.baseStyle2;
            scene.addChild(gfx);
            scene.addChild(cont);

            var text = new PIXI.Text("Move " + this.units[this.turnList[0]].name + ' to node ' + node.q + ',' + node.r + '?', style);
            text.anchor.x = 0.5;
            text.position.x = w*0.5;
            text.position.y = h;
            text.style.fill = 'red';
            text = Graphics.fitText(text,w-5);
            cont.addChild(text);
            h += text.height + 5;
      
            var confirmButton = Graphics.makeUiElement({
                text: 'Yes',
                style: style,
                interactive: true,
                buttonMode: true,
                anchor: [0.5,0],
                position: [w/4,h],
                clickFunc: function onClick(){
                    console.log('Send Move!!');
                    Acorn.Net.socket_.emit('playerUpdate',{command: 'move',
                        q: node.q,
                        r: node.r
                    });
                    Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
                }
            });
            confirmButton.node = node;
            cont.addChild(confirmButton);  

            var cancelButton = Graphics.makeUiElement({
                text: 'No',
                style: style,
                interactive: true,
                buttonMode: true,
                anchor: [0.5,0],
                position: [w*0.75,h],
                clickFunc: function onClick(){
                    Acorn.Input.setValue(Acorn.Input.Key.CANCEL, true);
                }
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
            this.drawBoxAround(confirmButton,gfx);
            this.drawBoxAround(cancelButton,gfx);

            //add it to uiWindows
            scene.position.x = Graphics.width/2-w/2;
            scene.position.y = Graphics.height/4-h/2;
            Graphics.uiContainer.addChild(scene);
            this.uiWindows.push(scene);
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
                var moveButton = Graphics.makeUiElement({
                    text: 'Move',
                    style: style,
                    interactive: true,
                    buttonMode: true,
                    anchor: [0.5,0],
                    position: [w/4,h],
                    clickFunc: function onClick(){
                        Game.moveActive = true;
                        Game.getMoveNodes();
                    }
                });
                scene.turnMenuElements.moveButton = moveButton;
                cont.addChild(moveButton);  
                //Move text
                var t = (typeof unit.moveLeft == 'undefined') ? 'Moves left: ???' : 'Moves left: ' + unit.moveLeft;
                var moveText = new PIXI.Text(t, style);
                moveText.anchor.x = 0.5;
                moveText.position.x = w*0.75;
                moveText.position.y = h;
                moveText = Graphics.fitText(moveText,w/2-5);
                cont.addChild(moveText);
                scene.turnMenuElements.moveText = moveText;
                h += moveButton.height + 10;
                //Attack button
                var attackButton = Graphics.makeUiElement({
                    text: 'Attack',
                    style: style,
                    interactive: true,
                    buttonMode: true,
                    anchor: [0.5,0],
                    position: [w/4,h],
                    clickFunc: function onClick(){
                        //Do move stuff
                    }
                });
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
                var actionButton = Graphics.makeUiElement({
                    text: 'Action',
                    style: style,
                    interactive: true,
                    buttonMode: true,
                    anchor: [0.5,0],
                    position: [w/2,h],
                    clickFunc: function onClick(){
                        //Do move stuff
                    }
                });
                scene.turnMenuElements.actionButton = actionButton;
                cont.addChild(actionButton);
                h += actionButton.height + 10;
                //Inventory Button
                var inventoryButton = Graphics.makeUiElement({
                    text: 'Inventory',
                    style: style,
                    interactive: true,
                    buttonMode: true,
                    anchor: [0.5,0],
                    position: [w/2,h],
                    clickFunc: function onClick(){
                        //Do move stuff
                    }
                });
                scene.turnMenuElements.inventoryButton = inventoryButton;
                cont.addChild(inventoryButton);
                h += inventoryButton.height + 10;
                //Wait button
                var waitButton = Graphics.makeUiElement({
                    text: 'End Turn',
                    style: style,
                    interactive: true,
                    buttonMode: true,
                    anchor: [0.5,0],
                    position: [w/2,h],
                    clickFunc: function onClick(){
                        //Do move stuff
                    }
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
                this.drawBoxAround(waitButton,gfx);
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
            var possibleNodes = this.map.cubeSpiral(this.map.getCube(unit.currentNode),unit.moveLeft);
            var start;
            var end;
            var pathArr;
            for(var i = 0; i < possibleNodes.length;i++){
                start = this.map.getCube(unit.currentNode);
                end = this.map.cubeMap[possibleNodes[i][0]][possibleNodes[i][1]][possibleNodes[i][2]];
                if (this.map.getAxial(end).unit != null){
                    continue;
                }
                pathArr = this.map.findPath(start,end,{maxJump:unit.jump,startingUnit:unit});
                if(pathArr.length != 0 && pathArr.length <= unit.moveLeft+1){
                    var axial = this.map.getAxial(end);
                    this.moveNodesActive.push(axial);
                }
            }
        },

        getTurnBox: function(id){
            var h = 75;
            var w = 150;
            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0x0000FF;
            var style  = AcornSetup.baseStyle;
            style.fill = 'white';
            if (this.units[id].owner != window.playerID){
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


            var text = new PIXI.Text(Game.units[id].name, style);
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;
            text.position.x = w*0.5;
            text.position.y = h*0.33;
            text.style.fill = Graphics.pallette.color1;
            text = Graphics.fitText(text,w-5);
            cont.addChild(text);

            var str = Game.units[id].classInfo.currentClass.charAt(0).toUpperCase() + Game.units[id].classInfo.currentClass.substr(1);
            var text2 = new PIXI.Text('L' + Game.units[id].level + ' ' + str, style);
            text2.anchor.x = 0.5;
            text2.anchor.y = 0.5;
            text2.position.x = w*0.5;
            text2.position.y = h*0.66;
            text2.style.fill = Graphics.pallette.color1;
            text2 = Graphics.fitText(text2,w-5);
            cont.addChild(text2);

            //create and render the texture and sprite
            var texture = PIXI.RenderTexture.create(w,h);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(scene,texture);
            var sprite = new PIXI.Sprite(texture);
            sprite.interactive = true;
            sprite.buttonMode = true;
            sprite.unitID = id;

            var overFunc = function(e){
                Game.selectUnit(Game.units[e.currentTarget.unitID]);
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
            if (typeof unit.classInfo.baseClass != 'undefined'){
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
            gfx.drawRect(10,hY-barHeight/2,w-20*percentage,barHeight);
            gfx.endFill();
            gfx.lineStyle(3,0xFFFF00,0);
            gfx.beginFill(0xFFFF00,0.5);
            var percentage = unit.currentEnergy/unit.maximumEnergy;
            gfx.drawRect(10,eY-barHeight/2,w-20*percentage,barHeight);
            gfx.endFill();
            gfx.lineStyle(3,0x00D0FF,0);
            gfx.beginFill(0x00D0FF,0.5);
            var percentage = unit.currentShields/unit.maximumShields;
            gfx.drawRect(10,sY-barHeight/2,w-20*percentage,barHeight);
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
                font: '24px Sigmar One',
                fill: Graphics.pallette.color1,
                align: 'left',
                stroke: '#000000',
                strokeThickness: 2,
            };
            //MOVE
            var n = (typeof unit.move == 'undefined') ? 'MOV: ???' : 'MOV: ' + unit.move;
            var movText = new PIXI.Text(n, style2);
            movText = Graphics.fitText(movText,w/3-5);
            movText.position.x = 10;
            movText.position.y = sY + barHeight/2 + 20;
            cont.addChild(movText);

            //JUMP
            var n = (typeof unit.jump == 'undefined') ? 'JMP: ???' : 'JMP: ' + unit.jump;
            var jmpText = new PIXI.Text(n, style2);
            jmpText = Graphics.fitText(jmpText,w/3-5);
            jmpText.position.x = 10;
            jmpText.position.y = movText.position.y + movText.height;
            cont.addChild(jmpText);

            //SPEED
            var n = (typeof unit.speed == 'undefined') ? 'SPD: ???' : 'SPD: ' + unit.speed;
            var spdText = new PIXI.Text(n, style2);
            spdText = Graphics.fitText(spdText,w/3-5);
            spdText.position.x = 10;
            spdText.position.y = jmpText.position.y + jmpText.height;
            cont.addChild(spdText);

            //POWER
            var n = (typeof unit.power == 'undefined') ? 'POW: ???' : 'POW: ' + unit.power;
            var powText = new PIXI.Text(n, style2);
            powText = Graphics.fitText(powText,w/3-5);
            powText.position.x = 10;
            powText.position.y = spdText.position.y + spdText.height;
            cont.addChild(powText);

            //SKILL
            var n = (typeof unit.skill == 'undefined') ? 'SKL: ???' : 'SKL: ' + unit.skill;
            var sklText = new PIXI.Text(n, style2);
            sklText = Graphics.fitText(sklText,w/3-5);
            sklText.position.x = 10;
            sklText.position.y = powText.position.y + powText.height;
            cont.addChild(sklText);

            //STRENGTH
            var n = (typeof unit.strength == 'undefined') ? 'STR: ???' : 'STR: ' + unit.strength;
            var strText = new PIXI.Text(n, style2);
            strText.anchor.x = 0.5;
            strText = Graphics.fitText(strText,w/3-5);
            strText.position.x = w/2;
            strText.position.y = sY + barHeight/2 + 20;
            cont.addChild(strText);

            //ENDURANCE
            var n = (typeof unit.endurance == 'undefined') ? 'END: ???' : 'END: ' + unit.endurance;
            var endText = new PIXI.Text(n, style2);
            endText.anchor.x = 0.5;
            endText = Graphics.fitText(endText,w/3-5);
            endText.position.x = w/2;
            endText.position.y = strText.position.y + strText.height;
            cont.addChild(endText);

            //DEXTERITY
            var n = (typeof unit.dexterity == 'undefined') ? 'DEX: ???' : 'DEX: ' + unit.dexterity;
            var dexText = new PIXI.Text(n, style2);
            dexText.anchor.x = 0.5;
            dexText = Graphics.fitText(dexText,w/3-5);
            dexText.position.x = w/2;
            dexText.position.y = endText.position.y + endText.height;
            cont.addChild(dexText);

            //AGILITY
            var n = (typeof unit.agility == 'undefined') ? 'AGI: ???' : 'AGI: ' + unit.agility;
            var agiText = new PIXI.Text(n, style2);
            agiText.anchor.x = 1;
            agiText = Graphics.fitText(agiText,w/3-5);
            agiText.position.x = w-10;
            agiText.position.y = sY + barHeight/2 + 20;
            cont.addChild(agiText);

            //INTELLIGENCE
            var n = (typeof unit.intelligence == 'undefined') ? 'INT: ???' : 'INT: ' + unit.intelligence;
            var intText = new PIXI.Text(n, style2);
            intText.anchor.x = 1;
            intText = Graphics.fitText(intText,w/3-5);
            intText.position.x = w-10;
            intText.position.y = agiText.position.y + agiText.height;
            cont.addChild(intText);

            //WILLPOWER
            var n = (typeof unit.willpower == 'undefined') ? 'WIL: ???' : 'WIL: ' + unit.willpower;
            var wilText = new PIXI.Text(n, style2);
            wilText.anchor.x = 1;
            wilText = Graphics.fitText(wilText,w/3-5);
            wilText.position.x = w-10;
            wilText.position.y = intText.position.y + intText.height;
            cont.addChild(wilText);

            //CHARISMA
            var n = (typeof unit.charisma == 'undefined') ? 'CHA: ???' : 'CHA: ' + unit.charisma;
            var chaText = new PIXI.Text(n, style2);
            chaText.anchor.x = 1;
            chaText = Graphics.fitText(chaText,w/3-5);
            chaText.position.x = w-10;
            chaText.position.y = wilText.position.y + wilText.height;
            cont.addChild(chaText);

            //create and render the texture and sprite
            var texture = PIXI.RenderTexture.create(w,h);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(scene,texture);
            var sprite = new PIXI.Sprite(texture);
            sprite.unitID = id;

            return sprite;
        },

        drawBG: function(){
            Graphics.bgContainer.clear();
            var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
            Graphics.drawBG('gray', 'gray');

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
            var t = 'Full LOS';
            if (s.tint == this.map.partialTint){
                t = 'Partial LOS'
            }else if (s.tint == this.map.noLosTint){
                t = 'NO LOS';
            }
            t = 'Node ' + a.q + ',' + a.r + '   ' + t;
            this.nodeText.visible = true;
            this.nodeInfo.visible = true;
            this.nodeInfo.text = t + '     Height: ' + a.h + '    Type: ' + a.tile;
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
                Game.setNodeText(Game.map.getCube(u.currentNode));
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
                sprite.position.x = node[sp].position.x;
                sprite.position.y = node[sp].position.y-this.map.TILE_HEIGHT*(node.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                this.map[cont].addChildAt(sprite,this.map[cont].getChildIndex(node[sp])+1);
                sprite.gotoAndPlay(frame);
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
        getLosOfNode: function(node){
            var aNode = this.map.getAxial(node);
            aNode.sprite1.tint = this.map.noLosTint;
            aNode.sprite2.tint = this.map.noLosTint;
            var aH = aNode.h;
            var startingHeight = 3;
            if (aNode.unit != null){
                //startingHeight = 3// if there is a unit on the node, add unit height
            }
            aH += startingHeight;
            for (var u in this.units){
                if (this.units[u].owner != playerID){continue;}
                var c = this.map.getCube(this.units[u].currentNode)
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
                var r1 = this.map.cubeLineDraw(node,cPos); //route 1
                var r2 = this.map.cubeLineDraw(node,cNeg); //route 2
                var blocked1 = false;
                var blocked2 = false;
                var highestAngle = 0;
                for (var j = 1; j < r1.length;j++){
                    var a = this.map.getAxial(r1[j]);
                    var h = (j==(r1.length-1)) ? (a.h+3) : a.h; //TODO actual unit height?
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
                    var h = (j==(r2.length-1)) ? (a.h+3): a.h;//TODO actual unit height?
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
                }else if ((!blocked1 && !blocked2) == false){
                    //PARTIAL LOS
                    aNode.sprite1.tint = this.map.partialTint;
                    aNode.sprite2.tint = this.map.partialTint;
                }else{
                    //FULL LOS AND BREAK
                    aNode.sprite1.tint = 0xFFFFFF;
                    aNode.sprite2.tint = 0xFFFFFF;
                    break;
                }
            }
        },
        resetColors: function(){
        }
    }
    window.Game = Game;
})(window);


//Game UI Elements