import {asyncHandler} from "../utils/asyncHandeler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


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
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

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
export {registerUser}