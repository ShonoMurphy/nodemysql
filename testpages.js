const app = require('./app.js').app;
const db = require('./app.js').db;

function testpages() {

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
            if (err) throw err;
            console.log(result);
            res.send('Posts table created...');
        });
    });

    // Insert post 1
    app.get('/addpost1', (req, res) => {
        let post = { title: 'Post One', body: 'This is post number one' };
        let sql = 'INSERT INTO posts SET ?';
        let query = db.query(sql, post, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.send('Post 1 added...');
        });
    });

    // Insert post 2
    app.get('/addpost2', (req, res) => {
        let post = { title: 'Post Two', body: 'This is post number two' };
        let sql = 'INSERT INTO posts SET ?';
        let query = db.query(sql, post, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.send('Post 2 added...');
        });
    });

    app.get("/addpost3", (req, res) => {
        let qtitle = req.query["title"];
        let qbody = req.query["body"];

        let post = { title: qtitle, body: qbody };
        let sql = "INSERT INTO posts SET ?";
        let query = db.query(sql, post, (err, result) => {
            if (err) throw err;
            console.log(result);
            res.send(`Post '${qtitle}' added...`);
        });
    });
}

module.exports = { testpages };