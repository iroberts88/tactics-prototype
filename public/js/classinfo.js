(function(window){

    var ClassInfo = function () {
        this.allClassAbilities = null;
        this.baseClass = null;
        this.baseid = null;
        this.classid = null;
        this.currentClass = null;
        this.equippedAbilities = null;
        this.learnedAbilities = null;
        this.ap = null;
        this.totalApValues = null; 
    }
        
    ClassInfo.prototype.init = function(data){
        this.allClassAbilities = {};
        for (var i in data[ENUMS.ALLCLASSABILITIES]){
            this.allClassAbilities[i] = [];
            for (var j = 0; j < data[ENUMS.ALLCLASSABILITIES][i].length;j++){
                var a = new Ability();
                a.init(data[ENUMS.ALLCLASSABILITIES][i][j]);
                this.allClassAbilities[i].push(a);
            }
        }
        this.baseClass = data[ENUMS.BASECLASS];
        this.baseid = data[ENUMS.BASEID];
        this.classid = data[ENUMS.CLASSID];
        this.currentClass = data[ENUMS.CURRENTCLASS];
        this.equippedAbilities = data[ENUMS.EQUIPPEDABILITIES];
        this.learnedAbilities = data[ENUMS.LEARNEDABILITIES];
        this.ap = data[ENUMS.AP];
        this.totalApValues = data[ENUMS.TOTALAPVALUES]; 
        
    }

    window.ClassInfo = ClassInfo;

})(window);

(function(window){

    var Ability = function () {};
        
    Ability.prototype.init = function(data){
        this.sCost = data[ENUMS.SCOST];
        this.name = data[ENUMS.NAME];
        this.description = data[ENUMS.DESCRIPTION];
        this.range = data[ENUMS.RANGE];
        this.ApCost = data[ENUMS.APCOST];
        this.id = data[ENUMS.ID];
        this.type = data[ENUMS.TYPE];
        this.radius = data[ENUMS.RADIUS];
        this.eCost = data[ENUMS.ECOST];
        this.speed = data[ENUMS.SPEED];
    };

    window.Ability = Ability;

})(window);