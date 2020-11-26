const express = require('express');
const mysql = require('mysql');
const WebSocket = require('ws');
const fs = require('fs');
var cookieParser = require('cookie-parser')

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

function catchException(error, req = null, res = null)
{
    console.error('error caught: ', error);
    if (res)
    {
        res.send('An error has occurred :(');
    }
}

const app = express();

app.use(cookieParser())

//middleware for parsing http requests
var bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

//package so people can request our apis without hell
var cors = require('cors');
const { query } = require('express');


const server = new WebSocket.Server({
    port: 8080
});

let sockets = [];
server.on('connection', function(socket) {
    sockets.push(socket);

    socket.on('message', function(msg) {
        data = JSON.parse(msg);

        if (data.mtype == 'chatjoined')
        {
            let sql = `SELECT nickname, color FROM user WHERE name = '${data.user}'`;
            db.query(sql, (err, result) => {
                if (err) { catchException(err); return; }
                if (result[0] == undefined) { sockets.filter(s => s !== socket); return;}

                let user = { 'name': result[0].nickname, 'color': result[0].color }
                let mtype = 'chatjoined';

                let reply = JSON.stringify({user, mtype})
                sockets.forEach(s => s.send(reply));
            });
        }
        
        else if (data.mtype == 'chat') {
            let sql = `SELECT nickname, color FROM user WHERE name = '${data.user}'`;
            db.query(sql, (err, result) => {
                if (err) { catchException(err); return; }
                if (result[0] == undefined) { sockets.filter(s => s !== socket); return;}

                let user = { 'name': result[0].nickname, 'color': result[0].color }
                let message = data.message;
                let mtype = 'chat';
                
                let reply = JSON.stringify({ message, user, mtype });
                sockets.forEach(s => s.send(reply));
            });
        }
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


function validateCredentials(sql, user, pass)
{
    return new Promise((resolve, reject) => {
        db.query(sql, [user], (err, result) => {
            if (err) { catchException(err, req, res); reject(); return; }
            
            data = result[0];
            if (data == undefined) { reject(); return;}

            if (user.toLowerCase() == data.name.toLowerCase() && pass == data.password) resolve()
            else reject();
        })
    })
}


app.get('/createchatusertable1029384756', (req, res) => {
    let sql = 'CREATE TABLE user ( `name` VARCHAR(30) NOT NULL , `id` INT NOT NULL AUTO_INCREMENT , `password` VARCHAR(4) NOT NULL , `nickname` VARCHAR(30) NOT NULL , `color` VARCHAR(7) NOT NULL , PRIMARY KEY (`id`), UNIQUE (`name`));';
    db.query(sql, (err, result) => {
        if (err) {catchException(err, req, res); return};
        res.send('User table created...');
    });
});

app.get('/chat', (req, res) => {
    if (!req.cookies['user']) { res.redirect("/chatlogin"); return; }
    let iname = req.cookies['user']
    let ipass = req.cookies['password']

    validateCredentials(`SELECT name, password FROM user WHERE name=?`, iname, ipass).then(
        function () {
            res.cookie('user', iname, { maxAge: 900000 });//, httpOnly: true });
            res.cookie('password', ipass, { maxAge: 900000 });//, httpOnly: true });
            res.sendFile(__dirname + '/chat.html')
        },
        function () {
            console.log('Invalid user...YEET!')
            res.cookie('user', null, {maxAge: 0});
            res.cookie('password', null, {maxAge: 0});
            res.redirect("/chatlogin");
        }
    )
});

app.get('/chatlogin', (req, res) => {
    if (req.cookies['user']) { res.redirect("/chat"); return; }
    res.sendFile(__dirname + "/chatlogin.html")
});

app.post('/chatlogin', (req, res) => {
    let iname = req.body["username"];
    let ipass = req.body["password"];

    validateCredentials(`SELECT name, password FROM user WHERE name = '${iname}'`, iname, ipass).then(
        function () {
            res.cookie('user', iname, { maxAge: 900000 });//, httpOnly: true });
            res.cookie('password', ipass, { maxAge: 900000 });//, httpOnly: true });
            res.redirect('/chat')
        },
        function () {
            console.log('Invalid login attempt');
            res.redirect('/chatlogin');
        }
    )
});

app.get('/chatlogout', (req, res) => {
    res.cookie('user', null, {maxAge: 0});
    res.cookie('password', null, {maxAge: 0});
    res.redirect("/chatlogin");
});

app.post('/chatregister', (req, res) => {
    let iname = req.body["username"];
    let ipass = req.body["password"];
    let icol = req.body["color"];

    var numpatt = /^[0-9]+$/;
        if (!numpatt.test(ipass))
        {
            res.send("Invalid password.");
            return;
        }

    let sql = `INSERT INTO user (name, password, color, nickname) VALUES ('${iname}', ${ipass}, '${icol}', '${iname}');`;
    db.query(sql, (err, result) => {
        if (err) { catchException(err, req, res); return; }
        res.cookie('user', iname, { maxAge: 900000 });
        res.cookie('password', ipass, { maxAge: 900000 });
        res.redirect('/chat')
    });
});

app.get('/chatprofile', (req, res) => {
    if (!req.cookies['user']) { res.redirect("/chatlogin"); return; }
    let iname = req.cookies['user']
    let ipass = req.cookies['password']

    validateCredentials(`SELECT name, password FROM user WHERE name=?`, iname, ipass).then(
        function () {
            res.cookie('user', iname, { maxAge: 900000 });//, httpOnly: true });
            res.cookie('password', ipass, { maxAge: 900000 });//, httpOnly: true });

            sql = `SELECT nickname, color FROM user WHERE name =?`;

            db.query(sql, [iname], (err, result) => {
                if (err) { catchException(err, req, res); return; }

                fs.readFile(__dirname + '/chatprofile.html', 'utf-8', (err, data) => {
                    if (err) { catchException(err, req, res); return; }
                    userdata = result[0]; //we should only get one result because id is unique, but we still get the sql result in an array

                    //Replace some values in the page's javascript
                    data = data.replace('$USERNICKNAME', userdata.nickname);
                    data = data.replace('$USERCOLOR', userdata.color)

                    //send the prepared html file
                    res.send(data)
                });
            });
        },
        function () {
            console.log('Invalid user...YEET!')
            res.cookie('user', null, {maxAge: 0});
            res.cookie('password', null, {maxAge: 0});
            res.redirect("/chatlogin");
        }
    )
});

app.post('/chatprofile', (req, res) => {
    let iname = req.cookies['user']
    let ipass = req.cookies['password']
    let icol = req.body["color"];
    let inick = req.body["nickname"];

    validateCredentials(`SELECT name, password FROM user WHERE name = '${iname}'`, iname, ipass).then(
        function () {
            res.cookie('user', iname, { maxAge: 900000 });//, httpOnly: true });
            res.cookie('password', ipass, { maxAge: 900000 });//, httpOnly: true });
            
            sql1 = 'UPDATE user SET nickname=? WHERE user.name = ?;';
            db.query(sql1, [inick, iname], (err, result1) => {
                if (err) { catchException(err, req, res); return; }

                sql2 = 'UPDATE user SET color=? WHERE user.name = ?;';
                db.query(sql2, [icol, iname], (err, result2) => {
                    if (err) { catchException(err, req, res); return; }

                    res.redirect('/chat')
                });
            });
        },
        function () {
            console.log('Invalid login attempt');
            res.redirect('/chatlogin');
        }
    )
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

app.get('/numberguessgame', (req, res) => {
    res.sendFile(__dirname + "/NGG.html")
});

app.listen('3000', () => {
    console.log('Server started on port 3000');
});

