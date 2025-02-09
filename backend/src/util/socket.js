// server/socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://nexus-tau-seven.vercel.app",
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    transports: ['websocket', 'polling']
});

const users = {};

io.on("connection", (socket) => {
    console.log("🟢 New socket connection:", socket.id);
    
    const userId = socket.handshake.query.userId;
    if (userId) {
        users[userId] = socket.id;
        console.log("User connected:", { userId, socketId: socket.id });
        console.log("Online users:", Object.keys(users));
    }

    io.emit("getOnlineUsers", Object.keys(users));

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
        if (userId) {
            delete users[userId];
            console.log("Remaining users:", Object.keys(users));
            io.emit("getOnlineUsers", Object.keys(users));
        }
    });

    // Add error handling
    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });
});

export const getReceiverSocketId = (receiverId) => users[receiverId];

export { app, io, server };