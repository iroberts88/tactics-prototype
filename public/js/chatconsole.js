(function(window) {

    ChatConsole = {
        active: false,
        textSprite: null,
        string: '',
        ticker: 0,
        _active: false,

        init: function(socket) {
            this.reset();
            //ChatConsole.socket = socket;
        },
        reset: function(){
            ChatConsole.textSprite = new PIXI.Text('', {font:"20px Verdana",fill:'white',wordWrap: false});
            ChatConsole.textSprite.anchor.x = 0;
            ChatConsole.textSprite.anchor.y = 1;
            ChatConsole.textSprite.position.x = 5;
            ChatConsole.textSprite.position.y = Graphics.height - 5;
            ChatConsole.textSprite.visible = false;
            Graphics.consoleContainer.addChild(ChatConsole.textSprite);
        },
        update: function(dt) {
            if (ChatConsole.active){
                ChatConsole.ticker += dt;
                if (ChatConsole.ticker > 0.4){
                    if (ChatConsole._active){
                        ChatConsole.textSprite.text = ">" + ChatConsole.string;
                        ChatConsole._active = false;
                    }else{
                        ChatConsole.textSprite.text = ">" + ChatConsole.string + "_";
                        ChatConsole._active = true;
                    }
                    ChatConsole.ticker = ChatConsole.ticker - 0.4
                }
            }
        },
        keyDown: function(key){
            if (ChatConsole.active){
                if (key === 8){
                    ChatConsole.string = ChatConsole.string.substring(0, ChatConsole.string.length-1);
                }
                
                if (ChatConsole._active){
                    ChatConsole.textSprite.text = ">" + ChatConsole.string;
                }else{
                    ChatConsole.textSprite.text = ">" + ChatConsole.string + "_";
                }
            }
            
            if (key === 13){if (ChatConsole.active === true){
                    ChatConsole.active = false;
                    ChatConsole.textSprite.visible = false;
                    if (ChatConsole.string == 'ping'){
                        Player.pingTime = Date.now();
                    }
                    Acorn.Net.socket_.emit(ENUMS.CLIENTCOMMAND,Utils.createServerData(
                        ENUMS.COMMAND, ChatConsole.string
                    ));
                    ChatConsole.string = '';
                    ChatConsole.textSprite.text = '>';
                }else{
                    ChatConsole.active = true;
                    ChatConsole.textSprite.visible = true;
                }
            }
        },
        keyPress: function(key){
            if(ChatConsole.active) {
            if(key !== 13) {
                ChatConsole.string += String.fromCharCode(key);
                if (ChatConsole._active){
                    ChatConsole.textSprite.text = ">" + ChatConsole.string;
                }else{
                    ChatConsole.textSprite.text = ">" + ChatConsole.string + "_";
                }
            }
        }
        }
    };

    window.ChatConsole = ChatConsole;
})(window);