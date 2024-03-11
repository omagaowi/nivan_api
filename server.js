const express = require('express');
const { processTransaction } = require('./payment')
const crypto = require("crypto");


const app = express()

app.use(express.static('static'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/redirect/payment/:plan', (req, res)=>{
    res.sendFile(__dirname + '/static/auth.html')
})

app.post('/submit/payment/:plan', (req, res)=>{
    const planCode = req.params.plan
    const body = req.body
    processTransaction(planCode, body.email, ({result, err})=>{
        if(!err){
            if(result.status){
                const responseData = result.data
                res.json({
                    status: true,
                    data: responseData
                })
            }else{
              res.json({
                status: false,
                data: 'an error occured',
              });
            }
        }else{
              res.json({
                status: false,
                data: "an error occured",
              });
        }
    })
})

// Using Express
app.post("/nivan_fx/webhook/url", function (req, res) {
  //validate event
  const hash = crypto
    .createHmac("sha512", "sk_live_3fe7ff54122f79596e91bdaea73372a09fab1e27")
    .update(JSON.stringify(req.body))
    .digest("hex");
  if (hash == req.headers["x-paystack-signature"]) {
    // Retrieve the request's body
    const event = req.body;
    console.log(event)
    console.log('api')
    // Do something with event
  }
  res.send(200);
});

app.get('/hh', (req, res)=>{
    console.log('hhh')
    res.send('hh')
})

app.listen(3000, (err)=>{
    if(!err){
        console.log('server is running at 3000')
    }else{
        console.log('ERROR STARTING SERVER')
        console.log(err)
    }
})