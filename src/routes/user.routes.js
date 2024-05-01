import { Router } from "express"; // Import the Router method from the express package
import { registerUser } from "../controllers/user.controller.js"; // Import the registerUser controller function
import { upload } from "../middlewares/multer.middleware.js"; // Import the upload middleware

const router = Router();

// Route for registering a user
router.route("/register").post(
  // Middleware for handling file uploads
  upload.fields([
    {
      name: "avatar", // Field name for avatar image
      maxCount: 1, // Maximum number of files allowed
    },
    {
      name: "coverImage", // Field name for cover image
      maxCount: 1 // Maximum number of files allowed
    },
  ]),
  registerUser // Controller function for registering a user
);

export default router;
