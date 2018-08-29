//Menu state for learning class abilites

(function(window) {
    EquipAbilities = {
        unitInfo: null,
        fromClass: null,
        classNames: null,
        bounds: null,
        init: function() {
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
            this.style1 = AcornSetup.baseStyle;
            this.style1.font = '48px Orbitron';
            this.style2 = AcornSetup.baseStyle;
            this.style2.font = '48px Sigmar One';

            this.classNames = [];
            
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
                            'unitid': e.currentTarget.unitid
                        });
                    }
                }
            });
            this.clearButton.unitid = this.unitInfo.id;
            this.clearButton.style.fontSize = 80
            this.clearButton.position.x = 25 + this.clearButton.width/2;
            this.clearButton.position.y = 25 + this.clearButton.height/2;
            Graphics.uiContainer.addChild(this.clearButton);
            //TODO draw Available Slots
            this.slotDisplay = Graphics.makeUiElement({
                text: this.unitInfo.usedAbilitySlots + '/' + this.unitInfo.abilitySlots,
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
                aName.tooltip.setAbilityTooltip(aName,ability);
                if (aName.position.y + aName.height > Graphics.height){
                    if (this.bounds > (aName.position.y + aName.height - Graphics.height) * -1 - 10){
                        this.bounds = (aName.position.y + aName.height - Graphics.height) * -1 - 10;                   
                    }
                }
                aName.style.fontSize = 32;
                Graphics.uiContainer.addChild(aName);

                //draw AP cost
                if (typeof this.unitInfo.classInfo.equippedAbilities[ability.id] != 'undefined'){
                    var slots = Graphics.makeUiElement({
                        text: ability.sCost + ' Slots (E)',
                        style: this.style1,
                        position: [Graphics.width/2,ypos]
                    });
                    slots.style.fontSize = 24;
                    Graphics.uiContainer.addChild(slots);
                    var minus = Graphics.makeUiElement({
                        texture: Graphics.minusTexture,
                        position: [Graphics.width*0.66,ypos],
                        interactive: true,buttonMode: true,
                        clickFunc: function onClick(e){
                            //check AP then send to client
                            Acorn.Net.socket_.emit('playerUpdate',{
                                'command': 'unEquipAbility',
                                'unitid': EquipAbilities.unitInfo.id,
                                'classID': EquipAbilities.fromClass,
                                'ablID': e.currentTarget.abl.id
                            });
                        }
                    });
                    minus.abl = ability;
                    minus.classID = this.fromClass;
                    minus.tint = Graphics.pallette.color7;
                    Graphics.uiContainer.addChild(minus);
                }else{
                    var slots = Graphics.makeUiElement({
                        text: ability.sCost + ' Slots',
                        style: this.style1,
                        position: [Graphics.width/2,ypos]
                    });
                    slots.style.fontSize = 24;
                    Graphics.uiContainer.addChild(slots);
                    var plus = Graphics.makeUiElement({
                        texture: Graphics.plusTexture,
                        position: [Graphics.width*0.66,ypos],
                        interactive: true,buttonMode: true,
                        clickFunc: function onClick(e){
                            //check AP then send to client
                            if (EquipAbilities.unitInfo.abilitySlots-EquipAbilities.unitInfo.usedAbilitySlots >= e.currentTarget.abl.sCost){
                                Acorn.Net.socket_.emit('playerUpdate',{
                                    'command': 'equipAbility',
                                    'unitid': EquipAbilities.unitInfo.id,
                                    'classID': EquipAbilities.fromClass,
                                    'ablID': e.currentTarget.abl.id
                                });
                            }
                        }
                    });
                    plus.abl = ability;
                    plus.classID = this.fromClass;
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
        },
        equipAbility: function(data){
            var unit;
            for (var i = 0; i < Player.units.length;i++){
                if (Player.units[i].id == data['unitid']){
                    unit = Player.units[i];
                }
            }
            unit.classInfo.equippedAbilities[data['ablID']] = 1;
            unit.usedAbilitySlots += data.sCost;
            this.clear();
            this.draw();
        },
        unEquipAbility: function(data){
            var unit;
            for (var i = 0; i < Player.units.length;i++){
                if (Player.units[i].id == data['unitid']){
                    unit = Player.units[i];
                }
            }
            delete unit.classInfo.equippedAbilities[data['ablID']];
            unit.usedAbilitySlots -= data.sCost;
            this.clear();
            this.draw();
        },
        clearAbilities: function(data){
            var unit;
            for (var i = 0; i < Player.units.length;i++){
                if (Player.units[i].id == data['unitid']){
                    unit = Player.units[i];
                }
            }
            unit.classInfo.equippedAbilities = {};
            unit.usedAbilitySlots = 0;
            this.clear();
            this.draw();
        }
    }
    window.EquipAbilities = EquipAbilities;
})(window);
