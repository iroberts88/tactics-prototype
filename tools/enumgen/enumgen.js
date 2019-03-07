var fs = require('fs');

var enums = [

	'ABILITY',
	'ABILITYSLOTS',
	'ABILITYSLOTSUSED',
	'ACCESSORY',
	'ADDUNIT',
	'ADDRANDOMCHAR',
	'AGILITY',
	'AMOUTN',
	'ATTACK',

	'CANCELSEARCH',
	'CHARISMA',
	'CLEARABILITIES',
	'CLIENTCOMMAND',
	'CLASSES',
	'CLASSINFO',
	'COMMAND',
	'CONSTANTEFFECT',
	'CREATEUSER',
	'CURRENTSHIELDS',
	'CURRENTENERGY',
	'CURRENTHEALTH',
	'CURRENTNODE',
	'CURRENTWEIGHT',

	'DAMAGE',
	'DAMAGETYPE',
	'DELAY',
	'DELETECHAR',
	'DESCRIPTION',
	'DEXTERITY',
	'DIRECTION',

	'ENDTURN',
	'ENDURANCE',
	'ENERGY',
	'EQDATA',
	'EQUIPABILITY',
	'EQUIPITEM',
	'EXP',
	'EXITGAME',

	'GAMESTATS',

	'HEATRES',

	'ID',
	'INTELLIGENCE',
	'INVENTORY',
	'ITEM',
	'ITEMS',
	'ITEMTOUNIT',
	'ITEMTOPLAYER',

	'JUMP',
	'JUMPLEFT',

	'LEARNABILITY',
	'LEVEL',
	'LOGOUT',
	'LOGINATTEMPT',

	'MAXENERGY',
	'MAXHEALTH',
	'MAXWEIGHT',
	'MOVE',

	'NAME',

	'ONUSE',
	'ONFIRE',
	'ONHIT',
	'ONEQUIP',
	'ONTAKEDAMAGE',
	'ONFULLRECHARGE',
	'ONDEPLETED',
	'OWNER',

	'POWER',
	'PLAYERUPDATE',

	'RANGE',
	'RANGEMIN',
	'RANGEMAX',
	'READY',
	'RECHARGE',

	'SETLOGINERRORTEXT',
	'SEX',
	'SHIELD',
	'SHIELDS',
	'SKILL',
	'STRENGTH',

	'TACTICS',
	'TESTGAME',
	'TEXT',
	'TYPE',

	'UNEQUIPABILITY',
	'UNEQUIPITEM',

	'WEAPON',
	'WEIGHT',
	'WILLPOWER',


]

function init(){

    fs.truncate('enums.txt', 0, function(){console.log('enums.txt cleared')})
    var writeStream = fs.createWriteStream('enums.txt', {AutoClose: true});
    for (var i = 0; i < enums.length;i++){
    	var text = '    ' + enums[i] + ': ' + i + ''
    	if (i < enums.length-1){
    		text += ',';
    	}
    	text += '\n';
    	writeStream.write(text);
    }
}


init();