import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./db/database.js";
import { app } from "./app.js";


// recreate __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load env ONCE
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// fail fast if env missing
if (!process.env.MONGODB_URI) {
  throw new Error("❌ MONGODB_URI not found. Check .env");
}

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
