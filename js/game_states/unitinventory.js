//Menu state for moving items from the player's inventory to a unit's inventory

(function(window) {
    UnitInventory = {
        unitInfo: null,

        init: function() {
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
            this.style1 = AcornSetup.baseStyle;
            this.style1.font = '48px Orbitron';
            this.style2 = AcornSetup.baseStyle;
            this.style2.font = '48px Sigmar One';

            this.exitButton = Graphics.makeUiElement({
                text: 'Back',
                style: this.style2,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    CharDisplay.charToDisplay = UnitInventory.unitInfo;
                    Acorn.changeState('charDisplay');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);
            this.draw();
        },
        
        draw: function(){
            this.bounds = 0;

            
            this.playerInventoryText = Graphics.makeUiElement({
                text: 'Player Inventory',
                style: this.style1,
                position: [0,Graphics.height/6],
                anchor: [0,0.5],
            });
            this.playerInventoryText.fontSize = 24;
            Graphics.uiContainer.addChild(this.playerInventoryText);

            this.unitInventoryText = Graphics.makeUiElement({
                text: this.unitInfo.name + ' Inventory',
                style: this.style1,
                position: [Graphics.width,Graphics.height/6],
                anchor: [1,0.5]
            });
            this.unitInventoryText.fontSize = 24;
            Graphics.uiContainer.addChild(this.unitInventoryText);
        
        },
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
        }

    }
    window.UnitInventory = UnitInventory;
})(window);
