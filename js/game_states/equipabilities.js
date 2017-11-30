//Menu state for learning class abilites

(function(window) {
    EquipAbilities = {
        unitInfo: null,
        fromClass: null,
        classNames: null,
        bounds: null,
        init: function() {
            Graphics.drawBG('navy', 'navy');
            this.classNames = [];
            //back button
            this.style2 = {
                font: '32px Orbitron', 
                fill: 'white', 
                align: 'left', 
                dropShadow: true,
                dropShadowColor: '#000000',
                stroke: '#000000',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6
            };
            this.style1 = {
                font: '64px Sigmar One', 
                fill: 'white', 
                align: 'left', 
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6
            };

            this.charName = Graphics.makeUiElement({
                text: this.unitInfo.name,
                style: this.style1,
            });
            this.charName.position.x = Graphics.width/2;
            this.charName.position.y = 25 + this.charName.height/2;

            Graphics.uiContainer.addChild(this.charName);
            this.exitButton = Graphics.makeUiElement({
                text: 'Back',
                style: this.style2,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    CharDisplay.charToDisplay = EquipAbilities.unitInfo;
                    Acorn.changeState('charDisplay');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            this.fromClass = this.unitInfo.classInfo.currentClass;
            this.draw();

        },
        clear: function(){
            //clear class/ability buttons etc.
            this.classNames = [];
            Graphics.uiContainer.removeChildren();
            Graphics.uiContainer2.removeChildren();
            Graphics.uiContainer.addChild(this.charName);
            Graphics.uiContainer.addChild(this.exitButton);
        },
        draw: function(){
            this.bounds = 0;

            //TODO draw CLEAR ALL button to reset abilities
            this.clearButton = Graphics.makeUiElement({
                text: 'Clear',
                style: this.style2,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    if (confirm('Clear all equipped abilities?')){
                        Acorn.Net.socket_.emit('playerUpdate',{
                            'command': 'clearAbilities',
                            'unitID': e.currentTarget.unitID
                        });
                    }
                }
            });
            this.clearButton.style.fontSize = 80
            this.clearButton.position.x = 25 + this.clearButton.width/2;
            this.clearButton.position.y = 25 + this.clearButton.height/2;
            Graphics.uiContainer.addChild(this.clearButton);
            //TODO draw Available Slots
            this.slotDisplay = Graphics.makeUiElement({
                text: this.unitInfo.classInfo.usedSlots + '/' + this.unitInfo.abilitySlots,
                style: this.style1,
            });
            this.slotDisplay.style.fontSize = 64;
            this.slotDisplay.position.x = Graphics.width/2;
            this.slotDisplay.position.y = Graphics.height/5;
            Graphics.uiContainer.addChild(this.slotDisplay);
            //add all available classes to the list
            var allAbl = this.unitInfo.classInfo.allClassAbilities
            var ypos = this.slotDisplay.y + this.slotDisplay.height/2 + 75;
            for (var i in allAbl){
                var cName = Graphics.makeUiElement({
                    text: i,
                    position: [10,ypos],
                    anchor: [0,0.5],
                    interactive: true,buttonMode: true,buttonGlow: true,
                    clickFunc: function onClick(e){
                        EquipAbilities.fromClass = i;
                        EquipAbilities.clear();
                        EquipAbilities.draw();
                        //EquipAbilities.drawCurrentClass();
                    }
                });
                if (cName.position.y + cName.height > Graphics.height){
                    this.bounds = (cName.position.y + cName.height - Graphics.height) * -1 - 10;
                }
                if (i == EquipAbilities.fromClass){
                    cName.style.fill = 'gray';
                }
                cName.className = i;
                cName.style.fontSize = 48;
                Graphics.uiContainer.addChild(cName);
                this.classNames.push(cName);

                ypos += cName.height + 25;
            }

            var ypos = this.slotDisplay.y + this.slotDisplay.height/2 + 75;
            //draw each learned ability from current class (w/tooltip) + ADD/REMOVE buttons
            for (var a = 0; a < allAbl[this.fromClass].length;a++){
                var ability = allAbl[this.fromClass][a];
                if (typeof this.unitInfo.classInfo.learnedAbilities[ability.id] == 'undefined'){
                    continue;
                }
                var aName = Graphics.makeUiElement({
                    text: ability.name,
                    style: this.style1,
                    position: [Graphics.width/3.5,ypos],
                    anchor: [0.5,0.5],
                    interactive: true
                });
                aName.tooltip = new Tooltip();
                var ttArray = [{text: ability.description}];
                if (typeof ability.sCost != 'undefined'){ttArray.push({text: "{Slot Cost:} " + ability.sCost})}
                if (typeof ability.eCost != 'undefined'){ttArray.push({text: "{Energy Cost:} " + ability.eCost})}
                if (typeof ability.range != 'undefined'){ttArray.push({text: "{Range:} " + ability.range})}
                if (typeof ability.radius != 'undefined'){ttArray.push({text: "{Radius:} " + ability.radius})}
                if (typeof ability.type != 'undefined'){ttArray.push({text: "{Type:} " + ability.type})}
                if (typeof ability.speed != 'undefined'){ttArray.push({text: "{Speed:} " + ability.speed})}
                aName.tooltip.set({
                    owner: aName,
                    ttArray: ttArray,
                    alpha: 0.5
                });
                if (aName.position.y + aName.height > Graphics.height){
                    if (this.bounds > (aName.position.y + aName.height - Graphics.height) * -1 - 10){
                        this.bounds = (aName.position.y + aName.height - Graphics.height) * -1 - 10;                   
                    }
                }
                aName.style.fontSize = 32;
                Graphics.uiContainer.addChild(aName);

                //draw AP cost
                if (typeof this.unitInfo.classInfo.equippedAbilities[ability.id] != 'undefined'){
                    var apCost = Graphics.makeUiElement({
                        text: 'Learned!',
                        style: this.style1,
                        position: [Graphics.width/2,ypos]
                    });
                    apCost.style.fontSize = 24;
                    Graphics.uiContainer.addChild(apCost);
                    var minus = Graphics.makeUiElement({
                        texture: Graphics.minusTexture,
                        position: [Graphics.width*0.66,ypos],
                        interactive: true,buttonMode: true,
                        clickFunc: function onClick(){
                            console.log('remove ability');
                        }
                    });
                    Graphics.uiContainer.addChild(minus);
                }else{
                    var apCost = Graphics.makeUiElement({
                        text: ability.sCost + ' Slots',
                        style: this.style1,
                        position: [Graphics.width/2,ypos]
                    });
                    apCost.style.fontSize = 24;
                    Graphics.uiContainer.addChild(apCost);
                    var plus = Graphics.makeUiElement({
                        texture: Graphics.plusTexture,
                        position: [Graphics.width*0.66,ypos],
                        interactive: true,buttonMode: true,
                        clickFunc: function onClick(){
                            console.log('add ability');
                        }
                    });
                    Graphics.uiContainer.addChild(plus);
                }
                ypos += aName.height + 25;
            }
        },
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.clearButton,Graphics.uiPrimitives2,{});
            for (var i = 0; i < this.classNames.length;i++){
                if (this.fromClass == this.classNames[i].className){

                }
                Graphics.drawBoxAround(this.classNames[i],Graphics.uiPrimitives2,{pos: [this.classNames[i].position.x + this.classNames[i].width/2,this.classNames[i].position.y]});
            }
        }

    }
    window.EquipAbilities = EquipAbilities;
})(window);
