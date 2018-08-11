var fs = require('fs'),
    AWS = require("aws-sdk");

var dbs = ['blaine_attacks','blaine_pkmn','blaine_userdata'];
var pos = 0;
var objects = {};
var num = 0;
var numl = dbs.length;
var interval;
var written = false;

AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});


function next(){

    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    if (pos < dbs.length){
        dbName = dbs[pos];
        console.log("Getting data from DB: " + dbName);
        docClient.scan({TableName: dbName}, function(err, data) {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Data received");
                var d = {};
                d[dbName] = [];
                for (var i = 0; i < data.Items.length;i++){
                    d[dbName].push(data.Items[i]);
                }
                objects[dbName] = d;
                pos += 1;
                next();
            }
        });
    }
}

function objToDynamoJSON(obj){
    var newObj = {};
    for (var i in obj){
        //martial each value
        if (obj[i] === null){
            newObj[i] = {'NULL': true};
        }else{
            switch(typeof obj[i]){
                case 'number':
                    newObj[i] = {'N': obj[i]};
                    break;
                case 'string':
                    newObj[i] = {'S': obj[i]};
                    break;
                case 'boolean':
                    newObj[i] = {'BOOL': obj[i]};
                    break;
                case 'object':
                    if (obj[i].constructor == Array){
                        //array object L,NS,SS
                        //make sure it isnt empty and add
                        if (obj[i].length == 0){
                            break;
                        }else if(typeof obj[i][0] == 'object'){
                            var arr = [];
                            for (var j = 0; j < obj[i].length;j++){
                                arr.push(objToDynamoJSON(obj[i][j]))
                            }
                            newObj[i] = {'L': arr};
                        }else if(typeof obj[i][0] == 'number'){
                            newObj[i] = {'NS': obj[i]};
                        }else if(typeof obj[i][0] == 'string'){
                            newObj[i] = {'SS': obj[i]};
                        }
                    }else{
                        //regular object = M
                        //make sure it isnt empty and add
                        var l = 0;
                        for (var j in obj[i]){
                            l+=1;
                        }
                        if (l > 0){
                            newObj[i] = {'M': objToDynamoJSON(obj[i])};
                        }
                    }
                    break;
            }
        }
    }
    return newObj;
}

function init() {

    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    next();
    
    interval = setInterval(tick, 20);
}

function tick(){
    var l = 0;
    for (var i in objects){
        l+=1;
    }
    if (l == dbs.length && !written){
        for (var i = 0; i < dbs.length;i++){

            fs.writeFile (dbs[i] + ".json", JSON.stringify(objects[dbs[i]],null,2), function(err) {
                if (err) throw err;
                console.log('complete');
                num += 1;
            });
        }
        written = true;
    }

    if (num == numl){
        console.log('');
        console.log("Dynamo Export Completed!");
        clearInterval(interval);
    }
}

init();



