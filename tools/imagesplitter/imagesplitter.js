var fs = require('fs'),
	Jimp = require('jimp');

var interval,
	columns = 12,
	rows = 8,
	s = 32,
	x = -3,
	y = 0,
	next = true,
	end = false;

function init(){
	interval = setInterval(tick,20);
}

function tick(){
	if (next && !end){
		x += 3;
		if (x == columns){
			x = 0;
			y += 4;
		}
		if (y == rows){
			end = true;
			clearInterval(interval);
			console.log('done');
			return;
		}
		cutImage();
		next = false;
	}
}
function cutImage(){
	Jimp.read('Treasure Icons 2.png', function (err,image){
		if (err){throw err}
		console.log('cutting ' + x + 'x' + y);
		image.crop(x*s,y*s,s,s);
		var file = 'i_' + x + 'x' + y + '.' + image.getExtension();
		image.write(file);
		next = true;
		if (end){
			clearInterval(interval);
			console.log('done');
		}
	});
}


init();