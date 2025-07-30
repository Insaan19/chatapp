import express from "express"
import { protectRoute } from "../middleware/auth.js";
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

//create different endpoints
messageRouter.get("/users",protectRoute,getUsersForSidebar); // display all user list
messageRouter.get("/:id",protectRoute,getMessages); 
messageRouter.put("/mark/:id",protectRoute,markMessageAsSeen);//put the data
messageRouter.post("/send/:id",protectRoute,sendMessage); // send a new message to user and the message will be seen instantly

export default messageRouter;
//add this message router in server.js file