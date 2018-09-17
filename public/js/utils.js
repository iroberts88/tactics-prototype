
(function(window) {
    //A collection of utility functions
    Utils = {
        numbers: {},
        letters: {},
        operators: {},
        init: function(){
            var n = '1234567890';
            var l = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            var o = '+-/*.';
            for (var i = 0; i < n.length;i++){
                this.numbers[n.charAt(i)] = true;
            }
            for (var i = 0; i < l.length;i++){
                this.letters[l.charAt(i)] = true;
            }
            for (var i = 0; i < o.length;i++){
                this.operators[o.charAt(i)] = true;
            }
        },


        colorShifter: function(data){
            //data.r = 255;
            //data.g = 0;
            //data.b = 0;
            //data.phase = 1;
            //data.speed = 1.5;
            switch(data.phase){
                case 1:
                    if (data.g >= 255){
                        data.phase = 2;
                        data.r -= data.speed;
                        data.g = 255;
                    }else{
                        data.g += data.speed;
                    }
                    break;
                case 2:
                    if (data.r <= 0){
                        data.phase = 3;
                        data.b += data.speed;
                        data.r = 0;
                    }else{
                        data.r -= data.speed;
                    }
                    break;
                case 3:
                    if (data.b >= 255){
                        data.phase = 4;
                        data.g -= data.speed;
                        data.b = 255;
                    }else{
                        data.b += data.speed;
                    }
                    break;
                case 4:
                    if (data.g <= 0){
                        data.phase = 5;
                        data.r += data.speed;
                        data.g = 0;
                    }else{
                        data.g -= data.speed;
                    }
                    break;
                case 5:
                    if (data.r >= 255){
                        data.phase = 6;
                        data.b -= data.speed;
                        data.r = 255;
                    }else{
                        data.r += data.speed;
                    }
                    break;
                case 6:
                    if (data.b <= 0){
                        data.phase = 1;
                        data.g += data.speed;
                        data.b = 0;
                    }else{
                        data.b -= data.speed;
                    }
                    break;
            }
            data.color1 = '0x' + Utils.componentToHex(Math.round(data.r)) + Utils.componentToHex(Math.round(data.g)) + Utils.componentToHex(Math.round(data.b));
            parseInt(data.color1);
            data.color2 = '#' + Utils.componentToHex(Math.round(data.r)) + Utils.componentToHex(Math.round(data.g)) + Utils.componentToHex(Math.round(data.b));
        },
        colorShifter2: function(data){
            switch(data.phase){
                case 1:
                    if (data.g >= 255){
                        data.phase = 2;
                        data.g = 255;
                    }else{
                        data.g += data.speed;
                    }
                    break;
                case 2:
                    if (data.g <= 0){
                        data.phase = 1;
                        data.g = 0;
                    }else{
                        data.g -= data.speed;
                    }
                    break;
            }
        },
        componentToHex: function(c){
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },
        getRandomTint: function(){
            try{
                return (0x1000000+(Math.random())*0xffffff);
            }catch(e){
                console.log(e);
                Utils.getRandomTint();
            }
        },
        parseRange: function(unit,range){
            var results = {
                d: 0, //distnace
                h: 0, //height
                s: false, //self
                m: false //is a move path
            };
            //get path
            if (range.substring(range.length-3,range.length) == '(m)'){
                console.log('got it');
                range = range.substring(0,range.length-3);
                results.m = true;
            }
            //get distance
            var dString = '';
            var start = 0
            for (var i = start; i < range.length;i++){
                if (range.charAt(i) == ' '){
                    continue;
                }else if (range.charAt(i) == '|'){
                    start = i+1;
                    break;
                }else{
                    dString += range.charAt(i);
                }
            }
            //get height
            var hString = '';
            for (var i = start; i < range.length;i++){
                if (range.charAt(i) == ' '){
                    continue;
                }else if (range.charAt(i) == '|'){
                    start = i+1;
                    break;
                }else{
                    hString += range.charAt(i);
                }
            }
            //get self?
            var sString = '';
            for (var i = start; i < range.length;i++){
                if (range.charAt(i) == ' '){
                    continue;
                }else if (range.charAt(i) == '|'){
                    start = i+1;
                    break;
                }else{
                    sString += range.charAt(i);
                }
            }
            if (sString == 'self'){
                results.s = true;
            }
            results.d = Utils.parseStringCode(dString,unit);
            results.h = Utils.parseStringCode(hString,unit);
            return results;
        },
        parseStringCode: function(code,unit){
            if (code.charAt(0) != '<'){
                return parseInt(code);
            }else{
                _code = code.substring(1,code.length-1);
                var percent = false;
                if (_code.charAt(_code.length-1) == '%'){
                    percent = true;
                    _code = _code.substring(0,_code.length-1);
                }
                var cArr = [];
                //seperate the code into numbers,operators, and attr codes
                var currentType = this.getType(_code.charAt(0));
                var str = '';
                for (var i = 0; i < _code.length;i++){
                    if (this.getType(_code.charAt(i)) == currentType){
                        str += _code.charAt(i);
                    }else{
                        if (currentType == 'a' && unit){
                            cArr.push(this.getAttr(str,unit));
                        }else if (currentType == 'n'){
                            cArr.push(parseInt(str));
                        }else{
                            cArr.push(str);
                        }
                        str = _code.charAt(i);
                        currentType = this.getType(_code.charAt(i));
                        if (!currentType){
                            console.log(code);
                        }
                    }
                }
                if (currentType == 'a' && unit){
                    cArr.push(this.getAttr(str,unit));
                }else if (currentType == 'n'){
                    cArr.push(parseInt(str));
                }else{
                    cArr.push(str);
                }
                for (var i = 0; i < cArr.length;i++){
                    if (cArr[i] == '.'){
                        var n = cArr[i-1] + cArr[i+1]/100;
                        cArr.splice(i-1,3,n);
                        i-=1;
                    }
                }
                for (var i = 0; i < cArr.length;i++){
                    if (cArr[i] == '*'){
                        var n = cArr[i-1] * cArr[i+1];
                        cArr.splice(i-1,3,n);
                        i-=1;
                    }
                }
                for (var i = 0; i < cArr.length;i++){
                    if (cArr[i] == '/'){
                        var n = Math.floor(cArr[i-1] / cArr[i+1]);
                        cArr.splice(i-1,3,n);
                        i-=1;
                    }
                }
                for (var i = 0; i < cArr.length;i++){
                    if (cArr[i] == '+'){
                        var n = cArr[i-1] + cArr[i+1];
                        cArr.splice(i-1,3,n);
                        i-=1;
                    }
                    if (cArr[i] == '-'){
                        var n = cArr[i-1] - cArr[i+1];
                        cArr.splice(i-1,3,n);
                        i-=1;
                    }
                }
                if (percent){
                    return cArr[0] + '%';
                }
                return(cArr[0]);   
            }
        },

        getAttr: function(str,unit){
            switch(str){
                case 'MOV':
                    return unit.move;
                    break;
                case 'JMP':
                    return unit.jump;
                    break;
                case 'SPD':
                    return unit.speed;
                    break;
                case 'STR':
                    return unit.strength;
                    break;
                case 'END':
                    return unit.endurance;
                    break;
                case 'DEX':
                    return unit.dexterity;
                    break;
                case 'AGI':
                    return unit.agility;
                    break;
                case 'INT':
                    return unit.intelligence;
                    break;
                case 'WIL':
                    return unit.willpower;
                    break;
                case 'CHA':
                    return unit.charisma;
                    break;
                default:
                    console.log("Unable to find attr string");
                    return 0;
            }
        },
        getType: function(char){
            if (this.letters[char]){return 'a';}
            if (this.numbers[char]){return 'n';}
            if (this.operators[char]){return 'o';}
            console.log("ERROR");
            console.log(char);
            return null;
        },
        getRadiusType: function(str){
            var result = '';
            var start = false;
            for (var i = 0; i < str.length;i++){
                if (start){
                    result = result + str.charAt(i);
                }else if (str.charAt(i) == ' '){
                    start = true;
                }
            }
            if (result == ''){
                return 'circle';
            }
            return result;
        },
        getRadiusN: function(unit,str){
            var rString = '';
            for (var i = 0; i < str.length;i++){
                if (str.charAt(i) == ' '){
                    break;
                }else{
                    rString += str.charAt(i);
                }
            }
            var result = Utils.parseStringCode(rString,unit);
            return parseInt(result);
        }
    };
    window.Utils = Utils;
})(window);