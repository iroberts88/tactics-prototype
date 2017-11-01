// Inventory
var Item = require('./item.js'),
    Attribute = require('./attribute.js').Attribute;
    Unit = require('./unit.js').Unit,
    Player = require('./player.js').Player


var Inventory = function () {
    this.currentWeight = 0;
    this.maxItemPile = 99;
    this.items = [];
}
    
Inventory.prototype.init = function(data){
    //this.items = data.items;
    this.maxWeight = new Attribute();
    //if unit inventory, maxWeight is based on strength
    //if its the main player inventory, it is 1000;
    this.owner = data.owner;
    if (this.owner instanceof Unit){
        this.maxWeight.init({
            'id': 'maxWeight',
            'owner': this.owner,
            'value': 1,
            'min': 1,
            'max': 1000,
            formula: function(){return (4+Math.floor(Math.pow(this.owner.strength.value,1.4)))*this.percentMod+this.numericMod;},
            next: function(){this.owner.inventory.maxWeight.set();}
        });
    }else{
        this.maxWeight.init({
            'id': 'maxWeight',
            'owner': this.owner,
            'value': 1,
            'min': 1,
            'max': 1000,
            formula: function(){return 1000;}
        });
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
Inventory.prototype.addItem = function(item,amount){
    //function tries to add a number of any item
    //returns an array containing [amount added, amount not added]
    //pass "nostack" to amount to not stack the items
    var amountToBeAdded;
    var amountNotAdded = 0;
    var cf = 10; //correction factor
    //check for overweight
    if (item.weight != 0){
        var availableWeight = ((this.maxWeight.value*cf) - (this.currentWeight*cf)) / cf;
        if ((item.weight*cf) * amount <= (availableWeight*cf)){
            //add all items
            amountToBeAdded = amount;
        }else{
            var i = 1;
            while((item.weight*cf)*i <= (availableWeight*cf)){
                i++;
            }
            amountToBeAdded = i-1;
            amountNotAdded = (amount - amountToBeAdded);
        }
    }
    else{
        amountToBeAdded = amount
    }
    //check for over max pile on the items if they stack and add item
    if (amount !== "nostack" && amountToBeAdded > 0){
        var containsItem = this.contains(item.id);
        if (containsItem[0]){
            if ((item.maxItemPile - this.items[containsItem[1]][1]) >= amountToBeAdded){
                this.items[containsItem[1]][1] += amountToBeAdded;
                this.changeWeight(item.weight*amountToBeAdded);
            }else{
                amountNotAdded = (amountToBeAdded - (item.maxItemPile - this.items[containsItem[1]][1]));
                amountToBeAdded = (item.maxItemPile - this.items[containsItem[1]][1]);
                this.items[containsItem[1]][1] = item.maxItemPile;
                this.changeWeight(item.weight*amountToBeAdded);
            }
        }else{
            this.items.push([item.id, amountToBeAdded]);
            this.changeWeight(item.weight*amountToBeAdded);
        }
    }else{
        if (amountToBeAdded){
            this.items.push(item);
            this.changeWeight(item.weight);
        }
    }
    return [amountToBeAdded,amountNotAdded];
}



Inventory.prototype._removeItem = function(index){
    //remove Item and change equipped it necessary
    this.items.splice(index,1);
}

Inventory.prototype.contains = function(id){
    //check if Inventory has item
    //will not check for equipment
    var b = [false,0];
    for (var i = 0;i < this.items.length;i++){
        if (this.items[i].length === 2 && this.items[i][0] === id){
            b[0] = true;
            b[1] = i;
        }
    }
    return b;
}

Inventory.prototype.sortByType = function(dir){
   
}

exports.Inventory = Inventory;