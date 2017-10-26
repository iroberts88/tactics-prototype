
(function(window) {
    Player = {
    	userData: null,
    	characters: null,
    	inventory: null,

    	init: function(data){
    		if (typeof data.characters != 'undefined'){
    			this.characters = data.characters;
    		}else{
    			this.characters = [];
    		}
    		if (typeof data.inventory != 'undefined'){
    			this.inventory = data.inventory;
    		}else{
    			this.inventory = [];
    		}
    	}
    }
    window.Player = Player;
})(window);
