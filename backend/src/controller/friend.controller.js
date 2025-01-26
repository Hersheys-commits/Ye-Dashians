import { User } from '../model/user.model.js';
import { ApiError } from '../util/ApiError.js';
import { ApiResponse } from '../util/ApiResponse.js';
import { asyncHandler } from '../util/asyncHandler.js';
import mongoose from 'mongoose';

// Search users by username (real-time suggestions)
export const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json(
            new ApiResponse(400, [], "Search query is required")
        );
    }

    const users = await User.find({
        username: { 
            $regex: query, 
            $options: 'i' // case-insensitive
        }
    }).select('username fullName avatar');

    return res.status(200).json(
        new ApiResponse(200, users, "Users found successfully")
    );
});

// Get user profile with friend request status
export const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findOne({ username })
        .select('username fullName avatar');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check existing friend request status
    const existingRequest = await User.findOne({
        _id: currentUserId,
        'friendRequests.sent': {
            $elemMatch: {
                recipient: user._id,
                status: { $in: ['pending', 'accepted'] }
            }
        }
    });

    const profileResponse = {
        user,
        friendRequestStatus: existingRequest ? 'sent' : 'not_sent'
    };

    return res.status(200).json(
        new ApiResponse(200, profileResponse, "Profile retrieved successfully")
    );
});

export const getUserProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get userId from request params
    const currentUserId = req.user._id;

    // Find the user by userId and select only relevant fields
    const user = await User.findById(id).select('username fullName avatar');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if a friend request has already been sent or accepted
    const existingRequest = await User.findOne({
        _id: currentUserId,
        'friendRequests.sent': {
            $elemMatch: {
                recipient: user._id,
                status: { $in: ['pending', 'accepted'] }
            }
        }
    });

    const profileResponse = {
        user,
        friendRequestStatus: existingRequest ? 'sent' : 'not_sent'
    };

    return res.status(200).json(
        new ApiResponse(200, profileResponse, "Profile retrieved successfully")
    );
});


// Send friend request
// Send friend request
export const sendFriendRequest = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const senderId = req.user._id;

    // Find recipient
    const recipient = await User.findOne({ username });
    if (!recipient) {
        throw new ApiError(404, "Recipient user not found");
    }

    // Check if request already exists
    const existingRequest = await User.findOne({
        _id: senderId,
        'friendRequests.sent': {
            $elemMatch: {
                recipient: recipient._id,
                status: { $in: ['pending', 'accepted'] }
            }
        }
    });

    if (existingRequest) {
        throw new ApiError(400, "Friend request already sent");
    }

    // Create friend request
    await User.findByIdAndUpdate(senderId, {
        $push: {
            'friendRequests.sent': {
                recipient: recipient._id,
                status: 'pending'
            }
        }
    });

    await User.findByIdAndUpdate(recipient._id, {
        $push: {
            'friendRequests.received': {
                requester: senderId,
                status: 'pending'
            }
        }
    });

    return res.status(201).json(
        new ApiResponse(201, null, "Friend request sent successfully")
    );
});

// Accept friend request
export const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.body;
    const recipientId = req.user._id;

    // Find the specific friend request
    const recipient = await User.findOne({ 
        _id: recipientId, 
        'friendRequests.received._id': requestId 
    });

    if (!recipient) {
        throw new ApiError(404, "Friend request not found");
    }

    // Find the specific request details
    const requestDetails = recipient.friendRequests.received.find(
        request => request._id.toString() === requestId
    );

    if (!requestDetails) {
        throw new ApiError(404, "Friend request details not found");
    }

    // Update recipient's profile
    await User.findByIdAndUpdate(recipientId, {
        $addToSet: { friends: requestDetails.requester },
        $pull: { 'friendRequests.received': { _id: requestId } }
    });

    // Update requester's profile
    await User.findByIdAndUpdate(requestDetails.requester, {
        $addToSet: { friends: recipientId },
        $pull: { 'friendRequests.sent': { recipient: recipientId } }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Friend request accepted")
    );
});

// Reject friend request
export const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.body;
    const recipientId = req.user._id;

    // Update recipient's received requests
    const updatedRecipient = await User.findOneAndUpdate(
        {
            _id: recipientId,
            'friendRequests.received._id': requestId
        },
        {
            $pull: { 'friendRequests.received': { _id: requestId } }
        }
    );

    if (!updatedRecipient) {
        throw new ApiError(404, "Friend request not found");
    }

    // Find the request details
    const requestDetails = updatedRecipient.friendRequests.received.find(
        request => request._id.toString() === requestId
    );

    // Update requester's sent requests
    await User.findByIdAndUpdate(requestDetails.requester, {
        $pull: { 'friendRequests.sent': { recipient: recipientId } }
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Friend request rejected")
    );
});


// Remove a friend
export const removeFriend = asyncHandler(async (req, res) => {
    const { friendId } = req.body;
    const currentUserId = req.user._id;

    // Validate friendId
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
        throw new ApiError(400, "Invalid friend ID");
    }

    // Check if the friend exists in current user's friends list
    const currentUser = await User.findById(currentUserId);
    if (!currentUser || !currentUser.friends.includes(friendId)) {
        throw new ApiError(404, "Friend not found in your friends list");
    }

    // Remove friend from current user's friends list
    await User.findByIdAndUpdate(currentUserId, { 
        $pull: { friends: friendId } 
    });

    // Remove current user from friend's friends list
    await User.findByIdAndUpdate(friendId, { 
        $pull: { friends: currentUserId } 
    });

    return res.status(200).json(
        new ApiResponse(200, null, "Friend removed successfully")
    );
});

// Get current user profile with friends and received friend requests
export const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    // Fetch user profile including friends and received requests
    const user = await User.findById(currentUserId)
        .select('username fullName email avatar friends friendRequests.received');

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Return profile details
    const profileResponse = {
        user,
        friendRequests: user.friendRequests.received.filter(request => request.status === 'pending')
    };

    return res.status(200).json(
        new ApiResponse(200, profileResponse, "Profile retrieved successfully")
    );
});


