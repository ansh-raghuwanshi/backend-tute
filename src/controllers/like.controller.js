import { asyncHandler } from "../utils/asyncHandeler";
import like, { Like } from "../models/likes.models.js"
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
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
    await existingLike.remove()
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
    await existingLike.remove()
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

export default {toggleVideoLike, toggleCommentLike, getVideoLikes}