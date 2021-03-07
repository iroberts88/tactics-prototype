
var Enums = require('./enums.js').Enums;

var Ability = function(){}

Ability.prototype.init = function(data) {
    this.sCost = data['sCost'];
    this.name = data['name'];
    this.description = data['description'];
    this.range = data['range'];
    this.ApCost = data['ApCost'];
    this.id = data['id'];
    this.type = data['type'];
    this.radius = data['radius'];
    this.eCost = data['eCost'];
    this.tickECost = data['tickECost'];
    this.speed = data['speed'];
    this.data = {};
    this.cData = this.getClientData();
};

Ability.prototype.getClientData = function(){
    var data = {};
    data[Enums.SCOST] = this.sCost;
    data[Enums.NAME] = this.name;
    data[Enums.DESCRIPTION] = this.description;
    data[Enums.RANGE] = this.range;
    data[Enums.APCOST] = this.ApCost;
    data[Enums.ID] = this.id;
    data[Enums.TYPE] = this.type;
    data[Enums.RADIUS] = this.radius;
    data[Enums.ECOST] = this.eCost;
    data[Enums.SPEED] = this.speed;
    return data;
}
exports.Ability = Ability;