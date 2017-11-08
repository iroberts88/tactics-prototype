
(function(window) {
    Player = {
    	userData: null,
    	units: null,
    	inventory: null,
        toolTip: null,

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
            this.units.push(data.unit);
        },
        deleteUnit: function(data){
            for(var i = 0; i < this.units.length;i++){
                if (this.units[i].id == data.id){
                    this.units.splice(i,1);
                    Acorn.changeState('charScreen');
                    continue;
                }
            }
        }
    }
    window.Player = Player;
})(window);
