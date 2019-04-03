
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

        this.updateInfoPane = false;

    };

    Unit.prototype.init = function(data) {
        //Set up all stats and attributes
        this.updateInfo(data);
        this.visible = (typeof data[ENUMS.VISIBLE] == 'undefined') ? true : data[ENUMS.VISIBLE];
        this.direction = data[ENUMS.DIRECTION];
        if (data[ENUMS.CURRENTNODE]){
            this.currentNode = Game.map.axialMap[data[ENUMS.CURRENTNODE][ENUMS.Q]][data[ENUMS.CURRENTNODE][ENUMS.R]];
        }else{
            this.currentNode = null;
            this.visible = false;
        }
        this.chargePercent = 0;

        if (this.direction){
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
                'scout': 0x42f1f4,
                'splicer': 0x9d00ff,
                'commando': 0x3200d8,
                'marksman': 0x704607
            };
            if (this.classInfo.currentClass == ''){
                this.sprite.scale.x = 0.5;
                this.sprite.scale.y = 0.5;
                this.sprite.tint = 0x000000;
            }else{
                this.sprite.tint = colors[this.classInfo.currentClass.toLowerCase()];
            }
            this.sprite.gotoAndPlay(Math.floor(Math.random()*8))
        }
    };

    Unit.prototype.updateInfo = function(data){
        this.maximumHealth = Utils.udCheck(data[ENUMS.MAXHEALTH]);
        this.maximumEnergy = Utils.udCheck(data[ENUMS.MAXENERGY]);
        this.maximumShields = Utils.udCheck(data[ENUMS.MAXSHIELDS]);
        //shields stay at null until a shield is equipped?

        this.full = Utils.udCheck(data[ENUMS.FULL]);
        this.currentHealth = Utils.udCheck(data[ENUMS.CURRENTHEALTH]);
        this.currentEnergy = Utils.udCheck(data[ENUMS.CURRENTENERGY]);
        this.currentShields = Utils.udCheck(data[ENUMS.CURRENTSHIELDS]);
        this.move = Utils.udCheck(data[ENUMS.MOVE]);
        this.moveLeft = Utils.udCheck(data[ENUMS.MOVE]);
        this.jump = Utils.udCheck(data[ENUMS.JUMP]);
        this.power = Utils.udCheck(data[ENUMS.POWER]);
        this.skill = Utils.udCheck(data[ENUMS.SKILL]);
        this.tactics = Utils.udCheck(data[ENUMS.TACTICS]);
        this.speed = Utils.udCheck(data[ENUMS.SPEED]);
        this.abilitySlots = Utils.udCheck(data[ENUMS.ABILITYSLOTS]);
        this.strength = Utils.udCheck(data[ENUMS.STRENGTH]);
        this.endurance = Utils.udCheck(data[ENUMS.ENDURANCE]);
        this.agility = Utils.udCheck(data[ENUMS.AGILITY]);
        this.dexterity = Utils.udCheck(data[ENUMS.DEXTERITY]);
        this.willpower = Utils.udCheck(data[ENUMS.WILLPOWER]);
        this.intelligence = Utils.udCheck(data[ENUMS.INTELLIGENCE]);
        this.charisma = Utils.udCheck(data[ENUMS.CHARISMA]);

        this.physicalRes = Utils.udCheck(data[ENUMS.RESISTANCEPHYSICAL]);
        this.heatRes = Utils.udCheck(data[ENUMS.RESISTANCEHEAT]);
        this.coldRes = Utils.udCheck(data[ENUMS.RESISTANCECOLD]);
        this.acidRes = Utils.udCheck(data[ENUMS.RESISTANCEACID]);
        this.poisonRes = Utils.udCheck(data[ENUMS.RESISTANCEPOISON]);
        this.electricRes = Utils.udCheck(data[ENUMS.RESISTANCEELECTRIC]);
        this.pulseRes = Utils.udCheck(data[ENUMS.RESISTANCEPULSE]);
        this.radiationRes = Utils.udCheck(data[ENUMS.RESISTANCERADIATION]);
        this.gravityRes = Utils.udCheck(data[ENUMS.RESISTANCEGRAVITY]);
        this.viralRes = Utils.udCheck(data[ENUMS.RESISTANCEVIRAL]);

        this.owner = Utils.udCheck(data[ENUMS.OWNER]);
        this.name = Utils.udCheck(data[ENUMS.NAME]);
        this.sex = Utils.udCheck(data[ENUMS.SEX]);
        this.id = Utils.udCheck(data[ENUMS.ID]);
        if (!Utils._udCheck(data[ENUMS.INVENTORY])){
            this.inventory = new Inventory();
            this.inventory.init(data[ENUMS.INVENTORY]);
        }else{
            this.inventory = null;
        }
        this.level = Utils.udCheck(data[ENUMS.LEVEL]);
        this.exp = Utils.udCheck(data[ENUMS.EXP]);
        this.classInfo = new ClassInfo();
        this.classInfo.init(data[ENUMS.CLASSINFO]);
        
        this.weapon = Utils.udCheck(data[ENUMS.WEAPON]);
        this.shield = Utils.udCheck(data[ENUMS.SHIELD]);
        this.accessory = Utils.udCheck(data[ENUMS.ACCESSORY]);

        this.class = Utils.udCheck(data[ENUMS.CLASS]);
        this.charge = Utils.udCheck(data[ENUMS.CHARGE]);

        this.usedAbilitySlots = Utils.udCheck(data[ENUMS.USEDABILITYSLOTS]);
    }

    Unit.prototype.getWeapon = function(){
        if (this.weapon != null){
            return this.inventory.items[this.weapon];
        }else{
            return {
                amount:1,
                classes:"ALL",
                description:"Hand to hand combat",
                eqData:{range: 1, damage: 10},
                id:"weapon_fists",
                name: "Punch",
                type: "weapon",
                weight:0
            }
        }
    };


    Unit.prototype.setFainted = function(bool){
        if (bool){
            this.sprite.rotation = 1.57;
            this.sprite.position.x -= this.sprite.width/2.2;
            this.sprite.stop();
            this.fainted = true;
        }else{
            this.sprite.rotation = 0;
            var node = Game.map.axialMap[this.currentNode.q][this.currentNode.r];
            var t = 1;
            if (!(Game.map.currentRotation%2)){t = 2}
            var sp = 'sprite' + t;
            this.sprite.position.x = node[sp].position.x;
            this.sprite.gotoAndPlay(1);
            this.fainted = false;
        }
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
    Unit.prototype.addDmgText = function(n,type){
        var str = n.toString();
        var sprites = [];
        var text = new PIXI.Text(str,AcornSetup.baseStyle3);
        if (typeof type != 'undefined'){
            switch(type){
                case 'pois':
                    text.style.fill = 'green';
                    break;
                case 'phys':
                    text.style.fill = 'red';
                    break;
                case 'expl':
                    text.style.fill = 0xffea84;
                    break;
                case 'elec':
                    text.style.fill = 0x0c00ff;
                    break;
                case 'grav':
                    text.style.fill = 0xd000ff;
                    break;
                case 'corr':
                    text.style.fill = 0x7bff00;
                    break;
                case 'cold':
                    text.style.fill = 0xFFFFFF;
                    break;
                case 'heat':
                    text.style.fill = 0xff8800;
                    break;
                case 'radi':
                    text.style.fill = 0x00ffbf;
                    break;
                case 'puls':
                    text.style.fill = 0xc9cbff;
                    break;
                case 'heal':
                    text.style.fill = 0x00c7ff;
                    break;
                default:
                    text.style.fill = 'white';
                    break;

            }
        }
        var xPos = 0;
        var yPos = -text.height/2;
        if (this.damageText.length){
            yPos = this.damageText[this.damageText.length-1].y + text.height/2;
            this.damageText[this.damageText.length-1].y -= text.height/2;
        }
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
                case ENUMS.MAXSHIELDS:
                    this.maximumShields = amt;
                    break;
                case ENUMS.DELAY:
                    this.shieldDelay = amt;
                    break;
                case ENUMS.RECHARGE:
                    this.shieldRecharge = amt;
                    break;
                case ENUMS.ABILITYSLOTS:
                    this.abilitySlots = amt;
                    break;
                case ENUMS.STRENGTH:
                    this.strength = amt;
                    break;
                case ENUMS.ENDURANCE:
                    this.endurance = amt;
                    break;
                case ENUMS.AGILITY:
                    this.agility = amt;
                    break;
                case ENUMS.DEXTERITY:
                    this.dexterity = amt;
                    break;
                case ENUMS.INTELLIGENCE:
                    this.intelligence = amt;
                    break;
                case ENUMS.WILLPOWER:
                    this.willpower = amt;
                    break;
                case ENUMS.CHARISMA:
                    this.charisma = amt;
                    break;
                case ENUMS.MAXHEALTH:
                    this.maximumHealth = amt;
                    break;
                case ENUMS.MAXENERGY:
                    this.maximumEnergy = amt;
                    break;
                case ENUMS.POWER:
                    this.power = amt;
                    break;
                case ENUMS.SKILL:
                    this.skill = amt;
                    break;
                case ENUMS.TACTICS:
                    this.tactics = amt;
                    break;
                case ENUMS.MOVE:
                    this.move = amt;
                    break;
                case ENUMS.JUMP:
                    this.jump = amt;
                    break;
                case ENUMS.SPEED:
                    this.speed = amt;
                    break;
                case 'pRes':
                    this.physicalRes = amt;
                    break;
                case 'hRes':
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
                case ENUMS.WEIGHT:
                    this.inventory.maxWeight = amt;
                    break;
            }
        }catch(e){
            console.log("unable to get stat " + id);
            console.log(e);
        }
        if (!Player.inGame){
            return;
        }
        if (Game.units[this.id]){
            console.log(this.id);
            this.updateInfoPane = true;
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
