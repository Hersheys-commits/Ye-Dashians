import User from "../model/user.model.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";
import { asyncHandler } from "../util/asyncHandler.js";
import mongoose from "mongoose";

// Search users by username (real-time suggestions)
export const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res
            .status(400)
            .json(new ApiResponse(400, [], "Search query is required"));
    }

    const users = await User.find({
        $or: [
            { username: { $regex: query, $options: "i" } },
            { fullName: { $regex: query, $options: "i" } },
        ],
    }).select("username fullName avatar email");

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users found successfully"));
});

// Get user profile with friend request status
export const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findOne({ username }).select(
        "-googleId -password -refreshToken -friends -friendRequests"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if they're already friends
    const areFriends = await User.findOne({
        _id: currentUserId,
        friends: {
            $elemMatch: {
                username: username,
            },
        },
    });

    if (areFriends) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { user, friendRequestStatus: "friends" },
                    "Profile retrieved successfully"
                )
            );
    }

    // Check for pending/accepted friend requests
    const existingRequest = await User.findOne({
        _id: currentUserId,
        "friendRequests.sent": {
            $elemMatch: {
                "recipient.userId": user._id,
                status: { $in: ["pending", "accepted"] },
            },
        },
    });

    let friendRequestStatus = "not_sent";
    if (existingRequest) {
        friendRequestStatus = "sent";
    }

    const profileResponse = {
        user,
        friendRequestStatus,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                profileResponse,
                "Profile retrieved successfully"
            )
        );
});

export const getUserProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(id).select(
        "username fullName avatar email"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const existingRequest = await User.findOne({
        _id: currentUserId,
        "friendRequests.sent": {
            $elemMatch: {
                recipient: user._id,
                status: { $in: ["pending", "accepted"] },
            },
        },
    });

    const profileResponse = {
        user,
        friendRequestStatus: existingRequest ? "sent" : "not_sent",
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                profileResponse,
                "Profile retrieved successfully"
            )
        );
});

// Send friend request
export const sendFriendRequest = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const sender = await User.findById(req.user._id);

    const recipient = await User.findOne({ username });
    if (!recipient) {
        throw new ApiError(404, "Recipient user not found");
    }

    const isAlreadyFriend = sender.friends.some(
        (friend) => friend.userId.toString() === recipient._id.toString()
    );

    if (isAlreadyFriend) {
        return res
            .status(202)
            .json(new ApiResponse(202, null, "Already friends"));
    }

    const existingRequest = await User.findOne({
        _id: sender._id,
        "friendRequests.sent": {
            $elemMatch: {
                "recipient.userId": recipient._id,
                status: { $in: ["pending", "accepted"] },
            },
        },
    });

    if (existingRequest) {
        throw new ApiError(400, "Friend request already sent");
    }

    await User.findByIdAndUpdate(sender._id, {
        $push: {
            "friendRequests.sent": {
                recipient: {
                    userId: recipient._id,
                    username: recipient.username,
                    email: recipient.email,
                },
                status: "pending",
            },
        },
    });

    await User.findByIdAndUpdate(recipient._id, {
        $push: {
            "friendRequests.received": {
                requester: {
                    userId: sender._id,
                    username: sender.username,
                    email: sender.email,
                },
                status: "pending",
            },
        },
    });

    return res
        .status(201)
        .json(new ApiResponse(201, null, "Friend request sent successfully"));
});

