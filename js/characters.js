//Character creation/editing screen

(function(window) {
    Characters = {
        

        init: function() {
            //back button
            this.units = [];
            var style = {
                font: '32px Orbitron', 
                fill: 'white', 
                align: 'left', 
                dropShadow: true,
                dropShadowColor: '#000000',
                stroke: '#000000',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6
            };
            this.style = {
                font: '18px Arvo', 
                fill: 'white', 
                align: 'left', 
                stroke: '#000000',
                strokeThickness: 5
            };
            var g = new PIXI.Graphics();            
            Graphics.uiContainer.addChild(g);
            this.noCharacters = Graphics.makeUiElement({
                text: 'You need 5 units to play!',
                position: [Graphics.width/2,35]
            })
            Graphics.uiContainer.addChild(this.noCharacters);

            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    Acorn.changeState('mainMenu');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);
            g.beginFill('black',1);
            g.lineStyle.color = 'black';
            g.drawRect(0,0,Graphics.width,this.exitButton.position.y + this.exitButton.height/2 + 20);
            g.endFill();

            this.newChar = Graphics.makeUiElement({
                text: '+ New Unit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,glowCont: Graphics.worldContainer,
                clickFunc: function onClick(){
                    console.log('Init char creation screen?');
                }
            });
            this.newChar.position.x = 25 + this.newChar.width/2;
            this.newChar.position.y = 25 + this.newChar.height/2;
            Graphics.uiContainer.addChild(this.newChar);

            this.newRandChar = Graphics.makeUiElement({
                text: '+ Random New Unit',
                style: style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    Acorn.Net.socket_.emit('addRandomChar',{});
                }
            });
            this.newRandChar.position.x = 25 + this.newRandChar.width/2 + this.newChar.position.x + this.newChar.width/2;
            this.newRandChar.position.y = 25 + this.newRandChar.height/2;
            Graphics.uiContainer.addChild(this.newRandChar);

            this.bounds = 0;
            this.startAt = {x: 20, y: this.exitButton.position.y + this.exitButton.height/2 + 20};

            //display characters
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.newChar,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.newRandChar,Graphics.uiPrimitives2,{});
            this.noCharacters.visible = (Player.units.length < 5) ? true : false;
            //check for new characters and make a UI element for each
            if (this.units.length != Player.units.length){
                Graphics.uiPrimitives.clear();
                this.startAt = {x: 20, y: this.exitButton.position.y + this.exitButton.height/2 + 20};
                this.units = [];
                for (var i = 0; i < Player.units.length;i++){
                    var texture = this.createUnitInfoPane(Player.units[i].unit);
                    var unitInfoElement = Graphics.makeUiElement({
                        texture: texture,
                        interactive: true,buttonMode: true,buttonGlow: true
                    });
                    if (this.startAt.x + unitInfoElement.width >= Graphics.width){
                        this.startAt.x = 20;
                        this.startAt.y += unitInfoElement.height + 20;
                    }
                    unitInfoElement.position.x = this.startAt.x;
                    unitInfoElement.position.y = this.startAt.y;
                    unitInfoElement.anchor.x = 0;
                    unitInfoElement.anchor.y = 0;
                    this.units.push(unitInfoElement)
                    Graphics.worldContainer.addChild(unitInfoElement);
                    this.startAt.x += unitInfoElement.width + 20;
                    if (unitInfoElement.position.y + unitInfoElement.height > Graphics.height){
                        this.bounds = (unitInfoElement.position.y + unitInfoElement.height - Graphics.height) * -1;
                    }
                }
                
                for (var u = 0; u <this.units.length;u++){
                    Graphics.drawBoxAround(this.units[u],Graphics.uiPrimitives,{pos: [this.units[u].position.x + this.units[u].width/2,this.units[u].position.y + this.units[u].height/2]});
                }
            }
        },

        createUnitInfoPane: function(unit){
            var x = 0;
            var y = 0;
            var maxWidth = 0;
            var maxHeight = 0;
            var container = new PIXI.Container();
            var name = new PIXI.Text(unit.name,this.style);
            name.position.x = x;
            name.position.y = y;
            name.anchor.x = 0;
            name.anchor.y = 0;
            y += name.height;
            container.addChild(name);
            var attr = [
                ["Health:   ", unit.maximumHealth],
                ["Energy:   ", unit.maximumEnergy],
                ["Power:   ", unit.power],
                ["Skill:   ", unit.skill],
                ["Ability Slots:   ", unit.abilitySlots],
                ["    ", ''],
                ["Strength:   ", unit.strength],
                ["Endurance:   ", unit.endurance],
                ["Agility:   ", unit.agility],
                ["Dexterity:   ", unit.dexterity],
                ["Intelligence:   ", unit.intelligence],
                ["Willpower:   ", unit.willpower],
                ["Charisma:   ", unit.charisma],
                ["    ", ''],
                ["Move:   ", unit.move],
                ["Jump:  ", unit.jump]
            ];
            var level = new PIXI.Text('Level ' + unit.level + ' ' + unit.classInfo.currentClass + " (" + unit.sex.substring(0,1).toUpperCase() + ")",this.style);
            level.position.x = x;
            level.position.y = y;
            level.anchor.x = 0;
            level.anchor.y = 0;
            y += level.height;
            container.addChild(level);
            for (var j = 0; j < attr.length;j++){
                var a = new PIXI.Text(attr[j][0] + attr[j][1],this.style);
                a.style.fontSize = 12;
                a.position.x = x;
                a.position.y = y;
                a.anchor.x = 0;
                a.anchor.y = 0;
                y += a.height
                container.addChild(a);
                if (a.width > maxWidth){
                    maxWidth = a.width;
                }
            }
            if (level.width > maxWidth){
                maxWidth = level.width;
            }
            if (name.width > maxWidth){
                maxWidth = name.width;
            }
            var tex = PIXI.RenderTexture.create(maxWidth,y);
            Graphics.app.renderer.render(container,tex);
            return tex;
        }

    }
    window.Characters = Characters;
})(window);
