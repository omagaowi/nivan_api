const express = require('express');
const { processTransaction, verifyTransaction } = require('./payment')
const crypto = require("crypto");
var cors = require("cors");
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')

require("dotenv").config();

const { connectToDb, getDb } = require("./db2");
const fs = require('fs')

const api_key = process.env.NIVAN_API_KEY;
const jwt_secret = process.env.JWT_SECRET;
const dbURI = process.env.DATABASE_URL;
const paystackAPI = process.env.PAYSTACK_SECRET;


const { activateIntermdiateBot } = require('./bots/intermediate');
const { error } = require('console');
const { json } = require('body-parser');
// const { activateExclusiveBot } = require("./bots/exclusive");
// const { activeProfitableBot } = require("./bots/profitable");
// const { activateSignalsBot } = require("./bots/signals");


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
    //  activateIntermdiateBot();
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
               processTransaction(planCode, decode.data? decode.data.email : decode.email, paystackAPI, ({ result, err }) => {
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
                      const fillingData = (memberID) => {
                        db.collection("users")
                          .findOne({
                            memberId: memberID,
                          })
                          .then((user) => { 
                            if (user) {
                               db.collection("subcriptions")
                                 .findOne({
                                   payment_ref: paymentRef,
                                 })
                                 .then((trans) => {
                                   if (trans) {
                                     res.json({
                                       status: true,
                                       data: {
                                         transaction: result.data,
                                         plan: thisPlan,
                                       },
                                     });
                                   } else {
                                     db.collection("subcriptions")
                                       .insertOne({
                                         sub_id: Date.now(),
                                         memberId: memberID,
                                         planCode: thisPlan.planCode,
                                         plan: thisPlan.plan,
                                         payment_ref: paymentRef,
                                         telegram: decode.data? decode.data.telegram : decode.telegram,
                                         valid: true,
                                         type: thisPlan.type,
                                       })
                                       .then(() => {
                                         res.json({
                                           status: true,
                                           data: {
                                            transaction: result.data,
                                            plan: thisPlan
                                           }
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
                            } else {
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
                      fillingData(memberID);
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


