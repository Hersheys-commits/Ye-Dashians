import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getLastMessage,
    getMessages,
    getUsersForSidebar,
    sendMessage,
} from "../controller/message.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/friends", verifyJWT, getUsersForSidebar);
router.get("/getMessage/:id", verifyJWT, getMessages);
router.get("/getLastMessage/:id", verifyJWT, getLastMessage);

router.post("/sendMessage/:id", verifyJWT, upload.single("image"), sendMessage);

export default router;
