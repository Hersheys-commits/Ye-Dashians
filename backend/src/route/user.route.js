import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateAccountDetails,
    updateAccountQuestion,
    removeUserAvatar,
    updatePreferences,
    updateBio,
    googleAuth,
} from "../controller/user.controller.js";
import { getCurrentUserProfile } from "../controller/friend.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/google-login").post(googleAuth);

//secured routes
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router
    .route("/update-account-question")
    .patch(verifyJWT, updateAccountQuestion);
router
    .route("/avatar")
    .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/profile").get(verifyJWT, getCurrentUserProfile);
router.route("/avatar/remove").delete(verifyJWT, removeUserAvatar);
router.route("/update-preferences").post(verifyJWT, updatePreferences);
router.route("/update-bio").post(verifyJWT, updateBio);

export default router;
