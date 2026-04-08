import { Router } from "express";
import { likeController } from "../controllers/like.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"


const router=Router()

router.post("/video/:videoId",authMiddleware,likeController.toggleVideoLike)
router.post("/comment/:commentId",authMiddleware,likeController.toggleCommentLike)
router.get("/video/:videoId",authMiddleware,likeController.getVideoLikes)

export const likeRouter=router