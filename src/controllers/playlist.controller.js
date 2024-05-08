import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponce} from "../utils/apiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const { name, description } = req.body
    
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    const createdPlaylist = await Playlist.findById(playlist._id)

    if (!createdPlaylist) {
        throw new apiError(400, "Failed to create playlist")
    }

    return res.status(201).json(new apiResponce(201, playlist, "Playlist created successfully"))
    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user id")
    }

    //TODO: get user playlists
    const playlists = await Playlist.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videosCount: { $size: "$videos" }
            }
        }
    ])

    if (!playlists) {
        throw new apiError(404, "No playlists found")
    }

    return res.status(200).json(new apiResponce(200, playlists, "User playlists"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(playlistId) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videos: {
                    _id: 1,
                    title: 1,
                    thumbnail: 1
                }
            }
        }
    ])

    if (!playlist) {
        throw new apiError(404, "Playlist not found")
    }

    return res.status(200).json(new apiResponce(200, playlist, "Playlist found"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid playlist or video id")
    }

    const addVideo = await Playlist.findByIdAndUpdate(playlistId, { $push: { videos: videoId } }, { new: true })

    if (!addVideo) {
        throw new apiError(400, "Failed to add video to playlist")
    }

    return res.status(200).json(new apiResponce(200, addVideo, "Video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid playlist or video id")
    }

    const removeVideo = await Playlist.findByIdAndUpdate(playlistId, { $pull: { videos: videoId } }, { new: true })

    if (!removeVideo) {
        throw new apiError(400, "Failed to remove video from playlist")
    }

    return res.status(200).json(new apiResponce(200, removeVideo, "Video removed from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        throw new apiError(400, "Failed to delete playlist")
    }

    return res.status(200).json(new apiResponce(200, playlist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name, description }
        },
        { new: true }
    )

    if (!playlist) {
        throw new apiError(400, "Failed to update playlist")
    }

    return res.status(200).json(new apiResponce(200, playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
