var app = require('http').createServer(webResponse),
    fs = require('fs'),
    AWS = require("aws-sdk"),
    io = require('socket.io').listen(app),
    GameEngine = require('./gameengine.js').GameEngine,
    RequireCheck = require('./requirecheck.js').RequireCheck;


const crypto = require('crypto');
    
var rc = null,
    ge = null;


//{endpoint: "https://dynamodb.us-west-1.amazonaws.com"}
AWS.config.update({
  region: "us-east-1",
  endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});


function init() {

    var docClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

    rc = new RequireCheck();
    ge = new GameEngine();

    rc.onReady(onReady);

    // ----------------------------------------------------------
    // Start Database Connection
    // ----------------------------------------------------------

    rc.ready();
    rc.require('dbMaps','dbUsers','dbItems','dbBuffs','dbClasses');

    // ---- Load Maps ----
    fs.readFile('./db/tactics_maps.json', "utf8",function read(err, data) {
        if (err) {
            throw err;
        }
        var obj = JSON.parse(data);

        ge.loadMaps(obj.items);
        rc.ready('dbMaps');
    });
    // ---- Load Items ----
    fs.readFile('./db/tactics_items.json', "utf8",function read(err, data) {
        if (err) {
            throw err;
        }
        var obj = JSON.parse(data);

        ge.loadItems(obj.items);
        rc.ready('dbItems');
    });
    // ---- Load Buffs ----
    fs.readFile('./db/tactics_buffs.json', "utf8",function read(err, data) {
        if (err) {
            throw err;
        }
        var obj = JSON.parse(data);

        ge.loadBuffs(obj.items);
        rc.ready('dbBuffs');
    });

    // ---- Load Classes ----
    fs.readFile('./db/tactics_classes.json', "utf8",function read(err, data) {
        if (err) {
            throw err;
        }
        var obj = JSON.parse(data);

        ge.loadClasses(obj.items);
        rc.ready('dbClasses');
    });

    // ---- Load Userbase ----
    docClient.scan({TableName: 'users'}, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Loading users... " + data.Items.length + ' found');
            ge.loadUsers(data.Items);
            rc.ready('dbUsers');
        }
    });

}
init();



// ----------------------------------------------------------
// Start Web Server
// ----------------------------------------------------------
var port = process.env.PORT || 3000;
app.listen(port);

function webResponse(req, res) {
    var filename = req.url;

    // Check for default
    if (filename == '/') {
        filename = '/index.html';
    }

    //console.log('HTTP Request: ' + filename);

    fs.readFile(__dirname + '/public' + filename, function(err, data) {
        if (err) {
            console.log('Couldn\'t find file: ' + req.url);
            res.writeHead(500);
            res.end('Couldn\'t find file: ' + req.url)
        }

        res.writeHead(200);
        res.end(data);
    });
}

function onReady() {
    console.log('All require items loaded. Starting Game Engine');
    ge.init();
}


// TO DO: Need to keep track of sockets with ids
// ----------------------------------------------------------
// Start Socket Listener
// ----------------------------------------------------------
io.sockets.on('connection', ge.newConnection);

console.log('Listening');


