var mouseX, mouseY;

var now, dt, lastTime;

var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000/60);
        };
})();


var mainObj = this;
mainObj.playerId = 'none';

$(function() {

    //Configure fonts
    WebFontConfig = {
      google: {
        families: [ 'Audiowide', 'Arvo', 'Podkova:700' , 'Electrolize', 'Orbitron', 'Sigmar One','Audiowide']
      },

      active: function() {
        // do something
      }

    };
    (function() {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
      })();

    // initialize Graphics
    document.body.style.margin = "0px 0px 0px 0px";
    Graphics.init(1920, 1080);
    Graphics.onReady(function() {
        Graphics.resourcesReady = true;
        console.log(Graphics);
        setupSocket();
        checkReady();
        document.body.appendChild(Graphics.app.renderer.view);
    });
    Graphics.resize();
    window.onresize = function(event) {
        Graphics.resize();
    };
    Graphics.startLoad();

    // Set up keyboard bindings

    $(document).keypress(function(e) {
        if(e.keyCode === 32) {
            e.preventDefault();
        }
        ChatConsole.keyPress(e.which);
    });
    $(document).keydown(function(e) {
        var key = e.which;
        if (Settings.credentialsOn && key == 13){
            if (Settings.credentials.getType() == 'login'){
                Acorn.Net.socket_.emit('loginAttempt',{sn: document.getElementById('usrInput').value,pw:document.getElementById('pwInput').value});
            }else if (Settings.credentials.getType() == 'new'){
                Acorn.Net.socket_.emit('createUser',{sn: document.getElementById('usrInput').value,pw:document.getElementById('pwInput').value});
            }
        }else{
            ChatConsole.keyDown(key);
        }

        if (!ChatConsole.active) {
            Acorn.Input.keyDown(key);
        }
        // Prevent system wide stops
        if (
                key === 8 || // Backspace
                key === 16// Delete
            ){
            e.preventDefault();
        }

        if ((key === 32 || key === 38 || key === 37 || key === 39 || key === 40 || key === 127) && !ChatConsole.active){
            e.preventDefault();
        }
    });

    $(document).keyup(function(e) {
        Acorn.Input.keyUp(e.which)
    });

    window.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        return false;
    });

    // Load Sounds
    Acorn.Sound.init();
    Acorn.Sound.addSound({url: 'sounds/my_sound.mp3', id: 'item', volume: 1, preload: true});
    Acorn.Sound.addSound({url: 'sounds/Flim.mp3', multi:false, id: 'flim', volume: 1,type: 'music',preload: true,onEnd: function(){Acorn.Sound.play('flim');}});
});

function setupSocket() {
    Acorn.Net.init();

    //set up acorn.Net
    AcornSetup.net();

    console.log("network ready!");
}

function checkReady() {
    if(Graphics.resourcesReady && Acorn.Sound.ready) { //&& Acorn.Net.ready
        console.log('Graphics/Net/Sound READY');
        init();
    } else {
        console.log('Waiting on load...');
    }
}

function init() {
    //do some stuff after Graphics and network are initialized
    lastTime = Date.now();

    //Init Console
    ChatConsole.init();

    Player.init();
    //Init Touch Events
    Graphics.app.stage.on('touchstart', Acorn.Input.handleTouchEvent).on('touchmove', Acorn.Input.handleTouchEvent);

    Graphics.showLoadingMessage(false);
    console.log('Loading Complete');
    Acorn.changeState('loginScreen');

    Graphics.app.ticker.add(function update(){
        Settings.stats.begin();
        if (Player.globalCDTicker > 0){
            Player.globalCDTicker -= Graphics.app.ticker.elapsedMS/2000;
        }
        Acorn.states[Acorn.currentState].update(Graphics.app.ticker.elapsedMS/2000); //update the current state
        Graphics.app.renderer.render(Graphics.app.stage);

        //TODO Put this stuff in the correct state!

        if (Acorn.Input.isPressed(Acorn.Input.Key.TOGGLESTATS)){
            Settings.toggleStats();
            Acorn.Input.setValue(Acorn.Input.Key.TOGGLESTATS, false);
        }
        if (Acorn.Input.isPressed(Acorn.Input.Key.ROTATE1)){
            Settings.rotateMap('left');
            Acorn.Input.setValue(Acorn.Input.Key.ROTATE1, false);
        }
        if (Acorn.Input.isPressed(Acorn.Input.Key.ROTATE2)){
            Settings.rotateMap('right');
            Acorn.Input.setValue(Acorn.Input.Key.ROTATE2, false);
        }
        if (Acorn.Input.isPressed(Acorn.Input.Key.YSCALE1)){
            Settings.setYScale('up');
            Acorn.Input.setValue(Acorn.Input.Key.YSCALE1, false);
        }
        if (Acorn.Input.isPressed(Acorn.Input.Key.YSCALE2)){
            Settings.setYScale('down');
            Acorn.Input.setValue(Acorn.Input.Key.YSCALE2, false);
        }
        Settings.stats.end();
    })
}

//set up acorn game states
AcornSetup.states();
//set up acorn game states
AcornSetup.input();
