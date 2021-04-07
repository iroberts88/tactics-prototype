var Enums = require('./enums.js').Enums,
    Actions = require('./actions.js').Actions;

var Buff = function(data){
    
    this.buffid = data.buffid; //buff DB ID
    
    var onTick = typeof data.actionsOnTick == 'undefined' ? [] : data.actionsOnTick;
    this.actionsOnTick = [];
    for (var i = 0; i < onTick.length;i++){
        this.actionsOnTick.push(onTick[i]);
    }
    var onImmediate = typeof data.actionsOnImmediate == 'undefined' ? [] : data.actionsOnImmediate;
    this.actionsOnImmediate = [];
    for (var i = 0; i < onImmediate.length;i++){
        this.actionsOnImmediate.push(onImmediate[i]);
    }
    var onEnd = typeof data.actionsOnEnd == 'undefined' ? [] : data.actionsOnEnd;
    this.actionsOnEnd = [];
    for (var i = 0; i < onEnd.length;i++){
        this.actionsOnEnd.push(onEnd[i]);
    }

     // an array containing the buff tags or specific id's to remove when the buff inits
    this.removes = typeof data.removes == 'undefined' ? {tags: [],ids: []} : data.removes;

    this.tickBeforeTurn = typeof data['tickBeforeTurn'] == 'undefined' ? false : data['tickBeforeTurn'];

    //tags for buff removal/stacking etc.
    //E.G. ["health restore","positive"]
    this.tags = typeof data.tags == 'undefined' ? [] : data.tags;
    
    this.stackType = data.stackType;
    //an identifier for how the buff stacks with itself
    //"none" - buff doesn't stack. adds a completely new instance of the buff
    //"Refresh" - removes itself and adds a new copy of the buff
    
    this.debuff = data.debuff;  //bool: false: positive buff, true: negative buff
    
    this.textureId = data.textureId;
    this.name = data.name;
    this.description = data.description;

    //effects and sound stuff
    if (typeof data.effect != 'undefined'){
        this.effect = data.effect;
    }
    if (data.instant === true){
        //the buff will tick once immediately then be removed
        this.duration = -Infinity;
    }else if (data.noTicks === true){
        //the buff will tick once immediately but will not tick again until buff ends
        this.noTicks = true;
        this.duration = data.duration; //number of turns active
    }else{
        this.duration = data.duration;
    }
    this.tickImmediately = typeof data.tickImmediately == 'undefined' ? false : data.tickImmediately;
    if (!this.duration){this.duration = Infinity}
    this.ticker = 0;
    this.buffEnded = false;
    this.refresh = false;
    this.stacks = 1;
    this.stackDurations = [];
}

Buff.prototype.init =  function(data){
    var Actions = require('./actions.js').Actions
    this.unit = data.unit; //the buff will perform actions on this object
    this.source = data.source;
    this.id = data.unit.owner.session.getId();
    var add = true;

    /*
    for (var i = 0; i < this.removes.tags.length;i++){
        //remove buffs with the designated tags
        for (var j = 0;j< this.unit.buffs.length;j++){
            for (var k = 0; k < this.unit.buffs[j].tags.length;k++){
                if (this.removes.tags[i] === this.unit.buffs[j].tags[k]){
                    this.unit.buffs[j].duration = 0;
                    if (this.unit.socket){
                        this.unit.session.queueData('alterBuff', {playerId: this.unit.socket.id,remove: this.unit.buffs[j].id});
                    }
                }
            }
        }
    }
    for (var i = 0; i < this.removes.ids.length;i++){
        //remove buffs with the designated ids
        for (var j = 0;j< this.unit.buffs.length;j++){
            if (this.removes.ids[i] === this.unit.buffs[j].ID){
                this.unit.buffs[j].duration = 0;
            }
        }
    }
    if (this.stackType === "refresh"){
        for (var i = 0;i< this.unit.buffs.length;i++){
            if (this.unit.buffs[i].ID === this.ID){
                this.unit.buffs[i].refresh = true;
                this.unit.buffs[i].actionsOnTick = this.actionsOnTick;
                add = false;
                if (this.unit.socket){
                    //send a refresh to the unit buff
                    this.unit.session.queueData('alterBuff', {playerId: this.unit.socket.id,refresh: this.unit.buffs[i].id, duration: this.unit.buffs[i].duration});
                }
            }
        }
    }*/

    if (add){
        this.unit.buffs.push(this);

        for (var i = 0;i < this.actionsOnImmediate.length;i++){
            var action = Actions.getAction(this.actionsOnImmediate[i]['action']);
            action(this.unit, this.actionsOnImmediate[i]);
        }

        //send buff to client
        if(this.unit.owner.socket){
            var cData = {};
            cData[Enums.ID] = this.unit.id;
            cData[Enums.BUFFDATA] = {};
            cData[Enums.BUFFDATA][Enums.ID] = this.id;
            cData[Enums.BUFFDATA][Enums.TEXTURE] = this.textureId;
            cData[Enums.BUFFDATA][Enums.DURATION] = this.duration;
            cData[Enums.BUFFDATA][Enums.DEBUFF] = this.debuff;
            cData[Enums.BUFFDATA][Enums.NAME] = this.name;
            cData[Enums.BUFFDATA][Enums.DESCRIPTION] = this.description;
            cData[Enums.BUFFDATA][Enums.EFFECT] = this.effect;

            this.unit.owner.session.queueData(Enums.ADDBUFF,cData);
        }
    }
}

Buff.prototype.tick = function(){
    var Actions = require('./actions.js').Actions;
    //new turn, update buffs!
    this.ticker += 1;
    for (var i = 0;i < this.actionsOnTick.length;i++){
        var action = Actions.getAction(this.actionsOnTick[i].action);
        var tickData = action(this.unit, this.actionsOnTick[i]);
        if (tickData.end){
            this.ticker = this.duration;
        }
        if (tickData[Enums.ACTIONDATA]){
            let cData = {};
            cData[Enums.ACTIONDATA] = tickData[Enums.ACTIONDATA]
            this.unit.owner.session.queueData(Enums.ACTION,cData);
        }
    }
    if (this.ticker >= this.duration){
        this.end();
    }
}

Buff.prototype.end = function(){
    var Actions = require('./actions.js').Actions;
    //The timer is over the max duration. Perform actions on end and end the buff
    for (var i = 0;i < this.actionsOnEnd.length;i++){
        var action = Actions.getAction(this.actionsOnEnd[i]['action']);
        action(this.unit, this.actionsOnEnd[i]);
    }
    console.log('buff ' + this.name + ' ended')
    this.buffEnded = true;
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
    
    