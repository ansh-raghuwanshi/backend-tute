import {asyncHandler} from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

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
    const avatar=await uploadToCloudinary(avatarLocalPath)
    if(!avatar.url)
    {
        throw new ApiError(400,"no url on cloudanary while updating avatar")
    }
    const user= await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatar.secure_url
            }
        },
        {
            new:true
        }
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar updated sucessfully"))
})

const updateUserCover=asyncHandler(async(req,res)=>{
    const coverImageLocalPathLocalPath=req.file?.path
    if(!coverImageLocalPathLocalPath)
    {
        throw new ApiError(400,"updated coverimage is mising")
    }
    const coverImage=await uploadToCloudinary(coverImageLocalPathLocalPath)
    if(!coverImage.url)
    {
        throw new ApiError(400,"no url on cloudanary while updating cover image")
    }
    const user= await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                coverImage:coverImage.secure_url
            }
        },
        {
            new:true
        }
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"cover image updated sucessfully"))
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
    updateUserDetail
        }
