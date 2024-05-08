import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const stats = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "likes"
            }
        },
        {
            $project: {
                totalViews: { $sum: "$videos.views" },
                totalVideos: { $size: "$videos" },
                totalSubscribers: { $size: "$subscribers" },
                totalLikes: { $size: "$likes" }
            }
        }
    ])

    if (!stats) {
        throw new apiError(404, "channel not found")
    }

    return res.json(new apiResponce(200, stats[0], "channel stats"))
})  

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $project: {
            title: 1,
            description: 1,
            thumbnail: 1,
            views: 1,
            isPublished: 1,
            createdAt: 1
            }
        }
    ])

    if (!videos) {
        throw new apiError(404, "videos not found")
    }

    return res.json(new apiResponce(200, videos, "channel videos"))
})

export {
    getChannelStats, 
    getChannelVideos
    }