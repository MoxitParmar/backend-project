import { asyncHandler } from "../utils/asyncHandler.js"; // Import the asyncHandler utility function
import { apiError } from "../utils/apiError.js"; // Import the apiError class
import { User } from "../models/user.model.js"; // Import the User model
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Import the uploadOnCloudinary utility function to upload images to Cloudinary
import { apiResponce } from "../utils/apiResponce.js"; // Import the apiResponce class

// Controller function to register a new user
const registerUser = asyncHandler(async (req, res) => {
  // step 1: get the user data from front end
  // step 2: validate the user data
  // step 3: check if the user already exists
  // step 4: check if the avatar image is provided
  // step 5: upload the avatar image to cloudinary
  // step 6: create a new user object in the database
  // step 7: remove password and refresh token fields from response
  // step 8: check if the user was successfully created
  // step 9: return the created user in the response

  // step 1: Get the user data from the request body
  const { fullName, email, username, password } = req.body;
  console.log("email:", email);

  // step 2: Check if any required fields are empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  // step 3: Check if the user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(400, "User already exists");
  }

  // Get the local path of the avatar image
  const avatarLocalPath = req.files?.avatar?.[0].path;

  // Get the local path of the cover image (if it exists)
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // stpe 4: Check if the avatar image is provided
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required");
  }

  // step 5: Upload the avatar image to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // Upload the cover image to Cloudinary (if it exists)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Check if the avatar upload failed
  if (!avatar) {
    throw new apiError(400, "Upload failed");
  }

  // step 6: Create a new user in the database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // step 7: Retrieve the created user from the database (excluding sensitive fields)
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // step 8: Check if the user was successfully created
  if (!createdUser) {
    throw new apiError(500, "User not created");
  }

  // step 9: Return a success response with the created user
  return res
    .status(201)
    .json(new apiResponce(200, createdUser, "User created successfully"));
});

// Export the registerUser function
export {
    registerUser,
}
