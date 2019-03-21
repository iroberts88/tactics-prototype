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
        this.maxWeight = Utils.udCheck(data[ENUMS.MAXWEIGHT]);
        this.items = [];
        for (var i=0; i<data[ENUMS.ITEMS].length; i++){
            var item = new Item();
            item.init(data[ENUMS.ITEMS][i]);
            this.items.push(item);
        }
        this.currentWeight = Utils.udCheck(data[ENUMS.CURRENTWEIGHT]);
        this.maxItemPile = Utils.udCheck(data[ENUMS.MAXITEMPILE]);
        
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


(function(window){

    var Item = function () {}
        
    Item.prototype.init = function(data){
        this.id = Utils.udCheck(data[ENUMS.ID]);
        this.amount = Utils.udCheck(data[ENUMS.AMOUNT]);
        this.description = Utils.udCheck(data[ENUMS.DESCRIPTION]);
        this.type = Utils.udCheck(data[ENUMS.TYPE]);
        this.weight = Utils.udCheck(data[ENUMS.WEIGHT]);
        this.classes = Utils.udCheck(data[ENUMS.CLASSES]);
        this.onUse = Utils.udCheck(data[ENUMS.ONUSE]);
        this.onFire = Utils.udCheck(data[ENUMS.ONFIRE]);
        this.onEquip = Utils.udCheck(data[ENUMS.ONEQUIP]);
        this.onHit = Utils.udCheck(data[ENUMS.ONHIT]);
        this.onTakeDamage = Utils.udCheck(data[ENUMS.ONTAKEDAMAGE]);
        this.constantEffect = Utils.udCheck(data[ENUMS.CONSTANTEFFECT]);
        this.onFullRecharge = Utils.udCheck(data[ENUMS.ONFULLRECHARGE]);
        this.onDepleted = Utils.udCheck(data[ENUMS.ONDEPLETED]);
        this.name = Utils.udCheck(data[ENUMS.NAME]);
        this.eqData = {};
        this.eqData.range = Utils.udCheck(data[ENUMS.EQDATA][ENUMS.RANGE]);
        this.eqData.damage = Utils.udCheck(data[ENUMS.EQDATA][ENUMS.DAMAGE]);
        this.eqData.damageType = Utils.udCheck(data[ENUMS.EQDATA][ENUMS.DAMAGETYPE]);
        this.eqData.rangeMin = Utils.udCheck(data[ENUMS.EQDATA][ENUMS.RANGEMIN]);
        this.eqData.rangeMax = Utils.udCheck(data[ENUMS.EQDATA][ENUMS.RANGEMAX]);
        this.eqData.recharge = Utils.udCheck(data[ENUMS.EQDATA][ENUMS.RECHARGE]);
        this.eqData.delay = Utils.udCheck(data[ENUMS.EQDATA][ENUMS.DELAY]);
    }

    window.Item = Item;

})(window);