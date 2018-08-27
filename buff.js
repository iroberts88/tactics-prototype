var Actions = require('./actions.js').Actions;

var Buff = function(data){
    
    this.buffid = data.buffid; //buff DB ID
    

    if (data.actionsOnTick){
        this.actionsOnTick = data.actionsOnTick; //action ids
    }else{
        this.actionsOnTick = [];
    }
    if (data.actionsOnImmediate){
        this.actionsOnImmediate = data.actionsOnImmediate; //action ids
    }else{
        this.actionsOnImmediate = [];
    }
    if (data.actionsOnEnd){
        this.actionsOnEnd = data.actionsOnEnd; //action ids
    }else{
        this.actionsOnEnd = [];
    }
    
     // an array containing the buff tags or specific id's to remove when the buff inits
    if (data.removes){
        this.removes = data.removes;
    }else{
        this.removes = {tags: [],ids: []};
    }

    if (data.tags){
        this.tags = data.tags;
    }else{
        this.tags = [];
    }
    //E.G. ["health restore","positive"]

    
    this.stackType = data.stackType;
    //an identifier for how the buff stacks with itself
    //"None" - buff doesn't stack. adds a completely new instance of the buff
    //"Refresh" - removes itself and adds a new copy of the buff
    
    this.debuff = data.debuff;  //bool: false: positive buff, true: negative buff
    
    this.textureId = data.textureId;
    this.name = data.name;
    this.description = data.description;

    //effects and sound stuff
    this.hasEffect = false;
    this.hasSound = false;
    if (typeof data.effect != 'undefined'){
        this.effect = data.effect;
        this.hasEffect = true;
    }
    if (typeof data.sound != 'undefined'){
        this.sound = data.sound;
        this.hasSound = true;
    }
        
    if (data.instant === true){
        //the buff will tick once immediately then be removed
        this.duration = 0;
        this.tickImmediately = true;
    }else if (data.noTicks === true){
        //the buff will tick once immediately but will not tick again until buff ends
        this.noTicks = true;
        this.tickImmediately = true;
        this.duration = data.duration; //number of turns active
    }else{
        this.duration = data.duration;
    }
    
    this.timer = 0;
    this.buffEnded = false;
    this.refresh = false;
    this.stacks = 1;
    this.stackDurations = [];
}

Buff.prototype.init =  function(data){
    this.target = data.player; //the buff will perform actions on this object
    this.id = data.id;
    var add = true;
    /*
    for (var i = 0; i < this.removes.tags.length;i++){
        //remove buffs with the designated tags
        for (var j = 0;j< this.target.buffs.length;j++){
            for (var k = 0; k < this.target.buffs[j].tags.length;k++){
                if (this.removes.tags[i] === this.target.buffs[j].tags[k]){
                    this.target.buffs[j].duration = 0;
                    if (this.target.socket){
                        this.target.gameSession.queueData('alterBuff', {playerId: this.target.socket.id,remove: this.target.buffs[j].id});
                    }
                }
            }
        }
    }
    for (var i = 0; i < this.removes.ids.length;i++){
        //remove buffs with the designated ids
        for (var j = 0;j< this.target.buffs.length;j++){
            if (this.removes.ids[i] === this.target.buffs[j].ID){
                this.target.buffs[j].duration = 0;
            }
        }
    }
    if (this.stackType === "refresh"){
        for (var i = 0;i< this.target.buffs.length;i++){
            if (this.target.buffs[i].ID === this.ID){
                this.target.buffs[i].refresh = true;
                this.target.buffs[i].actionsOnTick = this.actionsOnTick;
                add = false;
                if (this.target.socket){
                    //send a refresh to the target buff
                    this.target.gameSession.queueData('alterBuff', {playerId: this.target.socket.id,refresh: this.target.buffs[i].id, duration: this.target.buffs[i].duration});
                }
            }
        }
    }*/

    if (add){
        this.target.buffs.push(this);

        if (this.tickImmediately){
            for (var i = 0;i < this.actionsOnImmediate.length;i++){
                var action = Actions.getAction(this.actionsOnImmediate[i].action);
                action(this.owner, this.target, this.actionsOnImmediate[i]);
            }
        }

        //send buff to client
        if(this.target.socket){
            /*this.target.gameSession.queueData('addBuff', {playerId: this.target.socket.id,
                                                            itemData: {
                                                                id: this.id,
                                                                texture: this.textureId,
                                                                duration: this.duration,
                                                                debuff: this.debuff,
                                                                name: this.name,
                                                                description: this.description
                                                            }});*/
        }
    }
}

Buff.prototype.tick = function(){
    //new turn, update buffs!
    this.ticker += 1;
    for (var i = 0;i < this.actionsOnTick.length;i++){
        var action = Actions.getAction(this.actionsOnTick[i].action);
        action(this.owner, this.target, this.actionsOnTick[i]);
        if (this.refresh){
            this.timer = 0;
            this.refresh = false;
        }
    }
    if (this.timer >= this.duration){
        //The timer is over the max duration. Perform actions on end and end the buff
        for (var i = 0;i < this.actionsOnEnd.length;i++){
            var action = Actions.getAction(this.actionsOnEnd[i].action);
            action(this.owner, this.target, this.actionsOnEnd[i]);
        }
        console.log(this.owner.gunDamagePercentMod.value);
        console.log(this.owner.weaponDamagePercentMod.value);
        this.buffEnded = true;
        if (this.hasEffect){
            this.owner.gameSession.queueData('removeEffect',{id:this.effectID});
        }
    }
}

Buff.prototype.modify = function(data){
    //modify a buff's values
    for (var i in data){
        switch(i){
            default:
                this[i] = data[i];
                break;
            case 'instant':
                this.duration = 0.0;
                this.tickImmediately = true;
                this.tickEvery = data.tickEvery;
            case 'noTicks':
                this.tickEvery = data.duration + 1.0;
                this.tickImmediately = true;
                this.duration = data.duration;
        }
    }
}


exports.Buff = Buff;
    
    