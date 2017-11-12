(function(window) {
    var Tooltip = function(){
        this.maxWidth = 250;
        this.ttInfo = null;
        this.texture = null;
        this.sprite = null;
        this.style1 = {
            font: '18px Sigmar One', 
            fill: 'white', 
            align: 'left',
            wordwrap: true,
            wordWrapWidth: this.maxWidth
        };
    };

    Tooltip.prototype.set = function(data){
        //set the texture, sprite and info of the tooltip
        this.ttInfo = data;
        //REQUIRED: data.ttArray [{text: "derp"}]
            //OPTIONS: color,fontSize, align, sprite????
        //OPTIONAL: data.bgFill
        if (typeof this.ttInfo.bgFill == 'undefined'){
            this.ttInfo.bgFill = 'black';
        }
        //OPTIONAL: data.alpha
        if (typeof this.ttInfo.alpha == 'undefined'){
            this.ttInfo.alpha = 1;
        }
        var w = 0;
        var h = 0;
        var hVar = 0;
        var eHei = 5; //extra height to add after each text object
        //create a new container for the tooltip
        var scene = new PIXI.Container();
        var cont = new PIXI.Container();
        var gfx = new PIXI.Graphics();
        gfx.beginFill(this.ttInfo.bgFill,this.ttInfo.alpha);
        gfx.drawRect(0,0,Graphics.width,Graphics.height);
        scene.addChild(gfx);
        scene.addChild(cont);
        
        var textObjects = [];
        for (var i = 0; i < this.ttInfo.ttArray.length;i++){
            //create the text object
            var text = new PIXI.Text(this.ttInfo.ttArray[i].text,this.style1);
            //set the fontSize/color/align ETC
            if (typeof this.ttInfo.ttArray[i].fontSize != 'undefined'){
                text.style.fontSize = this.ttInfottArray[i].fontSize;
            }
            if (typeof this.ttInfo.ttArray[i].color != 'undefined'){
                text.style.fill = this.ttInfo.ttArray[i].color;
            }
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;
            text.position.x = text.width/2;
            text.position.y = text.height/2 + hVar;
            hVar += text.height + eHei;
            textObjects.push(text);
            //increment height and width
            h += text.height;
            if (text.width > w){
                w = text.width;
            }
            cont.addChild(text);
        }
        //check alignment
        for (var j = 0; j < textObjects.length; j++){
            try{
                if (this.ttInfo.ttArray[j].align == 'center'){
                    textObjects[j].position.x = w/2;
                }else if(this.ttInfo.ttArray[j].align == 'right'){
                    textObjects[j].position.x = w-textObjects[j].width/2;
                }
            }catch(e){
                console.log(e);
            }
        }
        //draw outline
        gfx.lineStyle(3,'white',1);
        gfx.moveTo(2,2);
        gfx.lineTo(w-2,2);
        gfx.lineTo(w-2,h-2);
        gfx.lineTo(2,h-2);
        gfx.lineTo(2,2);
        //create and render the texture and sprite
        this.texture = PIXI.RenderTexture.create(w,h);
        var renderer = new PIXI.CanvasRenderer();
        Graphics.app.renderer.render(scene,this.texture);
        this.sprite = new PIXI.Sprite(this.texture);
    }

    window.Tooltip = Tooltip;
})(window);
