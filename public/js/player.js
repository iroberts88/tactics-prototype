
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
                if (this.units[i].id == data[Enums.UNITID]){
                    this.units.splice(i,1);
                    Acorn.changeState('charScreen');
                    continue;
                }
            }
        },
        setUnitStat: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data[Enums.UNITID]){
                    this.units[i].setStat(data[Enums.STAT],data[Enums.VALUE]);
                }
            }
            Characters.refresh = true;
        },
        equipItem: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data[Enums.UNITID]){
                    this.units[i].equip(data[Enums.INDEX]);
                }
            }
            UnitInventory.refresh = true;
        },
        unEquipItem: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data[Enums.UNITID]){
                    this.units[i].unEquip(data[Enums.INDEX]);
                }
            }
            UnitInventory.refresh = true;
        }

    }
    window.Player = Player;
})(window);
