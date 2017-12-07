(function(window) {
    var Tooltip = function(){
        this.maxWidth = 400;
        this.ttInfo = null;
        this.texture = null;
        this.sprite = null;
        this.style1 = {
            font: '20px Sigmar One', 
            fill: 'white', 
            align: 'left',
            wordWrap: true,
            wordWrapWidth: this.maxWidth
        };
        this.position = {
            x: 0,
            y: 0
        }
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
        var padding = 5;
        var eHeight = 5; //extra height to add after each text object
        var lastHeight = 0;
        //create a new container for the tooltip
        var scene = new PIXI.Container();
        var cont = new PIXI.Container();
        var gfx = new PIXI.Graphics();
        gfx.beginFill(this.ttInfo.bgFill,this.ttInfo.alpha);
        gfx.drawRect(0,0,Graphics.width,Graphics.height);
        gfx.endFill();
        scene.addChild(gfx);
        scene.addChild(cont);
        
        var textObjects = [];
        var yStart = padding;
        for (var i = 0; i < this.ttInfo.ttArray.length;i++){
            //create the text object
            var start = 0;
            var text = this.ttInfo.ttArray[i].text;
            var xStart = padding;
            for (var sI = 0; sI < text.length; sI++){
                if (text.charAt(sI) == ' ' || sI == text.length-1){
                    //found word'
                    if (text.charAt(start) == '<' || text.charAt(start) == '{'){
                        var t= '';
                        for (var c = start; c < text.length; c++){
                            t = t + text.charAt(c);
                            if (text.charAt(c) == '>' || text.charAt(c) == '}'){
                                start = c+1;
                                sI = c;
                                var nextWord = new PIXI.Text(t,this.style1);
                                break;
                            }
                        }
                    }else{
                        if (sI == text.length-1){
                            var nextWord = new PIXI.Text(text.slice(start),this.style1);
                        }else{
                            var nextWord = new PIXI.Text(text.slice(start,sI+1),this.style1);
                            start = sI+1;
                        }
                    }
                    //set the fontSize/color/align ETC
                    if (typeof this.ttInfo.ttArray[i].fontSize != 'undefined'){
                        nextWord.style.fontSize = this.ttInfottArray[i].fontSize;
                    }
                    if (nextWord.text.charAt(0) == '<'){
                        nextWord.style.fill = 0x42d7f4;
                        nextWord.text = nextWord.text.slice(1,nextWord.text.length-1) + '';
                    }else if (nextWord.text.charAt(0) == '{'){
                        nextWord.style.fill = 0x42f450;
                        nextWord.text = nextWord.text.slice(1,nextWord.text.length-1) + '';
                    }
                    if (typeof this.ttInfo.ttArray[i].color != 'undefined'){
                        nextWord.style.fill = this.ttInfo.ttArray[i].color;
                    }
                    nextWord.anchor.x = 0.5;
                    nextWord.anchor.y = 0.5;
                    nextWord.position.x = xStart + nextWord.width/2;
                    nextWord.position.y = yStart + nextWord.height/2;
                    xStart += nextWord.width;
                    if (xStart > this.maxWidth){
                        //move down a line
                        xStart = padding*2 + nextWord.width;
                        nextWord.position.x = padding + nextWord.width/2;
                        yStart += nextWord.height;
                        nextWord.position.y = yStart + nextWord.height/2;
                    }
                    if (nextWord.position.x + nextWord.width/2 > w){
                        w = nextWord.position.x + nextWord.width/2 + padding;
                    }
                    textObjects.push(nextWord);
                    cont.addChild(nextWord);
                    lastHeight = nextWord.height;
                }
            }
            yStart += lastHeight + eHeight;
            xStart = padding;
            //increment height and width
        }
        h = yStart + padding;
        //check alignment
        /*for (var j = 0; j < textObjects.length; j++){
            try{
                if (this.ttInfo.ttArray[j].align == 'center'){
                    textObjects[j].position.x = w/2;
                }else if(this.ttInfo.ttArray[j].align == 'right'){
                    textObjects[j].position.x = w-textObjects[j].width/2;
                }
            }catch(e){
                console.log(e);
            }
        }*/
        //draw outline
        gfx.lineStyle(3,0xFFFFFF,1);
        gfx.moveTo(2,2);
        gfx.lineTo(w+padding*2-2,2);
        gfx.lineTo(w+padding*2-2,h+padding*2-2);
        gfx.lineTo(2,h+padding*2-2);
        gfx.lineTo(2,2);
        //create and render the texture and sprite
        this.texture = PIXI.RenderTexture.create(w+padding*2,h+padding*2);
        var renderer = new PIXI.CanvasRenderer();
        Graphics.app.renderer.render(scene,this.texture);
        this.sprite = new PIXI.Sprite(this.texture);

        data.owner.tooltipAdded = false;

        this.position.x = Graphics.width - this.sprite.width - 5;
        this.position.y = Graphics.height - this.sprite.height - 5;
        var overFunc = function(e){
            if (!e.currentTarget.tooltipAdded){
                Graphics.uiContainer2.addChild(e.currentTarget.tooltip.sprite);
                e.currentTarget.tooltipAdded = true;
            }
            e.currentTarget.tooltip.sprite.position.x =  e.currentTarget.tooltip.position.x;
            e.currentTarget.tooltip.sprite.position.y =  e.currentTarget.tooltip.position.y;
        }
        var outFunc = function(e){
            if (e.currentTarget.tooltipAdded){
                Graphics.uiContainer2.removeChild(e.currentTarget.tooltip.sprite);
                e.currentTarget.tooltipAdded = false;
            }
        }
        var moveFunc = function(e){
            var x = Acorn.Input.mouse.X/Graphics.actualRatio[0];
            var y = Acorn.Input.mouse.Y/Graphics.actualRatio[1];
            if (x+e.currentTarget.tooltip.sprite.width > Graphics.width){x = Graphics.width - e.currentTarget.tooltip.sprite.width}
            if (y+e.currentTarget.tooltip.sprite.height > Graphics.height){y = Graphics.height - e.currentTarget.tooltip.sprite.height}
            e.currentTarget.tooltip.sprite.position.x =  x+30;
            e.currentTarget.tooltip.sprite.position.y =  y+30;
        }
        data.owner.on('pointerover',overFunc);
        data.owner.on('pointermove',moveFunc);
        data.owner.on('touchmove',overFunc);
        data.owner.on('touchend', outFunc);
        data.owner.on('touchendoutside', outFunc);
        data.owner.on('pointerout', outFunc);
    }

    Tooltip.prototype.getItemTooltip = function(element,item){
        // element = the element containing the tooltip
        //item = the item to work on

        var ttArray = [{text: '<' + item.name + '>'}];
        if (typeof item.description != 'undefined'){ttArray.push({text: item.description});}
        if (typeof item.eqData.damage != 'undefined'){ttArray.push({text: '{Damage: }' + Math.round(item.eqData.damage/10)});}
        if (typeof item.eqData.rangeMin != 'undefined'){ttArray.push({text: '{Range: }' + item.eqData.rangeMin + '-' + item.eqData.rangeMax});}
        if (typeof item.weight != 'undefined'){ttArray.push({text: '{Weight: }' + item.weight});}
        if (typeof item.classes != 'undefined'){
            var cText = '';
            if (item.classes == 'ALL'){
                cText = 'ALL';
            }else{
                for (var j = 0; j < item.classes.length;j++){
                    if (j == item.classes.length-1){
                        cText = cText + '<' + item.classes[j] + '>';
                    }else{
                        cText = cText + '<' + item.classes[j] + '> / ';
                    }
                }
            }
            ttArray.push({text: '{Classes: }' + cText});
        }
        element.tooltip.set({
            owner: element,
            ttArray: ttArray,
            alpha: 0.5
        });
    }

    window.Tooltip = Tooltip;
})(window);