// Accept friend request
export const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.body;
    const recipientId = req.user._id;

    // Find the recipient with the friend request
    const recipient = await User.findOne({
        _id: recipientId,
        "friendRequests.received._id": requestId,
    });

    if (!recipient) {
        throw new ApiError(404, "Friend request not found");
    }

    // Get details of the received request
    const requestDetails = recipient.friendRequests.received.find(
        (request) => request._id.toString() === requestId
    );

    if (!requestDetails) {
        throw new ApiError(404, "Friend request details not found");
    }

    const requester = await User.findById(requestDetails.requester.userId);
    if (!requester) {
        throw new ApiError(404, "Requester not found");
    }

    // Check if requester is already in recipient's friends list
    const isAlreadyFriend = recipient.friends.some(
        (friend) =>
            friend.userId.toString() ===
            requestDetails.requester.userId.toString()
    );

    if (isAlreadyFriend) {
        throw new ApiError(400, "Users are already friends");
    }

    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Update recipient's profile
        await User.findByIdAndUpdate(
            recipientId,
            {
                $push: {
                    friends: {
                        userId: requestDetails.requester.userId,
                        username: requestDetails.requester.username,
                        email: requestDetails.requester.email,
                    },
                },
                $pull: {
                    "friendRequests.received": { _id: requestId },
                },
            },
            { session }
        );

        // Update requester's profile
        await User.findByIdAndUpdate(
            requestDetails.requester.userId,
            {
                $push: {
                    friends: {
                        userId: recipientId,
                        username: recipient.username,
                        email: recipient.email,
                    },
                },
                $pull: {
                    "friendRequests.sent": { "recipient.userId": recipientId },
                    // Also remove any received requests from the recipient
                    "friendRequests.received": {
                        "requester.userId": recipientId,
                    },
                },
            },
            { session }
        );

        // Commit the transaction
        await session.commitTransaction();
    } catch (error) {
        // If anything fails, abort the transaction
        await session.abortTransaction();
        throw error;
    } finally {
        // End the session
        session.endSession();
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Friend request accepted"));
});

// Reject friend request
export const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.body;
    const recipientId = req.user._id;

    const updatedRecipient = await User.findOneAndUpdate(
        {
            _id: recipientId,
            "friendRequests.received._id": requestId,
        },
        {
            $pull: { "friendRequests.received": { _id: requestId } },
        }
    );

    if (!updatedRecipient) {
        throw new ApiError(404, "Friend request not found");
    }

    const requestDetails = updatedRecipient.friendRequests.received.find(
        (request) => request._id.toString() === requestId
    );

    await User.findByIdAndUpdate(requestDetails.requester.userId, {
        $pull: { "friendRequests.sent": { "recipient.userId": recipientId } },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Friend request rejected"));
});

// Cancel friend request
export const cancelFriendRequest = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const senderId = req.user._id;

    const recipient = await User.findOne({ username });
    if (!recipient) {
        throw new ApiError(404, "Recipient user not found");
    }

    const existingRequest = await User.findOne({
        _id: senderId,
        "friendRequests.sent": {
            $elemMatch: {
                "recipient.userId": recipient._id,
                status: "pending",
            },
        },
    });

    if (!existingRequest) {
        throw new ApiError(404, "No pending friend request found");
    }

    await User.findByIdAndUpdate(senderId, {
        $pull: {
            "friendRequests.sent": {
                "recipient.userId": recipient._id,
                status: "pending",
            },
        },
    });

    await User.findByIdAndUpdate(recipient._id, {
        $pull: {
            "friendRequests.received": {
                "requester.userId": senderId,
                status: "pending",
            },
        },
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Friend request cancelled successfully")
        );
});

// Get current user profile
export const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const profileResponse = {
        user,
        friendRequests: user.friendRequests.received.filter(
            (request) => request.status === "pending"
        ),
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                profileResponse,
                "Profile retrieved successfully"
            )
        );
});

// Remove a friend
export const removeFriend = asyncHandler(async (req, res) => {
    const { friendId } = req.body;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
        throw new ApiError(400, "Invalid friend ID");
    }

    // Check if the friend exists in current user's friends list
    const currentUser = await User.findById(currentUserId);
    if (
        !currentUser ||
        !currentUser.friends.some(
            (friend) => friend.userId.toString() === friendId
        )
    ) {
        throw new ApiError(404, "Friend not found in your friends list");
    }

    // Remove friend from current user's friends list
    await User.findByIdAndUpdate(currentUserId, {
        $pull: { friends: { userId: friendId } },
    });

    // Remove current user from friend's friends list
    await User.findByIdAndUpdate(friendId, {
        $pull: { friends: { userId: currentUserId } },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Friend removed successfully"));
});
