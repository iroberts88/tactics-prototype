
(function(window) {
    Player = {
    	userData: null,
    	units: null,
    	inventory: null,

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
            this.units.push(data);
        }
    }
    window.Player = Player;
})(window);
