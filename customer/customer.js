const app = require('../app.js').app;
const db = require('../app.js').db;
const fs = require('fs');
const { send } = require('process');

module.exports = {customer};


function customer()
{
    //Customer pages
    app.get('/customer/', (req, res) => {
    res.redirect('/customer/index')
    });
    app.get('/customer/index', (req, res) => {
        res.sendFile(__dirname + "/Index.html");
    });



    app.get('/customer/newcustomer', (req, res) => {
        res.sendFile(__dirname + "/newcustomer.html")
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
    
    app.get('/customer/neworder', (req, res) =>
    {
        let sql = `SELECT * FROM customer`;
        db.query(sql, (err, result) =>
        {
            if (err) throw err;
            
            fs.readFile(__dirname + '/neworder.html', 'utf-8', (err, data) => 
            {
                if (err) throw err;
                
                var options = "";
                result.forEach(customer => {
                    var name = customer.customer_name;
                    options += `<option value="${name}">${name}</option>\n`;
                });
                
                data = data.replace('$CUSTOMER', options)
                res.send(data)
            });
        });
    });
    //======================================================================================================================================//
    //protocol for adding a new order into the db
    app.post('/customer/neworder', (req, res) => {
        let icname = req.body['customer'];
        let idate = req.body['date'];
        let iid = req.body['id'];

        let sql = `INSERT INTO felixdb.order (order_number, customerID, order_date)
        VALUES (${iid}, (SELECT customerID FROM customer WHERE customer_name='${icname}'), '${idate}');`
        
        db.query(sql, (err, result) => {
            //Error handling in case the user entered an id that is already there
            if(err) {
                if (err.sqlMessage.includes('Duplicate entry')) res.send(`Duplicate entry '${iid}' for order number.`);
                else res.send('Error') //if it was an unrelated error, send a generic result instead
                return;
            }

            //The row insertion was a success, so we redirect the user to the order's page
            res.redirect(`/customer/order/${result.insertId}`);
        })
    });
    
    //page for listing the info of an order
    app.get('/customer/order/:id/', (req, res) => {
        let iid = req.params["id"];
        let id = parseInt(iid);

        //if the user manually entered something that isn't an id, we dont want to go through it
        if (!Number.isInteger(id))
        {
            res.redirect('/customer');
            return;
        }

        //Get the info of not only the order, but the customer of that order as well
        let sql = `SELECT o.order_number, o.order_date, c.customer_name, c.email, c.address
                    FROM felixdb.order o
                    INNER JOIN felixdb.customer c ON o.customerID=c.customerID
                    WHERE o.orderID = ${id}`;

        db.query(sql, (err, result) => {
            if (err) throw err;

            fs.readFile(__dirname + '/orderpage.html', 'utf-8', (err, data) => 
            {
                if (err) throw err;
                order = result[0]; //we should only get one result because id is unique, but we still get the sql result in an array

                //Replace some values in the page's javascript
                data = data.replace('$CUSTOMERNAME', order.customer_name);
                data = data.replace('$CUSTOMERMAIL', order.email)
                data = data.replace('$CUSTOMERADDRESS', order.address)
                data = data.replace('$ORDERNUMBER', order.order_number)
                data = data.replace('$ORDERDATE', order.order_date)
                data = data.replace('$ORDERID', id)
                //send the prepared html file
                res.send(data)
            });
        });
    });

    //get all order items based on the order id
    app.get('/get/orderitem/:id/', (req, res) => {
        let iid = req.params["id"];
        let id = parseInt(iid);
        if (!Number.isInteger(id))
        {
            send('ERROR')
            return;
        }

        let sql = `SELECT p.product_name, o.quantity, o.orderitemID
                   FROM order_item o
                   INNER JOIN product p ON o.productID=p.productID
                   WHERE o.orderID = ${id}`
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });

    //get all products
    app.post('get/product', (req, res) => {
        let sql = 'SELECT * FROM product'
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.send(result);
        });
    });

    //add an order item
    app.post('/customer/addorderitem', (req, res) => {
        let product = req.body['product'];
        let quantity = req.body['quantity'];
        let orderid = req.body['orderid']

        
        let sql = `INSERT INTO order_item (orderID, productID, quantity)
                   VALUES (${orderid}, (SELECT productID FROM product WHERE product_name='${product}'), ${quantity})`;
        
        db.query(sql, (err, result) => {
            if(err) throw err
            res.redirect(`/customer/order/${orderid}`)
        })
    });

    //delete an order item
    app.delete('/customer/deleteorderitem/:id', (req, res) => {
        let id = req.params['id'];

        let sql = `DELETE FROM order_item WHERE order_item.orderitemID = ${id}`
        db.query(sql, (err, result) => {
            if(err) throw err
            res.sendStatus(200);
        })
    })

    //========================================================================================================================================//
    // edit customers information




    //this should probably be about the same as newcustomer, with only the input, regex and table being different
    app.get('/customer/newproduct', (req, res) => {
        res.sendFile(__dirname + "/newproduct.html")
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
            res.send(`Success! ${iname} has been added to the product list.`)
        });
    });

    app.get('/customer/listcustomer', (req, res) => {
        res.sendFile(__dirname + "/listcustomer.html")
    });

}

// edit customers information

app.get('/customer/editcustomer', (req, res) => {
    res.sendFile(__dirname + "/editcustomer.html")
});

app.put('/put/customer/:id/', (req, res) => {
    let newName = req.headers["customer_name"];
    let newEmail = req.headers["email"];
    let newAddress = req.headers["address"];
    let sql = `UPDATE customer SET customer_name = '${newName}', email = '${newEmail}', address = '${newAddress}'  WHERE customerID = ${req.params.id}`;
    let query = db.query(sql, (err, results) => {
        if(err) throw err;
        console.log('Post updated...');
    });
});