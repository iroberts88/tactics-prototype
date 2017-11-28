//Menu state for learning class abilites

(function(window) {
    LearnAbilities = {
        unitInfo: null,
        fromClass: null,
        classNames: null,
        learnButtons: null,
        bounds: null,
        init: function() {
            Graphics.drawBG('navy', 'navy');
            this.classNames = [];
            this.learnButtons = [];
            //back button
            this.style2 = {
                font: '32px Orbitron', 
                fill: 'white', 
                align: 'left', 
                dropShadow: true,
                dropShadowColor: '#000000',
                stroke: '#000000',
                strokeThickness: 5,
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6
            };
            this.style1 = {
                font: '64px Sigmar One', 
                fill: 'white', 
                align: 'left', 
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 6,
                dropShadowDistance: 6
            };

            this.charName = Graphics.makeUiElement({
                text: this.unitInfo.name,
                style: this.style1,
            });
            this.charName.position.x = Graphics.width/2;
            this.charName.position.y = 25 + this.charName.height/2;

            Graphics.uiContainer.addChild(this.charName);

            this.drawClasses();

        },
        clear: function(){
            //clear class/ability buttons etc.
            this.classNames = [];
            this.learnButtons = [];
            Graphics.uiContainer.removeChildren();
            Graphics.uiContainer2.removeChildren();
            Graphics.uiContainer.addChild(this.charName);
            Graphics.uiContainer.addChild(this.exitButton);
        },
        drawClasses: function(){
            this.bounds = 0;
            this.exitButton = Graphics.makeUiElement({
                text: 'Back',
                style: this.style2,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    CharDisplay.charToDisplay = LearnAbilities.unitInfo;
                    Acorn.changeState('charDisplay');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            //add all available classes to the list
            var allAbl = this.unitInfo.classInfo.allClassAbilities
            var ypos = this.exitButton.y + this.exitButton.height/2 + 75;
            for (var i in allAbl){
                var cName = Graphics.makeUiElement({
                    text: i,
                    position: [Graphics.width/4,ypos],
                    interactive: true,buttonMode: true,buttonGlow: true,
                    clickFunc: function onClick(e){
                        LearnAbilities.fromClass = i;
                        LearnAbilities.clear();
                        LearnAbilities.drawCurrentClass();
                    }
                })
                cName.style.fontSize = 48;
                Graphics.uiContainer.addChild(cName);
                this.classNames.push(cName);

                if (cName.position.y + cName.height > Graphics.height){
                    this.bounds = (cName.position.y + cName.height - Graphics.height) * -1 - 10;
                }
                var ap = Graphics.makeUiElement({
                    text: 'AP: ' + this.unitInfo.classInfo.ap[i],
                    position: [Graphics.width/2,ypos]
                })
                ap.style.fontSize = 32;
                Graphics.uiContainer.addChild(ap);

                var numLearned = 0;
                for (var j = 0; j < allAbl[i].length;j++){
                    try{
                        if (this.unitInfo.classInfo.learnedAbilities[allAbl[i][j].id]){
                            console.log('learned!!')
                            numLearned += 1;
                        }
                    }catch(e){}
                }
                var percent = Graphics.makeUiElement({
                    text: Math.round((numLearned/(j+1))*100) + '%',
                    position: [Graphics.width*0.75,ypos]
                })
                percent.style.fontSize = 32;
                Graphics.uiContainer.addChild(percent);

                ypos += cName.height + 25;
            }
        },
        learnAbility: function(data){
            var unit;
            for (var i = 0; i < Player.units.length;i++){
                if (Player.units[i].id == data['unitID']){
                    unit = Player.units[i];
                }
            }
            unit.classInfo.learnedAbilities[data['ablID']] = 1;
            unit.classInfo.ap[data['classID']] -= data.apCost;
            this.clear();
            this.drawCurrentClass();
        },
        drawCurrentClass: function(){
            this.bounds = 0;
            this.exitButton = Graphics.makeUiElement({
                text: 'Back',
                style: this.style2,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    LearnAbilities.clear();
                    LearnAbilities.drawClasses();
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);
            
            var cText = Graphics.makeUiElement({
                text: 'Learn ' + this.fromClass + ' Abilities',
                position: [Graphics.width/2,this.exitButton.y + this.exitButton.height/2 + 75]
            });
            cText.style.fontSize = 32;
            Graphics.uiContainer.addChild(cText);

            var ap = Graphics.makeUiElement({
                text: 'AP: ' + this.unitInfo.classInfo.ap[this.fromClass],
                position: [this.exitButton.position.x,this.exitButton.y + this.exitButton.height/2 + 75]
            });
            ap.style.fontSize = 32;
            Graphics.uiContainer.addChild(ap);

            //add all abilities to be learned
            var ablArr = this.unitInfo.classInfo.allClassAbilities[this.fromClass]
            var ypos = cText.y + cText.height/2 + 50;
            for (var i = 0; i < ablArr.length;i++){
                var cName = Graphics.makeUiElement({
                    text: ablArr[i].name,
                    position: [10,ypos],
                    anchor: [0,0.5],
                    interactive: true
                })
                cName.style.fontSize = 32;
                Graphics.uiContainer.addChild(cName);

                cName.tooltip = new Tooltip();
                var ttArray = [{text: ablArr[i].description}];
                if (typeof ablArr[i].sCost != 'undefined'){ttArray.push({text: "{Slot Cost: }" + ablArr[i].sCost})}
                if (typeof ablArr[i].eCost != 'undefined'){ttArray.push({text: "{Energy Cost: }" + ablArr[i].eCost})}
                if (typeof ablArr[i].range != 'undefined'){ttArray.push({text: "{Range: }" + ablArr[i].range})}
                if (typeof ablArr[i].radius != 'undefined'){ttArray.push({text: "{Radius: }" + ablArr[i].radius})}
                if (typeof ablArr[i].type != 'undefined'){ttArray.push({text: "{Type: }" + ablArr[i].type})}
                if (typeof ablArr[i].speed != 'undefined'){ttArray.push({text: "{Speed: }" + ablArr[i].speed})}
                cName.tooltip.set({
                    owner: cName,
                    ttArray: ttArray,
                    alpha: 0.5
                });
                
                if (cName.position.y + cName.height > Graphics.height){
                    this.bounds = (cName.position.y + cName.height - Graphics.height) * -1 - 10;
                }

                if (typeof this.unitInfo.classInfo.learnedAbilities[ablArr[i].id] != 'undefined'){
                    var learnedText = Graphics.makeUiElement({
                        text: 'Learned!',
                        position: [Graphics.width/2,ypos]
                    })
                    learnedText.style.fontSize = 32;
                    Graphics.uiContainer.addChild(learnedText);
                }else{
                    var learnButton = Graphics.makeUiElement({
                        text: 'Learn (' + ablArr[i].ApCost + ' AP)',
                        position: [Graphics.width/2,ypos],
                        interactive: true,buttonMode: true,buttonGlow: true,
                        clickFunc: function onClick(e){
                            console.log('learning ability with id: ' + e.currentTarget.ablID);
                            //first check AP
                            Acorn.Net.socket_.emit('playerUpdate',{
                                'command': 'learnAbility',
                                'unitID': e.currentTarget.unitID,
                                'classID': e.currentTarget.classID,
                                'ablID': e.currentTarget.ablID
                            });
                        }
                    })
                    learnButton.style.fontSize = 32;
                    learnButton.ablID = ablArr[i].id;
                    learnButton.unitID = this.unitInfo.id;
                    learnButton.classID = this.fromClass;
                    Graphics.uiContainer.addChild(learnButton);
                    this.learnButtons.push(learnButton);
                }

                ypos += cName.height + 20;
            }

        },
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            for (var i = 0; i < this.classNames.length;i++){
                Graphics.drawBoxAround(this.classNames[i],Graphics.uiPrimitives2,{});
            }
            for (var i = 0; i < this.learnButtons.length;i++){
                Graphics.drawBoxAround(this.learnButtons[i],Graphics.uiPrimitives2,{});
            }
        }

    }
    window.LearnAbilities = LearnAbilities;
})(window);
