import { ApiError } from "../util/ApiError.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(402, "Unauthorized request");
            // req.user=null;
            // next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(403, "Invalid Access Token");
        }

        req.user = user;
        // console.log("success jwt verify")
        next();
    } catch (error) {
        throw new ApiError(404, error?.message || "Invalid access token");
    }
});
