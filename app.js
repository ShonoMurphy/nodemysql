const express = require('express');
const mysql = require('mysql');
const WebSocket = require('ws');

// Create connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'phpmyadmin',
    password : 'root',
    database : 'felixdb'
});

// Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...')
});

process.on('uncaughtException', err => {
    console.error('There was an uncaught error, aaaaa =(:', err)
    process.exit(1) //mandatory (as per the Node.js docs)
});

function catchException(error, req, res)
{
    console.error('error caught: ', error);
    res.send('An error has occurred :(');
}

const app = express();

//middleware for parsing http requests
var bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

//package so people can request our apis without hell
var cors = require('cors');


const server = new WebSocket.Server({
    port: 8080
});

let sockets = [];
server.on('connection', function(socket) {
    sockets.push(socket);

    socket.on('message', function(msg) {
        sockets.forEach(s => s.send(msg));
    });

    socket.on('close', function() {
        sockets = sockets.filter(s => s !== socket);
    });
});

/*Client test
let clients = [
    new WebSocket('ws://localhost:8080'),
    new WebSocket('ws://localhost:8080')
];

clients.map(client => {
    client.on('message', msg => console.log(msg));
});
async function test () {
await new Promise(resolve => clients[0].once('open', resolve))
clients[0].send('Test');
}
test();*/

module.exports = { app, db, catchException}

const customer = require('./customer/customer.js').customer;
customer();

const testpages = require('./testpages.js').testpages;
testpages();

// Create DB
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE felixdb';
    db.query(sql, (err, result) => {
        if (err) { catchException(err, req, res); return; }
        console.log(result);
        res.send('database created...');
    });
});

app.get('/', (req, res) => {
    res.redirect("/index");
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + "/index.html")
});

app.get('/chat/', (req, res) => {
    res.sendFile(__dirname + "/chat.html");
});

app.get('/colorpage/', (req, res) => {
    res.sendFile(__dirname + "/Colors.html");
});

//color api
app.get('/colors/:name?', cors(), (req, res) => {
    //get all the colors from the db
    let sql = 'SELECT * FROM colors'
    db.query(sql, (err, result) => {
        if (err) { catchException(err, req, res); return; }
        
        //if the user entered a color name
        if (req.params.name)
        {
            //filter through all the colors to get the ones whose name contains the entered name
            var filteredres = new Array();
            result.forEach(color => {
                colorname = color.name.toLowerCase();
                if (colorname.includes(req.params.name))
                {
                    filteredres.push(color);
                }
            });
            
            //send this filtered list
            res.send(filteredres);
        }
        
        //otherwise just send everything
        else res.send(result);
    });
});

app.get('/createcolorstable', (req, res) => {
    let sql = 'CREATE TABLE colors(name VARCHAR(50), rgb VARCHAR(50), hsv VARCHAR(50), hex VARCHAR(12))';
    db.query(sql, (err, result) => {
        if (err) { catchException(err, req, res); return; }
        console.log(result);
        res.send('Color table created...');
    });
});


app.get('/get/recipes/:id?', cors(), (req, res) => {
    let sql = `SELECT id, recipe_name, prep_time, portion_size FROM recipes`;
    let id = Number(req.params.id);
    let idgiven;
    
    if (id != null && id != undefined && id != "" && !isNaN(id) && id >= 0) {
        sql = `SELECT * FROM recipes WHERE id = ${req.params.id}`;
        idgiven = true;
    }

    db.query(sql, (err, result) => {
        if (err) { catchException(err, req, res); return; }
        if (idgiven) { res.send(result[0]); return; }
        res.send(result);
    });
});

app.post('/post/recipes/', cors(), (req, res) => {
    let rname = "";
    let rpreptime = "";
    let rportsize = "";

    if (req.headers['recipe_name'])
    {
        rname = req.headers['recipe_name'];
        rpreptime = req.headers['prep_time'];
        rportsize = req.headers['portion_size'];
    }
    else if (req.body['recipe_name'])
    {
        rname = req.body['recipe_name'];
        rpreptime = req.body['prep_time'];
        rportsize = req.body['portion_size'];
    }
    else { res.sendStatus(400); return;}

    preptime = Number(rpreptime);
    if (isNaN(preptime) || preptime <= 0 || rname.includes("')") || rportsize.includes("')")) { res.sendStatus(400); return }

    let sql = `INSERT INTO recipes (recipe_name, prep_time, portion_size) VALUES ('${rname}', '${rpreptime}', '${rportsize}')`
    db.query(sql, (err, result) => {
        if (err) { catchException(err, req, res); return; }
        res.sendStatus(200);
    });
});

app.listen('3000', () => {
    console.log('Server started on port 3000');
});

