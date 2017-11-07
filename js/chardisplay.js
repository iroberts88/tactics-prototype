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
                    if (confirm("Delete " + CharDisplay.charToDisplay.name + ' ?')){
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



        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.deleteButton,Graphics.uiPrimitives2,{});
        }

    }
    window.CharDisplay = CharDisplay;
})(window);
