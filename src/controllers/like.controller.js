import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id")
    }
    //TODO: toggle like on video

    const like = await Like.findOne({ video: videoId, likedBy: req.user._id })
    
    if (!like) {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
    } else {
        await Like.findByIdAndDelete(like._id)
    }

    const Liked = await Like.findOne({ video: videoId, likedBy: req.user._id })

    let isLiked = "not-liked"
    if (Liked) {
        isLiked = "liked"
    }

    return res.json(new apiResponce(200, {isLiked}, "like toggled"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "invalid comment id")
    }
    //TODO: toggle like on comment

    const like = await Like.findOne({ comment: commentId, likedBy: req.user._id })

    if (!like) {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
    } else
    {
        await Like.findByIdAndDelete(like._id)
    }

    const Liked = await Like.findOne({ comment: commentId, likedBy: req.user._id })

    let isLiked = "not-liked"
    if (Liked) {
        isLiked = "liked"
    }

    return res.json(new apiResponce(200, {isLiked}, "like toggled"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "invalid tweet id")
    }
    //TODO: toggle like on tweet

    const like = await Like.findOne({ tweet: tweetId, likedBy: req.user._id })

    if (!like) {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
    } else
    {
        await Like.findByIdAndDelete(like._id)
    }

    const Liked = await Like.findOne({ tweet: tweetId, likedBy: req.user._id })

    let isLiked = "not-liked"
    if (Liked) {
        isLiked = "liked"
    }

    return res.json(new apiResponce(200, {isLiked}, "like toggled"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: { likedBy: req.user._id }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                _id: "$video._id",
                title: "$video.title",
                description: "$video.description",
                thumbnail: "$video.thumbnail",
                createdAt: "$video.createdAt"
            }
        }
    ])

    if (!likedVideos) {
        return res.json(new apiResponce(200, [], "you dont have any liked videos"))
    }

    return res.json(new apiResponce(200, likedVideos, "liked videos"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}