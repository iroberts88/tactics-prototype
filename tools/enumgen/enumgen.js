var fs = require('fs');

var enums = [

	'ABILITY',
	'ABILITYSLOTS',
	'ABILITYSLOTSUSED',
	'ACCESSORY',
	'ADDUNIT',
	'ADDRANDOMCHAR',
	'AGILITY',
	'AMOUNT',
	'APCOST',
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
	'DELETED',
	'DELETECHAR',
	'DESCRIPTION',
	'DEXTERITY',
	'DIRECTION',

	'ECOST',
	'ENDTURN',
	'ENDURANCE',
	'ENERGY',
	'EQDATA',
	'EQUIPABILITY',
	'EQUIPITEM',
	'EXP',
	'EXITGAME',

	'GAMESTATS',

	'H',
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

	'MAPDATA',
	'MAPINFO',
	'MAXENERGY',
	'MAXHEALTH',
	'MAXWEIGHT',
	'MOVE',

	'NAME',
	'NODEID',

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

	'Q',

	'R',
	'RADIUS',
	'RANGE',
	'RANGEMIN',
	'RANGEMAX',
	'READY',
	'RECHARGE',
	'RESOURCE',

	'SCOST',
	'SETLOGINERRORTEXT',
	'SEX',
	'SHIELD',
	'SHIELDS',
	'SKILL',
	'SPEED',
	'STARTZONE1',
	'STARTZONE2',
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