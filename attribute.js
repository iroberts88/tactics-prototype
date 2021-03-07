
var Enums = require('./enums.js').Enums;

var Attribute = function(){
    this.owner = null;
    this.id = null;
    this.value = null; 
    this.base = null; 
    this.nMod = null; 
    this.pMod = null;
    this.min = null; 
    this.max = null;

    this.formula = null;
    this.next = null;
}
        
Attribute.prototype.init = function(data){
	this.owner = data.owner; //the unit that owns this stat
    if (this.owner){
        this.player = data.owner.owner;
        this.engine = this.player.engine;
        this.updateClient = (typeof data.clientUpdate == 'undefined') ? true : data.clientUpdate;
    }else{
        this.updateClient = false;
    }
	this.id = data.id;
	this.value = data.value; //this stat's actual value
	this.base = data.value; //this stat's base value before buff/item mods etc.
	this.nMod = 0; //a numeric modifier added to the base value before usage
	this.pMod = 1.0; //a percentile modifier added to the base value before usage
	this.min = data.min; //minimum value
	this.max = data.max; //maximum value

	this.setBool = false; //the attribute is forced to change to this value if true
	this.setValue = 0;
    this.updateClient = (typeof data.clientUpdate == 'undefined') ? true : data.clientUpdate;
	//formula for setting the attribute
	if (typeof data.formula == 'undefined'){
		this.formula = function(){return Math.round((this.base+this.nMod)*this.pMod);};
    }else{
    	this.formula = data.formula;
    }
    //function to be executed after the attribute is set
    if (typeof data.next == 'undefined'){
    	this.next = function(){};
    }else{
    	this.next = data.next;
    }
    this.onChange = [];
}
Attribute.prototype.set = function(updateClient = false){
	if (this.setBool){
		//force value change
		this.value = this.setValue;
	}else{
		//normal set value
		this.value = this.formula(updateClient);
		//check bounds
		if (typeof this.min != 'undefined'){
    		if (this.value < this.min){
    			this.value = this.min;
    		}
    	}
    	if (typeof this.max != 'undefined'){
    		if (this.value > this.max){
    			this.value = this.max;
    		}
    	}
	}
    try{this.next(updateClient)}catch(e){}
    let fun = null;
    for (let i = 0;i < this.onChange.length;i++){
        func = this.onChange[i].func;
        func(updateClient,this,this.onChange[i].ability);
    }
    try{
        if (updateClient && this.updateClient){
            if (this.player.session){
                this.player.session.queueDataIfIdentified(Enums.SETUNITSTAT,this.engine.createClientData(
                    Enums.UNITID, this.owner.id,
                    Enums.STAT, this.id,
                    Enums.VALUE, this.value
                ));
            }else{
                this.engine.queuePlayer(this.player, Enums.SETUNITSTAT,this.engine.createClientData(
                    Enums.UNITID, this.owner.id,
                    Enums.STAT, this.id,
                    Enums.VALUE, this.value
                ));

            }
        }
    }catch(e){
        console.log(e);
    }
    return;
}

Attribute.prototype.addOnChange = function(func){
    //add an on-change function
    this.onChange.push(func);
}
Attribute.prototype.removeOnChange = function(n){
    //add an on-change function
    for (let i = 0;i < this.onChange.length;i++){
        if (this.onChange.name == n){
            this.onChange.splice(i,1);
            return;
        }
    }
}

exports.Attribute = Attribute;
