var Item = function(){
    this.itemID = null;
    this.onUse = null;
    this.icon = null;
    this.type = null;
    this.amount = null;
    this.weight = null;
    this.weaponData = null;
    this.shieldData = null;
}

Item.prototype.init = function(data) {
    this.itemID = data.itemID;

    //on use function
    this.onUse = data.onUse;

};

exports.Item = Item;

