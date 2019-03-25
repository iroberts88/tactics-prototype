
function init(){

	createData(
		'Derp',1,
		"der",2,
		"der2",2,
		"der3",2,
		"der4",2,
	);
}

function createData(){
    var data = {};
    for (var i = 0; i < arguments.length;i+=2){
        data[arguments[i]] = arguments[i+1];
    }
    console.log(data);
    return data;
}


init();