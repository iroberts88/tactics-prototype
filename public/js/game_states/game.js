
(function(window) {
    Game = {

        map: null,
        setNewHoveredNode: null, //set a new hovered over node
        setNewHoveredUnit: null, //set a new hovered over unit
        currentlyMousedOver: null,

        selectedNode: null,
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

        currentTurnArrow: null,
        turnArrowStartY: null,

        nodeText: null,
        nodeInfo: null,

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
            window.currentGameMap = this.map;
            Graphics.showLoadingMessage(false);
        },

        initUI: function(){
            var outlineFilterRed = new PIXI.filters.GlowFilter(25, 2, 1.5, 0xff9999, 0.5);
            var filtersOn = function (e) {
                Game.resetTint();
                Game.units[e.currentTarget.unitID].sprite.filters = [outlineFilterRed];
                var t = 1;
                if (!(Game.map.currentRotation%2)){t = 2}
                if (Game.units[e.currentTarget.unitID].currentNode){
                    Game.setNewHoveredNode = Game.units[e.currentTarget.unitID].currentNode['sprite' + t];
                    Game.currentlyMousedOver = Game.units[e.currentTarget.unitID].currentNode['sprite' + t];
                }else{
                    Game.setNewHoveredUnit = Game.units[e.currentTarget.unitID];
                }
            }

            var filtersOff = function(e) {
                Game.resetTint();
                Game.units[e.currentTarget.unitID].sprite.filters = [];
            }
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
                    if (Game.units[e.currentTarget.unitID].currentNode){
                        Game.selectNode(Game.units[e.currentTarget.unitID].currentNode);
                    }
                }
                this.units[i].sprite.on('pointerdown',overFunc);
                this.units[i].sprite.on('pointerover', filtersOn);
                this.units[i].sprite.on('pointerout', filtersOff);
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
                sprite.on('pointerover', filtersOn);
                sprite.on('pointerout', filtersOff);
            }
            /*this.currentTurnArrow = Graphics.getSprite('arrow');
            this.currentTurnArrow.tint = 0x00FF00;
            this.currentTurnArrow.anchor.x = 0.5;
            this.currentTurnArrow.anchor.y = 0.5;
            this.setTurnArrow();*/

            //Compass

            //Time/player turn

            //Info Pane

            //Node info pane

            //Menu

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
            while(text.width > w-5){
                text.style.fontSize = text.style.fontSize*0.9;
            }
            cont.addChild(text);

            var text2 = new PIXI.Text('Level ' + Game.units[id].level + ' ' + Game.units[id].classInfo.currentClass, style);
            text2.anchor.x = 0.5;
            text2.anchor.y = 0.5;
            text2.position.x = w*0.5;
            text2.position.y = h*0.66;
            text2.style.fill = Graphics.pallette.color1;
            while(text2.width > w-5){
                text2.style.fontSize = text2.style.fontSize*0.9;
            }
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
                if (Game.units[e.currentTarget.unitID].currentNode){
                    Game.selectNode(Game.units[e.currentTarget.unitID].currentNode);
                }
            }
            sprite.on('pointerdown',overFunc);

            return sprite;
        },

        getUnitInfoPane: function(id){
            var h = 600;
            var w = 400;
            var scene = new PIXI.Container();
            var cont = new PIXI.Container();
            var gfx = new PIXI.Graphics();
            var color = 0xFFFFFF;
            var style  = AcornSetup.baseStyle;
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
            while(nameText.width > w-100){
                nameText.style.fontSize = nameText.style.fontSize*0.9;
            }
            nameText.position.x = w*0.5;
            nameText.position.y = 5;
            cont.addChild(nameText);

            //LEVEL AND CLASS
            var n = 'Level ' + unit.level + ' ' + unit.classInfo.currentClass;
            if (typeof unit.classInfo.baseClass != 'undefined'){
                n += ' (' + unit.classInfo.baseClass + ')';
            }
            var lvlClassText = new PIXI.Text(n, style);
            lvlClassText.anchor.x = 0.5;
            lvlClassText.style.fill = Graphics.pallette.color1;
            while(lvlClassText.width > w-100){
                lvlClassText.style.fontSize = lvlClassText.style.fontSize*0.9;
            }
            lvlClassText.position.x = w*0.5;
            lvlClassText.position.y = 10 + nameText.height;
            cont.addChild(lvlClassText);

            //HEALTH, ENERGY , SHIELDS
            var barHeight = 30;
            var hY = lvlClassText.position.y + lvlClassText.height + 50;
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
            while(hpText.width > w/2){
                hpText.style.fontSize = hpText.style.fontSize*0.9;
            }
            hpText.position.x = w*0.5;
            hpText.position.y = hY;
            cont.addChild(hpText);
            var enText = new PIXI.Text('Energy: ' + unit.currentEnergy + '/' + unit.maximumEnergy, style);
            enText.anchor.x = 0.5;
            enText.anchor.y = 0.5;
            enText.style.fill = Graphics.pallette.color1;
            while(enText.width > w/2){
                enText.style.fontSize = enText.style.fontSize*0.9;
            }
            enText.position.x = w*0.5;
            enText.position.y = eY;
            cont.addChild(enText);
            var shText = new PIXI.Text('Shields: ' + unit.currentShields + '/' + unit.maximumShields, style);
            shText.anchor.x = 0.5;
            shText.anchor.y = 0.5;
            shText.style.fill = Graphics.pallette.color1;
            while(shText.width > w/2){
                shText.style.fontSize = shText.style.fontSize*0.9;
            }
            shText.position.x = w*0.5;
            shText.position.y = sY;
            cont.addChild(shText);

            //MOVE
            var n = (typeof unit.move == 'undefined') ? 'MOV: ???' : 'MOV: ' + unit.move;
            var movText = new PIXI.Text(n, style);
            movText.style.fill = Graphics.pallette.color1;
            while(movText.width > w/3*5){
                movText.style.fontSize = movText.style.fontSize*0.9;
            }
            movText.position.x = 10;
            movText.position.y = sY + barHeight/2 + 20;
            cont.addChild(movText);

            //JUMP
            var n = (typeof unit.jump == 'undefined') ? 'JMP: ???' : 'JMP: ' + unit.jump;
            var jmpText = new PIXI.Text(n, style);
            jmpText.style.fill = Graphics.pallette.color1;
            while(jmpText.width > w/3*5){
                jmpText.style.fontSize = jmpText.style.fontSize*0.9;
            }
            jmpText.position.x = 10;
            jmpText.position.y = movText.position.y + movText.height;
            cont.addChild(jmpText);

            //SPEED
            var n = (typeof unit.speed == 'undefined') ? 'SPD: ???' : 'SPD: ' + unit.speed;
            var spdText = new PIXI.Text(n, style);
            spdText.style.fill = Graphics.pallette.color1;
            while(spdText.width > w/3-5){
                spdText.style.fontSize = spdText.style.fontSize*0.9;
            }
            spdText.position.x = 10;
            spdText.position.y = jmpText.position.y + jmpText.height;
            cont.addChild(spdText);

            //STRENGTH
            var n = (typeof unit.strength == 'undefined') ? 'STR: ???' : 'STR: ' + unit.strength;
            var strText = new PIXI.Text(n, style);
            strText.anchor.x = 0.5;
            strText.style.fill = Graphics.pallette.color1;
            while(strText.width > w/3-5){
                strText.style.fontSize = strText.style.fontSize*0.9;
            }
            strText.position.x = w/2;
            strText.position.y = sY + barHeight/2 + 20;
            cont.addChild(strText);

            //ENDURANCE
            var n = (typeof unit.endurance == 'undefined') ? 'END: ???' : 'END: ' + unit.endurance;
            var endText = new PIXI.Text(n, style);
            endText.anchor.x = 0.5;
            endText.style.fill = Graphics.pallette.color1;
            while(endText.width > w/3-5){
                endText.style.fontSize = endText.style.fontSize*0.9;
            }
            endText.position.x = w/2;
            endText.position.y = strText.position.y + strText.height;
            cont.addChild(endText);

            //DEXTERITY
            var n = (typeof unit.dexterity == 'undefined') ? 'DEX: ???' : 'DEX: ' + unit.dexterity;
            var dexText = new PIXI.Text(n, style);
            dexText.anchor.x = 0.5;
            dexText.style.fill = Graphics.pallette.color1;
            while(dexText.width > w/3-5){
                dexText.style.fontSize = dexText.style.fontSize*0.9;
            }
            dexText.position.x = w/2;
            dexText.position.y = endText.position.y + endText.height;
            cont.addChild(dexText);

            //AGILITY
            var n = (typeof unit.agility == 'undefined') ? 'AGI: ???' : 'AGI: ' + unit.agility;
            var agiText = new PIXI.Text(n, style);
            agiText.anchor.x = 1;
            agiText.style.fill = Graphics.pallette.color1;
            while(agiText.width > w/3*5){
                agiText.style.fontSize = agiText.style.fontSize*0.9;
            }
            agiText.position.x = w-10;
            agiText.position.y = sY + barHeight/2 + 20;
            cont.addChild(agiText);

            //INTELLIGENCE
            var n = (typeof unit.intelligence == 'undefined') ? 'INT: ???' : 'INT: ' + unit.intelligence;
            var intText = new PIXI.Text(n, style);
            intText.anchor.x = 1;
            intText.style.fill = Graphics.pallette.color1;
            while(intText.width > w/3*5){
                intText.style.fontSize = intText.style.fontSize*0.9;
            }
            intText.position.x = w-10;
            intText.position.y = agiText.position.y + agiText.height;
            cont.addChild(intText);

            //WILLPOWER
            var n = (typeof unit.willpower == 'undefined') ? 'WIL: ???' : 'WIL: ' + unit.willpower;
            var wilText = new PIXI.Text(n, style);
            wilText.anchor.x = 1;
            wilText.style.fill = Graphics.pallette.color1;
            while(wilText.width > w/3*5){
                wilText.style.fontSize = wilText.style.fontSize*0.9;
            }
            wilText.position.x = w-10;
            wilText.position.y = intText.position.y + intText.height;
            cont.addChild(wilText);

            //CHARISMA
            var n = (typeof unit.charisma == 'undefined') ? 'CHA: ???' : 'CHA: ' + unit.charisma;
            var chaText = new PIXI.Text(n, style);
            chaText.anchor.x = 0.5;
            chaText.style.fill = Graphics.pallette.color1;
            while(chaText.width > w/3*5){
                chaText.style.fontSize = chaText.style.fontSize*0.9;
            }
            chaText.position.x = w/2;
            chaText.position.y = dexText.position.y + dexText.height;
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

        update: function(deltaTime){
            this.map.update(deltaTime);
            if (!this.map.rotateData){
                //set the new currently selected node after mouseover
                try{

                    if (this.updateUnitsBool || this.map.changedZoom){
                        this.updateUnits();
                    }
                    if (this.setNewHoveredNode && this.selectedNode == null){
                        this.setHoveredNode();
                    }else if(this.setNewHoveredUnit && this.selectedNode == null){
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
        },

        setHoveredNode: function(){
            Game.resetTint();
            this.selectedSprite = this.setNewHoveredNode;
            this.setNodeText(this.selectedSprite);
            this.setNewHoveredNode = 0;
        },
        setHoveredUnit: function(){
            Game.resetTint();
            this.setNewHoveredUnit.infoPane.position.x = Graphics.width - 10 - this.setNewHoveredUnit.infoPane.width;
            this.setNewHoveredUnit.infoPane.position.y = this.nodeText.position.y - 50 - this.setNewHoveredUnit.infoPane.height;
            Graphics.uiContainer.addChild(this.setNewHoveredUnit.infoPane);
            this.currentInfoPane = this.setNewHoveredUnit.infoPane;
            this.setNewHoveredNode = 0;
        },
          
        resetTint: function(){
            if (this.selectedNode != null){return;}
            if (this.selectedSprite){this.selectedSprite.filters = [];}
            if (this.currentInfoPane != null){
                Graphics.uiContainer.removeChild(this.currentInfoPane);
                this.currentInfoPane = null;
            }
            this.nodeText.visible = false;
            this.nodeInfo.visible = false;
        },

        setNodeText: function(node){
            var cubeNode = this.map.cubeMap[node.cubeCoords.x][node.cubeCoords.y][node.cubeCoords.z];
            var a = this.map.getAxial(cubeNode);
            var t = 1;
            if (!(this.map.currentRotation%2)){t = 2}
            var s = a['sprite' + t];
            s.filters = [Game.map.outlineFilter];
            //set node info text
            var t = 'Full LOS';
            if (s.tint == this.map.partialTint){
                t = 'Partial LOS'
            }else if (s.tint == this.map.noLosTint){
                t = 'NO LOS';
            }
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
            console.log('set unit to: ');
            console.log(a.unit);
            a.unit.infoPane.position.x = Graphics.width - 10 - a.unit.infoPane.width;
            a.unit.infoPane.position.y = this.nodeText.position.y - 50 - a.unit.infoPane.height;
            Graphics.uiContainer.addChild(a.unit.infoPane);
            this.currentInfoPane = a.unit.infoPane;

        },

        selectNode: function(n){
            if (typeof n == 'undefined'){n = 'none'}

            console.log(n);

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
                // if there is a unit on the node, add unit height
            }
            aH += startingHeight;
            for (var u in this.units){
                if (this.units[u].owner != playerID){continue;}
                var c = this.map.getCube(this.units[u].currentNode)
                var cPos = {
                    x: c.x + 1e-6,
                    y: c.y + 1e-6,
                    z: c.z + -2e-6,
                }
                var cNeg = {
                    x: c.x + -1e-6,
                    y: c.y + -1e-6,
                    z: c.z + 2e-6,
                }
                var r1 = this.map.cubeLineDraw(node,cPos);
                var r2 = this.map.cubeLineDraw(node,cNeg);
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