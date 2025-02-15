import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiError.js";
import User from "../model/user.model.js";
import { uploadOnCloudinary } from "../util/cloudinary.js";
import { ApiResponse } from "../util/ApiResponse.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        // console.log(user);

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { fullName, email, username, password } = req.body;
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some(
            (field) => typeof field === "string" && field.trim() === "" // Only call trim on strings
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    //console.log(req.files);

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
    });

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // use secure cookies in production
        sameSite: "none", // necessary for cross-site cookies
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // cookie expires in 1 day
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered Successfully"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    // console.log("first")

    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")

    // }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // use secure cookies in production
        sameSite: "none", // necessary for cross-site cookies
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // cookie expires in 1 day
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged In Successfully"
            )
        );
});

const googleAuth = async (req, res) => {
    const { tokenId } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub, picture } = ticket.getPayload();
        console.log(picture);
        let user = await User.findOne({ googleId: sub }).select(
            "-password -refreshToken"
        );
        let user2 = await User.findOne({ email: email }).select("googleId");
        if (user2 && !user2?.googleId) {
            // console.log("got caught")
            return res
                .status(210)
                .json(
                    new ApiResponse(
                        210,
                        { error: "email exists" },
                        "Email exists already"
                    )
                );
        }

        if (user) {
            const { accessToken, refreshToken } =
                await generateAccessAndRefereshTokens(user._id);

            const options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // use secure cookies in production
                sameSite: "none", // necessary for cross-site cookies
                path: "/",
                maxAge: 24 * 60 * 60 * 1000, // cookie expires in 1 day
            };

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {
                            user: user,
                            accessToken,
                            refreshToken,
                            first: false,
                        },
                        "User logged In Successfully"
                    )
                );
        } else {
            // const username = email.match(/^([^@]+)/);
            user = await User.create({
                fullName: name,
                googleId: sub,
                username: email,
                email,
                // avatar: picture,
                first: true,
            });

            const { accessToken, refreshToken } =
                await generateAccessAndRefereshTokens(user._id);

            const options = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // use secure cookies in production
                sameSite: "none", // necessary for cross-site cookies
                path: "/",
                maxAge: 24 * 60 * 60 * 1000, // cookie expires in 1 day
            };

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {
                            user: user,
                            accessToken,
                            refreshToken,
                        },
                        "User signed In Successfully"
                    )
                );
        }
    } catch (error) {
        console.error("Google Authentication Error:", error);
        throw new ApiError(401, error?.message || "Google Login Failed");
    }
};

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefereshTokens(user._id);
        console.log(user._id);
        console.log(newRefreshToken);
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, age, address, gender } = req.body;

    if (!fullName || !age || !address || !gender) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                age,
                address,
                gender,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateAccountQuestion = asyncHandler(async (req, res) => {
    const age = req?.body?.age || null;
    const gender = req?.body?.gender || null;
    const address = req?.body?.address || null;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                age,
                address,
                gender,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    console.log("Avatar local path:", avatarLocalPath); // Debug log

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // Add file type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(req.file.mimetype)) {
        fs.unlinkSync(avatarLocalPath); // Delete the invalid file
        throw new ApiError(
            400,
            "Invalid file type. Only JPEG, PNG and GIF are allowed"
        );
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found"); // Add user check
    }

    if (user.avatar) {
        try {
            const oldAvatarUrl = user.avatar;
            const publicId = oldAvatarUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
            console.log("Old avatar deleted successfully"); // Debug log
        } catch (error) {
            console.error("Error deleting old avatar:", error); // Debug log
            // Continue anyway since we want to update the avatar
        }
    }

    try {
        const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);
        console.log("Cloudinary response:", cloudinaryResponse); // Debug log

        if (!cloudinaryResponse?.url) {
            throw new ApiError(400, "Error while uploading avatar");
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: cloudinaryResponse.url,
                },
            },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedUser,
                    "Avatar image updated successfully"
                )
            );
    } catch (error) {
        console.error("Error in avatar update:", error); // Debug log
        throw new ApiError(400, `Avatar update failed: ${error.message}`);
    }
});

// Remove avatar controller
const removeUserAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);

    if (user.avatar) {
        // Get public ID from URL
        const publicId = user.avatar.split("/").pop().split(".")[0];

        // Delete from cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: null,
                },
            },
            { new: true }
        ).select("-password");

        return res
            .status(200)
            .json(
                new ApiResponse(200, updatedUser, "Avatar removed successfully")
            );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "No avatar to remove"));
});

const updatePreferences = async (req, res) => {
    try {
        // req.body should contain an object "preferences" with keys like restaurant, cafe, etc.
        const { preferences } = req.body;
        if (!preferences || typeof preferences !== "object") {
            return res
                .status(400)
                .json({ success: false, message: "Invalid preferences data" });
        }

        // Convert the boolean flags into an array of strings
        const selectedPreferences = Object.keys(preferences).filter(
            (place) => preferences[place] === true
        );

        // Assuming req.user is populated by your auth middleware
        const userId = req.user._id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { preferences: selectedPreferences },
            { new: true }
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedUser,
                    "Preferences Updated successfully"
                )
            );
    } catch (error) {
        console.error("Error updating preferences:", error);
        throw new ApiError(400, `Avatar update failed: ${error.message}`);
    }
};

const updateBio = async (req, res) => {
    const bio = req.body?.bio || null;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                bio,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
};

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    removeUserAvatar,
    updateAccountQuestion,
    updatePreferences,
    updateBio,
    googleAuth,
};
