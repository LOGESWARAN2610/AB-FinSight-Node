const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process["env"]["DATABASE_URI"]);
const dataBase = client.db(process["env"]["DATABASE"]);

module.exports = {
  dataBase,
};
