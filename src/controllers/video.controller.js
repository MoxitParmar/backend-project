import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary , extractPublicId , deleteFromCloudinary, deletevideoFromCloudinary, getVideoLength } from "../utils/cloudinary.js";
import mongoose, {isValidObjectId} from "mongoose";

// Get all videos by search query
const getAllVideos = asyncHandler(async (req, res) => {

  const { page = 1, limit = 2, query, sortBy = "createdAt", sortType = 1} = req.query;

  const getvideos = await Video.aggregate([
    {
      // search by title or description
      $match: {
        $or: [
          { title: { $regex: query || "", $options: "i" } },
          { description: { $regex: query || "", $options: "i" } },
        ],
      },
    }, {
      // join with users table to get the owner details
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    }, {
      // unwind the owner array to get the owner details as an object
      $unwind: "$owner",
    }, {
      // sort the videos by the sortBy field in the sortType order
      $sort: { [sortBy]: sortType },
    }, {
      // skip the videos based on the page number if it is page 2 then 
      // it skips the videos of page 1 and shows the videos of page 2
      $skip: (page - 1) * limit,
    }, {
      // limit the number of videos on the current page
      $limit: parseInt(limit, 10),
    }, 
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        views: 1,
        isPublished: 1,
        owner: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    }
  ]);

  if (!getvideos) {
    throw new apiError(404, "videos not found");
  }

  return res.status(200).json(new apiResponce(200, getvideos, "searched videos found"));
  
});

// Publish a video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  // Get the local path for the video and thumbnail
  const videoLocalPath = req.files?.videoFile?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  if (!videoLocalPath && !thumbnailLocalPath) {
    throw new apiError(400, "videoFile and thumbnail are required");
  }

  // Upload the video and thumbnail to cloudinary
  const videoFile = await uploadOnCloudinary(videoLocalPath, "video");
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "image");

  if (!videoFile && !thumbnail) {
    throw new apiError(400, "Upload failed");
  }

  // get the duration of the video
  const publicId = await extractPublicId(videoFile.url);
  const duration = await getVideoLength(publicId);

  // Create a new video
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    duration: duration,
  });

  //  Retrieve the created video from the database
  const createdVideo = await Video.findById(video._id)
    
  // Check if the video was successfully created
  if (!createdVideo) {
    throw new apiError(500, "video not created");
  }

  // Return a success response with the created video
  return res
    .status(201)
    .json(new apiResponce(200, createdVideo, "video created successfully"));
});

// Get a video by id and set view and watch history
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "invalid video id");
  }
  //TODO: get video by id
  
  // set views and watch history
  const video = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });
  const watchHistory = await User.findByIdAndUpdate(req.user._id, { $push: { watchHistory: videoId } }, { new: true });

  if (!watchHistory) {
    throw new apiError(500, "watch history not updated");
  }

  if (!video) {
      throw new apiError(404, "Video not found");
  }   

  return res.status(200).json(new apiResponce(200, video, "Video found"));
});

// Update the video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "invalid video id");
  }

  const { title, description } = req.body;
  //TODO: update video details like title, description, thumbnail
  const video = await Video.findById(videoId);

  if (!video) {
      throw new apiError(404, "Video not found");
  }

  //TODO: delete old thumbnail from cloudinary 
  const publicId = await extractPublicId(video.thumbnail);
  const deleteResponse = await deleteFromCloudinary(publicId);

  // upload the new thumbnail
  const thumbnailLocalPath = req.file?.path;
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new apiError(400, "Error while Uploading thumbnail");
  }

  // update the video details
  const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: { title, description , thumbnail: thumbnail.url},
      },
      { new: true }
  )

  if (!updatedVideo) {
    throw new apiError(500, "video not updated");
  }


  return res
  .status(200)
  .json(new apiResponce(200, updatedVideo, "video updated successfully"));
    
});

// Delete a video by videoId
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "invalid video id");
  }

  //TODO: delete video
  const video = await Video.findById(videoId);

  if (!video) {
      throw new apiError(404, "Video not found");
  }

  // delete the thumbnail and video from cloudinary
  const publicId = await extractPublicId(video.thumbnail);
  const deleteResponse = await deleteFromCloudinary(publicId);

  const publicId0 = await extractPublicId(video.videoFile);
  const deleteResponse0 = await deletevideoFromCloudinary(publicId0);

  // delete the video from the database
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new apiResponce(200, {}, "video deleted successfully"));
});

// Toggle the publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "invalid video id");
  }

  //TODO: toggle publish status
  const video = await Video.findById(videoId);

  if (!video) {
      throw new apiError(404, "Video not found");
  }

  // toggle the publish status
  if (video.isPublished == true) {
      video.isPublished = false;
  }else{
      video.isPublished = true;
  }

  // save the updated status
  await video.save({ validateBeforeSave: false });
  
  return res
      .status(200)
      .json(new apiResponce(200, video.isPublished, "video publish status updated"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
