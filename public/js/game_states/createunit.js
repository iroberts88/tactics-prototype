//Create Unit 

(function(window) {
    CreateUnit = {
        charToDisplay: null,

        init: function() {
            
            Graphics.drawBG(Graphics.pallette.color2, Graphics.pallette.color2);
            
            this.style1 = AcornSetup.baseStyle;
            this.style1.font = '48px Roboto';
            this.style2 = AcornSetup.baseStyle;
            this.style2.font = '48px Roboto';
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
                    CreateUnit.resetColors();
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
                    CreateUnit.resetColors();
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
                    CreateUnit.resetColors();
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
                    CreateUnit.resetColors();
                }
            });
            Graphics.uiContainer.addChild(this.scoutButton);

            this.commandoButton = Graphics.makeUiElement({
                text: 'Commando',
                style: this.style2,
                position: [Graphics.width/9,this.scoutButton.position.y + 20 + this.scoutButton.height],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.classSelected = 'commando';
                    CreateUnit.resetColors();
                }
            });
            Graphics.uiContainer.addChild(this.commandoButton);

            this.splicerButton = Graphics.makeUiElement({
                text: 'Splicer',
                style: this.style2,
                position: [Graphics.width/9,this.commandoButton.position.y + 20 + this.commandoButton.height],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.classSelected = 'splicer';
                    CreateUnit.resetColors();
                }
            });
            Graphics.uiContainer.addChild(this.splicerButton);

            this.marksmanButton = Graphics.makeUiElement({
                text: 'Marksman',
                style: this.style2,
                position: [Graphics.width/9,this.splicerButton.position.y + 20 + this.splicerButton.height],
                interactive: true,
                buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(){
                    CreateUnit.classSelected = 'marksman';
                    CreateUnit.resetColors();
                }
            });
            Graphics.uiContainer.addChild(this.marksmanButton);

            var statText = Graphics.makeUiElement({
                text: 'Assign Stat Points',
                style: this.style1,
                position: [Graphics.width/2,this.exitButton.position.y + 25 + this.exitButton.height/2]
            });
            Graphics.uiContainer.addChild(statText);

            var statNames = ['Strength:','Endurance:','Agility:','Dexterity:','Intelligence:','Willpower:','Charisma:'];
            var stats = ['strength','endurance','agility','dexterity','intelligence','willpower','charisma'];
            var attrDesc = [
                "<Strength> increases <power> and <max carry weight> on levelup. It also increases  and effectiveness of strength based abilities",
                "<Endurance> increases max <health> on levelup. It also increases effectiveness of endurance based abilities",
                "<Agility> increases <speed> on levelup. It also increases effectiveness of agility based abilities",
                "<Dexterity> increases <skill> on levelup. It also increases effectiveness of dexterity based abilities",
                "<Intelligence> increases <ability slots> and <tactics> on levelup. It also increases effectiveness of intelligence based abilities",
                "<Willpower> increases max <energy> and <damage resistance> on levelup. It also increases effectiveness of willpower based abilities",
                "<Charisma> increases <all stats> slightly on levelup. It also increases effectiveness of charisma based abilities"
            ];
            this.stats = stats;
            this.recommendedStats = {
                'soldier': [4,5,4,4,1,2,0],
                'medic': [1,3,1,1,4,4,6],
                'tech': [0,3,3,3,8,3,0],
                'scout': [2,2,8,3,2,1,2],
                'commando': [2,2,0,3,3,3,7],
                'splicer': [0,1,5,2,6,6,0],
                'marksman': [0,2,5,9,2,2,0]
            };

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

                if (i == 0){h = t.height*1.5;}
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

            this.recommendedBtn = Graphics.makeUiElement({
                text: 'Recommended Stats',
                style: this.style1,
                position: [Graphics.width/2,this.pointsText.position.y + 100],
                interactive: true,buttonMode: true,buttonGlow: true,
                clickFunc: function onClick(e){
                    for (let i = 0; i < CreateUnit.recommendedStats[CreateUnit.classSelected].length;i++){
                        let stat = CreateUnit.stats[i];
                        CreateUnit.statsAssigned[stat] = 1 + CreateUnit.recommendedStats[CreateUnit.classSelected][i];
                        CreateUnit[stat + 'Num'].text = CreateUnit.statsAssigned[stat];
                    }
                    CreateUnit.points = 0;
                }
            });
            Graphics.uiContainer.addChild(this.recommendedBtn);

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
                    CreateUnit.checkAndCreate();
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
                    CreateUnit.resetColors();
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
                    CreateUnit.resetColors();
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
            Graphics.drawBoxAround(this.commandoButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.marksmanButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.splicerButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.createButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.recommendedBtn,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.femaleButton,Graphics.uiPrimitives2,{});
            Graphics.drawBoxAround(this.maleButton,Graphics.uiPrimitives2,{});

            this.pointsText.text = 'Points: ' + this.points + '/20';

            var colors = {
                'tech': 0xFFFF00,
                'soldier': 0xFF0000,
                'medic': 0x00FF00,
                'scout': 0x42f1f4,
                'splicer': 0x9d00ff,
                'commando': 0x3200d8,
                'marksman': 0x704607
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
            CreateUnit[CreateUnit.classSelected + 'Button'].style.fill = 'gray';
            CreateUnit[CreateUnit.sex + 'Button'].style.fill = 'gray';
        },
        resetColors: function(){
            CreateUnit.soldierButton.style.fill = Graphics.pallette.color1;
            CreateUnit.techButton.style.fill = Graphics.pallette.color1;
            CreateUnit.scoutButton.style.fill = Graphics.pallette.color1;
            CreateUnit.medicButton.style.fill = Graphics.pallette.color1;
            CreateUnit.commandoButton.style.fill = Graphics.pallette.color1;
            CreateUnit.splicerButton.style.fill = Graphics.pallette.color1;
            CreateUnit.marksmanButton.style.fill = Graphics.pallette.color1;

            CreateUnit.maleButton.style.fill = Graphics.pallette.color1;
            CreateUnit.femaleButton.style.fill = Graphics.pallette.color1;

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
            var sObj = {};
            sObj[Enums.STRENGTH] = this.statsAssigned.strength;
            sObj[Enums.ENDURANCE] = this.statsAssigned.endurance;
            sObj[Enums.AGILITY] = this.statsAssigned.agility;
            sObj[Enums.DEXTERITY] = this.statsAssigned.dexterity;
            sObj[Enums.INTELLIGENCE] = this.statsAssigned.intelligence;
            sObj[Enums.WILLPOWER] = this.statsAssigned.willpower;
            sObj[Enums.CHARISMA] = this.statsAssigned.charisma;
            if (p < 27){
                this.errorText.text = "You need to spend all of your stat points!";
                return;
            }else if (p > 27){
                this.errorText.text = "Invalid stat assignment...";
                return;
            }
            //check if valid class
            var validClasses = {
                'scout': 1,'soldier': 1,'medic': 1,'tech': 1, 'commando': 1, 'splicer': 1
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
            Acorn.Net.socket_.emit(Enums.PLAYERUPDATE,Utils.createServerData(
                Enums.COMMAND, Enums.ADDUNIT,
                Enums.NAME, name,
                Enums.CLASS, this.classSelected,
                Enums.STATS, sObj,
                Enums.SEX, this.sex
            ));
            document.body.removeChild( document.getElementById('nameInput'));
            Acorn.changeState('charScreen');
        }

    }
    window.CreateUnit = CreateUnit;
})(window);
