
import { Router } from "express";
import { publishAVideo, getVideoByID, updateVideo, deleteVideo, toglePublishStatus, getAllVideos } from "../controllers/video.controler.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router=Router();

router.route("/get-video/:videoId").get(getVideoByID)

//protected routes
router.route("/publish").post(
  verifyJWT,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  publishAVideo
)
router.route("/update-video/:videoId").patch(verifyJWT,upload.single("video"),updateVideo)
router.route("/delete-video/:videoId").delete(verifyJWT,deleteVideo)
router.route("/toggle-publish/:videoId").patch(verifyJWT,toglePublishStatus)
router.route("/get-all-videos").get(getAllVideos)

export default router
