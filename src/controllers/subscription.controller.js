import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import { apiResponce } from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// controller to toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "invalid channel id")
    }

    // TODO: toggle subscription
    const subscriberId = req.user._id

    const subscriber = await Subscription.findOne({channel: channelId, subscriber: subscriberId})
    
    // if subscriber not found, create a new subscription else delete the existing subscription
    if (!subscriber) {
        await Subscription.create({
            channel: channelId,
            subscriber: subscriberId
        })
    } else {
        await Subscription.findByIdAndDelete(subscriber._id)
    }

    // check if subscriber now subscribed to the channel
    const subscribed = await Subscription.findOne({ channel: channelId, subscriber: subscriberId })
    
    let isSubscribed = "unsubscribed"
    // if subscribed is not null, then user is subscribed
    if (subscribed) {
        isSubscribed = "subscribed"
    }

    return res.json(new apiResponce(200, {isSubscribed}, "subscription toggled"))
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "invalid channel id")
    }

    // get all subscribers of the channel
    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1
                }
            }
        }
    ])

    return res.json(new apiResponce(200, subscribers, "subscribers found"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new apiError(400, "invalid subscriber id")
    }

    // get all channels to which user has subscribed
    const channels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                _id: 0,
                channel: {
                    _id: 1,
                    username: 1,
                    fullName: 1
                }
            }
        }
    ])

    return res.json(new apiResponce(200, channels, "channels found"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}