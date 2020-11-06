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

module.exports = { app, db }

const customer = require('./customer/customer.js').customer;
customer();

const testpages = require('./testpages.js').testpages;
testpages();

//middleware for parsing http requests
var bodyparser = require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Create DB
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE felixdb';
    db.query(sql, (err, result) => {
        if(err) throw err;
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



db.connect(function(err) {
    //if (err) throw err;
    //Select all customers and return the result object:
    db.query("SELECT * FROM customer", function (err, result) {
      if (err) throw err;
      console.log(result);
    });
});

getData = () => { 
    return new Promise((resolve, reject)=>{ 
        db.query('SELECT * FROM names',(err, rows)=>{ resolve(rows);})
    })
}
app.get('/abc',(req,res)=>{ getData().then((results)=>{let html = '';for(let x in results)html+= results[x].kapitein+"<br>"; res.end(html)})});


app.get('/colorpage/', (req, res) => {
    res.sendFile(__dirname + "/Colors.html");
});
app.get('/colors/:name?', (req, res) => {
    let sql = 'SELECT * FROM colors'
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (req.params.name)
        {
            var filteredres = new Array();
            result.forEach(color => {
                colorname = color.name.toLowerCase();
                if (colorname.includes(req.params.name))
                {
                    filteredres.push(color);
                }
            });
            res.send(filteredres);
        }
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

