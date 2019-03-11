
var ENUMS = require('./enums.js').Enums;

var Ability = function(){}

Ability.prototype.init = function(data) {
    this.sCost = data['sCost'];
    this.name = data['name'];
    this.description = data['description'];
    this.range = data['range'];
    this.ApCost = data['apCost'];
    this.id = data['id'];
    this.type = data['type'];
    this.radius = data['radius'];
    this.eCost = data['eCost'];
    this.speed = data['speed'];
    this.cData = this.getClientData();
};

Ability.prototype.getClientData = function(){
    var data = {};
    data[ENUMS.SCOST] = this.sCost;
    data[ENUMS.NAME] = this.name;
    data[ENUMS.DESCRIPTION] = this.description;
    data[ENUMS.RANGE] = this.range;
    data[ENUMS.APCOST] = this.apCost;
    data[ENUMS.ID] = this.id;
    data[ENUMS.TYPE] = this.type;
    data[ENUMS.RADIUS] = this.radius;
    data[ENUMS.ECOST] = this.eCost;
    data[ENUMS.SPEED] = this.speed;
    return data;
}
exports.Ability = Ability;