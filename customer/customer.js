const app = require('../app.js').app;
const db = require('../app.js').db;
const fs = require('fs');

module.exports = {customer};


function customer()
{
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
        //Add code for the new order submit button here
    });
}
