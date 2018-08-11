var fs = require('fs'),
    AWS = require("aws-sdk");

var dbs = ['blaine_attacks','blaine_pkmn','blaine_userdata'];
var pos = 0;
var objects = {};
var num = 0;
var totalItems = 0;
var interval;
var sent = false;

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });


function next(){

    if (pos < dbs.length){
        dbName = dbs[pos];
        console.log("Getting data from DB: " + dbName);
        fs.readFile('./' + dbName + '.json', "utf8",function read(err, data) {
            if (err) {
                throw err;
            }
            var obj = JSON.parse(data);
            var name;
            for (var i in obj){
                name = i;
                objects[name] = obj[i];
                totalItems += obj[i].length;
            }
            pos += 1;
            next();
        });
    }
}


function init() {

    next();
    
    interval = setInterval(tick, 20);
}

function tick(){
    var l = 0;
    for (var i in objects){
        l+=1;
    }
    if (l == dbs.length && !sent){
        console.log("sending " + totalItems + ' items to dynamodb');
        for (var i in objects){
            for (var o = 0; o < objects[i].length;o++){
                var params = {
                    TableName: i,
                    Item: objects[i][o]
                }
                docClient.put(params, function(err, data2) {
                    if (err) {
                        console.error("Unable to send item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("Send item succeeded:", JSON.stringify(data2, null, 2));
                        num += 1;
                    }
                });
            }
        }
        sent = true;
    }

    if (num == totalItems && sent){
        console.log('');
        console.log("Dynamo Export Completed!");
        clearInterval(interval);
    }
}

init();



