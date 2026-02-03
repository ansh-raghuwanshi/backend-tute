import dotenv from "dotenv";

// load env ONCE
dotenv.config()
console.log("ENV CHECK ", {
  MONGO: process.env.MONGODB_URI,
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUD_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUD_SECRET: process.env.CLOUDINARY_API_SECRET,
});

// fail fast if env missing
if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI not found. Check .env");
}


import connectDB from "./db/database.js";
import { app } from "./app.js";

// connect to DB
connectDB()
.then(()=>{
  app.listen(process.env.PORT,(error)=>
  {
    console.log(`server is listining on port : ${process.env.PORT}`);
  })
})
.catch((error)=>{
  console.log("mongodb connection failed",error);
})
