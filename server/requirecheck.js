//----------------------------------------------------------------
//requirecheck.js
//Author: Eric Grotzke
//database required check
//----------------------------------------------------------------

var RequireCheck = function() {
    this.required = [];
    this.callback = null;
}

RequireCheck.prototype.init = function () {
    //
};

RequireCheck.prototype.onReady = function(callback) {
    this.callback = callback;
}

RequireCheck.prototype.require = function () {
    for (var i = 0; i < arguments.length; i++) {
        this.required.push(arguments[i]);
        console.log('RequiredCheck: [' + arguments[i] + '] is required');
    }
}

RequireCheck.prototype.ready = function(is_ready) {
    for (var i = 0; i < this.required.length; i++) {
        if(this.required[i] == is_ready) {
            this.required.splice(i, 1);
            console.log('RequiredCheck: [' + is_ready + '] is ready');
            break;
        }
    }
    if(this.required.length == 0) {
        if(this.callback != null && typeof this.callback == 'function' ) {
            this.callback();
        }
    }
}

exports.RequireCheck = RequireCheck;