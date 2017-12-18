
(function(window) {
    Player = {
    	userData: null,
    	units: [],
    	inventory: [],
        globalCD: 0.15,
        globalCDTicker: 0,

        addNewUnit: function(data){
            var unit = new Unit();
            unit.init(data);
            this.units.push(unit);
        },
        deleteUnit: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data['id']){
                    this.units.splice(i,1);
                    Acorn.changeState('charScreen');
                    continue;
                }
            }
        },
        setUnitStat: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data.unit){
                    this.units[i].setStat(data.stat,data.amt);
                }
            }
            Characters.refresh = true;
        }

    }
    window.Player = Player;
})(window);
