const sqlite = require('sqlite3')

let sql
const db = new sqlite.Database("./app.db", sqlite.OPEN_READWRITE)

const createTable = () => {
    sql = `CREATE TABLE users(member_id, full_name, email, phone, country, telegram)`;
    // sql = `CREATE TABLE subsciptions(sub_id, member_id, planCode, plan, payment_ref, telegram, valid)`;
    db.run(sql, (err)=>{
        if(err){
            console.log(err)
        }else{
            console.log('TABLE CREATED')
        }
    })
}


const createUser = (values, callback) => {
    sql = `INSERT INTO users(member_id, full_name, email, phone, country, telegram) VALUES(?,?,?,?,?,?)`;
    let res
    db.run(sql, values, (err)=>{
        if(!err){
            res = {
              status: true,
              data: values[0],
            };
        }else{
              res = {
                status: false,
                data: "Error Creating User",
              };
              console.log(err)
        }
        callback(res)
    })
}


const allUsers = (callback) => {
    sql = `SELECT * FROM users`
    let res
    db.all(sql, [], (err, rows)=>{
        if(!err){
            res = {
                status: true,
                data: rows
            }
        }else{
            res = {
              status: false,
              data: 'An Error Occured!',
            };
        }
        callback(res)
    })
}

const findUserWithEmail = (email, callback) => {
    sql = `SELECT * FROM users where email =?`;
    let res
    db.all(sql, email, (err, rows)=>{
        if(!err){
            res = {
                status: true,
                data: rows
            }
        }else{
            res = {
                status: false,
                data: 'An Error Occured'
            }
        }
        callback(res)
    })
}

const findUserWithId = (id, callback) => {
  sql = `SELECT * FROM users where member_id =?`;
  let res;
  db.all(sql, id, (err, rows) => {
    if (!err) {
      res = {
        status: true,
        data: rows,
      };
    } else {
      res = {
        status: false,
        data: "An Error Occured",
      };
    }
    callback(res)
  });
};



//SUBCRIPTIONS QUERIES

const newSubcription = (values, callback) => {
  sql = `INSERT INTO subsciptions(sub_id, member_id, planCode, plan, payment_ref, telegram, valid) VALUES(?,?,?,?,?,?,?)`;
  let res;
  db.run(sql, values, (err) => {
    if (!err) {
      res = {
        status: true,
        data: values[0],
      };
    } else {
      res = {
        status: false,
        data: "Error adding subscription",
      };
    }
    callback(res);
  });
};

const allSubsciptions = (callback) => {
  sql = `SELECT * FROM subsciptions`;
  let res;
  db.all(sql, [], (err, rows) => {
    if (!err) {
      res = {
        status: true,
        data: rows,
      };
    } else {
      res = {
        status: false,
        data: "An Error Occured!",
      };
    }
    callback(res);
  });
};


const getSubscriptionWithUser = (user, callback) => {
    sql = `SELECT * FROM subsciptions where member_id =?`;
    let res;
    db.all(sql, user, (err, rows) => {
      if (!err) {
        res = {
          status: true,
          data: rows,
        };
      } else {
        res = {
          status: false,
          data: "An Error Occured",
        };
      }
      callback(res);
    });
}

const getSubscriptionWithId = (id, callback) => {
  sql = `SELECT * FROM subsciptions where sub_id =?`;
  let res;
  db.all(sql, id, (err, rows) => {
    if (!err) {
      res = {
        status: true,
        data: rows,
      };
    } else {
      res = {
        status: false,
        data: "An Error Occured",
      };
    }
    callback(res);
  });
};

const getSubscriptionWithRef = (ref, callback) => {
     sql = `SELECT * FROM subsciptions where payment_ref =?`;
     let res;
     db.all(sql, ref, (err, rows) => {
       if (!err) {
         res = {
           status: true,
           data: rows,
         };
       } else {
         res = {
           status: false,
           data: "An Error Occured",
         };
       }
       callback(res);
     });
}

module.exports = { createUser,findUserWithEmail, findUserWithId, allUsers, newSubcription, getSubscriptionWithId, getSubscriptionWithUser, allSubsciptions, getSubscriptionWithRef }

// createUser([1234556, 'Omaga David' , 'omagaowi@gmail.com', '+2349028009750', 'country', 'omagaowi'], ({status, msg})=>{
//     if(status){
//         console.log('sucesss:' + msg)
//     }
// });

// newSubcription([1234556, 'PLN_57w84734' , 'Intermediate Mentorship', 'sdfefef3', 'omagaowi'], ({status, data})=>{
//     if(status){
//         console.log(data)
//     }
// });

// createTable()

// allSubsciptions(({status, data})=>{
//     console.log(data)
// })

// findUserWithId(1234556, ({ status, data }) => {
//   console.log(data);
// });

// getSubscriptionWithRef("7ttoydmt1q", ({status, data})=>{
//     console.log(data[0])
// });