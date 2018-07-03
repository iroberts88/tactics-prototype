(function(window) {

//TODO put this into Acorn???

    Settings = {
        scaleToFit: null,
        mute: null,
        masterVolume: null,
        musicVolume: null,
        sfxVolume: null,

        autoFullScreen: null,
        stats: null,
        statsOn: null,
        currentRotation: null,
        credentials: null,
        credentialsOn: null,
        charScrollSpeed: null,

        init: function() {
        	//Working
            this.scaleToFit = true; //scale to fit screen size
            this.mute = false; 
            this.masterVolume = 1.0;
            this.musicVolume = 1.0;
            this.sfxVolume = 1.0;

            this.charScrollSpeed = 100;
            this.autoFullScreen = false;
            this.currentMap = null;
            this.stats = new Stats();
            this.stats.setMode(0);
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';
            this.statsOn = false;
            this.credentials = new Credentials();
            this.credentials.domElement.style.position = 'absolute';
            this.credentialsOn = false;
            this.currentRotation = 0;
        },
        zoom: function(dir){
            if (Acorn.currentState == 'MapGen' || Acorn.currentState == 'inGame'){
                var changed = true;
                if (dir == 'in'){
                    window.currentGameMap.currentZoomSetting += 1;
                    if (window.currentGameMap.currentZoomSetting == window.currentGameMap.ZOOM_SETTINGS.length){
                        window.currentGameMap.currentZoomSetting = window.currentGameMap.ZOOM_SETTINGS.length-1;
                        changed = false
                    }
                }else if (dir == 'out'){
                    window.currentGameMap.currentZoomSetting -= 1;
                    if (window.currentGameMap.currentZoomSetting == -1){
                        window.currentGameMap.currentZoomSetting = 0;
                        changed = false
                    }
                }
                if (changed){
                    var t = 1;
                    if (!(window.currentGameMap.currentRotation%2)){t = 2}
                    window.currentGameMap['container' + t].children = window.currentGameMap.updateSprites(window.currentGameMap['container' + t].children);
                    window.currentGameMap.changedZoom = true;
                }
            }else{
                var bounds = 0;
                if (Acorn.currentState == 'charScreen'){bounds = Characters.bounds}
                if (Acorn.currentState == 'learnAbilitiesMenu'){bounds = LearnAbilities.bounds}
                if (Acorn.currentState == 'equipAbilitiesMenu'){bounds = EquipAbilities.bounds}
                if (dir == 'in'){
                    Graphics.uiPrimitives.position.y += this.charScrollSpeed;
                    Graphics.uiPrimitives2.position.y += this.charScrollSpeed;
                    Graphics.worldContainer.position.y += this.charScrollSpeed;
                    Graphics.uiContainer.position.y += this.charScrollSpeed;
                    if (Graphics.uiPrimitives.position.y > 0){
                        Graphics.uiPrimitives.position.y = 0;
                        Graphics.worldContainer.position.y = 0;
                        Graphics.uiPrimitives2.position.y = 0;
                        Graphics.uiContainer.position.y = 0;
                    }
                }else if (dir == 'out'){
                    Graphics.uiPrimitives.position.y -= this.charScrollSpeed;
                    Graphics.worldContainer.position.y -= this.charScrollSpeed;
                    Graphics.uiPrimitives2.position.y -= this.charScrollSpeed;
                    Graphics.uiContainer.position.y -= this.charScrollSpeed;
                    if (Graphics.uiPrimitives.position.y < bounds){
                        Graphics.uiPrimitives.position.y = bounds;
                        Graphics.worldContainer.position.y = bounds;
                        Graphics.uiPrimitives2.position.y = bounds;
                        Graphics.uiContainer.position.y = bounds;
                    }
                }
            }
        },
        setYScale: function(dir){
            /*
            if (Acorn.currentState == 'MapGen' || Acorn.currentState == 'inGame'){
                if (dir == 'up'){
                    window.currentGameMap.currentYScaleSetting += 1;
                    if (window.currentGameMap.currentYScaleSetting == window.currentGameMap.YSCALE_SETTINGS.length){
                        window.currentGameMap.currentYScaleSetting = window.currentGameMap.YSCALE_SETTINGS.length-1;
                    }
                }else if (dir == 'down'){
                    window.currentGameMap.currentYScaleSetting -= 1;
                    if (window.currentGameMap.currentYScaleSetting == -1){
                        window.currentGameMap.currentYScaleSetting = 0;
                    }
                }
                var t = 1;
                if (!(window.currentGameMap.currentRotation%2)){t = 2}
                window.currentGameMap['container' + t].children = window.currentGameMap.updateSprites(window.currentGameMap['container' + t].children);
            }*/
        },
        rotateMap: function(dir){
            
            if (Acorn.currentState == 'MapGen' || Acorn.currentState == 'inGame'){
                var c = window.currentGameMap.currentRotation;
                var d = 1;
                if (dir == 'right'){
                    window.currentGameMap.currentRotation -= 1;
                    if (window.currentGameMap.currentRotation == -1){
                        window.currentGameMap.currentRotation = window.currentGameMap.totalRotations-1;
                    }
                }else if (dir == 'left'){
                    d = -1;
                    window.currentGameMap.currentRotation += 1;
                    if (window.currentGameMap.currentRotation == window.currentGameMap.totalRotations){
                        window.currentGameMap.currentRotation = 0;
                    }
                }
                window.currentGameMap.rotateData = {
                    t: 0,
                    extraRot: 0,
                    time: 0.05,
                    dir: dir,
                    angle: ((360/window.currentGameMap.totalRotations)*Math.PI/180)*d
                }
            }
        },
        toggleCredentials: function(on){
            try{
                if (!on){
                    this.credentialsOn = false;
                    document.body.removeChild( this.credentials.domElement );
                }else{
                    this.credentialsOn = true;
                    document.body.appendChild( this.credentials.domElement );
                    document.getElementById('usrInput').value = '';
                    document.getElementById('pwInput').value = '';
                }
            }catch(e){}
        },
        toggleStats: function(){
            if (this.statsOn){
                var mode = this.stats.getMode();
                if (mode == 3){
                    this.stats.setMode(0);
                    this.stats.modeSwitch(0);
                    this.statsOn = false;
                    document.body.removeChild( this.stats.domElement );
                }else{
                    this.stats.modeSwitch( ++ mode % 4 );
                    this.stats.setMode(mode);
                }
            }else{
                this.statsOn = true;
                document.body.appendChild( this.stats.domElement );
            }
        },
        toggleViewBump: function(){
        	if (this.viewBumpSpeed > 0){
        		//turn it off
        		this.oldViewBump = this.viewBumpSpeed;
        		this.viewBumpSpeed = 0;
        		Map.currentViewBump.x = 0;
        		Map.currentViewBump.y = 0;
        	}else{
        		this.viewBumpSpeed = this.oldViewBump;
        	}
        },
        toggleAutoFullScreen: function(){
            if (this.autoFullScreen){
                this.autoFullScreen = false;
                Graphics.renderer.view.removeEventListener('click',Settings.requestFullScreen);
                Graphics.renderer.view.removeEventListener('touchend',Settings.requestFullScreen, {passive: false});
                Settings.exitFullScreen();
            }else{
                this.autoFullScreen = true;
                Graphics.renderer.view.addEventListener('click',Settings.requestFullScreen);
                Graphics.renderer.view.addEventListener('touchend',Settings.requestFullScreen, {passive: false});
            }
        },
        requestFullScreen: function(e){
            e.preventDefault();
            document.body.style.overflow = 'visible';
            if (!document.fullscreenElement){
                var c = document.body;
                if (c.webkitRequestFullScreen){
                    c.webkitRequestFullScreen();
                }else if (c.mozRequestFullScreen){
                    c.mozRequestFullScreen();
                }else if (c.requestFullscreen){
                    c.requestFullscreen();
                }else if (c.msRequestFullscreen){
                    c.msRequestFullscreen();
                }
            }
            if (Acorn.currentState == 'initialScreen'){
                Acorn.changeState('mainMenu');
            }
        },
        exitFullScreen: function(){
            if (document.webkitExitFullscreen){
                document.webkitExitFullscreen();
            }else if (document.mozCancelFullScreen){
                document.mozCancelFullScreen();
            }else if (document.exitFullscreen){
                document.exitFullscreen();
            }else if (document.msExitFullscreen){
                document.msExitFullscreen()
            }
            document.body.style.overflow = 'hidden';
            Graphics.resize();
        },
        toggleScaleToFit: function(){
            if (this.scaleToFit){
                this.scaleToFit = false;
            }else{
                this.scaleToFit = true;
            }
            Graphics.resize();
        },
        toggleMute: function(){
            if (this.mute){
                this.mute = false;
                this.setMasterVolume(this.masterVolume);
            }else{
                this.mute = true;
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    Acorn.Sound._sounds[i].volume = 0;
                }
            }
        },
        setSFXVolume: function(v){
            Settings.sfxVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    var snd = Acorn.Sound._sounds[i];
                    if (snd.type == 'sfx'){
                        snd.volume = snd.volumeBase*Settings.masterVolume*Settings.musicVolume;
                    }
                }
            }
        },
        setMusicVolume: function(v){
            Settings.musicVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    var snd = Acorn.Sound._sounds[i];
                    if (snd.type == 'music'){
                        snd.volume = snd.volumeBase*Settings.masterVolume*Settings.musicVolume;
                    }
                }
            }
        },
        setMasterVolume: function(v){
            Settings.masterVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                Settings.setMusicVolume(Settings.musicVolume);
                Settings.setSFXVolume(Settings.sfxVolume);
            }
        }
    };
    
    Settings.init();

    window.Settings = Settings;
})(window);