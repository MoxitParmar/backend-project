import dotenv from "dotenv";
import mongoose from "mongoose";
// import { DB_NAME } from "./constance";
import express from "express";
import connectDB from "./db/index.db.js";
const app = express();

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(error);
      throw error;
    })
    app.listen(process.env.PORT || 8000 , () => {
      console.log(`server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });

//first approach
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log(error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//         console.log(`server is running on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// })();
