// Inventory
var Item = require('./item.js').Item,
    Attribute = require('./attribute.js').Attribute;
    Unit = require('./unit.js').Unit,
    Player = require('./player.js').Player


var Inventory = function () {
    this.gameEngine = null;
    this.owner = null;
    this.currentWeight = 0;
    this.maxItemPile = 99;
    this.items = [];
    this.maxWeight = null;
    this.stackable = null;
}
    
Inventory.prototype.init = function(data){
    //this.items = data.items;
    this.maxWeight = new Attribute();
    //if unit inventory, maxWeight is based on strength
    //if its the main player inventory, it is 1000;
    if (this.owner instanceof Unit){
        //unit's inventory
        this.owner = data.owner;
        this.stackable = false;
        this.maxItemPile = 1;
        this.duplicates = true;
        this.maxWeight.init({
            'id': 'wgt',
            'owner': this.owner,
            'value': 1,
            'min': 1,
            'max': 1000,
            formula: function(){return Math.round(Math.round(3+Math.pow(this.owner.strength.value,1.4))*this.pMod+this.nMod);},
            next: function(){this.owner.speed.set()}
        });
    }else{
        //the player's main inventory
        this.owner = data.owner;
        this.maxItemPile = 99;
        this.stackable = true;
        this.maxWeight.init({
            'id': 'wgt',
            'owner': this.owner,
            'value': 1,
            'min': 1,
            'max': 999999,
            formula: function(){return 999999;}
        });
    }
    this.maxWeight.set();
}

Inventory.prototype.changeWeight = function(amt,mult){
    //change the current weight
    if (typeof mult === 'undefined'){mult = 1;}
    var cf = 10;
    this.currentWeight = ((this.currentWeight*cf + (amt*cf)*mult) / cf);
}


Inventory.prototype.equipItem = function(index){
    
}

Inventory.prototype.addItem = function(id, amt){
    //function tries to add a number of any item
    //returns an array containing [amount added, amount not added]
    //pass "nostack" to amount to not stack the items
    try{
        var item = this.gameEngine.items[id];
        var amountToBeAdded = amt;
        var amountNotAdded = 0;
        var containsItem = this.contains(id);
        if (containsItem[0]){
            if ((this.maxItemPile - this.items[containsItem[1]][1]) >= amountToBeAdded){
                this.items[containsItem[1]].amount += amountToBeAdded;
                this.changeWeight(item.weight*amountToBeAdded);
            }else{
                amountNotAdded = (amountToBeAdded - (this.maxItemPile - this.items[containsItem[1]][1]));
                amountToBeAdded = (this.maxItemPile - this.items[containsItem[1]][1]);
                this.items[containsItem[1]].amount = this.maxItemPile;
                this.changeWeight(item.weight*amountToBeAdded);
            }
        }else{
            var I = new Item();
            I.init(item);
            this.items.push(I);
            this.changeWeight(item.weight*amountToBeAdded);
        }

        return [amountToBeAdded,amountNotAdded];
    }catch(e){
        this.gameEngine.debug(this.player,{'id': 'addItemError', 'error': e.stack, 'itemID': id});
    }
}



Inventory.prototype._removeItem = function(index){
    //remove Item and change equipped it necessary
    this.items.splice(index,1);
}

Inventory.prototype.contains = function(id){
    //check if Inventory has item
    //returns an array [contains item,at index]
    var b = [false,0];
    for (var i = 0;i < this.items.length;i++){
        if (this.items[i].itemID === id){
            b[0] = true;
            b[1] = i;
        }
    }
    return b;
}

Inventory.prototype.sortByType = function(dir){
   
}

Inventory.prototype.setGameEngine = function(ge){
    this.gameEngine = ge;
}

exports.Inventory = Inventory;