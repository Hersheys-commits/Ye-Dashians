import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { app } from "./util/socket.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
    path: "./.env",
});

const allowedOrigins = [
    "https://nexus-tau-seven.vercel.app",
    "http://localhost:5173", // if needed for local development
];

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

app.get("/api/place/:placeId", async (req, res) => {
    // Expect query parameters: location, radius, type
    // const { location, radius, type } = req.query;
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_MAP_API;

    // Construct the URL for the Google Places Nearby Search endpoint
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching place details:", error.message);
        res.status(500).json({ error: "Error fetching place details." });
    }
});

app.get("/api/distance", async (req, res) => {
    const { origin, destination } = req.query;
    // console.log("Received origin:", origin, "destination:", destination);

    if (!origin || !destination) {
        return res
            .status(400)
            .json({ error: "Origin and destination are required." });
    }

    try {
        const googleApiKey = process.env.GOOGLE_MAP_API;
        //   console.log("Using Google API Key:", googleApiKey);

        const response = await axios.get(
            "https://maps.googleapis.com/maps/api/distancematrix/json",
            {
                params: {
                    origins: origin,
                    destinations: destination,
                    key: googleApiKey,
                },
            }
        );

        const data = response.data;
        //   console.log("Google Distance Matrix response:", data);

        if (data.status !== "OK") {
            return res
                .status(500)
                .json({ error: "Error from Distance Matrix API", data });
        }

        const element = data.rows[0]?.elements[0];
        if (!element || element.status !== "OK") {
            return res
                .status(500)
                .json({ error: "No valid distance data returned", element });
        }

        return res.json({
            distance: element.distance.text,
            duration: element.duration.text,
            distanceValue: element.distance.value,
            durationValue: element.duration.value,
        });
    } catch (error) {
        console.error("Error in Distance Controller:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/api/places/autocomplete", async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: "Query parameter is required." });
    }

    try {
        // Call the Google Places Autocomplete API
        const googleResponse = await axios.get(
            "https://maps.googleapis.com/maps/api/place/autocomplete/json",
            {
                params: {
                    input: query,
                    key: process.env.GOOGLE_MAP_API,
                    // Optionally add parameters like "types" or "location" to narrow the search
                },
            }
        );

        // Check if Google returned an error
        if (googleResponse.data.status !== "OK") {
            return res.status(400).json({
                error:
                    googleResponse.data.error_message ||
                    "Error fetching autocomplete results.",
            });
        }

        // Return only the predictions (suggestions)
        return res.json({ data: googleResponse.data.predictions });
    } catch (error) {
        console.error("Error in getPlaceAutocomplete:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
});

export { app };
