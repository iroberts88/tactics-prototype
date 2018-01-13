//Loading Screen

(function(window) {
    Loader = {

        loadingText: 'Waiting for a game',
        cs: {r: 255,g: 0,b: 0,phase: 1,speed: 2.5},
        ticker: 0,
        dots: '',

        init: function() {
            this.style = AcornSetup.baseStyle
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);

            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: this.style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    Acorn.Net.socket_.emit('playerUpdate',{command: 'cancelSearch'});
                    Acorn.changeState('mainMenu');
                }
            });
            this.exitButton.style.fontSize = 80;
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            this.loading = Graphics.makeUiElement({
                text: this.loadingText,
                style: this.style,
                position: [Graphics.width/2,Graphics.height/2]
            });
            this.loading.style.fontSize = 64;
            var pos = Graphics.width/2 - this.loading.width/2;
            this.loading.anchor.x = 0;
            this.loading.position.x = pos;
            Graphics.uiContainer.addChild(this.loading);

        },
        
        update: function(dt){
            this.ticker += dt;
            Utils.colorShifter(this.cs);
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            this.loading.style.fill = this.cs.color2;
            if (this.ticker > 0.4){
                this.dots += '.';
                this.ticker -= 0.4;
                if (this.dots == '....'){this.dots = ''}
            }
            this.loading.text = this.loadingText + this.dots;
            
        }

    }
    window.Loader = Loader;
})(window);
