
(function(window) {
    PreGame = {

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
        }
    window.PreGame = PreGame;
})(window);
