//Character creation/editing screen

(function(window) {
    CharDisplay = {
        charToDisplay: null,

        init: function() {
            Graphics.drawBG('navy', 'navy');
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
                        Acorn.Net.socket_.emit('playerUpdate',{deleteChar:CharDisplay.charToDisplay.id})
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
            unitAbilities.position.x = this.charName.x;
            unitAbilities.position.y = this.deleteButton.y + this.deleteButton.height/2 + 50;
            unitAbilities.anchor.x = 0.5;
            unitAbilities.anchor.y = 0;
            Graphics.uiContainer.addChild(unitAbilities);
            var unitInventory = new PIXI.Text('Inventory',this.style1);
            unitInventory.style.fontSize = 32;
            unitInventory.position.x = this.exitButton.x;
            unitInventory.position.y = this.deleteButton.y + this.deleteButton.height/2 + 50;
            unitInventory.anchor.x = 0.5;
            unitInventory.anchor.y = 0;
            Graphics.uiContainer.addChild(unitInventory);
            var attr = [
                ["Max Health:   ", this.charToDisplay.maximumHealth],
                ["Max Energy:   ", this.charToDisplay.maximumEnergy],
                ["Power:   ", this.charToDisplay.power],
                ["Skill:   ", this.charToDisplay.skill],
                ["Ability Slots:   ", this.charToDisplay.abilitySlots],
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
            var startY = unitStats.y + unitStats.height + 25;
            for (var j = 0; j < attr.length;j++){
                var a = new PIXI.Text(attr[j][0] + attr[j][1],this.style1);
                a.style.fontSize = 24;
                a.position.x = 10;
                a.position.y = startY;
                startY += a.height + 10
                a.anchor.x = 0;
                a.anchor.y = 0;
                Graphics.uiContainer.addChild(a);
            }


        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.deleteButton,Graphics.uiPrimitives2,{});
        }

    }
    window.CharDisplay = CharDisplay;
})(window);
