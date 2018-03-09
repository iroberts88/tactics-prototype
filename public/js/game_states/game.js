
(function(window) {
    Game = {

        map: null,
        setNewSelectedNode: null,
        currentlyMousedOver: null,

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
            //initialize the units and every UI element
            for (var i in this.units){
                var x = 0;
                var y = 0;
                var node = this.map.axialMap[this.units[i].currentNode.q][this.units[i].currentNode.r];
                this.units[i].setCurrentNode(this.units[i].currentNode.q,this.units[i].currentNode.r,this.map);
                node.unit = this.units[i];
                var t = 1;
                if (!(this.map.currentRotation%2)){t = 2}
                var cont = 'container' + t;
                var sp = 'sprite' + t;
                this.units[i].sprite.position.x = node[sp].position.x;
                this.units[i].sprite.position.y = node[sp].position.y-this.map.TILE_HEIGHT*(node.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                this.map[cont].addChildAt(this.units[i].sprite,this.map[cont].getChildIndex(node[sp])+1);
                var overFunc = function(e){
                    Game.selectNode(Game.units[e.currentTarget.unitID].currentNode);
                }
                //this.units[i].sprite.on('pointerdown',overFunc);
            }

            //UI Elements

            //Turn order
            this.turnListSprites = [];
            var outlineFilterRed = new PIXI.filters.GlowFilter(25, 2, 1.5, 0xff9999, 0.5);
            var filtersOn = function (e) {
                 Game.units[e.currentTarget.unitID].sprite.filters = [outlineFilterRed];
            }

            var filtersOff = function(e) {
                 Game.units[e.currentTarget.unitID].sprite.filters = [];
            }
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
            sprite.unitID = id;


            var overFunc = function(e){
                Game.selectNode(Game.units[e.currentTarget.unitID].currentNode);
            }
            sprite.on('pointerdown',overFunc);

            return sprite;
        },

        selectNode: function(n){
            if (typeof n == 'undefined'){n = 'none'}

            console.log(n);

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
                        this.setTurnArrow();
                    }
                    if (this.setNewSelectedNode){
                        this.selectedSprite = this.setNewSelectedNode;
                        var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                        var a = this.map.getAxial(cubeNode);
                        var t = 1;
                        if (!(this.map.currentRotation%2)){t = 2}
                        var s = a['sprite' + t];
                        s.tint = 0x999999;
                        //set node info text
                        this.nodeText.visible = true;
                        this.nodeInfo.visible = true;
                        this.nodeInfo.text = 'Height: ' + a.h + '    Type: ' + a.tile;
                        this.nodeText.position.x = this.nodeInfo.position.x - this.nodeInfo.width/2;
                        this.nodeText.position.y = this.nodeInfo.position.y - this.nodeInfo.height - 25;
                        this.setNewSelectedNode = 0;
                    }
                }catch(e){
                    console.log(e)
                }
            }else{
                this.updateUnitsBool = true;
            }
            for (var i in this.units){
                if (!this.units[i].sprite.parent.parent){
                    //units havent updated properly...
                    this.updateUnitsBool = true;
                    return;
                }
            }
        },

        updateUnits: function(){
            for (var i in this.units){
                var sprite = this.units[i].sprite;
                var unit = this.units[i];
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

        resetColors: function(){
        }
    }
    window.Game = Game;
})(window);


//Game UI Elements