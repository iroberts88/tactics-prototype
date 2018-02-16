// Inventory
var Item = require('./item.js').Item,
    Attribute = require('./attribute.js').Attribute;
    Unit = require('./unit.js').Unit,
    Player = require('./player.js').Player,
    Actions = require('./actions.js').Actions


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
            return true;
        }else{
            //TODO send a client error
            console.log('Too many items!!');
            return false;
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
    this.owner.speed.set(true);
}


Inventory.prototype.equip = function(index,updateClient){
    //attempts to equip the item at the given index
    if (typeof index != 'number'){return;}

    try{
        var item = this.items[index];
        if (item.type == 'weapon' || item.type == 'gun'){
            try{
                if (typeof this.owner.weapon == 'number'){
                    var itemToUnequip = this.items[this.owner.weapon];
                    for (var i = 0; i < itemToUnequip.eqData.onEquip.length;i++){
                        itemToUnequip.eqData.onEquip[i].reverse = true;
                        var onEquipFunc = Actions.getAction(itemToUnequip.eqData.onEquip[i].name);
                        onEquipFunc(this.owner,itemToUnequip.eqData.onEquip[i]);
                    }
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'weaponUnEquipActionError', error: e.stack, iterator: i,item: item});
            }
            try{
                for (var i = 0; i < item.eqData.onEquip.length;i++){
                    item.eqData.onEquip[i].reverse = false;
                    var onEquipFunc = Actions.getAction(item.eqData.onEquip[i].name);
                    onEquipFunc(this.owner,item.eqData.onEquip[i]);
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'weaponEquipActionError', error: e.stack, iterator: i,item: item});
            }
            this.owner.weapon = index;
        }else if (item.type == 'shield'){
            try{
                if (typeof this.owner.shield == 'number'){
                    var itemToUnequip = this.items[this.owner.shield];
                    for (var i = 0; i < itemToUnequip.eqData.onEquip.length;i++){
                        itemToUnequip.eqData.onEquip[i].reverse = true;
                        var onEquipFunc = Actions.getAction(itemToUnequip.eqData.onEquip[i].name);
                        onEquipFunc(this.owner,itemToUnequip.eqData.onEquip[i]);
                    }
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'shieldUnEquipActionError', error: e.stack, iterator: i,item: item});
            }
            try{
                for (var i = 0; i < item.eqData.onEquip.length;i++){
                    item.eqData.onEquip[i].reverse = false;
                    var onEquipFunc = Actions.getAction(item.eqData.onEquip[i].name);
                    onEquipFunc(this.owner,item.eqData.onEquip[i]);
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'shieldEquipActionError', error: e.stack, iterator: i,item: item});
            }
            this.owner.shield = index;
        }else if (item.type == 'accessory'){
            try{
                if (typeof this.owner.accessory == 'number'){
                    var itemToUnequip = this.items[this.owner.accessory];
                    for (var i = 0; i < itemToUnequip.eqData.onEquip.length;i++){
                        itemToUnequip.eqData.onEquip[i].reverse = true;
                        var onEquipFunc = Actions.getAction(itemToUnequip.eqData.onEquip[i].name);
                        onEquipFunc(this.owner,itemToUnequip.eqData.onEquip[i]);
                    }
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'accessoryUnEquipActionError', error: e.stack, iterator: i,item: item});
            }
            try{
                for (var i = 0; i < item.eqData.onEquip.length;i++){
                    item.eqData.onEquip[i].reverse = false;
                    var onEquipFunc = Actions.getAction(item.eqData.onEquip[i].name);
                    onEquipFunc(this.owner,item.eqData.onEquip[i]);
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'accessoryEquipActionError', error: e.stack, iterator: i,item: item,a: Actions});
            }
            this.owner.accessory = index;
        }else{
            return;
        }
    
    //update client
        if (updateClient){
            this.gameEngine.queuePlayer(this.owner.owner,'equipItem',{'unit': this.owner.id, 'index': index});
        }
    }catch(e){
        this.gameEngine.debug(this.owner,{'id': 'equipItemError', 'error': e.stack, 'index': index});
    }
}

Inventory.prototype.unEquip = function(index,updateClient){
    //attempts to remove the equipped item at the given index
    try{
        var item = this.items[index];
        if (item.type == 'weapon' || item.type == 'gun'){
            try{
                if (typeof this.owner.weapon == 'number'){
                    for (var i = 0; i < item.eqData.onEquip.length;i++){
                        item.eqData.onEquip[i].reverse = true;
                        var onEquipFunc = Actions.getAction(item.eqData.onEquip[i].name);
                        onEquipFunc(this.owner,item.eqData.onEquip[i]);
                    }
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'weaponUnEquipActionError', error: e.stack, iterator: i,item: item});
            }
            this.owner.weapon = null;
        }else if (item.type == 'shield'){
            try{
                if (typeof this.owner.shield == 'number'){
                    for (var i = 0; i < item.eqData.onEquip.length;i++){
                        item.eqData.onEquip[i].reverse = true;
                        var onEquipFunc = Actions.getAction(item.eqData.onEquip[i].name);
                        onEquipFunc(this.owner,item.eqData.onEquip[i]);
                    }
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'shieldUnEquipActionError', error: e.stack, iterator: i,item: item});
            }
            this.owner.shield = null;
        }else if (item.type == 'accessory'){
            try{
                if (typeof this.owner.accessory == 'number'){
                    for (var i = 0; i < item.eqData.onEquip.length;i++){
                        item.eqData.onEquip[i].reverse = true;
                        var onEquipFunc = Actions.getAction(item.eqData.onEquip[i].name);
                        onEquipFunc(this.owner,item.eqData.onEquip[i]);
                    }
                }
            }catch(e){
                this.gameEngine.debug(this.owner.owner,{'id': 'accessoryUnEquipActionError', error: e.stack, iterator: i,item: item});
            }
            this.owner.accessory = null;
        }else{
            return;
        }
    
    //update client
        if (updateClient){
            this.gameEngine.queuePlayer(this.owner.owner,'unEquipItem',{'unit': this.owner.id, 'index': index});
        }
    }catch(e){
        this.gameEngine.debug(this.owner,{'id': 'equipItemError', 'error': e.stack, 'index': index});
    }
}

Inventory.prototype.removeItemUnit = function(index,updateClient){
    //remove Item by index from a unit's inventory
    var item = this.items[index];
    this.changeWeight(-1*item.weight,1);
    this._removeItem(index);
    //send item data to client
    if (updateClient){
        this.gameEngine.queuePlayer(this.owner.owner,'removeItemUnit',{'unit': this.owner.id, 'index': index, 'w': this.currentWeight});
    }
    if (this.owner.weapon > index){
        this.owner.weapon -= 1;
    }else if (this.owner.weapon == index){
        this.owner.weapon = null;
    }
    if (this.owner.shield > index){
        this.owner.shied -= 1;
    }else if (this.owner.shield == index){
        this.owner.shield = null;
    }
    if (this.owner.accessory > index){
        this.owner.accessory -= 1;
    }else if (this.owner.accessory == index){
        this.owner.accessory = null;
    }
}

Inventory.prototype.removeItem = function(index,amt,updateClient){
    //remove Item by index from player's inventory
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