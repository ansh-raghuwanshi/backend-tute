import { asyncHandler } from "../utils/asyncHandeler";
import { Like } from "../models/likes.models.js"
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";

const addComment =asyncHandler(async(req,res)=>{
  const commentData=req.body
  if(!commentData.text)
  {
    throw new ApiError(400,"comment text is required")
  }
  commentData.user=req.user._id
  const comment=await Comment.create(commentData)
    res.status(201).json(new ApiResponse(201,comment,"comment added successfully"))
  })

const deleteComment =asyncHandler(async(req,res)=>{
  const userId=req.user._id
  
})