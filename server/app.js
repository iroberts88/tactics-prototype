var app = require('http').createServer(webResponse),
    fs = require('fs'),
    mongo = require('mongodb').MongoClient,
    io = require('socket.io').listen(app),
    GameEngine = require('./gameengine.js').GameEngine,
    RequireCheck = require('./requirecheck.js').RequireCheck;
    
var rc = null,
    ge = null;

function init() {
    rc = new RequireCheck();
    ge = new GameEngine();
    rc.onReady(onReady);
    io.settings.log = false; //enable node logging
    // ----------------------------------------------------------
    // Start Database Connection
    // ----------------------------------------------------------
    var url = 'mongodb://127.0.0.1/wisp';
    rc.ready();
    //TODO -- update to a new database
    rc.require('dbHighScores','dbUsers');

    // Use connect method to connect to the DB
    mongo.connect(url, function(err, db) {
        console.log("Connected to db");
        console.log("DB errors: " + err);
        
        // ---- Load HighScores ----
        var HSColl = db.collection('highScores');
        HSColl.find().toArray(function(err, arr) {
            ge.loadHighScores(arr);
            rc.ready('dbHighScores');
        });

        // ---- Load Userbase ----
        var usersColl = db.collection('users');
        usersColl.find().toArray(function(err, arr) {
            ge.loadUsers(arr);
            rc.ready('dbUsers');
        });
        db.close();
    });
}

init();



// ----------------------------------------------------------
// Start Web Server
// ----------------------------------------------------------
app.listen(8087);

function webResponse(req, res) {
    var filename = req.url;

    // Check for default
    if (filename == '/') {
        filename = '/index.html';
    }

    //console.log('HTTP Request: ' + filename);

    fs.readFile(__dirname + '/..' + filename, function(err, data) {
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


