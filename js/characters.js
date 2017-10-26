//Character creation/editing screen

(function(window) {
    Characters = {
        

        init: function() {
            //back button
            this.exitButton = AcornSetup.makeButton({
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

        }

    }
    window.MapGen = MapGen;
})(window);
