import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAcessTocken, changePassword, updateUserDetail, getCurrentUser, updateUserAvtar, updateUserCover, getUserChanelProfile, getWatchHistory} from "../controllers/users.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router();

router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount:1
    },{
      name:"coverImage",
      maxCount:1
    }
  ])
  ,registerUser)

  router.route("/login").post(loginUser)

  //secured routes

  router.route("/logout").post(verifyJWT,logoutUser)
  router.route("/refresh-tocken").post(refreshAcessTocken)
  router.route("/change-password").post(verifyJWT,changePassword)
  router.route("/update-detail").patch(verifyJWT,updateUserDetail)
  router.route("/get-user").get(verifyJWT,getCurrentUser)
  router.route("/update-avatar").patch(verifyJWT,upload.single("avatarLocalPath"),updateUserAvtar)
  router.route("/update-cover").patch(verifyJWT,upload.single("coverImageLocalPath"),updateUserCover)
  router.route("/chanel/:username").get(verifyJWT,getUserChanelProfile)
  router.route("/watch-history").get(verifyJWT,getWatchHistory)

export default router