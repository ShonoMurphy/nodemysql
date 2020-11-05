const express = require('express');
const mysql = require('mysql');
const app = express();

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

// Create customer table
app.get('/createcustomertable', (req, res) => {
    let sql = "CREATE TABLE `customer`(`customerID` int NOT NULL AUTO_INCREMENT,`customer_name` varchar(40) NOT NULL,`email` varchar(40) NULL,`address` varchar(100) NOT NULL,PRIMARY KEY (`customerID`),UNIQUE KEY `AK1_customer_customerName` (`customer_name`)) AUTO_INCREMENT=1;";
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Customer table created...');
    });
});

// Create product table
app.get('/createproducttable', (req, res) => {
    let sql = "CREATE TABLE `product`(`productID` int NOT NULL AUTO_INCREMENT,`product_name` varchar(50) NOT NULL,`sku` varchar(50) NULL,`unit_price` decimal(12,2) NOT NULL,PRIMARY KEY (`productID`),UNIQUE KEY `AK1_product_SupplierID_productName`(`product_name`)) AUTO_INCREMENT=1;";
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Product table created...');
    });
});

// Create order table
app.get('/createordertable', (req, res) => {
    let sql = "CREATE TABLE `order`(`orderID` int NOT NULL AUTO_INCREMENT,`order_number` varchar(10) NULL,`customerID` int NOT NULL,`order_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY (`orderID`),UNIQUE KEY `AK1_order_orderNumber` (`order_number`),KEY `FK_order_customerID_customer` (`customerID`),CONSTRAINT `FK_order_customerID_customer` FOREIGN KEY `FK_order_customerID_customer` (`customerID`) REFERENCES `customer` (`customerID`)) AUTO_INCREMENT=1;";
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Order table created...');
    });
});

// Create order_item table
app.get('/createorder_itemtable', (req, res) => {
    let sql = "CREATE TABLE `order_item`(`orderID`   int NOT NULL,`productID` int NOT NULL,`quantity` int NOT NULL,PRIMARY KEY (`orderID`, `productID`),KEY `FK_order_item_orderID_order` (`orderID`),CONSTRAINT `FK_order_item_orderID_order` FOREIGN KEY `FK_order_item_orderID_order` (`orderID`) REFERENCES `order` (`orderID`),KEY `FK_order_item_productID_product` (`productID`),CONSTRAINT `FK_order_item_productID_product` FOREIGN KEY `FK_order_item_productID_product` (`productID`) REFERENCES `product` (`productID`));";
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Order Item table created...');
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

// Delete post
app.get('/delete/:table/:id/', (req, res) => {
    let sql = `DELETE FROM ${req.params.table} WHERE ${req.params.table}id = ${req.params.id}`;
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        res.send('Post deleted...');
    });
});

// Listen on port 3000
app.listen('3000', () => {
    console.log('Server started on port 3000');
});