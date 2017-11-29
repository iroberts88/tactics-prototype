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

            this.fromClass = this.unitInfo.classInfo.currentClass;
            this.drawClasses();

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

            //TODO draw CLEAR ALL button to reset abilities

            //TODO draw Available Slots

            //add all available classes to the list
            var allAbl = this.unitInfo.classInfo.allClassAbilities
            var ypos = this.exitButton.y + this.exitButton.height/2 + 75;
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
                if (i == EquipAbilities.fromClass){
                    cName.style.fill = 'gray';
                }
                cName.className = i;
                cName.style.fontSize = 48;
                Graphics.uiContainer.addChild(cName);
                this.classNames.push(cName);

                ypos += cName.height + 25;
            }

            //TODO draw each ability from current class (w/tooltip) + ADD/REMOVE buttons
        },
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            for (var i = 0; i < this.classNames.length;i++){
                if (this.fromClass == this.classNames[i].className){

                }
                Graphics.drawBoxAround(this.classNames[i],Graphics.uiPrimitives2,{pos: [this.classNames[i].position.x + this.classNames[i].width/2,this.classNames[i].position.y]});
            }
        }

    }
    window.EquipAbilities = EquipAbilities;
})(window);
