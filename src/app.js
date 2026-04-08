import express from 'express'
import cors from 'cors'
import cookieparser from 'cookie-parser'


const app=express();
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credintials: true
}))

app.use(express.json({
  limit:"16kb"
}))

app.use(express.static("public"))
app.use(cookieparser())




//router imports 
import userRouter from './routes/user.route.js'
import videoRouter from './routes/video.route.js'
import subscriptionRouter from './routes/subscription.route.js'
import likeRouter from './routes/like.router.js'


//routes declaration

app.use("/api/users",userRouter)
app.use("/api/videos",videoRouter)
app.use("/api/subscription",subscriptionRouter)
app.use("/api/likes",likeRouter)


export{app}