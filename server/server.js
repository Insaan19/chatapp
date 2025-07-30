import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./route/userRoutes.js";
import messageRouter from "./route/messageRoutes.js";
import { Server } from "socket.io";

//Create express app and http server
const app = express();
const server = http.createServer(app)

//initialize socket.io server
export const io = new Server(server,{
    cors:{origin:"*"} // allow all the origin
})

//store online users - add data in form of userId:socketId
export const userSocketMap ={};

//socket connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected" , userId);

    if(userId){ // when ever data is available we will add it in the userSocket Map
        userSocketMap[userId] = socket.id
    }
    //emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})


//MiddleWare Setup
app.use(express.json({limit:"4mb"})); // images upto 4mb
app.use(cors()); //all url connect to backend

app.use("/api/status",(req,res)=>res.send("Server is live")); //check whether backend is running or not, it will send a response
app.use("/api/auth",userRouter);//route setup
app.use("/api/messages",messageRouter);

//Connect to mongodb

await connectDB();


//define a port where server will run
if(process.env.NODE_ENV !== "production"){
const PORT = process.env.PORT || 5000 //if port is available then use else 500
server.listen(PORT, ()=>console.log("Server is running on PORT :"+ PORT)); //to start the server
}

//export server for vercel
export default server;


