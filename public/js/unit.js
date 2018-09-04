
(function(window) {

    var Unit = function(){
        this.id = null;
        
        //Unit Stats
        //health
        this.currentHealth = null;
        this.maximumHealth = null;
        //energy
        this.currentEnergy = null;
        this.maximumEnergy = null;

        this.move = null;
        this.moveLeft = null;
        this.jump = null;
        this.power = null;
        this.skill = null;
        this.tactics = null;
        this.abilitySlots = null;
        //shields
        this.currentShields = null;
        this.maximumShields = null;
        this.shieldDelay = null;
        this.shieldRecharge = null;
        //attributes
        this.strength = null;
        this.intelligence = null;
        this.endurance = null;
        this.willpower = null;
        this.agility = null;
        this.dexterity = null;
        this.charisma = null;

        //level and class stuff?
        this.level = null;
        this.exp = null;

        //all the information about the unit's class
        this.classInfo = null;
        //the unit's current Inventory
        this.inventory = null;
        //game stats (games won; damage/healing done etc)
        this.gameInfo = null;

        this.sprite = null;

        this.weapon = null;
        this.shield = null;
        this.accessory = null;

        this.physicalRes = null;
        this.heatRes = null;
        this.coldRes = null;
        this.acidRes = null;
        this.poisonRes = null;
        this.electricRes = null;
        this.pulseRes = null;
        this.radiationRes = null;
        this.gravityRes = null;

        this.usedAbilitySlots = 0;

        this.turnSprite = null;
        this.infoPane = null;

        this.visible = null;

        this.chargePercent = null;
        this.cr = 0;
        
        this.damageText = [];
        this.dmgTextTime = 1.5;
        this.actionUsed = false;
        this.actionBubble = null;
        this.actionBubbleTime = 2.0
        this.height = 2;

        this.fainted = false;
        this.dead = false;

    };

    Unit.prototype.init = function(data) {
        //Set up all stats and attributes
        this.maximumHealth = data.maximumHealth;
        this.maximumEnergy = data.maximumEnergy;
        this.maximumShields = data.maximumShields;
        //shields stay at null until a shield is equipped?

        this.full = data.full;
        this.visible = (typeof data.visible == 'undefined') ? true : data.visible;
        this.direction = data.direction;
        if (data.currentNode){
            this.currentNode = Game.map.axialMap[data.currentNode.q][data.currentNode.r];
        }else{
            this.currentNode = data.currentNode;
        }
        this.currentHealth = data.health;
        this.currentEnergy = data.energy;
        this.currentShields = data.shields;
        this.move = data.move;
        this.moveLeft = data.move;
        this.jump = data.jump;
        this.power = data.power;
        this.skill = data.skill;
        this.tactics = data.tactics;
        this.speed = data.speed;
        this.abilitySlots = data.abilitySlots;
        this.strength = data.strength;
        this.endurance = data.endurance;
        this.agility = data.agility;
        this.dexterity = data.dexterity;
        this.willpower = data.willpower;
        this.intelligence = data.intelligence;
        this.charisma = data.charisma;

        this.chargePercent = 0;

        this.physicalRes = data.physicalRes;
        this.heatRes = data.heatRes;
        this.coldRes = data.coldRes;
        this.acidRes = data.acidRes;
        this.poisonRes = data.poisonRes;
        this.electricRes = data.electricRes;
        this.pulseRes = data.pulseRes;
        this.radiationRes = data.radiationRes;
        this.gravityRes = data.gravityRes;

        this.owner = data.owner;
        this.name = data.name;
        this.sex = data.sex;
        this.id = data.id;
        if (data.inventory){
            this.inventory = new Inventory();
            this.inventory.init(data.inventory);
        }else{
            this.inventory = null;
        }
        this.level = data.level;
        this.exp = data.exp;
        this.classInfo = data.classInfo;
        if (data.direction){
            //initialize the sprite
            var dir = '';
            dir = window.currentGameMap.dirArray[(window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations];
            this.sprite = Graphics.getSprite('unit_base_'+ dir + '_');
            this.sprite.unitid = this.id;
            this.sprite.pSprite = true;
            this.sprite.scale.x = 0.6;
            this.sprite.scale.y = 0.6;
            var p = (window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations;
            if (p >= 1 && p <= 5){
                this.sprite.scale.x = -0.6;
            }
            this.sprite.anchor.x = 0.5;
            this.sprite.anchor.y = 0.85;
            var colors = {
                'tech': 0xFFFF00,
                'soldier': 0xFF0000,
                'medic': 0x00FF00,
                'scout': 0x42f1f4
            };
            this.sprite.tint = colors[this.classInfo.currentClass.toLowerCase()];
            this.sprite.gotoAndPlay(Math.floor(Math.random()*8))
        }
        this.weapon = data.weapon;
        this.shield = data.shield;
        this.accessory = data.accessory;

        this.usedAbilitySlots = data.usedAbilitySlots;
    };
    Unit.prototype.getWeapon = function(){
        if (this.weapon >= 0){
            return this.inventory.items[this.weapon];
        }else{
            return {
                amount:1,
                classes:"ALL",
                description:"Hand to hand combat",
                eqData:{range: 1, damage: 10},
                itemID:"weapon_fists",
                name:"Fists",
                type:"weapon",
                weight:0
            }
        }
    };

    Unit.prototype.setFainted = function(){
        this.sprite.rotation = 1.57;
        this.sprite.position.x -= this.sprite.width/2.2;
        this.sprite.stop();
        this.fainted = true;
    };

    Unit.prototype.setDead = function(){
        this.sprite.parent.removeChild(this.sprite);
        this.dead = true;
    };

    Unit.prototype.setChargePercent = function(val){
        this.cr = val;
        if (val > Game.chargeMax){
            val = Game.chargeMax;
        }
        this.chargePercent = Math.round((val/Game.chargeMax)*100);
    }
    Unit.prototype.setNewDirection = function(direction){
        var frame = this.sprite.currentFrame;
        this.direction = direction;
        var dir = window.currentGameMap.dirArray[(window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations];
        this.sprite.textures = Graphics.getResource('unit_base_'+ dir + '_');
        this.sprite.scale.x = 0.6 * window.currentGameMap.ZOOM_SETTINGS[window.currentGameMap.currentZoomSetting];
        this.sprite.scale.y = 0.6 * window.currentGameMap.ZOOM_SETTINGS[window.currentGameMap.currentZoomSetting];
        var p = (window.currentGameMap.spriteStartingDirections[this.direction] + window.currentGameMap.currentRotation) % window.currentGameMap.totalRotations
        if (p >= 1 && p <= 5){
            this.sprite.scale.x = -0.6 * window.currentGameMap.ZOOM_SETTINGS[window.currentGameMap.currentZoomSetting];
        }
        this.sprite.gotoAndPlay(frame);
    };
    Unit.prototype.setCurrentNode = function(q,r,map){
        this.currentNode = map.axialMap[q][r];
        map.axialMap[q][r].unit = this;
    };
    Unit.prototype.addDmgText = function(n){
        var str = n.toString();
        var sprites = [];
        var text = new PIXI.Text(str,AcornSetup.baseStyle3);
        var xPos = 0;
        var yPos = -text.height/2;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;
        Graphics.world.addChild(text);
        sprites.push(text);
        this.damageText.push({
            t: Date.now(),
            x: xPos,
            y: yPos,
            sprite: text
        });
    };
    Unit.prototype.addActionBubble = function(str){
        var scene = new PIXI.Container();
        var cont = new PIXI.Container();
        var gfx = new PIXI.Graphics();
        var style  = {
            font: '16px Sigmar One',
            fill: 'white',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 2,
        }
        scene.addChild(gfx);
        scene.addChild(cont);

        var text = new PIXI.Text(str, style);
        text.position.x = 0;
        text.position.y = 0;
        cont.addChild(text);

        //draw BG Fill
        gfx.lineStyle(1,0x000000,0.0);
        gfx.beginFill(0x000000,0.5);
        gfx.drawRect(0,0,text.width,text.height);
        gfx.endFill();
        //draw outline
        gfx.lineStyle(3,0xFFFFFF,1);
        gfx.moveTo(0,0);
        gfx.lineTo(text.width,0);
        gfx.lineTo(text.width,text.height);
        gfx.lineTo(0,text.height);
        gfx.lineTo(0,0);

        //create and render the texture and sprite
        var texture = PIXI.RenderTexture.create(text.width,text.height);
        var renderer = new PIXI.CanvasRenderer();
        Graphics.app.renderer.render(scene,texture);
        var sprite = new PIXI.Sprite(texture);
        sprite.anchor.x = 0.5;
        if (this.actionBubble){
            Graphics.world.removeChild(this.actionBubble.sprite);
        }
        Graphics.world.addChild(sprite);
        this.actionBubble = {
            t: Date.now(),
            sprite: sprite
        };
    };
    Unit.prototype.equip = function(index) {
        var item = this.inventory.items[index];
        if (item.type == 'weapon' || item.type == 'gun'){
            this.weapon = index;
        }else if (item.type == 'shield'){
            this.shield = index;
        }else if (item.type == 'accessory'){
            this.accessory = index;
        }
    };
    Unit.prototype.unEquip = function(index) {
        var item = this.inventory.items[index];
        if (item.type == 'weapon' || item.type == 'gun'){
            this.weapon = null;
        }else if (item.type == 'shield'){
            this.shield = null;
        }else if (item.type == 'accessory'){
            this.accessory = null;
        }
    };
    Unit.prototype.setStat = function(id,amt){
        console.log(id + '   ' + amt)
        try{
            switch(id){
                case 'sh':
                    this.maximumShields = amt;
                    break;
                case 'shdel':
                    this.shieldDelay = amt;
                    break;
                case 'shrec':
                    this.shieldRecharge = amt;
                    break;
                case 'absl':
                    this.abilitySlots = amt;
                    break;
                case 'str':
                    this.strength = amt;
                    break;
                case 'end':
                    this.endurance = amt;
                    break;
                case 'agi':
                    this.agility = amt;
                    break;
                case 'dex':
                    this.dexterity = amt;
                    break;
                case 'int':
                    this.intelligence = amt;
                    break;
                case 'wil':
                    this.willpower = amt;
                    break;
                case 'char':
                    this.charisma = amt;
                    break;
                case 'hp':
                    this.maximumHealth = amt;
                    break;
                case 'energy':
                    this.maximumEnergy = amt;
                    break;
                case 'pwr':
                    this.power = amt;
                    break;
                case 'skl':
                    this.skill = amt;
                    break;
                case 'tac':
                    this.tactics = amt;
                    break;
                case 'mov':
                    this.move = amt;
                    break;
                case 'jmp':
                    this.jump = amt;
                    break;
                case 'spd':
                    this.speed = amt;
                    break;
                case 'pRes':
                    this.physicalRes = amt;
                    break;
                case 'hres':
                    this.heatRes = amt;
                    break;
                case 'cRes':
                    this.coldRes = amt;
                    break;
                case 'aRes':
                    this.acidRes = amt;
                    break;
                case 'eRes':
                    this.electricRes = amt;
                    break;
                case 'poRes':
                    this.poisonRes = amt;
                    break;
                case 'puRes':
                    this.pulseRes = amt;
                    break;
                case 'rRes':
                    this.radiationRes = amt;
                    break;
                case 'gRes':
                    this.gravityRes = amt;
                    break;
                case 'wgt':
                    this.inventory.maxWeight = amt;
                    break;
            }
        }catch(e){
            console.log("unable to get stat " + id);
            console.log(e);
        }
        if (Game.units[this.id]){
            console.log('what');
            this.infoPane = Game.getUnitInfoPane(this.id);
        }
    };
    Unit.prototype.update = function(deltaTime){
        for (var i = 0; i < this.damageText.length;i++){
            var dt = this.damageText[i];
            dt.sprite.position.x = Graphics.width/2 + this.sprite.position.x + dt.x;
            dt.sprite.position.y = Graphics.height/2 + this.sprite.position.y + dt.y;
            dt.y -= 0.5;
            dt.t += deltaTime;
            if (Date.now() - dt.t  > 2000){
                Graphics.world.removeChild(dt.sprite);
                this.damageText.splice(i,1);
            }
        }
        if (this.actionBubble){
            this.actionBubble.sprite.position.x = Graphics.width/2 + this.sprite.position.x;
            this.actionBubble.sprite.position.y = Graphics.height/2 + this.sprite.position.y - this.sprite.height - 25;
            this.actionBubble.t += deltaTime;
            if (Date.now() - this.actionBubble.t  > 2000){
                Graphics.world.removeChild(this.actionBubble.sprite);
                this.actionBubble = null;
            }
        }
    }
    window.Unit = Unit;
})(window);
