
(function(window) {
    Player = {
    	userData: null,
    	units: null,
    	inventory: null,
        globalCD: 0.15,
        globalCDTicker: 0,

    	init: function(data){
    		if (typeof data.units != 'undefined'){
    			this.units = data.units;
    		}else{
    			this.units = [];
    		}
    		if (typeof data.inventory != 'undefined'){
    			this.inventory = data.inventory;
    		}else{
    			this.inventory = [];
    		}
            
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

        addItem: function(data){

        },

        removeItem: function(data){

        }

    }
    window.Player = Player;
})(window);
