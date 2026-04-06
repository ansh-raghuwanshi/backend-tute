
import { Router } from "express";
import { publishAVideo, getVideoByID, updateVideo, deleteVideo, toglePublishStatus, getAllVideos } from "../controllers/video.controler.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router();

router.route("/get-video/:id").get(getVideoByID)

//protected routes
router.route("/publish").post(verifyJWT,upload.single("video"),publishAVideo)
router,route("/update-video/:id").patch(verifyJWT,upload.single("video"),updateVideo)
router.route("/delete-video/:id").delete(verifyJWT,deleteVideo)
router.route("/toggle-publish/:id").patch(verifyJWT,toglePublishStatus)
router.route("/get-all-videos").get(getAllVideos)

export default router
