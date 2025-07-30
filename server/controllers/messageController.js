//create controller function using that we can store the message

import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../server.js";
//get all user except loggen in user

export const getUsersForSidebar = async (req,res)=>{
    try {

        const userId = req.user._id; // add user data in req and from user data we can find the id
        const filteredUsers = await User.find({_id:{$ne:userId}}).select("-password"); //when ever _id is not equal to userId we will filter all user and get users list

        //to count number of unseen msg
        const unseenMessages = {}
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId:user._id,receiverId:userId,seen:false})
            if(messages.length>0){
                unseenMessages[user._id] = messages.length; // value of msg unread
            }
        })
        await Promise.all(promises);
        res.json({success:true,users:filteredUsers,unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,users:error.message});
    }
}

//get all messages for selected users
export const getMessages = async(req,res) =>{
    try {
        const {id:selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId:myId, receiverId:selectedUserId},
                {senderId:selectedUserId, receiverId:myId},
            ]
        })

        await Message.updateMany({senderId:selectedUserId,receiverId:myId},{seen:true}) //messages marked as seen

        res.json({success:true,messages})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,users:error.message});
    }
}

//api to mark message as seen using message id

export const markMessageAsSeen = async ()=>{
    try {
        const{id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,users:error.message});
    }
}

//create controller function so that we can send the messages but before that create router
//now create function to send message to selected user

export const sendMessage = async (req,res)=>{
    try {
        const {text,image} = req.body;
        const receiverId = req.params.id;//sender id
        const senderId = req.user._id;// user using middelware

        let imageUrl;
        if(image){ //IF IMAGE THEN UPLOAD TO CLOUDINARY SO IMPORT IT
            const uploadResponse = await cloudinary.uploader.upload(image) //we will get url and then store it 
            imageUrl = uploadResponse.secure_url;
        }

        //store message data in DB
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        //emit the new message to the receiver socket
        //now the receiver will immediately see the message
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.json({success:true,newMessage});//WE CAN SEND THE NEW MESSAGE AND THEN IT CAN STORE IN DB

        // WE WANT THIS MESSAGE TO DISPLAY ON REAL TIME - USING SOCKET.IO SETUP IN server.js
    } catch (error) {
        console.log(error.message);
        res.json({success:false,users:error.message});
    }
}

//now create api endpoint using sendMessage controller function
