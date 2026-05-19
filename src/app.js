import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'


const app=express();
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json({
  limit:"16kb"
}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))
app.use(cookieparser())

// Health check route for root URL
app.get('/', (req, res) => {
  res.send('VTube Backend API is running!');
});




//router imports 
import userRouter from './routes/user.route.js'
import videoRouter from './routes/video.route.js'
import subscriptionRouter from './routes/subscription.route.js'
import { likeRouter } from './routes/like.router.js'
import { commentRouter } from './routes/comment.router.js';


//routes declaration
app.use("/api/users",userRouter)
app.use("/api/videos",videoRouter)
app.use("/api/subscription",subscriptionRouter)
app.use("/api/likes",likeRouter)
app.use("/api/comments",commentRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

export{app}