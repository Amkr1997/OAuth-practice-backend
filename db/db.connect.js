const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const intializeDatabase = async () => {
  try {
    const connectDb = await mongoose.connect(process.env.MONGODB_URI);

    if (connectDb) console.log("connected to mongoDB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { intializeDatabase };
