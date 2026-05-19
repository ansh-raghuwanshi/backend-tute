import { Router } from "express";
import { addComment, deleteComment, getVideoComments } from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/video/:videoId").post(verifyJWT,addComment)
router.route("/:commentId").delete(verifyJWT,deleteComment)

router.route("/video/:videoId").get(getVideoComments)
export const commentRouter=router