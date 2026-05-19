import { Router } from "express";
import likeController from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router=Router()

router.route("/video/:videoId/toggle").post(verifyJWT,likeController.toggleVideoLike)
router.route("/comment/:commentId/toggle").post(verifyJWT,likeController.toggleCommentLike) 
router.route("/video/:videoId/likes").get(verifyJWT,likeController.getVideoLikes)
router.route("/comment/:commentId/likes").get(verifyJWT,likeController.getCommentLikes)
router.route("/videos").get(verifyJWT,likeController.getLikedVideos)

export const likeRouter=router