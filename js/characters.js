//Character creation/editing screen

(function(window) {
    Characters = {
        

        init: function() {
            //back button

            var style = {
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
            this.noCharacters = Graphics.makeUiElement({
                text: 'You need 5 units to play!',
                position: [Graphics.width/2,35]
            })
            Graphics.uiContainer.addChild(this.noCharacters);

            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    Acorn.changeState('mainMenu');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            this.newChar = Graphics.makeUiElement({
                text: '+ New Unit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    console.log('Init char creation screen?');
                }
            });
            this.newChar.position.x = 25 + this.newChar.width/2;
            this.newChar.position.y = 25 + this.newChar.height/2;
            Graphics.uiContainer.addChild(this.newChar);

            this.newRandChar = Graphics.makeUiElement({
                text: '+ Random New Unit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    Acorn.Net.socket_.emit('addRandomChar',{});
                }
            });
            this.newRandChar.position.x = 25 + this.newRandChar.width/2 + this.newChar.position.x + this.newChar.width/2;
            this.newRandChar.position.y = 25 + this.newRandChar.height/2;
            Graphics.uiContainer.addChild(this.newRandChar);

            //display characters
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.newChar,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.newRandChar,Graphics.uiPrimitives2,{});
            this.noCharacters.visible = (Player.characters.length < 5) ? true : false;
        }

    }
    window.MapGen = MapGen;
})(window);
