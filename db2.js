const { MongoClient } = require("mongodb");

let dbConnection;
// const URI = "mongodb+srv://omagadvd:cre8tive@cluster0.od13iq7.mongodb.net/NIVAN-FX?retryWrites=true&w=majority&appName=Cluster0";
const URI =  'mongodb://localhost:27017/NIVAN-FX'
module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(URI)
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
