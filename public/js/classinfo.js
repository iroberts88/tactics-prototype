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
        for (var i in data[Enums.ALLCLASSABILITIES]){
            this.allClassAbilities[i] = [];
            for (var j = 0; j < data[Enums.ALLCLASSABILITIES][i].length;j++){
                var a = new Ability();
                a.init(data[Enums.ALLCLASSABILITIES][i][j]);
                this.allClassAbilities[i].push(a);
            }
        }
        this.baseClass = data[Enums.BASECLASS];
        this.baseid = data[Enums.BASEID];
        this.classid = data[Enums.CLASSID];
        this.currentClass = data[Enums.CURRENTCLASS];
        this.equippedAbilities = data[Enums.EQUIPPEDABILITIES];
        this.learnedAbilities = data[Enums.LEARNEDABILITIES];
        this.ap = data[Enums.AP];
        this.totalApValues = data[Enums.TOTALAPVALUES]; 
        
    }

    window.ClassInfo = ClassInfo;

})(window);

(function(window){

    var Ability = function () {};
        
    Ability.prototype.init = function(data){
        this.sCost = data[Enums.SCOST];
        this.name = data[Enums.NAME];
        this.description = data[Enums.DESCRIPTION];
        this.range = data[Enums.RANGE];
        this.ApCost = data[Enums.APCOST];
        this.id = data[Enums.ID];
        this.type = data[Enums.TYPE];
        this.radius = data[Enums.RADIUS];
        this.eCost = data[Enums.ECOST];
        this.speed = data[Enums.SPEED];
    };

    window.Ability = Ability;

})(window);