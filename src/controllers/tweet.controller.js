import mongoose , {isValidObjectId} from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    const createdTweet = await Tweet.findById(tweet._id)
    if (!createdTweet) {
        throw new apiError(500, "tweet not created")
    }
    res.json(new apiResponce(200, createdTweet, "tweet created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { page = 1, limit = 1 } = req.query
    // TODO: get user tweets
    const tweets = await Tweet.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(req.params.userId) }
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

    if (!tweets) {
        throw new apiError(404, "tweets not found")
    }

    res.json(new apiResponce(200, tweets ,"tweets found"))
    
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "invalid tweet id")
    }

    const { content } = req.body

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new apiError(404, "Tweet not found")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
          $set: { content },
        },
        { new: true }
    )

    if (!updatedTweet) {
        throw new apiError(500, "Error while updating tweet")
    }

    return res.json(new apiResponce(200, updatedTweet, "tweet updated"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "invalid tweet id")
    }

    await Tweet.findByIdAndDelete(tweetId)

    res.json(new apiResponce(200, {}, "tweet deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
