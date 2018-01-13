(function(window){

    var Inventory = function () {
        this.currentWeight = 0;
        this.maxItemPile = 99;
        this.items = [];
        this.maxWeight = null;
        this.duplicates = false
    }
        
    Inventory.prototype.init = function(data){
        //this.items = data.items;
        this.maxWeight = data.maxWeight;
        this.items = data.items;
        this.currentWeight = data.currentWeight;
        this.maxItemPile = data.maxItemPile;
        
    }

    Inventory.prototype.changeWeight = function(amt,mult){
        //change the current weight
        if (typeof mult === 'undefined'){mult = 1;}
        var cf = 10;
        this.currentWeight = ((this.currentWeight*cf + (amt*cf)*mult) / cf);
    }


    Inventory.prototype.contains = function(id){
        //check if Inventory has item
        //returns an array [contains item,at index]
        var b = [false,0];
        for (var i = 0;i < this.items.length;i++){
            if (this.items[i][0] === id){
                b[0] = true;
                b[1] = i;
            }
        }
        return b;
    }

    window.Inventory = Inventory;

})(window);