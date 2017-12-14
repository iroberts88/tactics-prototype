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
    this.maxUnitItems = 10;
}
    
Inventory.prototype.init = function(data){
    //this.items = data.items;
    this.maxWeight = new Attribute();
    this.owner = data.owner
    //if unit inventory, maxWeight is based on strength
    //if its the main player inventory, it is 1000;
    if (this.owner instanceof Unit){
        //unit's inventory
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
        this.maxItemPile = 99;
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

Inventory.prototype.addItemUnit = function(id,amt,updateClient){
    //function tries to add 1 of item (ID)
    // TODO add amt?
    try{
        if (this.items.length < this.maxUnitItems){
            if (typeof updateClient == 'undefined'){updateClient = false}
            var item = this.gameEngine.items[id];

            var I = new Item();
            I.init(item);
            this.items.push(I);
            this.changeWeight(item.weight);

            //send item data to client
            if (updateClient){
                this.gameEngine.queuePlayer(this.owner.owner,'addItemUnit',{unit: this.owner.id, item: I.getClientData(), w: this.currentWeight});
            }
        }else{
            //TODO send a client error
            console.log('Too many items!!')
        }
    }catch(e){
        this.gameEngine.debug(this.owner.owner,{'id': 'addItemUnitError', 'error': e.stack, 'itemID': id});
    }
}

Inventory.prototype.addItem = function(id, amt){
    //function tries to add a number of any item to the player's iventory
    //returns an array containing [amount added, amount not added]
    //pass "nostack" to amount to not stack the items
    if (typeof amt == 'undefined'){
        amt = 1;
    }
    try{
        var item = this.gameEngine.items[id];
        var data = {};
        var amountToBeAdded = amt;
        var amountNotAdded = 0;
        var containsItem = this.contains(id);
        if (containsItem[0]){
            //this is a player inventory
            if ((this.maxItemPile - this.items[containsItem[1]].amount) >= amountToBeAdded){
                this.items[containsItem[1]].amount += amountToBeAdded;
            }else{
                amountNotAdded = (amountToBeAdded - (this.maxItemPile - this.items[containsItem[1]].amount));
                amountToBeAdded = (this.maxItemPile - this.items[containsItem[1]].amount);
                this.items[containsItem[1]].amount = this.maxItemPile;
            }
            data.itemID = id;
            data.amt = amountToBeAdded;
        }else{
            var I = new Item();
            I.init(item);
            I.amount = amt;
            this.items.push(I);
            data.item = I.getClientData();
            data.item.amount = amountToBeAdded;
        }
        this.gameEngine.queuePlayer(this.owner,'addItem',data);
    }catch(e){
        this.gameEngine.debug(this.owner,{'id': 'addItemPlayerError', 'error': e.stack, 'itemID': id});
    }
}



Inventory.prototype.changeWeight = function(amt,mult){
    //change the current weight
    if (typeof mult === 'undefined'){mult = 1;}
    var cf = 10;
    this.currentWeight = ((this.currentWeight*cf + (amt*cf)*mult) / cf);
}


Inventory.prototype.equipItem = function(index){
    
}

Inventory.prototype.removeItemUnit = function(index,updateClient){
    //remove Item by index
    var item = this.items[index];
    this.changeWeight(-1*item.weight,1);
    this._removeItem(index);
    //send item data to client
    if (updateClient){
        this.gameEngine.queuePlayer(this.owner.owner,'removeItemUnit',{'unit': this.owner.id, 'index': index, 'w': this.currentWeight});
    }
}

Inventory.prototype.removeItem = function(index,amt,updateClient){
    //remove Item by index
    var item = this.items[index];
    if (item.amount > amt){
        item.amount -= amt;
    }else{
        this._removeItem(index);
    }
    //send item data to client
    if (updateClient){
        this.gameEngine.queuePlayer(this.owner,'removeItem',{'index': index, 'amt': amt});
    }
}

Inventory.prototype._removeItem = function(index){
    //remove Item and change equipped if necessary
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