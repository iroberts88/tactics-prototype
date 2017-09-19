
(function(window) {
    Attribute = {
        getNewAttribute: function(data){
            return {
                owner: data.owner, //the unit that owns this stat
                value: data.value, //this stat's actual value
                base: data.base, //this stat's base value before buff/item mods etc.
                nMod: 0, //a numeric modifier added to the base value before usage
                pMod: 1.0 //a percentile modifier added to the base value before usage
                min: data.min, //minimum value
                max: data.max, //maximum value
                init: function(data){

                },
                set: function(v){

                },
            }
        }
    }
    window.Attribute = Attribute;
})(window);
