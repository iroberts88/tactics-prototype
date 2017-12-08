

var Item = function(){
    this.itemID = null;
    this.name = null;
    this.description = null;
    this.onUse = null;
    this.icon = null;
    this.type = null;
    this.amount = null;
    this.weight = null;
    this.onUseText = null;
    this.onFireText = null;
    this.onEquipText = null;
    this.onHitText = null;
    this.constantEffectText = null;
    this.classes = null;
    this.eqData = {};
}

Item.prototype.getClientData = function(){
    var data = {};
    data.itemID = this.itemID;
    data.name = this.name;
    data.description = this.description;
    data.type = this.type;
    data.amount = this.amount;
    data.weight = this.weight;
    data.classes = this.classes;
    data.onUseText = this.onUseText;
    data.onFireText = this.onFireText;
    data.onEquipText = this.onEquipText;
    data.onHitText = this.onHitText;
    data.constantEffectText = this.constantEffectText;
    data.amount = this.amount;
    data.eqData = {}
    switch(this.type){
        case 'weapon':
            data.eqData.range = this.eqData.range;
            data.eqData.damage = this.eqData.damage;
            break;
        case 'gun':
            data.eqData.rangeMin = this.eqData.rangeMin;
            data.eqData.rangeMax = this.eqData.rangeMax;
            data.eqData.damage = this.eqData.damage;
            break;
        case 'shield':
            data.eqData.capacity = this.eqData.capacity;
            data.eqData.rechargeRate = this.eqData.rechargeRate;
            data.eqData.rechargeDelay = this.eqData.rechargeDelay;
            break;
    }
    return data;
}

Item.prototype.init = function(data) {
    this.itemID = data._dbIndex;
    this.name = data.name;
    this.description = data.description;
    this.classes = data.classes;
    this.onUse = data.onUse;
    this.icon = data.icon;
    this.type = data.type;
    this.amount = data.amount;
    this.weight = data.weight;
    this.amount = 1;

    switch(this.type){
        case 'weapon':
            this.eqData = new Weapon();
            this.eqData.init(data.eqData);
            break;
        case 'gun':
            this.eqData = new Gun();
            this.eqData.init(data.eqData);
            break;
        case 'shield':
            this.eqData = new Shield();
            this.eqData.init(data.eqData);
            break;
        case 'accessory':
            this.eqData = new Accessory();
            this.eqData.init(data.eqData);
            break;
    }
    this.onUseText = data.onUseText;
    this.onFireText = data.onFireText;
    this.onEquipText = data.onEquipText;
    this.onHitText = data.onHitText;
    this.constantEffectText = data.constantEffectText;
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

exports.Gun = Gun;

var Weapon = function(){
    this.damage = null;
    this.range = null;
    this.onEquip = null;
    this.onFire = null;
    this.onHit = null;
}

Weapon.prototype.init = function(data) {
    this.damage = data.damage;
    this.range = data.range;
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