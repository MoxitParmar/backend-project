import express from "express"; // Importing the Express framework
import cors from "cors"; // Importing the CORS middleware
import cookieParser from "cookie-parser"; // Importing the cookie-parser middleware

const app = express(); // Creating an instance of the Express application

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Allowing requests from the specified origin
    credentials: true, // Allowing credentials to be included in requests
  })
);

app.use(express.json({ limit: "16kb" })); // Parsing JSON requests with a maximum size of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parsing URL-encoded requests with a maximum size of 16kb
app.use(express.static("public")); // Serving static files from the "public" directory
app.use(cookieParser()); // Parsing cookies from incoming requests

// Importing the user routes
import userRouter from "./routes/user.routes.js";

import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

// Declaring the user routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

export { app }; // Exporting the Express application
