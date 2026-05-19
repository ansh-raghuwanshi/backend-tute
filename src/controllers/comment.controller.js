import { asyncHandler } from "../utils/asyncHandeler.js";
import { Like } from "../models/likes.models.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comments.model.js"
import mongoose from "mongoose";

const addComment =asyncHandler(async(req,res)=>{
  const commentData=req.body
  if(!commentData.content)
  {
    throw new ApiError(400,"comment content is required")
  }
  commentData.owner=req.user._id;
  commentData.video=req.params.videoId;
  
  const comment=await Comment.create(commentData)
  res.status(201).json(new ApiResponse(201,comment,"comment added successfully"))
})

const deleteComment =asyncHandler(async(req,res)=>{
  const userId=req.user._id
  const {commentId}=req.params
  if(!commentId)
  {
    throw new ApiError(400,"comment id is required")
  }
  if(!mongoose.Types.ObjectId.isValid(commentId))
  {
    throw new ApiError(400,"invalid comment id")
  }
  const comment=await Comment.findById(commentId)
  if(!comment)  
  {
    throw new ApiError(404,"comment not found")
  }
  if(comment.owner.toString()!==userId.toString())
  {
    throw new ApiError(403,"you are not authorized to delete this comment")
  }
  await Comment.findByIdAndDelete(commentId)
  res.status(200).json(new ApiResponse(200, null, "comment deleted successfully"))

})
const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!videoId)
    {
      throw new ApiError(400,"video id is required")
    }
    if(!mongoose.Types.ObjectId.isValid(videoId))
    {
      throw new ApiError(400,"invalid video id")
    }
    const comments = await Comment.find({video: videoId})
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate("owner", "fullname username avatar")
    res.status(200).json(new ApiResponse(200, comments, "comments retrieved successfully"))



})

export {addComment,deleteComment,getVideoComments}