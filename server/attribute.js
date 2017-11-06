
    

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
	this.id = data.id;
	this.value = data.value; //this stat's actual value
	this.base = data.value; //this stat's base value before buff/item mods etc.
	this.nMod = 0; //a numeric modifier added to the base value before usage
	this.pMod = 1.0; //a percentile modifier added to the base value before usage
	this.min = data.min; //minimum value
	this.max = data.max; //maximum value

	this.setBool = false; //the attribute is forced to change to this value if true
	this.setValue = 0;
	//formula for setting the attribute
	if (typeof data.formula == 'undefined'){
		this.formula = function(){return Math.round(this.base*this.pMod+this.nMod);};
    }else{
    	this.formula = data.formula;
    }
    //function to be executed after the attribute is set
    if (typeof data.next == 'undefined'){
    	this.next = function(){};
    }else{
    	this.next = data.next;
    }
}
Attribute.prototype.set = function(){
	if (this.setBool){
		//force value change
		this.value = this.setValue;
	}else{
		//normal set value
		this.value = this.formula();
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
    try{this.next()}catch(e){}
}

exports.Attribute = Attribute;
