const mongoose = require("mongoose");
const db = mongoose.connection;

mongoose.connect(process.env.MONGO_URI);

db.once("open", () => {
  console.log("MongoDB Connected");
});

module.exports = db;
