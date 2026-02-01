import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema=new Schema(
  {
    username:{
      type:String,
      required : true,
      unique:true,
      lowercase:true,
      trim :true,
      index:true
    },
     email:{
      type:String,
      required : true,
      unique:true,
      lowercase:true,
      trim :true,
    },
     fullname:{
      type:String,
      required : true,
      unique:true,
      trim :true,
    },
     avtar:{
      type:String,  //we will use cloudnary
      required : true,
    },
    coverImage:{
      type:String,
    },
    watchHistory:[
      {
        type: Schema.Types.ObjectId,
        ref:"Video"
      }
    ],
    password:{
      type:String,
      required:[true,'password is required']
    },
    refreshTocken:{
      type: String
    }

  },
  {
    timestamps:true
  }
)

userSchema.pre("save",async function (next) {
  if(!this.isModified("password"))return next();
  this.password=await bcrypt.hash(this.password,10)
  return next()
  
})

userSchema.methods.isPasswordCorrect=async function(password)
{
return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAcessTocken=function(){
 return jwt.sign(
    {
      _id:this._id,
      email:this.email,
      fullname:this.fullname,
      username:this.username
    },
    process.env.ACESS_TOCKEN_SECRET,
    {
      expiresIn:process.env.ACESS_TOCKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshTocken=function(){
 return jwt.sign(
    {
      _id:this._id,
      
    },
    process.env.REFRESH_TOCKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOCKEN_EXPIRY
    }
  )
}


export const User= mongoose.model("User",userSchema)