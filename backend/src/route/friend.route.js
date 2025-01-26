import { Router } from 'express';
import { 
    searchUsers, 
    getUserProfile, 
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getUserProfileById,
    removeFriend
} from '../controller/friend.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/search').get( verifyJWT, searchUsers);
router.route('/profile/:username').get( verifyJWT, getUserProfile);
router.route('/friend-request/:username').post( verifyJWT, sendFriendRequest);
router.route('/accept-request').post( verifyJWT, acceptFriendRequest);
router.route('/reject-request').put( verifyJWT, rejectFriendRequest);
router.route('/getProfileById/:id').get(verifyJWT,getUserProfileById);
router.route('/remove-friend').post(verifyJWT,removeFriend);

export default router