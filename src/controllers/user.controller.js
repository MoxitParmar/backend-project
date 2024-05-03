import { asyncHandler } from "../utils/asyncHandler.js"; // Import the asyncHandler utility function
import { apiError } from "../utils/apiError.js"; // Import the apiError class
import { User } from "../models/user.model.js"; // Import the User model
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Import the uploadOnCloudinary utility function to upload images to Cloudinary
import { apiResponce } from "../utils/apiResponce.js"; // Import the apiResponce class

// step 5: Generate access and refresh token method
const generateAccessTokenAndRefreshToken = async (userID) => {
  try {
    // Find the user by ID
    const user = await User.findById(userID)

    // Generate an access token
    const accessToken = await user.generateAccessToken();

    // Generate a refresh token
    const refreshToken = await user.generateRefreshToken();

    // Save the refresh token to the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the access and refresh tokens
    return { accessToken, refreshToken };

  } catch (error) {
    throw new apiError(500, "Token generation failed");
  }
}

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

const loginUser = asyncHandler(async (req, res) => {
  // step 1: get the user data from front end
  // step 2: validate login by username or password
  // step 3: find the user
  // step 4: password check
  // step 5: generate the access and refress token
  // step 6: send the token to the user by cookie

  // step 1: Get the user data from the request body
  const { username, password, email } = req.body;

  // step 2: Validate login by username and password
  if (!username && !email) {
    throw new apiError(400, "Username or email is required");
  }

  // step 3: Find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // Check if the user exists
  if (!user) {
    throw new apiError(400, "User not found");
  }

  // step 4: Check if the password is correct
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new apiError(400, "Invalid password");
  }

  // step 5.1: Generate access and refresh token method call
  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(
    user._id
  );

  // step 6: Send the access token in a cookie
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true
  };

  // Send the access token and refresh token in a cookie
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponce(200, {
      user: loggedInUser, accessToken, refreshToken
    }, "Login successful"));
})

// logout user controller
const logoutUser = asyncHandler(async (req, res) => {
  // step 1: find the user by id and update the refresh token to undefined
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true })
  
  // step 2: clear the access and refresh token from the cookie
  const options = {
    httpOnly: true,
    secure: true,
  }
  
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponce(200, {}, "Logout successful"))  // step 3: send the logout respons
})

// Export the registerUser function
export {
  registerUser,
  loginUser,
  logoutUser
}
