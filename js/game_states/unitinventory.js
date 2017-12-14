//Menu state for moving items from the player's inventory to a unit's inventory

(function(window) {
    UnitInventory = {
        unitInfo: null,
        buttons: null,
        currentPage: null,

        init: function() {
            this.currentPage = 'compound';
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

            var y = Graphics.height/6 + 75;
            var padding = 75;
            this.compoundsButton = Graphics.makeUiElement({
                text: 'C',
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    UnitInventory.currentPage = 'compound';
                    UnitInventory.compoundsButton.style.fill = 'gray';
                    UnitInventory.weaponsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.gunsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.accessoriesButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.miscButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.shieldsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.clear();
                    UnitInventory.draw();
                },
                position: [Graphics.width/10,y]
            });
            this.compoundsButton.style.fill = 'gray';
            //tooltip setup
            this.compoundsButton.tooltip = new Tooltip();
            var ttArray = [{text: 'Compounds'}];
            this.compoundsButton.tooltip.set({
                owner: this.compoundsButton,
                ttArray: ttArray,
                alpha: 0.5
            });

            this.weaponsButton = Graphics.makeUiElement({
                text: 'W',
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    UnitInventory.currentPage = 'weapon';
                    UnitInventory.compoundsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.weaponsButton.style.fill = 'gray';
                    UnitInventory.gunsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.accessoriesButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.miscButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.shieldsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.clear();
                    UnitInventory.draw();
                },
                position: [0,y]
            });
            this.weaponsButton.position.x = this.compoundsButton.position.x + this.compoundsButton.width/2 + this.weaponsButton.width/2;
            //tooltip setup
            this.weaponsButton.tooltip = new Tooltip();
            var ttArray = [{text: 'Weapons'}];
            this.weaponsButton.tooltip.set({
                owner: this.weaponsButton,
                ttArray: ttArray,
                alpha: 0.5
            });

            this.gunsButton = Graphics.makeUiElement({
                text: 'G',
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    UnitInventory.currentPage = 'gun';
                    UnitInventory.compoundsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.weaponsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.gunsButton.style.fill = 'gray';
                    UnitInventory.accessoriesButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.miscButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.shieldsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.clear();
                    UnitInventory.draw();
                },
                position: [0,y]
            });
            this.gunsButton.position.x = this.weaponsButton.position.x + this.weaponsButton.width/2 + this.gunsButton.width/2;
            //tooltip setup
            this.gunsButton.tooltip = new Tooltip();
            var ttArray = [{text: 'Guns'}];
            this.gunsButton.tooltip.set({
                owner: this.gunsButton,
                ttArray: ttArray,
                alpha: 0.5
            });

            this.shieldsButton = Graphics.makeUiElement({
                text: 'S',
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    UnitInventory.currentPage = 'shield';
                    UnitInventory.compoundsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.weaponsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.gunsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.shieldsButton.style.fill = 'gray';
                    UnitInventory.accessoriesButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.miscButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.clear();
                    UnitInventory.draw();
                },
                position: [0,y]
            });
            this.shieldsButton.position.x = this.gunsButton.position.x + this.gunsButton.width/2 + this.shieldsButton.width/2;
            //tooltip setup
            this.shieldsButton.tooltip = new Tooltip();
            var ttArray = [{text: 'Shields'}];
            this.shieldsButton.tooltip.set({
                owner: this.shieldsButton,
                ttArray: ttArray,
                alpha: 0.5
            });

            this.accessoriesButton = Graphics.makeUiElement({
                text: 'A',
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    UnitInventory.currentPage = 'accessory';
                    UnitInventory.compoundsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.weaponsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.gunsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.accessoriesButton.style.fill = 'gray';
                    UnitInventory.miscButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.shieldsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.clear();
                    UnitInventory.draw();
                },
                position: [0,y]
            });
            this.accessoriesButton.position.x = this.shieldsButton.position.x + this.shieldsButton.width/2 + this.accessoriesButton.width/2;
            //tooltip setup
            this.accessoriesButton.tooltip = new Tooltip();
            var ttArray = [{text: 'Accessories'}];
            this.accessoriesButton.tooltip.set({
                owner: this.accessoriesButton,
                ttArray: ttArray,
                alpha: 0.5
            });

            this.miscButton = Graphics.makeUiElement({
                text: 'M',
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    UnitInventory.currentPage = 'misc';
                    UnitInventory.compoundsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.weaponsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.gunsButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.accessoriesButton.style.fill = Graphics.pallette.color1;
                    UnitInventory.miscButton.style.fill = 'gray';
                    UnitInventory.clear();
                    UnitInventory.draw();
                },
                position: [0,y]
            });
            this.miscButton.position.x = this.accessoriesButton.position.x + this.accessoriesButton.width/2 + this.miscButton.width/2;
            //tooltip setup
            this.miscButton.tooltip = new Tooltip();
            var ttArray = [{text: 'Misc. Items'}];
            this.miscButton.tooltip.set({
                owner: this.miscButton,
                ttArray: ttArray,
                alpha: 0.5
            });

            this.clear();
            this.draw();
        },
        clear: function(){
            //clear class/ability buttons etc.
            this.buttons = [];
            Graphics.uiContainer.removeChildren();
            Graphics.uiContainer2.removeChildren();
            Graphics.uiContainer.addChild(this.exitButton);
            Graphics.uiContainer.addChild(this.compoundsButton);
            Graphics.uiContainer.addChild(this.weaponsButton);
            Graphics.uiContainer.addChild(this.gunsButton);
            Graphics.uiContainer.addChild(this.accessoriesButton);
            Graphics.uiContainer.addChild(this.miscButton);
            Graphics.uiContainer.addChild(this.shieldsButton);
            Graphics.worldPrimitives.clear();
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

            this.weightText = Graphics.makeUiElement({
                text: this.unitInfo.inventory.currentWeight + ' / ' + this.unitInfo.inventory.maxWeight,
                style: this.style1,
                position: [this.unitInventoryText.position.x - this.unitInventoryText.width/2,Graphics.height/6],
            });
            this.weightText.style.fontSize = 24;
            this.weightText.position.x -= this.weightText.width*2;
            Graphics.uiContainer.addChild(this.weightText);
            var wText = Graphics.makeUiElement({
                text: 'Weight:',
                style: this.style1,
                position: [this.weightText.position.x,this.weightText.position.y - this.weightText.height/2],
            });
            wText.style.fontSize = 24;
            Graphics.uiContainer.addChild(wText);

            //add buttons for each UNIT INVENTORY item
            var start = this.unitInventoryText.position.y + this.unitInventoryText.height/2 + 50;
            for (var i = 0; i < this.unitInfo.inventory.items.length;i++){
                var item = this.unitInfo.inventory.items[i];
                var itemText = Graphics.makeUiElement({
                    text: item.name,
                    style: this.style1,interactive: true,
                    position: [this.unitInventoryText.position.x, 0],
                })
                var fs = 32;
                itemText.style.fontSize = fs;
                while(itemText.position.x + itemText.width/2 > Graphics.width){
                    fs -= 1;
                    itemText.style.fontSize = fs;
                }
                itemText.position.y = start + ((itemText.height+5)*i);

                //tooltip setup
                itemText.tooltip = new Tooltip();//tooltip setup
                itemText.tooltip.getItemTooltip(itemText,item);
                Graphics.uiContainer.addChild(itemText);

                //check bounds
                if (itemText.position.y + itemText.height > Graphics.height){
                    this.bounds = (itemText.position.y + itemText.height - Graphics.height) * -1 - 10;
                }

                var moveButton = Graphics.makeUiElement({
                    text: '←',
                    style: this.style1,interactive: true,buttonMode: true, buttonGlow: true,
                    position: [Graphics.width*(2/3),itemText.position.y],
                    clickFunc: function onClick(e){
                        //attempt to move the item from unit inventory to player inventory
                        Acorn.Net.socket_.emit('playerUpdate',{
                            'command': 'itemToPlayer',
                            'unitID': e.currentTarget.unitID,
                            'itemIndex': e.currentTarget.itemIndex
                        });
                    }
                })
                moveButton.unitID = this.unitInfo.id;
                moveButton.itemIndex = i;
                moveButton.style.fontSize = 20;
                moveButton.position.x -= moveButton.width;
                //tooltip setup
                moveButton.tooltip = new Tooltip();
                var ttArray = [{text: 'Move to player inventory'}];
                moveButton.tooltip.set({
                    owner: moveButton,
                    ttArray: ttArray,
                    alpha: 0.5
                });
                this.buttons.push(moveButton);
                Graphics.uiContainer.addChild(moveButton);
                //if type == gun/weapon/shield/accessory add an equip button
                if (item.type == 'gun' || item.type == 'weapon' || item.type == 'accessory'){
                    var equipButton = Graphics.makeUiElement({
                        text: 'E',
                        style: this.style1,interactive: true,buttonMode: true, buttonGlow: true,
                        position: [0,itemText.position.y],
                        clickFunc: function onClick(e){
                            //attempt to move the item from unit inventory to player inventory
                            Acorn.Net.socket_.emit('playerUpdate',{
                                'command': 'equipItem',
                                'unitID': e.currentTarget.unitID,
                                'itemIndex': e.currentTarget.itemIndex
                            });
                        }
                    })
                    equipButton.unitID = this.unitInfo.id;
                    equipButton.itemIndex = i;
                    equipButton.style.fontSize = 20;
                    equipButton.position.x = moveButton.position.x - 40;
                    //tooltip setup
                    equipButton.tooltip = new Tooltip();
                    var ttArray = [{text: 'Equip the <' + item.name + '>'}];
                    equipButton.tooltip.set({
                        owner: equipButton,
                        ttArray: ttArray,
                        alpha: 0.5
                    });
                    this.buttons.push(equipButton);
                    Graphics.uiContainer.addChild(equipButton);
                }
            }
            //add text/buttons for all player items
            var start = this.compoundsButton.position.y + this.compoundsButton.height/2 + 50;
            var yPos = 0;
            for (var i = 0; i < Player.inventory.length;i++){
                if (Player.inventory[i].type != this.currentPage){
                    continue;
                }
                var item = Player.inventory[i];
                var itemText = Graphics.makeUiElement({
                    text: item.name,
                    style: this.style1,interactive: true,
                    position: [this.playerInventoryText.position.x, 0],
                })
                var fs = 32;
                itemText.style.fontSize = fs;
                while(itemText.position.x - itemText.width/2 < 0){
                    fs -= 1;
                    itemText.style.fontSize = fs;
                }
                itemText.position.y = start + ((itemText.height+5)*yPos);

                //tooltip setup
                itemText.tooltip = new Tooltip();
                itemText.tooltip.getItemTooltip(itemText,item);
                Graphics.uiContainer.addChild(itemText);

                var amtText = Graphics.makeUiElement({
                    text: 'x' + item.amount,
                    style: this.style1,
                    position: [Graphics.width*(1/3), itemText.position.y],
                })
                amtText.style.fontSize = 20;
                Graphics.uiContainer.addChild(amtText);

                var moveButton = Graphics.makeUiElement({
                    text: '→',
                    style: this.style1,interactive: true,buttonMode: true, buttonGlow: true,
                    position: [0,itemText.position.y],
                    clickFunc: function onClick(e){
                        //attempt to move the item from unit inventory to player inventory
                        Acorn.Net.socket_.emit('playerUpdate',{
                            'command': 'itemToUnit',
                            'unitID': e.currentTarget.unitID,
                            'itemIndex': e.currentTarget.itemIndex
                        });
                    }
                })
                moveButton.unitID = this.unitInfo.id;
                moveButton.itemIndex = i;
                moveButton.style.fontSize = 20;
                moveButton.position.x = amtText.position.x + amtText.width/2 + moveButton.width/2 + 5;
                //tooltip setup
                moveButton.tooltip = new Tooltip();
                var ttArray = [{text: 'Move one <' + item.name + '> to <' + UnitInventory.unitInfo.name + "'s> inventory"}];
                moveButton.tooltip.set({
                    owner: moveButton,
                    ttArray: ttArray,
                    alpha: 0.5
                });
                this.buttons.push(moveButton);
                Graphics.uiContainer.addChild(moveButton);
                yPos += 1;
            }
            Graphics.drawBoxAround(this.exitButton,Graphics.worldPrimitives,{});
            Graphics.drawBoxAround(this.compoundsButton,Graphics.worldPrimitives,{});
            Graphics.drawBoxAround(this.weaponsButton,Graphics.worldPrimitives,{});
            Graphics.drawBoxAround(this.gunsButton,Graphics.worldPrimitives,{});
            Graphics.drawBoxAround(this.accessoriesButton,Graphics.worldPrimitives,{});
            Graphics.drawBoxAround(this.miscButton,Graphics.worldPrimitives,{});
            Graphics.drawBoxAround(this.shieldsButton,Graphics.worldPrimitives,{});
            for (var i = 0; i < this.buttons.length;i++){
                Graphics.drawBoxAround(this.buttons[i], Graphics.worldPrimitives,{});
            }
            
        },
        update: function(dt){
        }

    }
    window.UnitInventory = UnitInventory;
})(window);
