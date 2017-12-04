//Create Unit 

(function(window) {
    CreateUnit = {
        charToDisplay: null,

        init: function() {
            
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
            
            this.style1 = AcornSetup.baseStyle;
            this.style1.font = '48px Orbitron';
            this.style2 = AcornSetup.baseStyle;
            this.style2.font = '48px Sigmar One';
            //back button
            this.classSelected = 'soldier';
            this.statsAssigned = {
                'strength': 1,
                'endurance': 1,
                'agility': 1,
                'dexterity': 1,
                'intelligence': 1,
                'willpower': 1,
                'charisma': 1
            };
            this.points = 20;
            this.max = 10;

            this.name = 'Noname';

            this.exitButton = Graphics.makeUiElement({
                text: 'Back',
                style: this.style2,
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    document.body.removeChild( document.getElementById('nameInput'));
                    Acorn.changeState('charScreen');
                }
            });
            this.exitButton.style.fontSize = 80
            this.exitButton.position.x = Graphics.width - 25 - this.exitButton.width/2;
            this.exitButton.position.y = 25 + this.exitButton.height/2;
            Graphics.uiContainer.addChild(this.exitButton);

            var nameText = Graphics.makeUiElement({
                text: 'Name: ',
                style: this.style1,
                position: [Graphics.width/9,this.exitButton.position.y]
            });
            Graphics.uiContainer.addChild(nameText);

            var nameInput = document.createElement( 'input' );
            nameInput.id = 'nameInput';
            nameInput.type = 'text';
            nameInput.name = 'userName';
            nameInput.style.cssText = 'maxlength:30;top:5%;left:20%;opacity:1;position:absolute;width:300px;height:50px;background-color:#fff;font-size: 32px';
            document.body.appendChild( nameInput );

            var classText = Graphics.makeUiElement({
                text: 'Pick a class',
                style: this.style1,
                position: [Graphics.width/9,this.exitButton.position.y + 25 + this.exitButton.height/2]
            });
            Graphics.uiContainer.addChild(classText);

            this.soldierButton = Graphics.makeUiElement({
                text: 'Soldier',
                style: this.style2,
                position: [Graphics.width/9,classText.position.y + 50 + classText.height/2],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.classSelected = 'soldier';
                    CreateUnit.soldierButton.style.fill = 'gray';
                    CreateUnit.techButton.style.fill = 'white';
                    CreateUnit.scoutButton.style.fill = 'white';
                    CreateUnit.medicButton.style.fill = 'white';
                }
            });
            this.soldierButton.style.fill = 'gray';
            Graphics.uiContainer.addChild(this.soldierButton);

            this.medicButton = Graphics.makeUiElement({
                text: 'Medic',
                style: this.style2,
                position: [Graphics.width/9,this.soldierButton.position.y + 20 + this.soldierButton.height],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.classSelected = 'medic';
                    CreateUnit.medicButton.style.fill = 'gray';
                    CreateUnit.techButton.style.fill = 'white';
                    CreateUnit.scoutButton.style.fill = 'white';
                    CreateUnit.soldierButton.style.fill = 'white';
                }
            });
            Graphics.uiContainer.addChild(this.medicButton);

            this.techButton = Graphics.makeUiElement({
                text: 'Tech',
                style: this.style2,
                position: [Graphics.width/9,this.medicButton.position.y + 20 + this.medicButton.height],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.classSelected = 'tech';
                    CreateUnit.techButton.style.fill = 'gray';
                    CreateUnit.soldierButton.style.fill = 'white';
                    CreateUnit.scoutButton.style.fill = 'white';
                    CreateUnit.medicButton.style.fill = 'white';
                }
            });
            Graphics.uiContainer.addChild(this.techButton);

            this.scoutButton = Graphics.makeUiElement({
                text: 'Scout',
                style: this.style2,
                position: [Graphics.width/9,this.techButton.position.y + 20 + this.techButton.height],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.classSelected = 'scout';
                    CreateUnit.soldierButton.style.fill = 'white';
                    CreateUnit.techButton.style.fill = 'white';
                    CreateUnit.scoutButton.style.fill = 'gray';
                    CreateUnit.medicButton.style.fill = 'white';
                }
            });
            Graphics.uiContainer.addChild(this.scoutButton);

            var statText = Graphics.makeUiElement({
                text: 'Assign Stat Points',
                style: this.style1,
                position: [Graphics.width/2,this.exitButton.position.y + 25 + this.exitButton.height/2]
            });
            Graphics.uiContainer.addChild(statText);

            var statNames = ['Strength:','Endurance:','Agility:','Dexterity:','Intelligence:','Willpower:','Charisma:'];
            var stats = ['strength','endurance','agility','dexterity','intelligence','willpower','charisma'];
            var attrDesc = [
                "<Strength> increases <power> on levelup. It also increases max carry weight and effectiveness of strength based abilities",
                "<Endurance> increases max <health> on levelup. It also increases effectiveness of endurance based abilities",
                "<Agility> increases <speed> on levelup. It also increases effectiveness of agility based abilities",
                "<Dexterity> increases <skill> on levelup. It also increases effectiveness of dexterity based abilities",
                "<Intelligence> increases <ability slots> on levelup. It also increases effectiveness of intelligence based abilities",
                "<Willpower> increases max <energy> on levelup. It also increases effectiveness of willpower based abilities",
                "<Charisma> increases all stats slightly on levelup. It also increases effectiveness of charisma based abilities"
            ];
                
            var h = 0;
            for (var i = 0; i < stats.length;i++){
                var t = Graphics.makeUiElement({
                    text: statNames[i],
                    style: this.style1,
                    interactive: true
                });

                //make tooltips
                t.tooltip = new Tooltip();
                t.tooltip.set({
                    owner: t,
                    ttArray: [
                        {
                            text: attrDesc[i]
                        }
                    ],
                    alpha: 0.5
                });

                if (i == 0){h = t.height;}
                t.position.x = Graphics.width/2 - t.width/2;
                t.position.y = statText.position.y + 75 + i*h;
                Graphics.uiContainer.addChild(t);
                this[stats[i]+'Num'] = Graphics.makeUiElement({
                    text: 1,
                    style: this.style1,
                    position: [Graphics.width/2+50,statText.position.y + 75 + i*h]
                });
                Graphics.uiContainer.addChild(this[stats[i]+'Num']);

                this[stats[i]+'Minus'] = Graphics.makeUiElement({
                    texture: Graphics.minusTexture,
                    position: [Graphics.width/2+150,statText.position.y + 75 + i*h],
                    interactive: true,buttonMode: true,buttonGlow: true,
                    clickFunc: function onClick(e){
                        CreateUnit.statsAssigned[e.currentTarget.statToChange] -= 1;
                        if (CreateUnit.statsAssigned[e.currentTarget.statToChange] < 1){
                            CreateUnit.statsAssigned[e.currentTarget.statToChange] = 1;
                        }else if (CreateUnit.points < 20){
                            CreateUnit.points +=1;
                        }
                        CreateUnit[e.currentTarget.statToChange + 'Num'].text = CreateUnit.statsAssigned[e.currentTarget.statToChange];
                    }
                });
                this[stats[i]+'Minus'].statToChange = stats[i];
                Graphics.uiContainer.addChild(this[stats[i]+'Minus']);

                this[stats[i]+'Plus'] = Graphics.makeUiElement({
                    texture: Graphics.plusTexture,
                    position: [Graphics.width/2+150+this[stats[i]+'Minus'].width*2,statText.position.y + 75 + i*h],
                    interactive: true,buttonMode: true,buttonGlow: true,
                    clickFunc: function onClick(e){
                        if (CreateUnit.points > 0){
                            CreateUnit.statsAssigned[e.currentTarget.statToChange] += 1;
                            if (CreateUnit.statsAssigned[e.currentTarget.statToChange] > 10){
                                CreateUnit.statsAssigned[e.currentTarget.statToChange] = 10;
                                CreateUnit.errorText.text = 'Cannot raise a stat above 10';
                            }else{
                                CreateUnit.points -=1;
                            }
                        }
                        CreateUnit[e.currentTarget.statToChange + 'Num'].text = CreateUnit.statsAssigned[e.currentTarget.statToChange];
                    }
                });
                this[stats[i]+'Plus'].statToChange = stats[i];
                Graphics.uiContainer.addChild(this[stats[i]+'Plus']);
            }

            this.pointsText = Graphics.makeUiElement({
                text: 'Points: 20/20',
                style: this.style1,
                position: [Graphics.width/2,this.charismaNum.position.y + 100]
            });
            Graphics.uiContainer.addChild(this.pointsText);

            this.errorText = Graphics.makeUiElement({
                text: ' ',
                style: this.style1,
                position: [Graphics.width/2,Graphics.height * 0.8]
            });
            Graphics.uiContainer.addChild(this.errorText);

            this.createButton = Graphics.makeUiElement({
                text: 'Create Unit',
                style: this.style2,
                position: [Graphics.width/2,this.errorText.position.y + 20 + this.errorText.height*2],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.checkAndCreate()
                }
            });
            this.createButton.style.fontSize = 64
            Graphics.uiContainer.addChild(this.createButton);

            this.sex = 'male';
            this.unitSprite = Graphics.getSprite('unit_base_dl_');
            this.unitSprite.position.x = Graphics.width*0.8;
            this.unitSprite.position.y = Graphics.height*0.06;
            this.unitSprite.anchor.x = 0.5;
            this.unitSprite.anchor.y = 0.5;
            this.unitSprite.scale.x = 1.5;
            this.unitSprite.scale.y = 1.5;
            var colors = {
                'tech': 0xFFFF00,
                'soldier': 0xFF0000,
                'medic': 0x00FF00,
                'scout': 0x42f1f4
            };
            this.unitSprite.tint = 0xFF0000;
            Graphics.worldContainer.addChild(this.unitSprite);

            this.maleButton = Graphics.makeUiElement({text: 'male',style: this.style2, 
                interactive: true, buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.sex = 'male';
                    CreateUnit.maleButton.style.fill = 'gray';
                    CreateUnit.femaleButton.style.fill = 'white';
                }
            });
            this.maleButton.position.x = this.unitSprite.position.x - this.unitSprite.width/2 - this.maleButton.width/2;
            this.maleButton.position.y = this.unitSprite.position.y - this.maleButton.height/2;
            this.maleButton.style.fill = 'gray';
            this.maleButton.style.fontSize = 32;
            Graphics.uiContainer.addChild(this.maleButton);

            this.femaleButton = Graphics.makeUiElement({text: 'female',style: this.style2, 
                interactive: true, buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.sex = 'female';
                    CreateUnit.maleButton.style.fill = 'white';
                    CreateUnit.femaleButton.style.fill = 'gray';
                }
            });
            this.femaleButton.style.fontSize = 32;
            this.femaleButton.position.x = this.maleButton.position.x;
            this.femaleButton.position.y = this.unitSprite.position.y + this.femaleButton.height/2;
            Graphics.uiContainer.addChild(this.femaleButton);
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            Graphics.drawBoxAround(this.exitButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.soldierButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.scoutButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.medicButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.techButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.createButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.femaleButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.maleButton,Graphics.uiPrimitives2,{});

            this.pointsText.text = 'Points: ' + this.points + '/20';

            var colors = {
                'tech': 0xFFFF00,
                'soldier': 0xFF0000,
                'medic': 0x00FF00,
                'scout': 0x42f1f4
            };
            this.unitSprite.tint = colors[this.classSelected];

            if (Acorn.Input.isPressed(Acorn.Input.Key.BACKSPACE)){
                if (document.activeElement.id == 'nameInput'){
                    document.getElementById('nameInput').value = document.getElementById('nameInput').value.substring(0, document.getElementById('nameInput').value.length-1);
                }
                Acorn.Input.setValue(Acorn.Input.Key.BACKSPACE, false);
            }if (Acorn.Input.isPressed(Acorn.Input.Key.TOGGLESTATS)){
                if (document.activeElement.id == 'nameInput'){
                    document.getElementById('nameInput').value = document.getElementById('nameInput').value + ' ';
                }
                Acorn.Input.setValue(Acorn.Input.Key.TOGGLESTATS, false);
            }
        },

        checkAndCreate: function(){
            //check if valid name
            var name = document.getElementById('nameInput').value;
            if (name.length > 30){
                this.errorText.text = "Name must be less than 30 characters";
                return;
            }
            if (name.length < 3){
                this.errorText.text = "Name must be 3 or more characters";
                return;
            }
            var spaces = 0;
            for (var i = 0; i < name.length;i++){
                if (name.charAt(i) == ' '){
                    spaces += 1;
                }
            }
            if (spaces > 1){
                this.errorText.text = "Name can only have 1 space";
                return;
            }
            var invalidChars = {'!': 1,'@': 1,'#': 1,'$': 1,'%': 1,'^': 1,'&': 1,'*': 1,"(": 1,')': 1,'_': 1,'+': 1,'=': 1,'[': 1,']': 1,'{': 1,'}': 1,'|': 1,';': 1,':': 1,'"': 1,'<': 1,'>': 1,',': 1,'?': 1,'/': 1,'.': 1,'~': 1,'0':1,'1':1,'2':1,'3':1,'4':1,'5':1,'6':1,'7':1,'8':1,'9':1}
            for (var i = 0; i < name.length;i++){
                if (invalidChars[name.charAt(i)]){
                    this.errorText.text = "Name contains an invalid character";
                    return;
                }
            }
            //check if valid stats
            var p = 0;
            for (var stats in this.statsAssigned){
                p += this.statsAssigned[stats];
                if (this.statsAssigned[stats] > 10 || this.statsAssigned[stats] < 1){
                    this.errorText.text = "Invalid stat assignment...";
                    return;
                }
            }
            if (p < 27){
                this.errorText.text = "You need to spend all of your stat points!";
                return;
            }else if (p > 27){
                this.errorText.text = "Invalid stat assignment...";
                return;
            }
            //check if valid class
            var validClasses = {
                'scout': 1,'soldier': 1,'medic': 1,'tech': 1
            }
            valid = false;
            for (var i = 0; i < name.length;i++){
                if (validClasses[CreateUnit.classSelected]){
                    valid = true;
                }
            }
            if (!valid){
                this.errorText.text = "Invalid class...";
                return;
            }
            //check if valid sex
            if (this.sex != 'male' && this.sex != 'female'){
                this.errorText.text = "Invalid sex...";
                return;
            }
            //send to server to create
            console.log("Success!!! send to server to create!");
            Acorn.Net.socket_.emit('addUnit',{name: name,
                class: this.classSelected,
                stats: this.statsAssigned,
                sex: this.sex
            });
            document.body.removeChild( document.getElementById('nameInput'));
            Acorn.changeState('charScreen');
        }

    }
    window.CreateUnit = CreateUnit;
})(window);
