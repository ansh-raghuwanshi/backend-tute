import {asyncHandler} from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {deleteFromCloudinary, uploadToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateRefreshAndAcessTocken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessTocken=await user.generateAcessTocken()
        const refreshTocken=await user.generateRefreshTocken()

        user.refreshTocken=refreshTocken
        await user.save({validateBeforeSave:false})
        return{accessTocken,refreshTocken}
        
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access tocken ")
    }

}


const registerUser=asyncHandler(async(req,res)=>{
    //get data from frontend
    //validation -not empty
    //check if user already exist : username,email
    //check for images
    //upload them to cloudnary
    //create user object -for entry in db
    //remove password and refresh tocken field from response
    //check user creation
    //return res


    //get data from frontend
    const {username , fullname ,email,password}=req.body

    //validation -not empty
    if(
        [username , fullname ,email,password].some((field)=>field?.trim()==="")
    )
    {
        throw new ApiError(400,"every field is required")
    }

    //check if user already exist : username,email
    const userExist= await User.findOne(    //(user)is imorted from user model which talk with db
        {
            $or :[{username},{email}]
        }
    )
    if(userExist)
    {
        throw new ApiError(409,"user already exist")
    }


    //check for images
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0)
    {
        coverImageLocalPath=req.files.coverImage[0].path
    }
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"avatar is required")
    }

    //upload them to cloudnary
    const avatar= await uploadToCloudinary(avatarLocalPath)
    const coverImage= await uploadToCloudinary(coverImageLocalPath)
    

    if(!avatar)
    {
        throw new ApiError(400,"avatar is required")
    }

    //create user object -for entry in db
    const user= await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username:username.toLowerCase(),
        email,
        password
    })
    //remove password and refresh tocken field from response
    const createdUser=await User.findById(user._id).select("-password -refreshTocken")

    //check user creation
    if(!createdUser){
        throw new ApiError(500,"somthing went wrong while registerung")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered sucessfully")
    )

})

const loginUser=asyncHandler(async(req,res)=>{
    //algorithm
    //req.body=>data
    //find the user
    //check the password
    //provide access and refresh tockens

    const{username,email,password}=req.body
    if(!(username || email))
    {
        throw new ApiError(401,"email or username required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"user not found")
    }
    
    const isPasswordValid=await user.isPasswordCorrect(password);
    if(!isPasswordValid)
    {
        throw new ApiError(401,"wrong password")
    }

    const {accessTocken,refreshTocken}=await generateRefreshAndAcessTocken(user._id)
    const logedinUser=await User.findById(user._id).select("-password -refreshTocken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessTocken",accessTocken,options)
    .cookie("refreshTocken",refreshTocken,options)
    .json(
        new ApiResponse(200,{
            user:logedinUser,accessTocken,refreshTocken
        },"user loggedin sucessfully")
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshTocken: undefined
            },
            
        },
        {
            new:true
        }

    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("refreshTocken",options)
    .clearCookie("accessTocken",options)
    .json(new ApiResponse(200,{},"logged out succesfully"))

})

const refreshAcessTocken=asyncHandler(async(req,res)=>{
    const incomingRefreshTocken=req.cookie.refreshTocken || req.body.accessTocken//if request is coming from the app(someone sending it)
    if(!incomingRefreshTocken)
    {
        throw new ApiError(401,"unorthorized accesss")

    }

   const decodedTocken= jwt.verify(
        incomingRefreshTocken,
        process.env.REFRESH_TOCKEN_SECRET
    )

    const user= await User.findById(decodedTocken?._id)
    if(!user)
    {
        throw new ApiError(401,"unorthorized")
    }
    if(incomingRefreshTocken!=user.refreshTocken){
        throw new ApiError(401,"invalid refresh tocken")
    }
    const options={
        httpOnly:true,
        secure:true
    }
    const{ accessTocken,newRefreshTocken}=await generateRefreshAndAcessTocken(user._id)
    
    return res
    .status(201)
    .cookie("refreshTocken",newRefreshTocken,options)
    .cookie("accessTocken",accessTocken,options)
    .json(
        new ApiResponse(201,
            {accessTocken,refreshTocken:newRefreshTocken},
            "access tocken refreshed"
        )
    )



})

const changePassword=asyncHandler(async(req,res)=>{
    const {oldPassword ,newPassword}=req.body
    
    const user=await User.findById(req.user?._id)
    const isPassCorect=await user.isPasswordCorrect(oldPassword) 
    if(!isPassCorect){
        throw new ApiError(401,"old password doesent match ")
    }
    if(newPassword==oldPassword)
    {
        throw new ApiError(400,"old password cant be new password")
    }
    user.password=newPassword
   await user.save({validateBeforeSave:false})
   return res.
   status(200)
   .json(new ApiResponse(200,{},"password changed sucessfully"))

})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(new ApiResponse(200,req.user,"user fettched sucessfully"))
})


const updateUserDetail=asyncHandler(async(req,res)=>{
    const{fullname,email}=req.body
    if(!fullname || !email)
    {
        throw new ApiError(400,"all info is required to update details")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullname:fullname,
                email:email
            }
        },
        {
            new:true
        }).select("-password")
        return res.
        status(200)
        .json(new ApiResponse(200,user,"information updated sucessfully"))
})

const updateUserAvtar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"updated avatar is mising")
    }
    
    const user=await User.findById(req.user._id)

    if(!user)
    {
        throw new ApiError(404,"user not found to update avater image")
    }

    let oldPublicID=null

    if(user.avatar)
    {
        const urlParts=user.avatar.split("/");
        const fileName=urlParts[urlParts.length-1]
        oldPublicID=fileName.split(".")[0];
    }

    const uploadedAvatar=await uploadToCloudinary(avatarLocalPath)

    user.avatar=uploadedAvatar.secure_url;
    await user.save();

    if(oldPublicID)
    {
        await deleteFromCloudinary(oldPublicID)
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar updated sucessfully"))
})

const updateUserCover=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"updated coverimage is mising")
    }
    const user=await User.findById(req.user._id)
    if(!user)
    {
        throw new ApiError(400,"user not found to update cover image ")
    }

    let oldPublicID=null
    if(user.coverImage)
    {
        const urlParts=user.coverImage.split("/");
        const fileName=urlParts[urlParts.length-1]
        oldPublicID=fileName.split(".")[0];
    }
    const uploadCover=await uploadToCloudinary(coverImageLocalPath)
    user.coverImage=uploadCover.secure_url
    user.save()
    if(oldPublicID)
    {
        await deleteFromCloudinary(oldPublicID)
    }

    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image updated sucessfully"))
})

const getUserChanelProfile=asyncHandler(async(req,res)=>
{
    const {username}=req.params
    if(!username)
    {
        throw new ApiError(400,"username not found")
    }

    const channel=await User.aggregate([
        {$match:{username:username}},
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"chanel",
                as:"subscribers"
            }
        },
        {
            $lookup:
            {
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{$size:"$subscribers"},
                chanelSubscribedToCount:{$size:"$subscribedTo"},
                isSubscribed:{
                    cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                chanelSubscribedToCount:1,
                isSubscribed:1

            }
        }
    ])
    if(!channel?.length)
    {
        new ApiError(404,"chanel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"chanel response fetched sucessfully")
    )

    
    
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistoryt",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullname:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res 
    .status(200)
    .json(
        new ApiResponse(200,user[0].watchHistory,"watch history fetched sucessfully")
    )
        
    
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessTocken,
    getCurrentUser,
    changePassword,
    updateUserCover,
    updateUserAvtar,
    updateUserDetail,
    getUserChanelProfile,
    getWatchHistory
        }
