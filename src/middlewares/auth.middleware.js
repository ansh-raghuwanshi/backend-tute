import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandeler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'




export const verifyJWT=asyncHandler(async(req,res,next)=>{
  try {
    const tocken=req.cookies?.accessTocken
    if(!tocken)
    {
      throw new ApiError(401,"unothorized")
    }
    
    const decodedTocken=jwt.verify(tocken,process.env.ACESS_TOCKEN_SECRET)
    const user=await User.findById(decodedTocken?._id).select("-password -refreshTocken")

    if(!user){
      throw new ApiError(401,"invalid access tocken")
    }
    req.user=user //creating a new object in req
    next()
  } catch (error) {
    
    throw new ApiError(401,error?.message || "invalid access tocken")
  }
})