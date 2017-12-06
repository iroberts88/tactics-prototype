//Menu state for moving items from the player's inventory to a unit's inventory

(function(window) {
    UnitInventory = {
        unitInfo: null,

        init: function() {
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
            this.style1 = AcornSetup.baseStyle;

            this.exitButton = Graphics.makeUiElement({
                text: 'Back',
                style: this.style1,
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
                text: 'Player',
                style: this.style1,
                position: [Graphics.width/6,Graphics.height/6],
            });
            this.playerInventoryText.style.fontSize = 24;
            Graphics.uiContainer.addChild(this.playerInventoryText);

            //add buttons for each item

            this.unitInventoryText = Graphics.makeUiElement({
                text: this.unitInfo.name,
                style: this.style1,
                position: [Graphics.width*(5/6),Graphics.height/6],
            });
            this.unitInventoryText.style.fontSize = 24;
            Graphics.uiContainer.addChild(this.unitInventoryText);

            //add buttons for each item
            var start = this.unitInventoryText.position.y + this.unitInventoryText.height/2 + 50;
            for (var i = 0; i < this.unitInfo.inventory.items.length;i++){
                var item = this.unitInfo.inventory.items[i];
                var itemButton = Graphics.makeUiElement({
                    text: item.name,
                    style: this.style1,interactive: true,
                    position: [this.unitInventoryText.position.x, 0],
                })
                var fs = 32;
                itemButton.style.fontSize = fs;
                while(itemButton.position.x + itemButton.width/2 > Graphics.width){
                    fs -= 1;
                    itemButton.style.fontSize = fs;
                }
                itemButton.position.y = start + ((itemButton.height+5)*i);

                //tooltip setup
                itemButton.tooltip = new Tooltip();
                var ttArray = [{text: '<' + item.name + '>'}];
                if (typeof item.description != 'undefined'){ttArray.push({text: item.description})}
                if (typeof item.eqData.damage != 'undefined'){ttArray.push({text: '{Damage: }' + Math.round(item.eqData.damage/10)})}
                if (typeof item.eqData.rangeMin != 'undefined'){ttArray.push({text: '{Range: }' + item.eqData.rangeMin + '-' + item.eqData.rangeMax})}
                itemButton.tooltip.set({
                    owner: itemButton,
                    ttArray: ttArray,
                    alpha: 0.5
                });
                Graphics.uiContainer.addChild(itemButton);

                //if type == gun/weapon/shield/accessory add an equip button
                //
                
            }
        
        },
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
        }

    }
    window.UnitInventory = UnitInventory;
})(window);
