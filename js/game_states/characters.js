//Character creation/editing screen

(function(window) {
    Characters = {
        

        init: function() {
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
            //back button
            this.units = [];
            this.refresh = false;
            this.style = AcornSetup.baseStyle;
            this.style.font = '32px Sigmar One'

            this.noCharacters = Graphics.makeUiElement({
                text: 'You need 5 units to play!',
                position: [Graphics.width/2 + 50,35]
            })
            Graphics.uiContainer.addChild(this.noCharacters);

            this.exitButton = Graphics.makeUiElement({
                text: 'Exit',
                style: this.style,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    Acorn.changeState('mainMenu');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            this.unitCount = Graphics.makeUiElement({
                text: Player.units.length + '/30',
                style: this.style
            });
            this.unitCount.style.fontSize = 60
            this.unitCount.position.x = this.exitButton.position.x - this.exitButton.width/2 - 25 - this.unitCount.width/2;
            this.unitCount.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.unitCount);

            this.newChar = Graphics.makeUiElement({
                text: '+ New Unit',
                style: this.style,
                interactive: true,buttonMode: true,buttonGlow: true,glowCont: Graphics.worldContainer,
                clickFunc: function onClick(){
                    if (Player.units.length < 30){
                        Acorn.changeState('createUnit');
                    }
                }
            });
            this.newChar.position.x = 25 + this.newChar.width/2;
            this.newChar.position.y = 25 + this.newChar.height/2;
            Graphics.uiContainer.addChild(this.newChar);

            this.newRandChar = Graphics.makeUiElement({
                text: '+ Random New Unit',
                style: this.style,
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
            if (this.units.length != Player.units.length || this.refresh){
                Graphics.uiPrimitives.clear();
                Graphics.worldContainer.removeChildren();
                this.startAt = {x: 20, y: this.exitButton.position.y + this.exitButton.height/2 + 20};
                this.units = [];
                for (var i = 0; i < Player.units.length;i++){
                    var texture = this.createUnitInfoPane(Player.units[i]);
                    var unitInfoElement = Graphics.makeUiElement({
                        texture: texture,
                        interactive: true,buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(e){
                            CharDisplay.charToDisplay = e.currentTarget.unit;
                            Acorn.changeState('charDisplay');
                        }
                    });
                    unitInfoElement.unit = Player.units[i];
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
                    var unitSprite = Graphics.getSprite('unit_base_dl_');
                    unitSprite.position.x = unitInfoElement.position.x + unitInfoElement.width*0.8;
                    unitSprite.position.y = unitInfoElement.position.y + unitInfoElement.height - 10;
                    unitSprite.anchor.x = 0.5;
                    unitSprite.anchor.y = 1.0;
                    var colors = {
                        'tech': 0xFFFF00,
                        'soldier': 0xFF0000,
                        'medic': 0x00FF00,
                        'scout': 0x42f1f4
                    };
                    unitSprite.tint = colors[Player.units[i].classInfo.currentClass.toLowerCase()];
                    Graphics.worldContainer.addChild(unitSprite);
                    this.startAt.x += unitInfoElement.width + 20;
                    if (unitInfoElement.position.y + unitInfoElement.height > Graphics.height){
                        this.bounds = (unitInfoElement.position.y + unitInfoElement.height - Graphics.height) * -1 - 10;
                    }
                }
                this.unitCount.text = Player.units.length + '/30';
                this.unitCount.position.x = this.exitButton.position.x - this.exitButton.width/2 - 25 - this.unitCount.width/2;
                for (var u = 0; u <this.units.length;u++){
                    Graphics.drawBoxAround(this.units[u],Graphics.uiPrimitives,{
                        pos: [this.units[u].position.x + this.units[u].width/2,this.units[u].position.y + this.units[u].height/2],
                        xbuffer: -5,
                        ybuffer: -5,
                    });
                }
                this.refresh = false;
            }

            if (Acorn.Input.isPressed(Acorn.Input.Key.SCROLLUP)){
                Settings.zoom('in');
                Acorn.Input.setValue(Acorn.Input.Key.SCROLLUP,false);
            }
            if (Acorn.Input.isPressed(Acorn.Input.Key.SCROLLDOWN)){
                Settings.zoom('out');
                Acorn.Input.setValue(Acorn.Input.Key.SCROLLDOWN,false);
            }
        },

        createUnitInfoPane: function(unit){
            var x = 0;
            var y = 0;
            var maxWidth = 0;
            var maxHeight = 0;
            var container = new PIXI.Container();
            var name = new PIXI.Text(unit.name,this.style);
            name.position.y = y;
            name.anchor.x = 0.5;
            name.anchor.y = 0;
            y += name.height;
            container.addChild(name);
            var attr1 = [
                ["HP:   ", unit.maximumHealth],
                ["E:   ", unit.maximumEnergy],
                ["Pwr:   ", unit.power],
                ["Skl:   ", unit.skill],
                ["Slots:   ", unit.usedAbilitySlots + '/' + unit.abilitySlots]
            ];
            var attr2 = [
                ["Str:   ", unit.strength],
                ["End:   ", unit.endurance],
                ["Agi:   ", unit.agility],
                ["Dex:   ", unit.dexterity],
                ["Int:   ", unit.intelligence],
                ["Wil:   ", unit.willpower],
                ["Cha:   ", unit.charisma]
            ];
            var attr3 = [
                ["Mov:   ", unit.move],
                ["Jmp:  ", unit.jump],
                ["Spd:  ", unit.speed]
            ];
            var level = new PIXI.Text('  LvL  ' + unit.level + '        ' + unit.classInfo.currentClass + " (" + unit.sex.substring(0,1).toUpperCase() + ")",this.style);
            level.position.x = x;
            level.position.y = y;
            level.anchor.x = 0;
            level.anchor.y = 0;
            y += level.height;
            container.addChild(level);
            if (level.width > maxWidth){
                maxWidth = level.width;
            }
            if (name.width > maxWidth){
                maxWidth = name.width;
            }
            var fSize = 16;
            for (var j = 0; j < attr1.length;j++){
                var a = new PIXI.Text(attr1[j][0] + attr1[j][1],this.style);
                a.style.fontSize = fSize;
                a.position.x = maxWidth*0.20;
                a.position.y = y;
                a.anchor.x = 0.5;
                a.anchor.y = 0;
                y += a.height;
                container.addChild(a);
            }
            y = level.height + level.position.y;
            for (var j = 0; j < attr2.length;j++){
                var a = new PIXI.Text(attr2[j][0] + attr2[j][1],this.style);
                a.style.fontSize = fSize;
                a.position.x = maxWidth/2;
                a.position.y = y;
                a.anchor.x = 0.5;
                a.anchor.y = 0;
                y += a.height;
                container.addChild(a);
                maxHeight = a.position.y + a.height + 5;
            }
            y = level.height + level.position.y;
            for (var j = 0; j < attr3.length;j++){
                var a = new PIXI.Text(attr3[j][0] + attr3[j][1],this.style);
                a.style.fontSize = fSize;
                a.position.x = maxWidth*0.80;
                a.position.y = y;
                a.anchor.x = 0.5;
                a.anchor.y = 0;
                y += a.height;
                container.addChild(a);
            }
            name.position.x = maxWidth/2;
            var tex = PIXI.RenderTexture.create(maxWidth,maxHeight);
            var renderer = new PIXI.CanvasRenderer();
            Graphics.app.renderer.render(container,tex);
            return tex;
        }

    }
    window.Characters = Characters;
})(window);
