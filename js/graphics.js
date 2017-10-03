(function(window) {

    Graphics = {
        app: null,
        width: null,
        height: null,
        loader: null,
        resources: null,
        resourcesReady: null,

        init: function(w,h) {

            this.width = w;
            this.height = h;
            this.diameter = Math.sqrt(w*w+h*h);

            //create the PIXI stage
            this.app = new PIXI.Application(this.width, this.height, {backgroundColor: 0xFFFFFF});
            this.filtersToApply = [];

            this.ratio = this.width/this.height;
            this.baseWidth = this.width;
            this.baseHeight = this.height;
            this.actualRatio = [1,1]; //for screen scaling

            this.world = new PIXI.Container();
            this.world.interactive = true;
            this.ui = new PIXI.Container();
            this.bgContainer = new PIXI.Graphics();
            this.bgContainer.position.x = 0;
            this.bgContainer.position.y = 0;
            this.drawBG();
            this.app.stage.addChild(this.bgContainer);
            this.app.stage.addChild(this.world);
            this.app.stage.addChild(this.ui);

            // Show loading message while waiting
            this.showLoadingMessage(true);

            this.worldContainer = new PIXI.Container();
            this.worldContainer.position.x = 0;
            this.worldContainer.position.y = 0;
            this.worldContainer.interactive = true;
            this.world.addChild(this.worldContainer); // ADD WORLD CONTAINER
            this.worldPrimitives = new PIXI.Graphics();
            this.world.addChild(this.worldPrimitives); //ADD WORLD PRIMS (Cleared on update);
            this.uiPrimitives = new PIXI.Graphics();
            this.ui.addChild(this.uiPrimitives); // ADD UI PRIMS
            this.uiContainer = new PIXI.Container();
            this.uiContainer.position.x = 0;
            this.uiContainer.position.y = 0;
            this.ui.addChild(this.uiContainer); //ADD UI CONTAINER
            this.uiPrimitives2 = new PIXI.Graphics();
            this.ui.addChild(this.uiPrimitives2); // ADD UI PRIMS
            this.consoleContainer = new PIXI.Container();
            this.consoleContainer.position.x = 0;
            this.consoleContainer.position.y = 0;
            this.ui.addChild(this.consoleContainer); //ADD CONSOLE CONTAINER

            this.resources = {};
            this.resourcesReady = false;
            this.animationSpeeds = {};
        },

        drawBG: function(color1,color2){
            this.bgContainer.removeChildren();
            if (typeof color1 == 'undefined'){
                color1 = 'black';
            }
            if (typeof color2 == 'undefined'){
                color2 = 'black';
            }
            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext('2d');
            var gradient = ctx.createLinearGradient(0, 0, 0, this.height*0.75);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0,this.width,this.height);
            var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            
            this.bgContainer.addChild(sprite);
        },
        clear: function(){
            this.bgContainer.clear();
            this.worldContainer.removeChildren();
            this.worldPrimitives.clear();
            this.uiContainer.removeChildren();
            this.uiPrimitives.clear();
            this.consoleContainer.removeChildren();
            this.drawBG();
            ChatConsole.reset();
        },

        resize: function(offset){
            if (typeof offset == 'undefined'){
                offset = 0;
            }
            var w;
            var h;
            if (Settings.scaleToFit){
                h = window.innerHeight - offset;
                w = window.innerWidth - offset;
            }else{
                if (window.innerWidth/window.innerHeight > this.width/this.height){
                    h = window.innerHeight - offset;
                    w = window.innerHeight * (this.width/this.height) - offset;
                }else{
                    w = window.innerWidth - offset;
                    h = window.innerWidth * (this.height/this.width) - offset;
                }
            }
            var pos = Math.round(window.innerWidth/2 - (parseInt(Settings.stats.domElement.style.width.substring(0,3))/2));
            Settings.stats.domElement.style.left = pos + 'px';
            this.app.renderer.view.style.width = w + 'px';
            this.app.renderer.view.style.height = h + 'px';
            this.actualRatio = [w/this.baseWidth,h/this.baseHeight];
        },
        startLoad: function(){
            Graphics.app.loader
                .add('img/sheet1.json')
                .add('img/sheet2.json')
                .load(Graphics.loadResources);
            
        },
        showLoadingMessage: function(display, message) {
            if(display) {
                this.loadingMessage = new PIXI.Text((message ? message : 'Loading...' ), {font: '35px Arial', fill: 'white', align: 'left'});
                this.loadingMessage.position.x = (this.width / 2) - 100;
                this.loadingMessage.position.y = (this.height / 2);
                this.app.stage.addChild(this.loadingMessage);
            } else {
                this.app.stage.removeChild(this.loadingMessage)
                this.loadingMessage = null;
            }
            this.app.renderer.render(this.app.stage);
        },

        loadResources: function() {
            console.log("loading resources....");

            //Load all movie clips
            var animations = [
                'unit_base_ul_', 9,
                'unit_base_l_', 9,
                'unit_base_u_', 9,
                'unit_base_d_', 9,
                'unit_base_dl_', 9
            ];
            Graphics.animationSpeeds = {
                'unit_base_ul_': 0.25,
                'unit_base_l_': 0.25,
                'unit_base_u_': 0.25,
                'unit_base_d_': 0.25,
                'unit_base_dl_': 0.25
            };

            //add all movie clips to resources
            for (var j = 0; j < animations.length; j += 2){
                var animTextures = [];
                for (var i=0; i < animations[j+1]; i++){
                    var texture = PIXI.Texture.fromFrame(animations[j] + (i+1) + ".png");
                    animTextures.push(texture);
                };
                Graphics.resources[animations[j]] = animTextures;

            }

            //Load all textures
            var textures = [
                'base_tile1',
                'base_tile2',
                'dirt_tile1',
                'dirt_tile2',
                'snow_tile1',
                'snow_tile2',
                'ice_tile1',
                'grass_tile2',
                'grass_tile1',
                'ice_tile2',
                'sand_tile1',
                'sand_tile2'
            ];

            //add all textures to resources
            for(var i = 0; i < textures.length; i++) {
                var texture = PIXI.Texture.fromFrame(textures[i] + ".png");
                Graphics.resources[textures[i]] = texture;
            }
            
            Graphics.onReady();
        },
        getResource: function(id){
            //returns a PIXI extras.MovieClip or a PIXI Texture from the Graphics.resources array

            //TODO (REMOVE) for debugging item ID's, log item id errors
            if (typeof Graphics.resources[id] === 'undefined'){
                console.log(id);
                console.log('-- Graphics resource not found' )
                return Graphics.resources['base_tile1'];
            }else{
                return Graphics.resources[id];
            }
        },
        onReady: function(callback) {
            Graphics.onReady = callback;
        },
		getSprite: function(id){
            try{
    			var t = this.getResource(id);
    			if (t.constructor === Array){
    				var s = new PIXI.extras.MovieClip(t);
    			}else{
    				var s = new PIXI.Sprite(t);
    			}
    			return s;
            }catch(e){
                console.log('-- Graphics resource not found' )
            }
		},
        drawBoxAround: function(sprite,g,color,size,ybuffer,xbuffer){
            //draws a box around sprite in
            //g = graphics container
            if (typeof ybuffer == 'undefined'){
                ybuffer = 0;
            }
            if (typeof xbuffer == 'undefined'){
                xbuffer = 0;
            }
            if (typeof color == 'undefined'){
                color = '0xFFFFFF';
            }
            if (typeof size == 'undefined'){
                size = 2;
            }
            g.lineStyle(size,color,1);
            g.moveTo(sprite.position.x - sprite.width/2 + xbuffer,sprite.position.y - sprite.height/2 + ybuffer);
            g.lineTo(sprite.position.x + sprite.width/2 - xbuffer,sprite.position.y - sprite.height/2 + ybuffer);
            g.lineTo(sprite.position.x + sprite.width/2 - xbuffer,sprite.position.y + sprite.height/2 - ybuffer);
            g.lineTo(sprite.position.x - sprite.width/2 + xbuffer,sprite.position.y + sprite.height/2 - ybuffer);
            g.lineTo(sprite.position.x - sprite.width/2 + xbuffer,sprite.position.y - sprite.height/2 + ybuffer);
        },
        setSlideBar: function(bar,func){
            bar.clicked = false;
            bar.percent = 0;
            bar.on('mousedown', function onClick(){
                bar.clicked = true;
            });
            bar.on('mouseup', function onClick(e){
                if (bar.clicked){
                    var position = e.data.getLocalPosition(e.target);
                    var start =  -1 * bar.width/2;
                    var percent = (position.x - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
                bar.clicked = false;
            });
            bar.on('mouseupoutside', function onClick(){
                bar.clicked = false;
            });
            bar.on('touchstart', function onClick(){
                bar.clicked = true;
            });
            bar.on('touchend', function onClick(e){
                if (bar.clicked){
                    var position = e.data.getLocalPosition(e.target);
                    var start =  -1 * bar.width/2;
                    var percent = (position.x - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
                bar.clicked = false;
            });
            bar.on('touchendoutside', function onClick(){
                bar.clicked = false;
            });
            bar.on('mousemove', function onMove(e){
                if (bar.clicked){
                    var position = e.data.global.x - Graphics.width/2;
                    var start =  -1 * bar.width/2;
                    var percent = (position - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
            });
            bar.on('touchmove', function onMove(e){
                if (bar.clicked){
                    var position = e.data.global.x - Graphics.width/2;
                    var start =  -1 * bar.width/2;
                    var percent = (position - start) / bar.width;
                    if (percent < 0){percent = 0;}
                    if (percent > 1){percent = 1;}
                    func(percent);
                }
            });
        }
    };

    window.Graphics = Graphics;
})(window);
