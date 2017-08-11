
(function(window) {
    //A collection of utility functions
    Utils = {
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
        getRandomItem: function(arr){
            //takes in a "drop list" array and returns a random index based on its values
            var randi = Math.random() * 100;
            var p = 0;
            if (randi <= 45){
                p = 0;
            }else if (randi <= 75){
                p = 1;
            }else if (randi <= 90){
                p = 2;
            }else if (randi <= 99){
                p = 3;
            }else if (randi <= 99.9){
                p = 4;
            }else if (randi <= 99.99){
                p = 5;
            }else if (randi <= 99.999){
                p = 6;
            }else if (randi <= 100){
                p = 7;
            }
            return arr[p][Math.floor(Math.random()*arr[p].length)];
        },
        drawMap: function(ctx, tiles,drawSize,mwidth,mheight){
            var color = null;
            for (var i=(tiles.length-1); i>=0; i--){
                for (var j=(tiles[0].length-1); j>=0; j--){
                    ctx.fillStyle = tiles[i][j].color;
                    ctx.fillRect(1000 - (drawSize * (mwidth - i)),700 - (drawSize * (mheight - j)), drawSize, drawSize);
                }
            }
            //draw player based on position 0 tile
            var startPos = [1000 - (drawSize * mwidth),700 - (drawSize * mheight)]; //start at the location of the 0 tile
            var zeroMult = [(500 - tiles[0][0].loc[0]) / 100, (350 - tiles[0][0].loc[1]) / 100]; //X and Y location multiplier
            ctx.fillStyle = 'hsla(230,100%,60%,1.0)';
            ctx.fillRect((startPos[0]+(drawSize*zeroMult[0]))- drawSize,(startPos[1]+(drawSize*zeroMult[1])) - drawSize,drawSize*2, drawSize*2);
        },
        compareArrays: function(a1,a2) {
        //Return True if arrays are same length and have exact same contents
            if (a1.length === a2.length)
            {
                for (var i = 0; i < a1.length;i++)
                {
                    if (a1[i] != a2[i])
                    {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },
        rectCollide: function(P1,s1,P2,s2){
            //check collision of 2 rects
            //p1,p2 are the topleft points of the first and second rects
            //s1,s2 are the sizes of the first and second rects
            
            var p1 = [P1[0]-Math.round(s1[0]/2),P1[1]-Math.round(s1[1]/2)]; //set the points from center to topleft
            var p2 = [P2[0]-Math.round(s2[0]/2),P2[1]-Math.round(s2[1]/2)];
            
            var xrange = [p1[0],(p1[0]+s1[0])];
            var yrange = [p1[1],(p1[1]+s1[1])];
            var points = [[p2[0],p2[1]],[p2[0]+s2[0],p2[1]],[p2[0],p2[1]+s2[1]],[p2[0]+s2[0],p2[1]+s2[1]]];
            for (var i=0;i<4;i+=1){
                if ((points[i][0] >= xrange[0]) && (points[i][0] <= xrange[1]) && (points[i][1] >= yrange[0]) && (points[i][1] <= yrange[1])){
                    return true;
                }
            }
            xrange = [p2[0],(p2[0]+s2[0])];
            yrange = [p2[1],(p2[1]+s2[1])];
            points = [[p1[0],p1[1]],[p1[0]+s1[0],p1[1]],[p1[0],p1[1]+s1[1]],[p1[0]+s1[0],p1[1]+s1[1]]];
            for (var i=0;i<4;i+=1){
                if ((points[i][0] >= xrange[0]) && (points[i][0] <= xrange[1]) && (points[i][1] >= yrange[0]) && (points[i][1] <= yrange[1])){
                    return true;
                }
            }
            return false;
        },
        pointCollide: function(point,p,s){
            //check collision of a point and a rect
            //point is the point
            //p,s is the topleft point and size of the rect
            var collides = false;
            if ((point[0] >= p[0]) && (point[0] <= (p[0]+s[0])) && (point[1] >= p[1]) && (point[1] <= (p[1]+s[1]))){
                collides = true;
            }
            return collides;
        },
        circleCollide: function(point,cpt,r){
            //check collision of a point and a circle
            //point is the point
            //cpt is the center point and r is the radius of the circle
            var hyp = 0;
            var distances = [0,0];
            distances[0] = point[0]-cpt[0];
            if (distances[0] < 0){ distances[0] = distances[0]*-1}
            distances[1] = point[1]-cpt[1];
            if (distances[1] < 0){ distances[1] = distances[1]*-1}
            hyp = Math.ceil(Math.sqrt(distances[0]*distances[0]+distances[1]*distances[1]))
            if (hyp <= r){return true;}else{return false}
        },
        rectCircleCollide: function(rect,cpt,r){
            //check collision of a rect and a circle
            //rect is the rect
            //cpt is the center point and r is the radius of the circle
            var points = [[rect[0],rect[1]],[rect[0],rect[1]+rect[3]],[rect[0]+rect[2],rect[1]],[rect[0]+rect[2],rect[1]+rect[3]]];
            for (var i = 0;i < 4; i++){
                var hyp = 0;
                var distances = [0,0];
                distances[0] = points[i][0]-cpt[0];
                if (distances[0] < 0){ distances[0] = distances[0]*-1}
                distances[1] = points[i][1]-cpt[1];
                if (distances[1] < 0){ distances[1] = distances[1]*-1}
                hyp = Math.ceil(Math.sqrt(distances[0]*distances[0]+distances[1]*distances[1]));
                if (hyp <= r){return true;}
            }
            return false;
        },
        mapCollide2: function(p){
            //checks if a point collides with map
            var pos = [Math.floor(p[0]/100),Math.floor(p[1]/100)];
            var remainder = [p[0] - pos[0]*100,p[1] - pos[1]*100];
            var t = Map.tiles[pos[0]][pos[1]][0];
            if (Map.hitmaps[t][remainder[1]][remainder[0]] === 0){
                return false;
            }else{
                return true;
            }
        },
        getVector: function(startingposx, startingposy, endingposx, endingposy, speed){
            //function to get X and Y values for a projectile
            var xdistance =(endingposx - startingposx);
            var ydistance =(endingposy - startingposy);
            var xneg, yneg;
            if (xdistance < 0){
                xneg = -1;
                xdistance = (xdistance * -1);
            }else{xneg = 1}
            if (ydistance < 0){
                yneg = -1
                ydistance = (ydistance * -1)
            }else{yneg = 1}
            //find hypotenuse
            var hypvalue = ((ydistance * ydistance) + (xdistance * xdistance));
            var hypotenuse = Math.sqrt(hypvalue);
            //find angle
            if (hypotenuse == 0){hypotenuse = 1}
            var anglevalue = (ydistance / hypotenuse);
            var angle = Math.asin(anglevalue);
            //multiply by speed to find x,y values
            var movex = (Math.cos(angle) * speed * xneg);
            var movey = (Math.sin(angle) * speed * yneg);
            movex = Math.round(movex);
            movey = Math.round(movey);
            return [movex, movey];
        },
        getVector2: function(startingposx, startingposy, endingposx, endingposy){
            //function to get X and Y values for a vector then normalize
            var xdistance =(endingposx - startingposx);
            var ydistance =(endingposy - startingposy);
            
            return [xdistance, ydistance];
        },
        getSniperLoc: function(startingposx, startingposy, endingposx, endingposy,tiles){
            //function to get X and Y values for a projectile
            var xdistance =(endingposx - startingposx);
            var ydistance =(endingposy - startingposy);
            var length = 1200;
            var xneg, yneg;
            if (xdistance < 0){
                xneg = -1;
                xdistance = (xdistance * -1);
            }else{xneg = 1}
            if (ydistance < 0){
                yneg = -1
                ydistance = (ydistance * -1)
            }else{yneg = 1}
            //find hypotenuse
            var hypvalue = ((ydistance * ydistance) + (xdistance * xdistance));
            var hypotenuse = Math.sqrt(hypvalue);
            //find angle
            if (hypotenuse == 0){hypotenuse = 1}
            var anglevalue = (ydistance / hypotenuse);
            var angle = Math.asin(anglevalue);
            //multiply by speed to find x,y values
            var movex = (Math.cos(angle) * length * xneg);
            var movey = (Math.sin(angle) * length * yneg);
            movex = Math.round(movex);
            movey = Math.round(movey);
            movex += startingposx;
            movey += startingposy;
            return [movex, movey];
        },
        mapCollide: function(rect,xmove,ymove){

        
            //function checks if rect will collide with map edges and return the new move value
            var newMove = [xmove,ymove];
            collidePoints = 0;
            if (xmove > 0){
                for (var i=rect[0]-xmove;i < rect[0]; i++)
                {
                    if (Utils.mapCollide2([i,rect[1]]) === false)
                    {
                        if (Utils.mapCollide2([i,rect[1]+rect[3]]) === false)
                        {
                            collidePoints++;
                        }
                    }
                }
                newMove[0] = collidePoints;
            }else if (xmove < 0){
                for (var i=rect[0]+rect[2]+1;i < rect[0]+rect[2]-xmove+1; i++)
                {
                    if (Utils.mapCollide2([i,rect[1]]) === false)
                    {
                        if (Utils.mapCollide2([i,rect[1]+rect[3]]) === false)
                        {
                            collidePoints++;
                        }
                    }
                }
                newMove[0] = collidePoints*-1;
            }
            collidePoints = 0;
            if (ymove > 0){
                for (var i=rect[1]-ymove;i < rect[1]; i++)
                {
                    if (Utils.mapCollide2([rect[0],i]) === false)
                    {
                        if (Utils.mapCollide2([rect[0]+rect[2],i]) === false)
                        {
                            collidePoints++;
                        }
                    }
                }
                newMove[1] = collidePoints;
            }else if (ymove < 0){
                for (var i=rect[1]+rect[3]+1;i < rect[1]+rect[3]-ymove+1; i++)
                {
                    if (Utils.mapCollide2([rect[0],i]) === false)
                    {
                        if (Utils.mapCollide2([rect[0]+rect[2],i]) === false)
                        {
                            collidePoints++;
                        }
                    }
                }
                newMove[1] = collidePoints*-1;
            }
            return newMove;
            
        },
        findenemy: function(loc){
            if (Enemies.enemyList.length === 0){
                return 'None';
            }
            var c = 0;
            var shortest = 9999;
            for (var i = 0;i<Enemies.enemyList.length;i+=1){
                if (Enemies.enemyList[i].isvisible && Enemies.enemyList[i].dying === false && Enemies.enemyList[i].dead === false){
                    var xdistance = Enemies.enemyList[i].sprite.position.x - loc[0];
                    var ydistance = Enemies.enemyList[i].sprite.position.y - loc[1];
                    if (xdistance < 0){xdistance = xdistance*-1}
                    if (ydistance < 0){ydistance = ydistance*-1}
                    var hyp = Math.sqrt((xdistance*xdistance)+(ydistance*ydistance));
                    if (hyp < shortest){
                        shortest = hyp;
                        c = i;
                    }
                }
            }
            if (shortest === 9999){
                return "None";
            }
            return [Enemies.enemyList[c].sprite.position.x,Enemies.enemyList[c].sprite.position.y];
        },
        getAngle: function(startingposx, startingposy, endingposx, endingposy){
            //get x/y distance from enemy to target
            var xdistance =(endingposx - startingposx);
            var ydistance =(endingposy - startingposy);
            var xneg = false;
            var yneg = false;
            // find hypotenuse
            if (xdistance < 0){
                xdistance = xdistance *-1;
                xneg = true;
            }
            if (ydistance < 0){
                ydistance = ydistance *-1;
                yneg = true;
            }
            var hypotenuse = Math.sqrt(((ydistance * ydistance) + (xdistance * xdistance)))
            if (hypotenuse === 0){
                hypotenuse = 1;
            }
            //find angle
            var anglevalue = Math.asin(ydistance / hypotenuse);
            var angle = (anglevalue * 180) / Math.PI;
            //convert to a -180-180 scale
            if (xneg && yneg === false){
                angle = (180-angle);
            }else if(yneg && xneg === false){
                angle = 360-angle;
            }else if(yneg && xneg){
                angle += 180;
            }
            return ((angle*Math.PI)/180);
        },
        
        bounce: function(bullet){
            //bounce the bullet
            var s = '';
            var sp = 30;
            if (Utils.mapCollide2([bullet.mapLoc[0]-sp,bullet.mapLoc[1]-sp])){
                s = s+'1';
            }else{
                s = s+'0';
            }
            if (Utils.mapCollide2([bullet.mapLoc[0]+sp,bullet.mapLoc[1]-sp])){
                s = s+'1';
            }else{
                s = s+'0';
            }
            if (Utils.mapCollide2([bullet.mapLoc[0]-sp,bullet.mapLoc[1]+sp])){
                s = s+'1';
            }else{
                s = s+'0';
            }
            if (Utils.mapCollide2([bullet.mapLoc[0]+sp,bullet.mapLoc[1]+sp])){
                s = s+'1';
            }else{
                s = s+'0';
            }
            var acc = 100;
            switch (s){
                case '1100':
                    bullet.ymove = bullet.ymove * -1;
                    bullet.clicked = [bullet.mapLoc[0]+bullet.xmove,bullet.ymove+bullet.mapLoc[1]];
                    break;
                case '1010':
                    bullet.xmove = bullet.xmove * -1;
                    bullet.clicked = [bullet.mapLoc[0]+bullet.xmove,bullet.ymove+bullet.mapLoc[1]];
                    break;
                case '0011':
                    bullet.ymove = bullet.ymove * -1;
                    bullet.clicked = [bullet.mapLoc[0]+bullet.xmove,bullet.ymove+bullet.mapLoc[1]];
                    break;
                case '0101':
                    bullet.xmove = bullet.xmove * -1;
                    bullet.clicked = [bullet.mapLoc[0]+bullet.xmove,bullet.ymove+bullet.mapLoc[1]];
                    break;
                case '1000':
                    bullet.clicked = [bullet.mapLoc[0]+50,bullet.mapLoc[1]+50];
                    acc = 75;
                    break;
                case '0100':
                    bullet.clicked = [bullet.mapLoc[0]-50,bullet.mapLoc[1]+50];
                    acc = 75;
                    break;
                case '0010':
                    bullet.clicked = [bullet.mapLoc[0]+50,bullet.mapLoc[1]-50];
                    acc = 75;
                    break;
                case '0001':
                    bullet.clicked = [bullet.mapLoc[0]-50,bullet.mapLoc[1]-50];
                    acc = 75;
                    break;
                case '1110':
                    bullet.clicked = [bullet.mapLoc[0]+50,bullet.mapLoc[1]+50];
                    acc = 50;
                    break;
                case '1011':
                    bullet.clicked = [bullet.mapLoc[0]+50,bullet.mapLoc[1]-50];
                    acc = 50;
                    break;
                case '1101':
                    bullet.clicked = [bullet.mapLoc[0]-50,bullet.mapLoc[1]+50];
                    acc = 50;
                    break;
                case '0111':
                    bullet.clicked = [bullet.mapLoc[0]-50,bullet.mapLoc[1]-50];
                    acc = 50;
                    break;
                case '1001':
                    acc = 75;
                    bullet.clicked = [bullet.mapLoc[0]+bullet.xmove,bullet.ymove+bullet.mapLoc[1]];
                    break;
                case '0110':
                    acc = 75;
                    bullet.clicked = [bullet.mapLoc[0]+bullet.xmove,bullet.ymove+bullet.mapLoc[1]];
                    break;
                case '0000':
                    bullet.ymove = bullet.ymove * -1;
                    bullet.xmove = bullet.xmove * -1;
                    bullet.clicked = [bullet.mapLoc[0]+bullet.xmove,bullet.ymove+bullet.mapLoc[1]];
                    break;
            }
            bullet.init(acc,bullet.damage,bullet.smod);
        }
    };
    window.Utils = Utils;
})(window);