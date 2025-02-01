import User from "../model/user.model.js";
import Message from "../model/message.model.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";
import { getReceiverSocketId,io } from "../util/socket.js";
import { ApiError } from "../util/ApiError.js";
import { ApiResponse } from "../util/ApiResponse.js";


//not to be used now

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find the logged in user and populate the friends' user details.
    const user = await User.findById(loggedInUserId)
      .populate("friends.userId", "fullName email _id")
      .select("friends");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map the populated friend objects to extract the friend details.
    // After population, each friend in user.friends will have the full user details in friend.userId.
    const friends = user.friends.map((friend) => friend.userId);

    res.status(200).json(friends);
  } catch (error) {
    console.error("Error in getFriendsForSidebar:", error.message);
    // Adjust your error handling as needed
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                messages,
                "Message retreived successfully"
            )
        )
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    throw new ApiError(500, "Internal server error")
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await uploadOnCloudinary(image);

      if (!uploadResponse) {
        throw new ApiError(400, "Image file is required")
    }
      imageUrl = uploadResponse.url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                newMessage,
                "Message sent successfully"
            )
        )
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    throw new ApiError(500, "Internal server error")
    
  }
};