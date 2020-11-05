const app = require('../app.js').app;
const db = require('../app.js').db;
const fs = require('fs');

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
    
    app.post('/customer/neworder', (req, res) => {
        res.send("Not implemented")//Add code for the new order submit button here
    });
    
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
            res.send(`Success! ${iname} has been added to the userlist.`)
        });
    });

    app.get('/customer/listcustomer', (req, res) => {
        res.sendFile(__dirname + "/listcustomer.html")
    });

}
