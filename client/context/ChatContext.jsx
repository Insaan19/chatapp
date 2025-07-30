//create context 

import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({children}) =>{

    const [messages, setMessages] = useState([]); //store messgaes for selected user
    const [users,setUsers] = useState([]);         //store list of users for leftside bar
    const [selectedUser,setSelectedUser] = useState(null); // store user id here on which person you click to chat
    const [unseenMessages, setUnseenMessages] = useState({}) //store user id and unseen messages

    const {socket,axios} = useContext(AuthContext); //axios with base url from AuthContext

    //create function to get users for sidebars
    const getUsers = async()=>{
        try { //api call to list users on sidebar
           const {data} =  await axios.get("/api/messages/users");
           if(data.success){
            setUsers(data.users)
            setUnseenMessages(data.unseenMessages)
           }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to get messages for selected users

    const getMessages = async (userId)=>{
        try {
           const {data} =  await axios.get(`/api/messages/${userId}`);
           if(data.success){
             setMessages(data.messages)
           }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //function to send message to selected user
    const sendMessage = async(messageData)=>{
        try {
            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData); //call api endpoint
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMessage])
            }
            else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //function to subscribe to message for selected user,get new msg in real time
    const subscribeToMessages = async () => {
        if(!socket) {
            return;
        }
        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen = true;
                setMessages((prevMessages)=>[...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`); //update the seen property too true as chatbox is opened
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId] : prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }

    //funtion to unsubscribe from messages, will be called when selected user changes

    const unsubscribeFromMessage = ()=>{
        if(socket) {
            socket.off("newMessage"); 
            //if socket is connected
        }
    }
    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessage();
    },[socket,selectedUser]) //whenever selected user changes this function will be called

    //pass all these function so we can use it in any component
    const value ={
        messages, users, selectedUser, getUsers, getMessages, 
        sendMessage, setSelectedUser, unseenMessages, setUnseenMessages
    }
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}