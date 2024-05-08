import { asyncHandler } from "../utils/asyncHandler.js"; // Import the asyncHandler utility function
import { apiError } from "../utils/apiError.js"; // Import the apiError class
import { User } from "../models/user.model.js"; // Import the User model
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "../utils/cloudinary.js"; // Import the uploadOnCloudinary utility function to upload images to Cloudinary
import { apiResponce } from "../utils/apiResponce.js"; // Import the apiResponce class
import jwt from "jsonwebtoken"; // Import the jsonwebtoken package
import mongoose from "mongoose";

// step 5: Generate access and refresh token method
const generateAccessTokenAndRefreshToken = async (userID) => {
  try {
    // Find the user by ID
    const user = await User.findById(userID);

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
};

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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
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

// Login user controller
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
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  // step 6: Send the access token in a cookie
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send the access token and refresh token in a cookie
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponce(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

// logout user controller
const logoutUser = asyncHandler(async (req, res) => {
  // step 1: find the user by id and remove the refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  // step 2: clear the access and refresh token from the cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponce(200, {}, "Logout successful")); // step 3: send the logout respons
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  // get the refresh token from the cookie or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Refresh token is required");
  }

  // decode incoming refresh token
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  // find the user by decoded refresh token id
  const user = await User.findById(decodedToken?._id);
  if (!user) {
    throw new apiError(401, "Invalid refresh token");
  }

  // compare refresh token from the database with the incoming refresh token
  if (user?.refreshToken !== incomingRefreshToken) {
    throw new apiError(401, "Refresh token is expired or used");
  }

  // generate new access token and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  // send the new access token and refresh token in the cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponce(
        200,
        {
          accessToken,
          refreshToken,
        },
        "Token refreshed successfully"
      )
    );
});

// Change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponce(200, {}, "Password changed successfully"));
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponce(200, req.user, "User found successfully"));
});

//delete current user
const deleteCurrentUser = asyncHandler(async (req, res) => {

  const publicId = await extractPublicId(req.user.coverImage);
  const deleteResponse = await deleteFromCloudinary(publicId);

  const publicId0 = await extractPublicId(req.user.avatar);
  const deleteResponse0 = await deleteFromCloudinary(publicId0);

  await User.findByIdAndDelete(req.user._id);


  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponce(200, {}, "User deleted successfully"));
});

// Update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new apiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName, email },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponce(200, user, "Account details updated successfully"));
});

// Update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required");
  }

  //TODO: delete old image from cloudinary - assignment
  const publicId = await extractPublicId(req.user.avatar);
  const deleteResponse = await deleteFromCloudinary(publicId);
  console.log("deleteResponse:", deleteResponse);

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new apiError(400, "Error while Uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponce(200, user, "Avatar updated successfully"));
});

// Update user cover image
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new apiError(400, "Cover image is required");
  }

  //TODO: delete old image - assignment
  const publicId = await extractPublicId(req.user.coverImage);
  const deleteResponse = await deleteFromCloudinary(publicId);
  console.log("deleteResponse:", deleteResponse);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new apiError(400, "Error while Uploading on cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponce(200, user, "Cover image updated successfully"));
});

// Get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new apiError(400, "Username is required");
  }

  // aggregate query to get the user channel profile
  const channel = await User.aggregate([
    {
      // match the username from the request
      $match: { username: username?.toLowerCase() }
    },
    {
      // add subscribers array in that user 
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
      
    },
    // add subscribedTo array in that user
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    // add fields like subscriberCount, channelsSubscribedToCount, isSubscribed in that user
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"]
            },
            then: true,
            else: false
          }
        }
      }
    },
    // project the fields to return in the response -> channel[0]
    {
      $project: {
        fullName: 1,
        username: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ])

  if (!channel?.length) {
    throw new apiError(404, "Channel not found");
  }

  // return the channel info in the response
  return res.status(200).json(new apiResponce(200, channel[0], "Channel found successfully"));
})

// Get watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      //there is the user that we want to get the watch history
      $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
    },
    {
      // add watchHistory array in that user which contains all the videos collections
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            //now in videos collection we have the owner field to each videos
            //so here we add owner array in all that videos 
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  // we dont want to give all the user info in owner array so we project only required fields
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          }, {
            // convert the owner array to object in videos collection
            $addFields: {
              owner: { $first: "$owner"}
            }
          }
        ]
      }
    }
  ])

  // return the watch history array of the user
  return res.status(200).json(new apiResponce(200, user[0]?.watchHistory || [], "Watch history found successfully"));
})



// Export the registerUser function
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  deleteCurrentUser
}
