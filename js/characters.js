//Character creation/editing screen

(function(window) {
    Characters = {
        

        init: function() {
            //back button

            var style = {
                font: '64px Orbitron', 
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

            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: style,
                interactive: true,buttonMode: true,
                clickFunc: function onClick(){
                    Acorn.changeState('mainMenu');
                }
            });
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);
            //display characters
        },
        
        update: function(dt){
            Graphics.uiPrimitives.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives,{});
        }

    }
    window.MapGen = MapGen;
})(window);
