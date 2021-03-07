//Character creation/editing screen

(function(window) {
    CharDisplay = {
        charToDisplay: null,

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
                clickFunc: function onClick(){
                    Acorn.changeState('charScreen');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            this.deleteButton = Graphics.makeUiElement({
                text: 'Delete',
                style: this.style2,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    if (confirm("Delete unit: <" + CharDisplay.charToDisplay.name + '> ?')){
                        Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,Utils.createServerData(Enums.COMMAND, Enums.DELETECHAR, Enums.UNITID, CharDisplay.charToDisplay.id));
                    }
                }
            });
            this.deleteButton.style.fontSize = 80
            this.deleteButton.position.x = 25 + this.deleteButton.width/2;
            this.deleteButton.position.y = 25 + this.deleteButton.height/2;
            Graphics.uiContainer.addChild(this.deleteButton);

            this.charName = Graphics.makeUiElement({
                text: this.charToDisplay.name,
                style: this.style1,
            });
            this.charName.position.x = Graphics.width/2;
            this.charName.position.y = 25 + this.charName.height/2;
            Graphics.uiContainer.addChild(this.charName);
            var unitStats = new PIXI.Text('Stats',this.style1);
            unitStats.style.fontSize = 32;
            unitStats.position.x = this.deleteButton.x;
            unitStats.position.y = this.deleteButton.y + this.deleteButton.height/2 + 50;
            unitStats.anchor.x = 0.5;
            unitStats.anchor.y = 0;
            Graphics.uiContainer.addChild(unitStats);

            var unitAbilities = new PIXI.Text('Ability/Class Info',this.style1);
            unitAbilities.style.fontSize = 32;
            unitAbilities.position.x = Graphics.width*0.66;
            unitAbilities.position.y = this.deleteButton.y + this.deleteButton.height/2 + 50;
            unitAbilities.anchor.x = 0.5;
            unitAbilities.anchor.y = 0;
            Graphics.uiContainer.addChild(unitAbilities);
            this.baseClass = Graphics.makeUiElement({
                text: "Base Class: " + this.charToDisplay.classInfo.baseClass,
                style: this.style1,
                position: [Graphics.width/2,unitAbilities.position.y + 100]
            })
            this.baseClass.style.fontSize = 24;
            Graphics.uiContainer.addChild(this.baseClass);
            this.currentClass = Graphics.makeUiElement({
                text: "Current Class: " + this.charToDisplay.classInfo.currentClass,
                style: this.style1,
                position: [Graphics.width/2,this.baseClass.position.y + 75]
            })
            this.currentClass.style.fontSize = 24;
            Graphics.uiContainer.addChild(this.currentClass);
            this.learnAbilities = Graphics.makeUiElement({
                text: "Learn Abilities",
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width/2,this.currentClass.position.y + 75],
                clickFunc: function onClick(e){
                    LearnAbilities.unitInfo = CharDisplay.charToDisplay;
                    Acorn.changeState('learnAbilitiesMenu');
                }
            })
            this.learnAbilities.style.fontSize = 32;
            Graphics.uiContainer.addChild(this.learnAbilities);
            this.equipAbilities = Graphics.makeUiElement({
                text: "Equip Abilities",
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width/2,this.learnAbilities.position.y + 75],
                clickFunc: function onClick(e){
                    EquipAbilities.unitInfo = CharDisplay.charToDisplay;
                    Acorn.changeState('equipAbilitiesMenu');
                }
            })
            this.equipAbilities.style.fontSize = 32;
            Graphics.uiContainer.addChild(this.equipAbilities);
            this.unitInventory = Graphics.makeUiElement({
                text: "Inventory",
                style: this.style1,
                interactive: true,buttonMode: true,buttonGlow: true,
                position: [Graphics.width/2,this.equipAbilities.position.y + 75],
                clickFunc: function onClick(e){
                    UnitInventory.unitInfo = CharDisplay.charToDisplay;
                    Acorn.changeState('unitInventoryMenu');
                }
            })
            this.unitInventory.style.fontSize = 32;
            Graphics.uiContainer.addChild(this.unitInventory);
            var attr = [
                ["Max Health:   ", this.charToDisplay.maximumHealth],
                ["Max Energy:   ", this.charToDisplay.maximumEnergy],
                ["Power:   ", this.charToDisplay.power],
                ["Skill:   ", this.charToDisplay.skill],
                ["Tactics:   ", this.charToDisplay.tactics],
                ["Ability Slots:   ", this.charToDisplay.usedAbilitySlots + '/' + this.charToDisplay.abilitySlots],
                ['',''],
                ["Strength:   ", this.charToDisplay.strength],
                ["Endurance:   ", this.charToDisplay.endurance],
                ["Agility:   ", this.charToDisplay.agility],
                ["Dexterity:   ", this.charToDisplay.dexterity],
                ["Intelligence:   ", this.charToDisplay.intelligence],
                ["Willpower:   ", this.charToDisplay.willpower],
                ["Charisma:   ", this.charToDisplay.charisma],
                ['',''],
                ["Move:   ", this.charToDisplay.move],
                ["Jump:  ", this.charToDisplay.jump],
                ["Speed:  ", this.charToDisplay.speed]
            ];
            var attrDesc = [
                "The maximum <Health> of the unit. Will be knocked unconscious when reduced to 0 health. Will be killed when reduced to -50% health or when fainted for 5 turns",
                "<Energy> is the main resource for using abilities",
                '<Power> directly increases melee weapon damage (1% per point)',
                '<Skill> directly increases ranged gun damage (1% per point)',
                '<Tactics> directly increases ability damage (1% per point)',
                "<Ability Slots> are used to equip abilites. An ability not from the unit's base or current class costs x3",
                '',
                "<Strength> increases <power> and <max carry weight> on levelup. It also increases  and effectiveness of strength based abilities",
                "<Endurance> increases max <health> on levelup. It also increases effectiveness of endurance based abilities",
                "<Agility> increases <speed> on levelup. It also increases effectiveness of agility based abilities",
                "<Dexterity> increases <skill> on levelup. It also increases effectiveness of dexterity based abilities",
                "<Intelligence> increases <ability slots> and <tactics> on levelup. It also increases effectiveness of intelligence based abilities",
                "<Willpower> increases max <energy> and <damage resistance> on levelup. It also increases effectiveness of willpower based abilities",
                "<Charisma> increases <all stats> slightly on levelup. It also increases effectiveness of charisma based abilities",
                '',
                "Number of hexes a unit can move during it's turn",
                "Number of hexes a unit can jump while moving. Also effects fall damage",
                "Speed affects the unit's position in the turn order."
            ];
            var startY = unitStats.y + unitStats.height + 25;
            for (var j = 0; j < attr.length;j++){
                var a = Graphics.makeUiElement({text: attr[j][0] + attr[j][1],style: this.style1,interactive: true});
                a.tooltip = new Tooltip();
                a.tooltip.set({
                    owner: a,
                    ttArray: [
                        {
                            text: attrDesc[j]
                        }
                    ],
                    alpha: 0.5
                });

                a.style.fontSize = 24;
                a.position.x = 10;
                a.position.y = startY;
                startY += a.height + 10;
                a.anchor.x = 0;
                a.anchor.y = 0;
                Graphics.uiContainer.addChild(a);
            }


        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.deleteButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.learnAbilities,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.equipAbilities,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.unitInventory,Graphics.uiPrimitives2,{});
        }

    }
    window.CharDisplay = CharDisplay;
})(window);
