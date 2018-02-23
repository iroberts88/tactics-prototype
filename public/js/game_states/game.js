
(function(window) {
    Game = {

        map: null,
        setNewSelectedNode: null,
        currentlyMousedOver: null,

        units: null,
        turnList: null,

        updateUnitsBool: null,

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
            window.currentGameMap = this.map;

            this.units = {};
            this.turnList = [];
            Graphics.showLoadingMessage(false);
        },

        initUI: function(){
            //initialize the units and every UI element
            for (var i in this.units){
                var x = 0;
                var y = 0;
                var node = this.map.axialMap[this.units[i].currentNode.q][this.units[i].currentNode.r];
                node.unit = this.units[i];
                var t = 1;
                if (!(this.map.currentRotation%2)){t = 2}
                var cont = 'container' + t;
                var sp = 'sprite' + t;
                this.units[i].sprite.position.x = node[sp].position.x;
                this.units[i].sprite.position.y = node[sp].position.y-this.map.TILE_HEIGHT*(node.h+1)*0.8*this.map.ZOOM_SETTINGS[this.map.currentZoomSetting];
                this.map[cont].addChildAt(this.units[i].sprite,this.map[cont].getChildIndex(node[sp])+1);
            }

            //UI Elements

            //Turn order

            //Compass

            //Time/player turn

            //Info Pane

            //Node info pane

            //Menu

        },

        drawBG: function(){
            Graphics.bgContainer.clear();
            var colors= [
                        'aqua', 'black', 'blue', 'fuchsia', 'green', 
                        'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 
                        'silver', 'teal', 'white', 'yellow'
                    ];
            Graphics.drawBG('blue', 'black');

        },
       
        update: function(deltaTime){
            this.map.update(deltaTime);
            
            if (!this.map.rotateData){
                //set the new currently selected node after mouseover
                try{

                    if (this.updateUnitsBool || this.map.changedZoom){
                        this.updateUnits();
                    }
                    if (this.setNewSelectedNode){
                        this.selectedSprite = this.setNewSelectedNode;
                        var cubeNode = this.map.cubeMap[this.selectedSprite.cubeCoords.x][this.selectedSprite.cubeCoords.y][this.selectedSprite.cubeCoords.z];
                        var a = this.map.getAxial(cubeNode);
                        var t = 1;
                        if (!(this.map.currentRotation%2)){t = 2}
                        var s = a['sprite' + t];
                        s.tint = 0x999999;
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
                    //units havent updated properly?...
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