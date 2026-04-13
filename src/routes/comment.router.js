import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/video/:videoId").post(authMiddleware,commentController.addComment)
router.route("/:commentId").delete(authMiddleware,commentController.deleteComment)

router.route("/video/:videoId").get(commentController.getCommentsByVideoId)
export const commentRouter=router