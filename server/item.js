

var Item = function(){
    this.itemID = null;
    this.name = null;
    this.description = null;
    this.onUse = null;
    this.icon = null;
    this.type = null;
    this.stackable = null;
    this.amount = null;
    this.weight = null;
    this.eqData = {};
}

Item.prototype.init = function(data) {
    this.itemID = data.itemID;
    this.name = data.name;
    this.description = data.description;
    //on use function
    this.onUse = data.onUse;
    this.icon = data.icon;
    this.type = data.type;
    this.amount = data.amount;
    this.weight = data.weight;

    switch(this.type){
        case 'weapon':
            this.stackable = false;
            this.eqData = new Weapon();
            this.eqData.init(data.eqData);
            break;
        case 'gun':
            this.stackable = false;
            this.eqData = new Gun();
            this.eqData.init(data.eqData);
            break;
        case 'shield':
            this.stackable = false;
            this.eqData = new Shield();
            this.eqData.init(data.eqData);
            break;
        case 'accessory':
            this.stackable = false;
            this.eqData = new Accessory();
            this.eqData.init(data.eqData);
            break;
    }
};

exports.Item = Item;

var Gun = function(){
    this.rangeMin = null;
    this.rangeMax = null,
    this.damage = null;

    this.onEquip = null;
    this.onFire = null;
    this.onHit = null;
}

Gun.prototype.init = function(data) {
    this.rangeMin = data.rangeMin;
    this.rangeMax = data.rangeMax;
    this.damage = data.damage;

    this.onEquip = data.onEquip;
    this.onFire = data.onFire;
    this.onHit = data.onHit;
};

exports.Weapon = Gun;

var Weapon = function(){
    this.damage = null;

    this.onEquip = null;
    this.onFire = null;
    this.onHit = null;
}

Weapon.prototype.init = function(data) {
    this.damage = data.damage;

    this.onEquip = data.onEquip;
    this.onFire = data.onFire;
    this.onHit = data.onHit;
};

exports.Weapon = Weapon;

var Shield = function(){
    this.capacity = null;
    this.rechargeRate = null;
    this.rechargeDelay = null;

    this.onEquip = null;
    this.onHit = null;
}

Shield.prototype.init = function(data) {
    this.capacity = data.capacity;
    this.rechargeRate = data.rechargeRate;
    this.rechargeDelay = data.rechargeDelay;

    this.onEquip = data.onEquip;
    this.onHit = data.onHit;
};

exports.Shield = Shield;

var Accessory = function(){
    this.onEquip = null;
}

Accessory.prototype.init = function(data){
    this.onEquip = data.onEquip;
}

exports.Accessory = Accessory;