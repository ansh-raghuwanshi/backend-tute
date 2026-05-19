import { asyncHandler } from "../utils/asyncHandeler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Like } from "../models/likes.models.js";


const publishAVideo=asyncHandler(async(req,res)=>{
  const{title,description}=req.body

  if(!title || !description ||([title,description].some((field)=>field.trim()==="")))
  {
    throw new ApiError(400,"title and description of the video is required")
  }
  const videoLocalPath=req.files?.video?.[0]?.path
  if(!videoLocalPath)
  {
    throw new ApiError(400,"video file is required")
  }
  const thumbnailLocalpath=req.files?.thumbnail?.[0]?.path
  const videoToUpload= await uploadToCloudinary(videoLocalPath)
  
  let thumbnail
  if(thumbnailLocalpath)
  {
    thumbnail=await uploadToCloudinary(thumbnailLocalpath)
    if(!thumbnail.url)
    {
      throw new ApiError(400,"thumbnail upload failed")
    }
  }
  
  if (!videoToUpload?.url)
  {
    throw new ApiError(400,"video is not uploded to cloudnary")
  }
  const video=await Video.create(
    {
      title,
      description,
      videoFile:videoToUpload.url,
      thumbnail:thumbnail?.url||"",
      duration: videoToUpload.duration ? videoToUpload.duration.toString() : "0",
      owner: req.user._id
    }
  ) 

  return res 
  .status(200)
  .json(
    new ApiResponse(200,video,"video uploded sucessfully")
  )
  

})

const getVideoByID=asyncHandler(async(req,res)=>{
  const {videoId}=req.params

  if(!videoId)
  {
    throw new ApiError(400,"no video id found")
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID")
}
  const video=await Video.findByIdAndUpdate(videoId, {
    $inc: { view: 1 }
  }, { new: true }).populate('owner', 'username avatar fullname')
  if(!video)
  {
    throw new ApiError(404,"no video with this videoId")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,video,"video fetched sucessfully")
  )

  
})


const updateVideo=asyncHandler(async (req,res)=>{
  const {videoId}=req.params
  if(!videoId)
  {
    throw new ApiError(400,"videoId required")
  }
  if(!mongoose.Types.ObjectId.isValid(videoId))
  {
    throw new ApiError(400,"invalid videoId")
  }

  const{title,description}=req.body
  const updateFields={}
  if(title) updateFields.title=title
  if(description) updateFields.description=description



  const video=await Video.findById(videoId)
  if(!video)
  {
    throw new ApiError(404,"video not found")
  }
  if(video.owner.toString() !== req.user._id.toString())
  {
    throw new ApiError(403,"only owner can update details")
  }

  if(req.file)
  {
    const updatedThumbnailLocalPath=req.file.path
    if(!updatedThumbnailLocalPath)
    {
      throw new ApiError(400,"updated thumbnail is missing")
    }

    let oldPublicID=null

    if(video.thumbnail)
    {
        const urlParts=video.thumbnail.split("/");
        const fileName=urlParts[urlParts.length-1]
        oldPublicID=fileName.split(".")[0];
    }
    
    const updatedThumbnail=await uploadToCloudinary(updatedThumbnailLocalPath)

    updateFields.thumbnail=updatedThumbnail.url

    if(oldPublicID)
    {
      await deleteFromCloudinary(oldPublicID)
    }

  }

  if(Object.keys(updateFields).length===0)
  {
    throw new ApiError(400,"atleast one field is required to update")
  }


  const updatedVideo=await Video.findByIdAndUpdate(videoId,{
    $set:updateFields
  },{
    new:true
  })

  return res
  .status(200)
  .json(
    new ApiResponse(200,updatedVideo,"details updated sucesssfully")
  )
  
})

const deleteVideo=asyncHandler(async(req,res)=>{

    /*
      1. Validate videoId
  2. Find video in DB
  3. If not found → 404
  4. Check ownership → 403 if not owner
  5. Delete thumbnail from cloud (if exists)
  6. Delete video from DB
  7. Send success response
    */


  const{videoId}=req.params;
  if(!videoId) 
  {
    throw new ApiError(400,"videoId is required")
  }
  if(!mongoose.Types.ObjectId.isValid(videoId))
  {
    throw new ApiError(400,"invalid videoId")
  }

  const videoToBeDeleted=await Video.findById(videoId)

  if(!videoToBeDeleted)
  {
    throw new ApiError(404,"no video found")
  }
  
  if(videoToBeDeleted.owner.toString()!==req.user._id.toString())
  {
    throw new ApiError(403,"unothorized request")
  }

  let oldVideoID=null

    if(videoToBeDeleted.videoFile)
    {
        const urlParts=videoToBeDeleted.videoFile.split("/");
        const fileName=urlParts[urlParts.length-1]
        oldVideoID=fileName.split(".")[0];
    }

  let oldThumbnailID=null

    if(videoToBeDeleted.thumbnail)
    {
        const urlParts=videoToBeDeleted.thumbnail.split("/");
        const fileName=urlParts[urlParts.length-1]
        oldThumbnailID=fileName.split(".")[0];
    }
  

  if(oldVideoID)
  {
    await deleteFromCloudinary(oldVideoID)
  }
  if(oldThumbnailID)
  {
    await deleteFromCloudinary(oldThumbnailID)
  }
  
  await videoToBeDeleted.deleteOne()

  // Cascade delete associated likes and comments
  await Comment.deleteMany({ video: videoId });
  await Like.deleteMany({ video: videoId });

  // Remove video from all users' watch history
  await User.updateMany(
    { watchHistory: videoId },
    { $pull: { watchHistory: videoId } }
  );

  return res 
  .status(200)
  .json(
    new ApiResponse(200,null,"video deleted")
  )
 
})

const toglePublishStatus=asyncHandler(async(req,res)=>{
  /* 
   1. Validate videoId
2. Find video
3. If not found → 404
4. Check ownership → only owner can toggle
5. Flip isPublished
6. Save/update
7. Return updated status
  */
  const{videoId}=req.params
  if(!videoId)
  {
    throw new ApiError(400,"videoId is required")
  }
  if(!mongoose.Types.ObjectId.isValid(videoId))
  {
    throw new ApiError(400,"invalid videoId")
  }
  const video=await Video.findById(videoId)
  if(!video)
  {
    throw new ApiError(404,"video not found")
  }
  if(video.owner.toString()!==req.user._id.toString())
  {
    throw new ApiError(403,"unothorized access")
  }
  video.isPublished=!video.isPublished
  await video.save()

  return res
  .status(200)
  .json(
    new ApiResponse(200,{isPublished:video.isPublished},"publish status toggled")
  )

})
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // 1. Convert types
  const pageNum = Number(page);
  const limitNum = Number(limit);

  // 2. Build filter
  const filter = { isPublished: true };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ];
  }

  if (userId) {
    filter.owner = userId;
  }

  // 3. Build sort
  const sortOptions = {};
  const sortField = sortBy || "createdAt";
  sortOptions[sortField] = sortType === "desc" ? -1 : 1;

  // 4. Pagination
  const skip = (pageNum - 1) * limitNum;

  // 5. Fetch data
  const videos = await Video.find(filter)
    .populate('owner', 'username avatar fullname')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  // 6. Total count
  const totalVideos = await Video.countDocuments(filter);

  // 7. Response
  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      page: pageNum,
      totalPages: Math.ceil(totalVideos / limitNum),
      totalVideos
    }, "Videos fetched successfully")
  );
});

export{
  publishAVideo,
  getVideoByID,
  updateVideo,
  deleteVideo,
  toglePublishStatus,
  getAllVideos
}