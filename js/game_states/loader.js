//Loading Screen

(function(window) {
    Loader = {

        loadingText: 'Waiting for a game...',
        cs: {r: 0,g: 0,b: 0,phase: 1,speed: 3},

        init: function() {
            this.style = AcornSetup.baseStyle
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);

            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: this.style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    Acorn.Net.socket_.emit('playerUpdate',{command: 'exitGame'});
                    Acorn.changeState('mainMenu');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            this.loading = Graphics.makeUiElement({
                text: this.loadingText,
                style: this.style,
                position: [Graphics.width/2,Graphics.height/2]
            });
            Graphics.uiContainer.addChild(this.loading);

        },
        
        update: function(dt){
            Utils.colorShifter(this.cs);
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            this.loading.style.fill = this.cs.color2;
        }

    }
    window.Loader = Loader;
})(window);
