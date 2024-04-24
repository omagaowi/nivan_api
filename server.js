const express = require('express');
const { processTransaction, verifyTransaction } = require('./payment')
const crypto = require("crypto");
var cors = require("cors");
const cookieParser = require('cookie-parser')

const { version } = require('process');
const { connectToDb, getDb } = require("./db2");

//bots

const { activateIntermdiateBot } = require('./bots/intermediate')
// const { activateExclusiveBot } = require("./bots/exclusive");
// const { activeProfitableBot } = require("./bots/profitable");
// const { activateSignalsBot } = require("./bots/signals");


const plans = [
  {
    planCode: "PLN_cu7k3ly30mwip4g",
    plan: "Intermediate Mentorship",
    notes: [
      `This subscription will give you access to NivanFx <b>Intermediate Mentorship Programme</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+UjLezAMIxPZiMDRk`,
  },
  {
    planCode: "PLN_cu7k3ly30mwip4g",
    plan: "Profitable Trader",
    notes: [
      `This subscription will give you access to NivanFx <b>Profitable Trader Mentorship Programme</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+2rsnSiPVauBjYjk8`,
  },
  {
    planCode: "PLN_cu7k3ly30mwip4g",
    plan: "Exclusive Mentorship",
    notes: [
      `This subscription will give you access to NivanFx <b>Exclusive Mentorship Programme</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+nDTp_I6cjTRiNDNk`,
  },
  {
    planCode: "PLN_cu7k3ly30mwip4g",
    plan: "Premium Signals",
    notes: [
      `This subscription will give you access to NivanFx <b>Premuim Signals Service</b>`,
      `Make sure the telegarm username @omagaowi you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+jqQphEmZeiZlOWFk`,
  },
];

const app = express()

let db;
connectToDb((err) => {
  if (!err) {
    db = getDb();
    console.log("connected to database");
    //  activateIntermdiateBot();
    app.listen(3000);
  } else {
    console.log(err);
  }
});


app.use(express.static('static'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(cors());


app.get('/redirect/payment/:plan', (req, res)=>{
    res.sendFile(__dirname + '/static/auth.html')
})

app.post('/submit/payment/:plan', (req, res)=>{
    const planCode = req.params.plan
    const body = req.body
    console.log(body)
    res.cookie('name', body.name)
     res.cookie("email", body.email);
      res.cookie("phone", body.phone);
       res.cookie("telegram", body.telegram);
       res.cookie('country', body.country)
    console.log('trurr')
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



// // Using Express
// app.post("/nivan_fx/webhook/url", function (req, res) {
//   //validate event
//   const hash = crypto
//     .createHmac("sha512", "sk_live_3fe7ff54122f79596e91bdaea73372a09fab1e27")
//     .update(JSON.stringify(req.body))
//     .digest("hex");
//   if (hash == req.headers["x-paystack-signature"]) {
//     // Retrieve the request's body
//     const event = req.body;
//     if(event.data.status == 'success'){
//         const plan = event.data.plan.plan_code
//         const ref = event.data.reference
//         // res.cookie('planId', plan)
//         // res.cookie('ref', ref)
//         // res.redirect('/payment/verify')
//     }
//   }
// });

app.get('/test', (req, res)=>{
    allUsers(({status, data})=>{
        if(status){
            res.json(data)
        }else{
            res.send('error')
        }
    })
})

app.get('/payment/verify', (req, res)=>{
    res.sendFile(__dirname + '/static/verify.html')
})

app.get('/verify/:ref', (req, res)=>{
    const paymentRef = req.params.ref
    verifyTransaction(paymentRef, ({result, err})=>{
        if(!err){
            if(result.status){
                const thisPlan = plans.filter(function(el){ return el.planCode == result.data.plan})[0]
                const fillingData = (memberID) =>{
                      db.collection("users")
                        .findOne({
                          memberId: memberID,
                        })
                        .then((user) => {
                          if (user) {
                            console.log("user already exists");
                            const userID = Number(
                              Date.now()
                                .toString()
                                .split("")
                                .splice(5, 5)
                                .join("")
                            );
                            fillingData(userID);
                          } else {
                            db.collection("users")
                              .insertOne({
                                memberId: memberID,
                                full_name: req.cookies.name,
                                email: req.cookies.email,
                                phone: req.cookies.phone,
                                country: req.cookies.country,
                                telegram: req.cookies.telegram,
                              })
                              .then(() => {
                                console.log("user seccessfully added");
                                db.collection("subcriptions")
                                  .findOne({
                                    payment_ref: paymentRef,
                                  })
                                  .then((trans) => {
                                    if (trans) {
                                      console.log(
                                        "subcription already verified"
                                      );
                                      res.json({
                                        status: true,
                                        data: result.data,
                                      });
                                    } else {
                                      db.collection("subcriptions")
                                        .insertOne({
                                          sub_id: Date.now(),
                                          memberId: memberID,
                                          planCode: thisPlan.planCode,
                                          plan: thisPlan.plan,
                                          payment_ref: paymentRef,
                                          telegram: req.cookies.telegram,
                                          valid: true,
                                        })
                                        .then(() => {
                                          console.log(
                                            "subscription successully added and verified"
                                          );
                                          res.json({
                                            status: true,
                                            data: result.data,
                                          });
                                        })
                                        .catch((err) => {
                                          res.json({
                                            status: false,
                                            data: "Án Error Occured",
                                          });
                                        });
                                    }
                                  })
                                  .catch((err) => {
                                    res.json({
                                      status: false,
                                      data: "Án Error Occured",
                                    });
                                  });
                              });
                          }
                        }).catch((err) => {
                          res.json({
                            status: false,
                            data: "Án Error Occured",
                          });
                        });
                }
                 const userID = Number(Date.now().toString().split("").splice(5, 5).join(''));
                 fillingData(userID);
            }else{
                 res.json({
                   status: false,
                   data: "Án Error Occured",
                 });
            }
        }else{
            res.json({
              status: false,
              data: 'Án Error Occured',
            });
        }
    })
})


app.post('/joinnewsletter', (req, res)=>{
  const email = req.body.email
  db.collection("NLwaitlist").findOne({
    email: email
  }).then((data)=>{
    if(data){
        res.json({
          status: true,
          data: "You have previously joined the Waitlist.",
        });
    }else{
      db.collection("NLwaitlist")
        .insertOne({
          email: email,
        })
        .then(() => {
          res.json({
            status: true,
            data: "You have Successfully joined the Waitlist.",
          });
        })
        .catch((err) => {
          res.json({
            status: false,
            data: "Án Error Occured",
          });
        });
    }
  }).catch((err)=>{
     res.json({
       status: false,
       data: "Án Error Occured",
     });
  })
})

