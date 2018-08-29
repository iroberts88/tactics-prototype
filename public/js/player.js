
(function(window) {
    Player = {
    	userData: null,
    	units: null,
    	inventory: null,
        globalCD: 0.15,
        globalCDTicker: 0,
        inGame: false,

        init: function(data){
            this.units = [];
            this.inventory = [];
        },
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
        },
        equipItem: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data.unit){
                    this.units[i].equip(data.index);
                }
            }
            UnitInventory.refresh = true;
        },
        unEquipItem: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data.unit){
                    this.units[i].unEquip(data.index);
                }
            }
            UnitInventory.refresh = true;
        }

    }
    window.Player = Player;
})(window);
