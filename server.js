const express = require('express');
const { processTransaction, verifyTransaction } = require('./payment')
const crypto = require("crypto");
var cors = require("cors");
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

require("dotenv").config();

const { connectToDb, getDb } = require("./db2");
const { paymentSuccessTemmp } = require('./emailTemps/paymentSucess')
const fs = require('fs')

const api_key = process.env.NIVAN_API_KEY;
const jwt_secret = process.env.JWT_SECRET;
const dbURI = process.env.DATABASE_URL;
const paystackAPI = process.env.PAYSTACK_SECRET;


const { activateIntermdiateBot } = require('./bots/intermediate');
const { error } = require('console');
const { json } = require('body-parser');
const { type } = require('os');
const runDiscordBot = require('./bots/discordBot');



const plans = [
  {
    planCode: "PLN_cu7k3ly30mwip4g",
    plan: "Intermediate Mentorship",
    type: "mentorship",
    notes: [
      `This subscription will give you access to NivanFx <b>Intermediate Mentorship Programme</b>`,
      `Make sure the telegarm username you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+UjLezAMIxPZiMDRk`,
  },
  {
    planCode: "PLN_w9fggz2ezfe44u9",
    plan: "Profitable Trader",
    type: "mentorship",
    notes: [
      `This subscription will give you access to NivanFx <b>Profitable Trader Mentorship Programme</b>`,
      `Make sure the telegarm username you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX here.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+2rsnSiPVauBjYjk8`,
  },
  {
    planCode: "PLN_omp4zkk597lbobe",
    plan: "Exclusive Mentorship",
    type: "mentorship",
    notes: [
      `This subscription will give you access to NivanFx <b>Exclusive Mentorship Programme</b>`,
      `Make sure the telegarm username  you previously entered is your correct telegram.`,
      `Incase of any errors with the above, find out how to change your telegarm username and manage your data and subscription with nivanFX <a>here<a/>.`,
      `It is important to join the telegram platform to get full access to this service. link below!!`,
    ],
    telegram: `https://t.me/+nDTp_I6cjTRiNDNk`,
  },
  {
    planCode: "PLN_d87553b9gq8mhde",
    plan: "Premium Signals",
    type: "signal",
    notes: [
      `This subscription will give you access to NivanFx <b>Premuim Signals Service</b>`,
      `Make sure the telegarm username you previously entered is your correct telegram.`,
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
    
     activateIntermdiateBot(db);
    // runDiscordBot(db)
    app.listen(4000);
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

app.get('/submit/payment/:plan', async (req, res)=>{
    const Authorization = req.headers.authorization;

    const currentTime = Math.floor(Date.now() / 1000);
    const x_api_key = req.headers.x_api_key;
    const planCode = req.params.plan
    if (x_api_key == api_key) {
    try {
      if (Authorization) {
        const reqToken = Authorization.split(" ")[1];
        const decode = await jwt.decode(reqToken, jwt_secret);
        if (decode) {
          if (decode.exp > currentTime) {
               const transactionID = Date.now()
               processTransaction(planCode, decode.data? { ...decode.data, transactionID: transactionID } : decode, paystackAPI, ({ result, err }) => {
                 if (result) {
                   if (result.status) {
                     const responseData = result.data;
                     res.json({
                       status: true,
                       data: responseData,
                     });
                   } else {
                    console.log(result, err)
                     res.json({
                       status: false,
                       msg: "an error occured",
                     });
                   }
                 } else {
                    console.log(result, err);
                   res.json({
                     status: false,
                     msg: "an error occured",
                   });
                 }
               });
          } else {
            res.status(500).json({
              status: false,
              msg: "Invalid Token",
            });
          }
        } else {
          res.status(500).json({
            status: false,
            msg: "Invalid Token",
          });
        }
      } else {
        res.status(500).json({
          status: false,
          msg: "Invalid Token",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        msg: "Invalid Token",
      });
    }
  } else {
    res.status(500).json({
      status: false,
      msg: "invalid api key",
    });
  }
})



// // Using Express
app.post("/nivan_fx/webhook/url", function (req, res) {
  //validate event
   const event = req.body;
  if(event.event == 'subscription.create'){
    const email = event.data.customer.email
    const subcription_code = event.data.subscription_code
    const authorization_code = event.data.authorization.authorization_code
    const next_date = event.data.next_payment_date
    // const createdAt = event.data.createdAt
    const planCode = event.data.plan.plan_code
    const plan = plans.filter(function(el){
      return el.planCode == planCode
    })[0].plan
    const card_details = {
      brand: event.data.authorization.brand,
      last4: event.data.authorization.last4,
    };
    db.collection("subscriptions").deleteMany({
      email: email,
      type: plans.filter(function(el){
      return el.planCode == planCode
    })[0].type,
      authorization_code: { $ne: authorization_code },
    }).then(()=>{
      console.log('delete success')
       db.collection("subscriptions")
         .findOne({ authorization_code: authorization_code })
         .then((data) => {
           if (data) {
             db.collection("subscriptions")
               .updateOne(
                 { authorization_code: authorization_code },
                 {
                   $set: {
                     subcription_code: subcription_code,
                     next_date: next_date,
                     email: email,
                     authorization_code: authorization_code,
                     card_name: `${card_details.brand} ${card_details.last4}`,
                     planCode: planCode,
                     plan: plan,
                     status: "renew",
                   },
                 }
               )
               .then((data) => {
                 console.log("sub edited");
               })
               .catch((err) => {
                 console.log("sub edited error");
               });
           } else {
             const subscription = {
               email: email,
               memberId: false,
               planCode: planCode,
               plan: plan,
               payment_ref: false,
               telegram: false,
               valid: true,
               type: plans.filter(function (el) {
                 return el.planCode == planCode;
               })[0].type,
               authorization_code: authorization_code,
               createdAt: false,
               next_date: next_date,
               card_name: `${card_details.brand} ${card_details.last4}`,
               subcription_code: subcription_code,
               last_paid: false,
               discord: false,
               status: "renew",
             };
             db.collection("subscriptions")
               .insertOne(subscription)
               .then((data) => {
                 console.log("sub added");
               })
               .catch((err) => {
                 console.log("sub added error");
               });
           }
         })
         .catch((err) => {
           console.log("sub find error");
         });
    }).catch((err)=>{
      console.log('delete err')
    })
  }else if(event.event == 'charge.success'){
     const reference = event.data.reference
     const authorization_code = event.data.authorization.authorization_code;
     const email = event.data.customer.email;
     const createdAt = event.data.created_at;
     const last_paid = event.data.paidAt
     const planCode = event.data.plan.plan_code;
     const amount = event.data.amount
     const plan = plans.filter(function (el) {
       return el.planCode == planCode;
     })[0].plan;
     const card_details = {
       brand: event.data.authorization.brand,
       last4: event.data.authorization.last4,
     };
     const emailData = {
      reference: reference,
      authorization_code: authorization_code,
      email: email,
      createdAt: createdAt,
      last_paid: last_paid,
      plan: plan,
      planCode: planCode,
      card_details: card_details,
      amount: amount
     }
    //  paymentSuccessTemmp(emailData)
    //  sendMail(paymentSuccessTemmp(emailData), emailData).then(()=>{
    //     console.log('email sent ')
    //  }).catch((err)=>{
    //     console.log("email error ");
    //  })
     const telegram = event.data.metadata.telegram;
     const discord = event.data.metadata.discord;
     const memberId = event.data.metadata.memberId;
     db.collection("subscriptions").deleteMany({
      email: email,
      type: plans.filter(function(el){
      return el.planCode == planCode
    })[0].type,
      authorization_code: { $ne: authorization_code },
    }).then(()=>{
      console.log('delete success')
       db.collection("subscriptions")
         .findOne({ authorization_code: authorization_code })
         .then((data) => {
           if (data) {
             db.collection("subscriptions")
               .updateOne(
                 { authorization_code: authorization_code },
                 {
                   $set: {
                     email: email,
                     authorization_code: authorization_code,
                     card_name: `${card_details.brand} ${card_details.last4}`,
                     last_paid: last_paid,
                     payment_ref: reference,
                     createdAt: createdAt,
                     planCode: planCode,
                     plan: plan,
                     telegram: telegram,
                     memberId: memberId,
                     discord: discord,
                     status: "renew",
                   },
                 }
               )
               .then((data) => {
                 console.log("sub edited charge");
               })
               .catch((err) => {
                 console.log("sub edited charge error");
               });
           } else {
             const subscription = {
               email: email,
               memberId: memberId,
               planCode: planCode,
               plan: plan,
               payment_ref: reference,
               telegram: telegram,
               valid: true,
               type: plans.filter(function (el) {
                 return el.planCode == planCode;
               })[0].type,
               authorization_code: authorization_code,
               createdAt: false,
               next_date: next_date,
               card_name: `${card_details.brand} ${card_details.last4}`,
               subcription_code: false,
               last_paid: last_paid,
               discord: discord,
               status: "renew",
             };
             db.collection("subscriptions")
               .insertOne(subscription)
               .then((data) => {
                 console.log("sub added charge");
               })
               .catch((err) => {
                 console.log("sub added charge error ");
               });
           }
         })
         .catch((err) => {
           console.log("sub find charge error ");
         });
    }).catch((err)=>{
      console.log('delete err')
    })

  }else if(event.event == 'subscription.disable'){
    const subcription_code = event.data.subscription_code;
    const card_details = {
        brand: event.data.authorization.brand,
        last4: event.data.authorization.last4,
    };
    db.collection("subscriptions").findOne({ subcription_code: subcription_code }).then((data)=>{
      if(data){
        db.collection("subscriptions").updateOne({ subcription_code: subcription_code }, { $set: {
           valid: false,
           status: 'not_renew',
           card_name: `${card_details.brand} ${card_details.last4}`
        }}).then((data)=>{
          console.log('sub failed update')
        }).catch((err)=>{
          console.log("sub failed update error");
        })
      }else{
        console.log('sub not found')
      }
    }).catch(err => {
      console.log('sub disable error')
    });
  }else if(event.event == 'subscription.not_renew'){
    const subcription_code = event.data.subscription_code;
    const amount = event.data.amount
    const date = Date.now()
    const card_details = {
      brand: event.data.authorization.brand,
      last4: event.data.authorization.last4,
    };
    db.collection("subscriptions").findOne({ subcription_code: subcription_code }).then((data)=>{
      if(data){
        db.collection("subscriptions").updateOne({ subcription_code: subcription_code }, { $set: {
           valid: true,
           status: 'not_renew'
        }}).then((data)=>{
          console.log('sub failed update')
        }).catch((err)=>{
          console.log("sub failed update error");
        })
      }else{
        console.log('sub not found')
      }
    }).catch(err => {
      console.log('sub disable error')
    });
  }else if(event.event == 'invoice.payment_failed'){
     const subcription_code = event.data.subscription.subscription_code;
      const card_details = {
        brand: event.data.authorization.brand,
        last4: event.data.authorization.last4,
      };
      const amount = event.data.amount;
      const date = Date.now();
     db.collection("subscriptions").findOne({ subcription_code: subcription_code }).then((data)=>{
      if(data){
        db.collection("subscriptions").updateOne({ subcription_code: subcription_code }, { $set: {
           valid: false,
           status: 'not_renew',
           card_name: `${card_details.brand} ${card_details.last4}`
        }}).then((data)=>{
          console.log('sub ivoice failed update')
        }).catch((err)=>{
          console.log("sub ivoice failed update error");
        })
      }else{
        console.log("sub ivoice not found");
      }
    }).catch(err => {
      console.log("sub ivoice disable error");
    });
  }
});

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

app.post('/auth/signup', (req, res)=>{
  const body = req.body
  const x_api_key = req.headers.x_api_key
  if(x_api_key == api_key){  
    db.collection('users').findOne({email: body.email}).then((data)=>{
      if(data){
         res.status(500).json({
           msg: "error creating user",
           data: false
         });
      }else{
        const memberID = Date.now()
         db.collection("users")
           .insertOne({
             memberId: memberID,
             ...body,
           })
           .then(() => {

             const token = jwt.sign({...body, memberID: memberID}, jwt_secret, {expiresIn: '30d'})
             res.status(200).json({
               msg: "use created",
               data: {
                  ...body,
                  memberID: memberID,
                  token: token
               }
             });
           })
           .catch((err) => {
             res.status(500).json({
               msg: "database error",
             });
           });
      }
    }).catch(err =>{
      res.status(500).json({
        msg: "database error",
      });
    })
  }else{
    res.status(500).json({
      msg: 'invalid api key'
    })
  }
})

app.post('/auth/login', (req, res)=>{
  const email = req.body.email
  const x_api_key = req.headers.x_api_key
  if(x_api_key == api_key){
      db.collection('users').findOne({ email: email }).then((data) => {
    if(data){
       const token = jwt.sign({data}, jwt_secret, {expiresIn: '30d'})
      res.json({
        status: true,
        data: {
          ...data,
          token: token
        }
      })
    }else{
      res.json({
        status: false,
        data: 'user not found'
      })
    }
  }).catch((err) => {
    res.status(500).json({
      msg: 'error connecting to db'
    })
  })
  }else{
    res.status(500).json({
      msg: "invalid api key",
    });
  }
})


app.post('/auth/user', (req, res)=>{
  const email = req.body.email
  db.collection('users').findOne({ email: email }).then((data) => {
    console.log(data)
    if(data){
      res.json({
        status: true,
        data: data
      })
    }else{
      res.json({
        status: false,
        data: false
      })
    }
  }).catch((err) => {
    res.status(500).json({
      msg: 'error connecting to db'
    })
    console.log(err)
  })
})

const getUserSubscriptions = async (userID, callback) => {
  let mentorships = []
  let signals = []
  db.collection('subscriptions').find().forEach(element => {
    if(element.type == 'mentorship'){
      mentorships.push(element)
    }
    if(element.type == 'signal'){
      signals.push(element)
    }
  }).then(() => {
    const data = {
      signals: signals.filter(function (el) {
        return el.memberId == userID && el.valid;
      })[0],
      mentorship: mentorships.filter(function (el) {
        return el.memberId == userID && el.valid;
      })[0],
    };
     callback({
       data: data,
       err: false,
     });
  }).catch((err) => {
      callback({
        data: false,
        err: err,
      });
  })
}

app.get('/auth/user/data', async (req, res)=>{
  const Authorization = req.headers.authorization;
   const currentTime = Math.floor(Date.now() / 1000);
  const x_api_key = req.headers.x_api_key;
  if (x_api_key == api_key) {
    try {
      if (Authorization) {
        const reqToken = Authorization.split(" ")[1];
        const decode = await jwt.decode(reqToken, jwt_secret);
        if (decode) {
          if (decode.exp > currentTime) {
            res.json({
              status: true,
              data: decode.data ? decode.data : decode
            })
          } else {
            res.status(500).json({
              status: false,
              msg: "Invalid Token",
            });
          }
        } else {
          res.status(500).json({
            status: false,
            msg: "Invalid Token",
          });
        }
      } else {
        res.status(500).json({
          status: false,
          msg: "Invalid Token",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        msg: "Invalid Token",
      });
    }
  } else {
    res.status(500).json({
      status: false,
      msg: "invalid api key",
    });
  }
})

app.put('/auth/user/data/edit', async (req, res) => {
   const Authorization = req.headers.authorization;
   const currentTime = Math.floor(Date.now() / 1000);
   const x_api_key = req.headers.x_api_key;
   const updates = req.body
   if (x_api_key == api_key) {
     try {
       if (Authorization) {
          const reqToken = Authorization.split(" ")[1];
         const decode = await jwt.decode(reqToken, jwt_secret);
         if (decode) {
           if (decode.exp > currentTime) {
            db.collection('users').updateOne({memberId: updates.memberId}, {$set: updates}).then((data)=>{
              db.collection("users")
                .findOne({ memberId: updates.memberId })
                .then((data) => {
                  if (data) {
                    const token = jwt.sign({data}, jwt_secret, {expiresIn: '30d'})
                    res.json({
                      status: true,
                      data: data,
                      token: token,
                    });
                  } else {
                    res.status(500).json({
                      status: false,
                      msg: "error connecting to db",
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).json({
                    status: false,
                    msg: "error connecting to db",
                  });
                  console.log(err);
                });
            }).catch((err) => {
              res.status(500).json({
                status: false,
                msg: "database error",
              });
            })
           } else {
             res.status(500).json({
               status: false,
               msg: "Invalid Token",
             });
           }
         } else {
           res.status(500).json({
             status: false,
             msg: "Invalid Token",
           });
         }
       } else {
         res.status(500).json({
           status: false,
           msg: "Invalid Token",
         });
       }
     } catch (err) {
       res.status(500).json({
         status: false,
         msg: "Invalid Token",
       });
     }
   } else {
     res.status(500).json({
       status: false,
       msg: "invalid api key",
     });
   }
})

app.get('/auth/user/subcriptions', async (req, res)=> {
  const Authorization = req.headers.authorization;
   const currentTime = Math.floor(Date.now() / 1000);
   const x_api_key = req.headers.x_api_key
   if(x_api_key == api_key){
    try {
      if (Authorization) {
        const reqToken = Authorization.split(" ")[1];
        const decode = await jwt.decode(reqToken, jwt_secret);
        if (decode) {
          if (decode.exp > currentTime) {
            getUserSubscriptions(decode.data? decode.data.memberId : decode.memberId, ({data, err}) => {
              if(data){
                res.json({
                  status: true,
                  data: data
                })
              }else{
                 res.status(500).json({
                   status: false,
                   msg: "An Error Occured",
                 });
              }
            }) 
             
          } else {
            res.status(500).json({
              status: false,
              msg: "Invalid Token",
            });
          }
        } else {
          res.status(500).json({
            status: false,
            msg: "Invalid Token",
          });
        }
      } else {
        res.status(500).json({
          status: false,
          msg: "Invalid Token",
        });
      }
    } catch (err) {
      res.status(500).json({
        status: false,
        msg: "Invalid Token",
      });
    }
   }else{
    res.status(500).json({
      status: false,
      msg: 'invalid api key'
    })
   }
})



app.get('/getCountryCode', (req, res)=>{
  fs.readFile(__dirname + "/static/CountryCodes.json", "utf-8", (err, data) => {
    if (err) {
    } else {
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData)
        // console.log(cards)
      } catch (parseError) {
        console.log(parseError);
      }
    }
  });
})

app.get('/verify/:ref', async (req, res)=>{
    const paymentRef = req.params.ref
    const Authorization = req.headers.authorization;
    const currentTime = Math.floor(Date.now() / 1000);
    const x_api_key = req.headers.x_api_key;
    if (x_api_key == api_key) {
      try {
        if (Authorization) {
          const reqToken = Authorization.split(" ")[1];
          const decode = await jwt.decode(reqToken, jwt_secret);
          if (decode) {
            if (decode.exp > currentTime) {
                const memberID = decode.data? decode.data.memberId : decode.memberId
                verifyTransaction(paymentRef, paystackAPI, ({ result, err }) => {
                  if (!err) {
                    if (result.status) {
                      const thisPlan = plans.filter(function (el) {
                        return el.planCode == result.data.plan;
                      })[0];
                      const fillingData = (memberID, result) => {
                        
                         const reference = result.data.reference;
                         const authorization_code =
                           result.data.authorization.authorization_code;
                         const email = result.data.customer.email;
                         const createdAt = result.data.created_at;
                         const last_paid = result.data.paid_at;
                         const planCode = result.data.plan;
                         console.log(planCode)
                         const plan = plans.filter(function (el) {
                           return el.planCode == planCode;
                         })[0].plan;
                         const card_details = {
                           brand: result.data.authorization.brand,
                           last4: result.data.authorization.last4,
                         };
                         const telegram = result.data.metadata.telegram;
                         const discord = result.data.metadata.discord;
                        db.collection("users")
                          .findOne({
                            memberId: memberID,
                          })
                          .then((user) => { 
                            if (user) {
                              db.collection("subscriptions")
                                .deleteMany({
                                  email: email,
                                  type: plans.filter(function (el) {
                                    return el.planCode == planCode;
                                  })[0].type,
                                  authorization_code: {
                                    $ne: authorization_code,
                                  },
                                })
                                .then(() => {
                                  console.log("delete success");
                                  db.collection("subcriptions")
                                    .findOne({
                                      authorization_code: authorization_code,
                                    })
                                    .then((trans) => {
                                      if (trans) {
                                        db.collection("subscriptions")
                                          .updateOne(
                                            {
                                              authorization_code:
                                                authorization_code,
                                            },
                                            {
                                              $set: {
                                                email: email,
                                                authorization_code:
                                                  authorization_code,
                                                payment_ref: reference,
                                                createdAt: createdAt,
                                                last_paid: last_paid,
                                                discord: discord,
                                                telegram: telegram,
                                                memberId: memberID,
                                                card_name: `${card_details.brand} ${card_details.last4}`,
                                                planCode: planCode,
                                                plan: plan,
                                              },
                                            }
                                          )
                                          .then((data) => {
                                            res.json({
                                              status: true,
                                              data: {
                                                transaction: result.data,
                                                plan: thisPlan,
                                              },
                                            });
                                            console.log("sub edited");
                                          })
                                          .catch((err) => {
                                            console.log("sub edited error");
                                          });
                                      } else {
                                        const subscription = {
                                          email: email,
                                          memberId: memberID,
                                          planCode: planCode,
                                          plan: plan,
                                          payment_ref: reference,
                                          telegram: telegram,
                                          valid: true,
                                          type: plans.filter(function (el) {
                                            return el.planCode == planCode;
                                          })[0].type,
                                          authorization_code:
                                            authorization_code,
                                          createdAt: createdAt,
                                          next_date: false,
                                          card_name: `${card_details.brand} ${card_details.last4}`,
                                          subcription_code: false,
                                          last_paid: last_paid,
                                          discord: discord,
                                          status: "renew",
                                        };
                                        db.collection("subcriptions")
                                          .insertOne(subscription)
                                          .then(() => {
                                            res.json({
                                              status: true,
                                              data: {
                                                transaction: result.data,
                                                plan: thisPlan,
                                              },
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
                                })
                                .catch((err) => {
                                  console.log("delete err");
                                });
                            } else {
                              console.log('444')
                              res.status(500).json({
                                status: false,
                                msg: "Invalid Token",
                              });
                            }
                          })
                          .catch((err) => {
                            res.json({
                              status: false,
                              data: "Án Error Occured",
                            });
                          });
                      };
                      fillingData(memberID, result);
                    } else {
                      res.json({
                        status: false,
                        data: "Án Error Occured",
                      });
                    }
                  } else {
                    res.json({
                      status: false,
                      data: "Án Error Occured",
                    });
                  }
                });
            } else {
              console.log("4445");
              res.status(500).json({
                
                status: false,
                msg: "Invalid Token",
              });
            }
          } else {
            console.log('4446')
            res.status(500).json({
              status: false,
              msg: "Invalid Token",
            });
          }
        } else {
          console.log("4447");
          res.status(500).json({
            status: false,
            msg: "Invalid Token",
          });
        }
      } catch (err) {
        console.log("4448");
        res.status(500).json({
          status: false,
          msg: "Invalid Token",
        });
      }
    } else {
      console.log("4449");
      res.status(500).json({
        status: false,
        msg: "invalid api key",
      });
    }
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


