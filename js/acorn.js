/*!
 * Acorn
 * A Stupid Simple Game Engine
 * 
 * Author: Eric Grotzke / Ian Roberts
 *
 */

(function(window) {

    // -------------------------------------------
    // Base Game Engine
    //--------------------------------------------

    Acorn = {
        states: {},
        currentState: null,

        addState: function(newState) {
        	console.log('Adding state: ' + newState.stateId);
        	this.states[newState.stateId] = newState;
        },
        
        changeState: function(stateId){
            try{
                this.currentState = stateId;
                this.states[stateId].init();
            }catch(e){
                console.log('failed to change to state ' + stateId);
                console.log(e);
            }
        },
        onReady: function(callback) {
            console.log('Loading state:');
        }
    };

    // -------------------------------------------
    // Input Manager
    //--------------------------------------------

    Acorn.Input = {
        // Keyboard Inputs
        Key: {
            UP: 0,
            DOWN: 1,
            LEFT: 2,
            RIGHT: 3,
            INVENTORY: 4,
            CHARSHEET: 5,
            ROTATE1: 6,
            ROTATE2: 7,
            INTERACT: 8,
            TOGGLEMAP: 10,
            TOGGLESTATS: 11,
            BACKSPACE: 12
        },
        keysPressed: [],
        keyBindings: [],

        // Mouse inputs
        mouse: {
            X: null,
            Y: null,
            prevX: null,
            prevY: null,
        },
        buttons: {},
        mouseUpCallback: null,
        mouseClickCallback: null,
        mouseMoveCallback: null,
        touchEventCallback: null,
        scrollCallback: null,


        init: function() {
            this.bind();

            //Mouse
            window.onmousemove = Acorn.Input.handleMouseMove;
            window.onmousedown = Acorn.Input.handleMouseClick;
            window.onmouseup = Acorn.Input.handleMouseUp;
            window.onwheel = Acorn.Input.handleScroll;
        },
        bind: function() {
            this.keyBindings[83] = Acorn.Input.Key.DOWN; //default S
            this.keyBindings[87] = Acorn.Input.Key.ROTATE2; //default W
            this.keyBindings[65] = Acorn.Input.Key.LEFT; //default D
            this.keyBindings[68] = Acorn.Input.Key.RIGHT; //default A
            this.keyBindings[32] = Acorn.Input.Key.TOGGLESTATS; //default Space
            this.keyBindings[67] = Acorn.Input.Key.CHARSHEET; //default C
            this.keyBindings[69] = Acorn.Input.Key.INTERACT; //default E
            this.keyBindings[81] = Acorn.Input.Key.ROTATE1; //default Q
            this.keyBindings[82] = Acorn.Input.Key.ROTATE; //default R
            this.keyBindings[77] = Acorn.Input.Key.TOGGLEMAP; //default M
            this.keyBindings[8] = Acorn.Input.Key.BACKSPACE; //default M
        },
        getBinding: function(keyCode) {
            return this.keyBindings[keyCode];
        },
        keyDown: function(keyCode) {
            //console.log(keyCode);
            this.keysPressed[this.getBinding(keyCode)] = true;
        },
        keyUp: function(keyCode) {
            this.keysPressed[this.getBinding(keyCode)] = false;
        },
        setValue: function(binding, value) {
            this.keysPressed[binding] = value;
        },
        isPressed: function(binding) {
            return this.keysPressed[binding];
        },

        // Mouse Functions
        handleMouseMove: function(e) {
            Acorn.Input.mouse.prevX = Acorn.Input.mouse.X;
            Acorn.Input.mouse.prevY = Acorn.Input.mouse.Y;
            Acorn.Input.mouse.X = e.layerX;
            Acorn.Input.mouse.Y = e.layerY;
            if(Acorn.Input.mouseMoveCallback && typeof Acorn.Input.mouseMoveCallback === 'function') {
                Acorn.Input.mouseMoveCallback(e);
            }
        },
        handleScroll: function(e) {
            if(Acorn.Input.scrollCallback && typeof Acorn.Input.scrollCallback === 'function') {
                Acorn.Input.scrollCallback(e);
            }
        },
        handleTouchEvent: function(e) {
            if(Acorn.Input.touchEventCallback && typeof Acorn.Input.touchEventCallback === 'function') {
                Acorn.Input.touchEventCallback(e);
            }
        },
        handleMouseClick: function(e){
            Acorn.Input.buttons[e.button] = true;
            if(Acorn.Input.mouseClickCallback && typeof Acorn.Input.mouseClickCallback === 'function') {
                Acorn.Input.mouseClickCallback(e);
            }
        },
        handleMouseUp: function(e){
            Acorn.Input.buttons[e.button] = false;
            if(Acorn.Input.mouseUpCallback && typeof Acorn.Input.mouseUpCallback === 'function') {
                Acorn.Input.mouseUpCallback(e);
            }
        },
        onMouseClick: function(callback){
            this.mouseClickCallback = callback;
        },
        onMouseUp: function(callback){
            this.mouseUpCallback = callback;
        },
        onScroll: function(callback){
            this.scrollCallback = callback;
        },
        onMouseMove: function(callback) {
            this.mouseMoveCallback = callback;
        },
        onTouchEvent: function(callback) {
            this.touchEventCallback = callback;
        }

    };
    
    //--------------------------------------------
    // Sound Manager
    //--------------------------------------------
    
    Acorn.Sound= {
        _sounds: [],
        ready: false,
        required: null, //number of sounds that need to be pre-loaded
        requiredCurrent: null,

        init: function() {
            this.required = 0;
            this.requiredCurrent = 0;
        },
        addSound: function(sound) {
            // url + id
            var newSound = {};
            newSound.url = sound.url;
            newSound.id = sound.id;
            //Set optional property multi
            if (typeof sound.multi == 'undefined'){
                newSound.multi = true;
            }else{
                newSound.multi = sound.multi;
            }
            if(newSound.multi) {
                newSound._sound = [];
                newSound._sound.push(new Audio(newSound.url));
            } else {
                newSound._sound = new Audio(newSound.url);
            }
            //set optional property volume
            if (typeof sound.volume == 'undefined'){
                newSound.volumeBase = 1.0;
                newSound.volume = 1.0;
            }else{
                newSound.volume = sound.volume;
                newSound.volumeBase = sound.volume;
            }
            //set optional property type
            if (typeof sound.type == 'undefined'){
                newSound.type = 'sfx';
            }else{
                newSound.type = sound.type;
            }

            //set optional property onEnd
            if (typeof sound.onEnd !== 'undefined'){
                newSound._sound.onended = sound.onEnd;
            }
            if (sound.preload && !newSound.multi){
                newSound._sound.oncanplaythrough = Acorn.Sound.isReady;
                this.required += 1;
            }
            this._sounds.push(newSound);
        },
        stop: function(id){
            for(var i = 0; i < this._sounds.length; i++) {
                if(this._sounds[i].id == id) {
                    var snd = this._sounds[i];
                    if(snd.multi) {
                        //TODO
                    } else {
                        snd._sound.pause();
                        snd._sound.currentTime = 0;
                    }
                    break;
                }
            }
        },
        isReady: function(){
            Acorn.Sound.requiredCurrent += 1;
            if (Acorn.Sound.requiredCurrent==Acorn.Sound.required){
                Acorn.Sound.ready = true;
                mainObj.checkReady();
            }
        },
        play: function(id,loc) {
            var vMod = 1.0;
            if (typeof loc != 'undefined'){
                var xDist = (Graphics.world.position.x*-1+(Graphics.width/2)) - loc[0];
                var yDist = (Graphics.world.position.y*-1+(Graphics.height/2)) - loc[1];
                var h = Math.sqrt(xDist * xDist + yDist * yDist);
                if (h != 0){
                    var vMod  =  (Graphics.diameter / (Graphics.diameter + (h*(h/25))));
                }
                if (vMod < 0){
                    vMod = 0;
                }else if (vMod > 1.0){
                    vMod = 1.0;
                }

            }
            for(var i = 0; i < this._sounds.length; i++) {
                if(this._sounds[i].id == id) {
                    var snd = this._sounds[i];
                    if(snd.multi) {
                        var addSound = true;
                        for(var j = 0; j < snd._sound.length; j++) {
                            if(snd._sound[j].paused) {
                                snd._sound[j].volume = snd.volume*vMod;
                                snd._sound[j].play();
                                addSound = false;
                                break;
                            }
                        }
                        if(addSound) {
                            snd._sound.push(new Audio(snd.url));
                            snd._sound[snd._sound.length - 1].volume = snd.volume*vMod;
                            snd._sound[snd._sound.length - 1].play();
                        }
                    } else {
                        if (snd._sound.paused) {
                            snd._sound.volume = snd.volume*vMod;
                            snd._sound.play();
                        } else {
                            snd._sound.currentTime = 0;
                        }
                    }
                    break;
                }
            }
        }
    };

    // -------------------------------------------
    // Network Manager
    //--------------------------------------------
    Acorn.Net = {
        socket_: null,
        ready: false,
        callbacks_: [],

        init: function() {
            // Start network connection
            console.log("Acorn.Net: Trying to set up socket....");
            this.socket_ = io.connect();
            this.socket_.on('serverUpdate', function(data) {
                for (var i = 0; i < data.length;i++){   
                    if(Acorn.Net.callbacks_[data[i].call]) {
                        Acorn.Net.callbacks_[data[i].call](data[i].data);
                    }
                }
            });
        },
        on: function(key, callback) {
            if(callback && typeof callback === 'function') {
                this.callbacks_[key] = callback;
            }
            //console.log(this.callbacks_);
        }
    };

    // -------------------------------------------
    // Initialize 
    //--------------------------------------------
    Acorn.Input.init();

    window.Acorn = Acorn;
})(window);