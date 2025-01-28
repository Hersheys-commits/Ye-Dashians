import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    credentials: true,              // Allow cookies
  })
);

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import friendRouter from './route/friend.route.js'
import userRouter from './route/user.route.js'
import messageRoutes from './route/message.route.js'

app.get('/home', (req, res) => {
    res.send('Welocome to home page!!!!!');
  });

app.use("/api/users", userRouter)
app.use("/api/friends", friendRouter)
app.use("/api/message", messageRoutes);

// http://localhost:8000/api/users/register

export { app }