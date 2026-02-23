import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAcessTocken, changePassword, updateUserDetail, getCurrentUser, updateUserAvtar, updateUserCover} from "../controllers/users.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";
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
  router.route("/update-detail").post(verifyJWT,updateUserDetail)
  router.route("/get-user").get(verifyJWT,getCurrentUser)
  router.route("/update-avatar").post(verifyJWT,upload.single("avatarLocalPath"),updateUserAvtar)
  router.route("/update-cover").post(verifyJWT,upload.single("coverImageLocalPathLocalPath"),updateUserCover)
export default router