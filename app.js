const express = require('express');
const mysql = require('mysql');

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

const app = express();

//middleware for parsing http requests
var bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

module.exports = { app, db }

const customer = require('./customer/customer.js').customer;
customer();

const testpages = require('./testpages.js').testpages;
testpages();

// Create DB
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE felixdb';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('database created...');
    });
});

app.get('get/recipes', (req, res) => {
    let sql = 'SELECT * FROM recipes'
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.get('/get/recipes/:id', (req, res) => {
    let sql = `SELECT * FROM recipes WHERE id = ${req.params.id}`;
    console.log(req.params.id)
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

app.get('/', (req, res) => {
    res.redirect("/index");
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + "/index.html")
});


app.get('/colorpage/', (req, res) => {
    res.sendFile(__dirname + "/Colors.html");
});

//color api
app.get('/colors/:name?', (req, res) => {
    //get all the colors from the db
    let sql = 'SELECT * FROM colors'
    db.query(sql, (err, result) => {
        if (err) throw err;
        
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
        if (err) throw err;
        console.log(result);
        res.send('Color table created...');
    });
});


app.listen('3000', () => {
    console.log('Server started on port 3000');
});

