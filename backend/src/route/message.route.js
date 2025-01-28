import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage} from "../controller/message.controller.js";

const router = express.Router();

router.get("/friends", verifyJWT, getUsersForSidebar);
router.get("/getMessage/:id", verifyJWT, getMessages);

router.post("/sendMessage/:id", verifyJWT, sendMessage);

export default router;