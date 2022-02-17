
var Enums = require('./enums.js').Enums;

var Item = function(){
    this.id = null;
    this.name = null;
    this.description = null;
    this.mfg = null;
    this.onUse = null;
    this.icon = null;
    this.type = null;
    this.amount = null;
    this.weight = null;

    //Tooltip texts for item uses
    this.onUseText = null;
    this.onFireText = null;
    this.onEquipText = null;
    this.onHitText = null;
    this.onTakeDamageText = null;
    this.onDepletedText = null;
    this.onFullRechargeText = null;
    this.constantEffectText = null;

    this.classes = null;
    this.eqData = {};
}

Item.prototype.getClientData = function(){
    var data = {};
    data[Enums.ID] = this.id;
    data[Enums.NAME] = this.name;
    data[Enums.DESCRIPTION] = this.description;
    data[Enums.MFG] = this.mfg;
    data[Enums.TYPE] = this.type;
    data[Enums.AMOUNT] = this.amount;
    data[Enums.WEIGHT] = this.weight;
    data[Enums.CLASSES] = this.classes;
    data[Enums.ONUSE] = this.onUseText;
    data[Enums.ONFIRE] = this.onFireText;
    data[Enums.ONEQUIP] = this.onEquipText;
    data[Enums.ONHIT] = this.onHitText;
    data[Enums.TAKEDAMAGE] = this.onTakeDamageText;
    data[Enums.CONSTANTEFFECT] = this.constantEffectText;
    data[Enums.ONFULLRECHARGE] = this.onFullRechargeText;
    data[Enums.ONDEPLETED] = this.onDepletedText;
    data[Enums.AMOUNT] = this.amount;
    data[Enums.EQDATA] = {};
    switch(this.type){
        case 'weapon':
            data[Enums.EQDATA][Enums.RANGE] = this.eqData.range;
            data[Enums.EQDATA][Enums.DAMAGE] = this.eqData.damage;
            data[Enums.EQDATA][Enums.DAMAGETYPE] = this.eqData.damageType;
            break;
        case 'gun':
            data[Enums.EQDATA][Enums.RANGEMIN] = this.eqData.rangeMin;
            data[Enums.EQDATA][Enums.RANGEMAX] = this.eqData.rangeMax;
            data[Enums.EQDATA][Enums.DAMAGE] = this.eqData.damage;
            data[Enums.EQDATA][Enums.DAMAGETYPE] = this.eqData.damageType;
            break;
        case 'shield':
            data[Enums.EQDATA][Enums.RECHARGE] = this.eqData.recharge;
            data[Enums.EQDATA][Enums.DELAY] = this.eqData.delay;
            break;
    }
    return data;
}

Item.prototype.init = function(data) {
    this.id = data['itemid'];
    this.name = data['name'];
    this.description = data['description'];
    this.classes = data['classes'];
    this.onUse = data['onUse'];
    this.icon = data['icon'];
    this.type = data['type'];
    this.amount = data['amount'];
    this.weight = data['weight'];
    this.mfg = data['mfg'];
    this.amount = 1;
    if (this.type != 'compound' && this.type != 'misc'){
        this.eqData = new Equipment();
        this.eqData.init(data['eqData']);
    }
    this.onUseText = data['onUseText'];
    this.onFireText = data['onFireText'];
    this.onEquipText = data['onEquipText'];
    this.onHitText = data['onHitText'];
    this.onTakeDamageText = data['onTakeDamageText'];
    this.onDepletedText = data['onDepletedText'];
    this.onFullRechargeText = data['onFullRechargeText'];
    this.constantEffectText = data['constantEffectText'];
};

Item.prototype.getWeaponNodes = function(map,node){
    return this.eqData.getWeaponNodes(map,node);
};

exports.Item = Item;

var Equipment = function(){}

Equipment.prototype.init = function(data) {
    //gun/wep
    this.rangeMin = (typeof data.rangeMin != 'undefined') ? data.rangeMin : null;
    this.rangeMax = (typeof data.rangeMax != 'undefined') ? data.rangeMax : null;
    this.range = (typeof data.range != 'undefined') ? data.range : null;
    this.damage = (typeof data.damage != 'undefined') ? data.damage : null;
    this.damageType = (typeof data.damageType != 'undefined') ? data.damageType : 'phys';
    //shield
    this.recharge = (typeof data.recharge != 'undefined') ? data.recharge : null;
    this.delay = (typeof data.delay != 'undefined') ? data.delay : null;

    //all
    this.onEquip = (typeof data.onEquip != 'undefined') ? data.onEquip : [];
    this.onFire = (typeof data.onFire != 'undefined') ? data.onFire : [];
    this.onHit = (typeof data.onHit != 'undefined') ? data.onHit : [];
    this.onTakeDamage = (typeof data.onTakeDamage != 'undefined') ? data.onTakeDamage : [];
    this.constant = (typeof data.constant != 'undefined') ? data.constant : [];
    this.onDepleted = (typeof data.onDepleted != 'undefined') ? data.onDepleted : [];
    this.onFullRecharge = (typeof data.onFullRecharge != 'undefined') ? data.onFullRecharge : [];

};

Equipment.prototype.getWeaponNodes = function(map,node){
    let possibleNodes = [];
    if (this.range){
        possibleNodes = map.cubeSpiral(node,parseInt(this.range));
        for (var i = possibleNodes.length-1; i >= 0;i--){
            if (map.cubeDistance(possibleNodes[i],node) < parseInt(this.range)){
                possibleNodes.splice(i,1);
            }
        }
    }else{
        possibleNodes = map.cubeSpiral(node,parseInt(this.rangeMax));
        for (var i = possibleNodes.length-1; i >= 0;i--){
            if (map.cubeDistance(possibleNodes[i],node) < parseInt(this.rangeMin)){
                possibleNodes.splice(i,1);
            }
        }
    }
    return possibleNodes;
};


exports.Equipment = Equipment;