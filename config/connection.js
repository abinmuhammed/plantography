require("dotenv").config();
const mongoClient = require("mongodb").MongoClient;
const state = {
  db: null,
};
const uri = (module.exports.connect = function (done) {
  const url = process.env.MONGODB_ATLAS;
  // const url="mongodb://localhost:27017"
  const dbname = "PLANTOGRAPHY";

  mongoClient.connect(url, (err, data) => {
    if (err) {
      console.log(err);
      return done(err);
    }
    state.db = data.db(dbname);
    done();
  });
});

module.exports.get = function () {
  return state.db;
};
