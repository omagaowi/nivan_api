const { MongoClient } = require("mongodb");

require("dotenv").config();

const dbURI = process.env.DATABASE_URL;

let dbConnection;
module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(dbURI)
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.log(err)
        return cb();
      });
  },
  getDb: () => dbConnection,
};
