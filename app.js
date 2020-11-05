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




// Standard GETs

// Select table
app.get('/get/:table', (req, res) => {
    let sql = `SELECT * FROM ${req.params.table}`;
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        res.send(results);
    });
});

// Select single post
app.get('/get/:table/:id', (req, res) => {
    let sql = `SELECT * FROM ${req.params.table} WHERE ${req.params.table}id = ${req.params.id}`;
    let query = db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result);
    });
});


// Select posts
app.get('/getposts', (req, res) => {
    let sql = 'SELECT * FROM posts';
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        console.log(results);
        res.send('Posts fetched');
    });
});

// Select single post
app.get('/getpost/:id', (req, res) => {
    let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        res.send(results);
    });
});

// Update post
app.get('/updatepost/:id/', (req, res) => {
    let newTitle = 'Updated Title';
    let sql = `UPDATE posts SET title = '${newTitle}'  WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        res.send('Post updated...');
    });
});

// Delete post
app.get('/deletepost/:id/', (req, res) => {
    let sql = `DELETE FROM posts WHERE id = ${req.params.id}`;
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        res.send('Post deleted...');
    });
});


app.listen('3000', () => {
    console.log('Server started on port 3000');
});

