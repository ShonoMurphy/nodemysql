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


//Customer pages
app.get('/customer/', (req, res) => {
    res.redirect('/customer/index')
});
app.get('/customer/index', (req, res) => {
    res.sendFile(__dirname + "/customer/Index.html");
});



app.get('/customer/newcustomer', (req, res) => {
    res.sendFile(__dirname + "/customer/newcustomer.html")
});
app.post('/customer/newcustomer', (req, res) => {
    let iname = req.body["name"];
    let iemail = req.body["email"];
    let iadress = req.body["adress"];
    
    //Validate the input, we only accept alphanumeric symbols besides @ and ., and must contain something, otherwise the user can input funky stuff... D:
    var patt = /^[a-zA-Z0-9@., ]+$/;
    if (!patt.test(iname) || !patt.test(iemail) || !patt.test(iadress))
    {
        console.log("Uh oh!")
        //We found something else that we didn't want, so we let the user know and tell them to fix it.
        res.send("Invalid input, please make sure your input only contains @, . or alphanumeric symbols.");
        return;
    }

    let sql = `INSERT INTO customer (customer_name, email, address) VALUES ('${iname}', '${iemail}', '${iadress}')`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(`Success! ${iname} has been added to the userlist.`)
    });
});

// edit customers information


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






//this should probably be about the same as newcustomer, with only the input, regex and table being different
app.get('/customer/newproduct', (req, res) => {
    res.sendFile(__dirname + "/customer/newproduct.html")
});
app.post('/customer/newproduct', (req, res) => {
    let iname = req.body["name"];
    let isku = req.body["sku"];
    let iprice = req.body["price"];
    iprice = Number(iprice.replace(",", "."));

    var patt = /^[a-zA-Z0-9 ]+$/; //only numbers and letters
    var iskupatt = /^[a-zA-Z0-9 -]+$/; //only numbers and letters
    var numpatt = /^[0-9. ]+$/; //only numbers or .
    if (!patt.test(iname) || !iskupatt.test(isku))
    {
        res.send("Invalid name or sku, please make sure your input only contains alphanumeric symbols.");
        return;
    }
    else if (!numpatt)
    {
        res.send("Invalid price, please only enter a numeric price.")
    }

    let sql = `INSERT INTO product (product_name, sku, unit_price) VALUES ('${iname}', '${isku}', '${iprice}')`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send(`Success! ${iname} has been added to the userlist.`)
    });
});

app.get('/customer/listcustomer', (req, res) => {
    res.sendFile(__dirname + "/customer/listcustomer.html")
});


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

//Test pages

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

