// Import necessary modules
import dotenv from "dotenv";
import connectDB from "./db/index.db.js";
import { app } from "./app.js";

// Load environment variables from .env file
dotenv.config({
  path: "./.env",
});

// Connect to the database
connectDB()
  .then(() => {
    // Handle any errors that occur in the express app
    app.on("error", (error) => {
      console.log(error);
      throw error;
    });

    // Start the express server and listen for incoming requests
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error", error);
  });

//first approach
/*
;(async () => {
  try {
    await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log(error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
        console.log(`server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
})();
*/
