import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app } from "./util/socket.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
    path: "./.env",
});

app.use(
    cors({
        origin: "http://localhost:5173", // Allow requests from your frontend
        credentials: true, // Allow cookies
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//routes import
import friendRouter from "./route/friend.route.js";
import userRouter from "./route/user.route.js";
import messageRoutes from "./route/message.route.js";

app.get("/home", (req, res) => {
    res.send("Welocome to home page!!!!!");
});

app.use("/api/users", userRouter);
app.use("/api/friends", friendRouter);
app.use("/api/message", messageRoutes);
app.get("/api/nearbyplaces", async (req, res) => {
    // Expect query parameters: location, radius, type
    const { location, radius, type } = req.query;
    const apiKey = process.env.GOOGLE_MAP_API;

    // Construct the URL for the Google Places Nearby Search endpoint
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching nearby places:", error.message);
        res.status(500).json({ error: "Error fetching nearby places." });
    }
});

// http://localhost:8000/api/users/register

export { app };
