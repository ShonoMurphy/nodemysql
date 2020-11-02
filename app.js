const express = require('express');
const mysql = require('mysql');

// Create connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'nodemysql'
});

// Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...')
});

const app = express();

// Create DB
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodemysql';
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

// Vraag 'Hallo' op
app.get('/hallo', (req, res) => {
    res.send("Hallo");
});

// Return a full html page
app.get('/test', (req, res) => {
    res.sendFile(__dirname + "/TestPage.html");
});

// Page to test xmlhttprequest on
app.get('/httptest', (req, res) => {
    res.sendFile(__dirname + "/HttpTest.html");
})

app.get('/xmladdnum/:id', (req, res) => {
    var resp = parseInt(req.params.id) + 1;
    res.send(resp.toString());
})

// POST request test page
app.get('/posttest', (req, res) => {
    res.sendFile(__dirname + "/PostTest.html");
});

app.post('/posttest', (req, res) => {
    let iname = req.headers["name"];
    let itext = req.headers["text"];
    let output = `${iname};\n\r"${itext}"`;
    res.send(output);
})

// Create table
app.get('/createpoststable', (req, res) => {
    let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Posts table created...');
    });
});

// Insert post 1
app.get('/addpost1', (req, res) => {
    let post = {title:'Post One', body:'This is post number one'};
    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post 1 added...');
    });
});

// Insert post 2
app.get('/addpost2', (req, res) => {
    let post = {title:'Post Two', body:'This is post number two'};
    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Post 2 added...');
    });
});

app.get("/addpost3", (req, res) => {
    let qtitle = req.query["title"];
    let qbody = req.query["body"];

    let post = {title: qtitle, body: qbody};
    let sql = "INSERT INTO posts SET ?";
    let query = db.query(sql, post, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send(`Post '${qtitle}' added...`);
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

//thierry