import { asyncHandler } from "../utils/asyncHandeler.js";
import { Like } from "../models/likes.models.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const toggleVideoLike =asyncHandler(async(req,res)=>{
  const {videoId}=req.params
  if(!videoId)
  {
    throw new ApiError(400,"video id is required")
  }
  if(!mongoose.Types.ObjectId.isValid(videoId))
  {
    throw new ApiError(400,"invalid video id")
  }
  const userId=req.user._id
  const existingLike=await Like.findOne({video:videoId,likedBy:userId})
  if(!existingLike)
  {
    const newLike=await Like.create({video:videoId,likedBy:userId})
    return res.status(201)
    .json(new ApiResponse(201,newLike,"video liked successfully"))
  }
  else{
    await existingLike.deleteOne()
    return res.status(200)
    .json(new ApiResponse(200,null,"video unliked successfully"))
  }
})
const toggleCommentLike =asyncHandler(async(req,res)=>
{
  const {commentId}=req.params
  if(!commentId)
  {
    throw new ApiError(400,"comment id is required ")
  }
  if(!mongoose.Types.ObjectId.isValid(commentId))
  {
    throw new ApiError(400,"invalid comment id")
  }
  const userId=req.user._id
  const existingLike=await Like.findOne({comment:commentId,likedBy:userId})
  if(!existingLike)
  {
    const newLike=await Like.create({comment:commentId,likedBy:userId})
    return res.status(201)
    .json(
      new ApiResponse(201,newLike,"comment liked sucessfully")
    )
    
  }
  else{
    await existingLike.deleteOne()
    return res
    .status(200)
    .json(
      new ApiResponse(200,null,"comment unliked suceessfully")
    )
  }

})

const getVideoLikes=asyncHandler(async(req,res)=>{
  const {videoId}=req.params
  if(!videoId)
  {
    throw new ApiError(400,"video id is required")
  }
  if(!mongoose.Types.ObjectId.isValid(videoId))
  {
    throw new ApiError(400,"invalid video id")
  }
  const likes=await Like.find({video:videoId})
  return res.status(200)
  .json(new ApiResponse(200,likes,"video likes fetched successfully"))
})

const getCommentLikes=asyncHandler(async(req,res)=>{
  const {commentId}=req.params
  if(!commentId)
  {
    throw new ApiError(400,"comment id is required")
  }
  if(!mongoose.Types.ObjectId.isValid(commentId))
  {
    throw new ApiError(400,"invalid comment id")
  }
  const likes=await Like.find({comment:commentId})
  return res.status(200)
  .json(new ApiResponse(200,likes,"comment likes fetched successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
        video: { $exists: true }
      }
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
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "video.owner"
      }
    },
    {
      $unwind: "$video.owner"
    },
    {
      $project: {
        _id: "$video._id",
        title: "$video.title",
        thumbnail: "$video.thumbnail",
        views: "$video.views",
        createdAt: "$video.createdAt",
        owner: {
          _id: "$video.owner._id",
          username: "$video.owner.username",
          avatar: "$video.owner.avatar"
        }
      }
    }
  ]);

  return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export default {toggleVideoLike, toggleCommentLike, getVideoLikes, getCommentLikes, getLikedVideos}