import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponce } from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const { page = 1, limit = 10 } = req.query
    
    const comments = await Comment.aggregate([
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $sort: { createdAt: 1 }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit, 10)
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: 1
            }
        }
    ])

    res.json(new apiResponce(200, comments, "comments retrieved successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id")
    }

    const { text } = req.body

    const comment = await Comment.create({
        content: text,
        video: videoId,
        owner: req.user._id
    })

    const createdComment = await Comment.findById(comment._id)
    if (!createdComment) {
        throw new apiError(500, "comment not created")
    }

    res.json(new apiResponce(200, createdComment, "comment created successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { text } = req.body

    const comment = await Comment.findByIdAndUpdate(commentId, { $set: { content: text } }, { new: true })

    if (!comment) {
        throw new apiError(500, "comment not updated")
    }

    res.json(new apiResponce(200, comment, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params
    
    await Comment.findByIdAndDelete(commentId)

    res.json(new apiResponce(200, null, "comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
