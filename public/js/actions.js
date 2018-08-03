
(function(window) {
    var Actions = function(){ }

    Actions.prototype.actionEnums = {
        Test: 'test'
    };

    Actions.prototype.update = function(dt){
        if (this.end){return;}
        if (this.currentAction == null){
            this.currentAction = this.actions[this.actionIndex];
        }else{
            var actionFunc = this.getAction(this.currentAction.action);
            actionFunc(dt,this,this.currentAction);
        }
    };

    Actions.prototype.getAction = function(a){
        switch(a){
            case this.actionEnums.Test:
                return this.test;
                break;
            default:
                return this.test;
                break;
        }
    };

    Actions.prototype.test = function(dt,action,data){
        if (typeof data.ticker == 'undefined'){
            data.ticker = 0;
        }
        console.log(data.ticker);
        data.ticker += dt;
        if (data.ticker > 0.5){
            return true;
        }else{
            return false;
        }
    };

    window.Actions = Actions;
})(window);
