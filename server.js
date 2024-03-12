const express = require('express');
const { processTransaction, verifyTransaction } = require('./payment')
const crypto = require("crypto");
var cors = require("cors");
const cookieParser = require('cookie-parser')

const { createUser, newSubcription, findUserWithId, getSubscriptionWithRef } = require('./db');
const { version } = require('process');

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
    telegram: `https://t.me/+gITCdV7SMzAzNDg0`,
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
    telegram: `https://t.me/+gITCdV7SMzAzNDg0`,
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
    telegram: `https://t.me/+gITCdV7SMzAzNDg0`,
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
    telegram: `https://t.me/+gITCdV7SMzAzNDg0`,
  },
];

const app = express()

app.use(express.static('static'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(cors())

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
                     findUserWithId(memberID, ({ status, data }) => {
                       if (status) {
                         if (data.length > 0) {
                           console.log("user already exists");
                           const userID = Number(Date.now().toString().split("").splice(5, 5).join(''));
                           fillingData(userID)
                         } else {
                           createUser(
                             [
                               memberID,
                               req.cookies.name,
                               req.cookies.email,
                               req.cookies.phone,
                               req.cookies.country,
                               req.cookies.telegram,
                             ],
                             (createData) => {
                               if (createData.status) {
                                getSubscriptionWithRef("7ttoydmt1q", (veRef)=>{
                                    if(veRef.status){
                                        if(veRef.data.length > 0){
                                            console.log('transaction already validated')
                                             res.json({
                                               status: true,
                                               data: result.data,
                                             });
                                        }else{
                                             newSubcription(
                                               [
                                                 Date.now(),
                                                 createData.data, //memberId
                                                 thisPlan.planCode,
                                                 thisPlan.plan,
                                                 paymentRef,
                                                 req.cookies.telegram,
                                                 true,
                                               ],
                                               (subData) => {
                                                 if (subData.status) {
                                                   console.log(
                                                     "verification complete"
                                                   );
                                                   res.json({
                                                     status: true,
                                                     data: result.data,
                                                   });
                                                 } else {
                                                   res.json({
                                                     status: false,
                                                     data: subData.data,
                                                   });
                                                 }
                                               }
                                             );
                                        }
                                    }else{
                                        res.json({
                                          status: false,
                                          data: veRef.data,
                                        });
                                    }
                                });
                               } else {
                                 res.json({
                                   status: false,
                                   data: createData.data,
                                 });
                               }
                             }
                           );
                         }
                       } else {
                         res.json({
                           status: false,
                           data: data,
                         });
                       }
                     });
                }

                 const userID = Number(Date.now().toString().split("").splice(5, 5).join(''));
                 fillingData(userID)
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




app.listen(3000, (err)=>{
    if(!err){
        console.log('server is running at 3000')
        activateIntermdiateBot()
        // // activateIntermdiateBot()
        // // activateExclusiveBot()
        // // activateSignalsBot()
    }else{
        console.log('ERROR STARTING SERVER')
        console.log(err)
    }
})