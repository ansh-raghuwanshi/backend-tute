import { Router } from "express";
import { likeController } from "../controllers/like.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"


const router=Router()

router.route("/video/:videoId/toggle").post(authMiddleware,likeController.toggleVideoLike)
router.route("/comment/:commentId/toggle").post(authMiddleware,likeController.toggleCommentLike) 
router.route("/video/:videoId/likes").get(authMiddleware,likeController.getVideoLikes)
router.route("/comment/:commentId/likes").get(authMiddleware,likeController.getCommentLikes)


export const likeRouter=router