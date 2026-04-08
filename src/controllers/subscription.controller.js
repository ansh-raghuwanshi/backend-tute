import { asyncHandler } from "../utils/asyncHandeler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import SubscriptionService from "../services/subscription.service";
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models";

const  toggleSubscription =asyncHandler(async(req,res)=>{
  const {channelId} = req.params;
  if(!channelId)
  {
    throw new ApiError(400,"channelId is required");
  }
  if(!mongoose.Types.ObjectId.isValid(channelId))
  {
    throw new ApiError(400,"invalid channelId")
  }
  const channel=await Subscription.findById(channelId)
  if(!channel)
  {
    throw new ApiError(404,"channel not found")
  }
  if(channelId.toString() === req.user._id.toString())
  {
    throw new ApiError(400,"you cannot subscribe to yourself")
  }

  const subscription=await Subscription.findOne({subscriber:req.user._id,channel:channelId})
  if(subscription)
  {
    // User is already subscribed, so unsubscribe
    await Subscription.deleteOne({subscriber:req.user._id,channel:channelId})
    return res.status(200).json(new ApiResponse(200,null,"unsubscribed successfully"))
  }
  else
  {
    // User is not subscribed, so subscribe
    await Subscription.create({subscriber:req.user._id,channel:channelId})
    return res.status(200).json(new ApiResponse(200,null,"subscribed successfully"))
  }
})

const  getUserChannelSubscribers=asyncHandler(async(req,res)=>{
  const{channelId}=req.params;
  if(!channelId)
  {
    throw new ApiError(400,"channelId is required")
  }
  if(!mongoose.Types.ObjectId.isValid(channelId))
  {
    throw new ApiError(400,"invalid channelId")
  }
  const channel=await Subscription.find({channel:channelId})
  if(!channel)
  {
    throw new ApiError(404,"channel not found")
  }
  const subscribers=await Subscription.find({channel:channelId}).populate("subscriber","name email")

  return res
  .status(200)
  .json(
    new ApiResponse(200,subscribers,"subscribers retrieved successfully")
  )

})

const getSubscribedChannels=asyncHandler(async(req,res)=>{
  const {subscriberId }=req.params
  if(!subscriberId)
  {
    throw new ApiError(400,"subscriberId is required")
  }
  if(!mongoose.Types.ObjectId.isValid(subscriberId))
  {
    throw new ApiError(400,"invalid subscriberId")
  }
  const subscriber=await Subscription.find({subscriber:subscriberId})
  if(!subscriber)
  {
    throw new ApiError(404,"subscriber not found")
  }
  const channels=await Subscription.find({subscriber:subscriberId}).populate("channel","name email")
  return res
  .status(200)
  .json(
    
      new ApiResponse(200,channels,"subscribed channels retrieved successfully")
    
  )
})




export default {toggleSubscription, getUserChannelSubscribers, getSubscribedChannels} 
