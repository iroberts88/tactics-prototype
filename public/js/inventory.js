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
        this.maxWeight = Utils.udCheck(data[Enums.MAXWEIGHT]);
        this.items = [];
        for (var i=0; i<data[Enums.ITEMS].length; i++){
            var item = new Item();
            item.init(data[Enums.ITEMS][i]);
            this.items.push(item);
        }
        this.currentWeight = Utils.udCheck(data[Enums.CURRENTWEIGHT]);
        this.maxItemPile = Utils.udCheck(data[Enums.MAXITEMPILE]);
        
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
        this.id = Utils.udCheck(data[Enums.ID]);
        this.amount = Utils.udCheck(data[Enums.AMOUNT]);
        this.description = Utils.udCheck(data[Enums.DESCRIPTION]);
        this.type = Utils.udCheck(data[Enums.TYPE]);
        this.weight = Utils.udCheck(data[Enums.WEIGHT]);
        this.classes = Utils.udCheck(data[Enums.CLASSES]);
        this.onUse = Utils.udCheck(data[Enums.ONUSE]);
        this.onFire = Utils.udCheck(data[Enums.ONFIRE]);
        this.onEquip = Utils.udCheck(data[Enums.ONEQUIP]);
        this.onHit = Utils.udCheck(data[Enums.ONHIT]);
        this.onTakeDamage = Utils.udCheck(data[Enums.ONTAKEDAMAGE]);
        this.constantEffect = Utils.udCheck(data[Enums.CONSTANTEFFECT]);
        this.onFullRecharge = Utils.udCheck(data[Enums.ONFULLRECHARGE]);
        this.onDepleted = Utils.udCheck(data[Enums.ONDEPLETED]);
        this.name = Utils.udCheck(data[Enums.NAME]);
        this.eqData = {};
        this.eqData.range = Utils.udCheck(data[Enums.EQDATA][Enums.RANGE]);
        this.eqData.damage = Utils.udCheck(data[Enums.EQDATA][Enums.DAMAGE]);
        this.eqData.damageType = Utils.udCheck(data[Enums.EQDATA][Enums.DAMAGETYPE]);
        this.eqData.rangeMin = Utils.udCheck(data[Enums.EQDATA][Enums.RANGEMIN]);
        this.eqData.rangeMax = Utils.udCheck(data[Enums.EQDATA][Enums.RANGEMAX]);
        this.eqData.recharge = Utils.udCheck(data[Enums.EQDATA][Enums.RECHARGE]);
        this.eqData.delay = Utils.udCheck(data[Enums.EQDATA][Enums.DELAY]);
    }

    window.Item = Item;

})(window);