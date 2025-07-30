// AuthContext.jsx

import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import io from "socket.io-client";

export const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // ✅ FIXED: use correct name
  const [socket, setSocket] = useState(null);

  // ✅ Function to connect to socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
    });

    setSocket(newSocket); // ✅ SET BEFORE EVENTS

    newSocket.on("connect", () => {
      console.log("Socket connected ✅");
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Online users:", userIds);
      setOnlineUsers(userIds); // ✅ Update state
    });
  };

  // ✅ Function to check user authentication on page load
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Function to log in user
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        localStorage.setItem("chat-user", JSON.stringify(data.userData)); // ✅ store user
        axios.defaults.headers.common["token"] = data.token; // ✅ set token
        setToken(data.token);
        localStorage.setItem("token", data.token); // ✅ store token
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Function to log out user
  const logout = () => {
    localStorage.removeItem("token"); // ✅ FIXED
    localStorage.removeItem("chat-user"); // ✅ NEW
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]); // ✅ clear list
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully"); // ✅ FIXED
    if (socket) socket.disconnect(); // ✅ disconnect socket
  };

  // ✅ Update profile API
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile Updated");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Restore user on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("chat-user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);
      setAuthUser(user);
      setToken(storedToken);
      axios.defaults.headers.common["token"] = storedToken;
      connectSocket(user);
    } else {
      checkAuth(); // fallback
    }
  }, []);

  // ✅ Context value
  const value = {
    axios,
    authUser,
    onlineUsers, // ✅ FIXED
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


/*
//add all the state variable and functions related to authentication

import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import io from "socket.io-client";

//need backend url create it in .env file so that we can make the api call

export const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;


//auth provider function
export const AuthProvider = ({children}) =>{
    //create state variable used for all application
    const [token,setToken] = useState(localStorage.getItem("token"));//if token available in local storage get stored in token state
    const [authUser,setAuthUser] = useState(null);
    const [onlineUser,setOnlineUsers] = useState([]);
    const [socket,setSocket] = useState(null);

    //create a function to check if user is authenticated and if so set the user and connect to socket
    const checkAuth = async() =>{
        try {
           const {data} =  await axios.get("/api/auth/check");
           if(data.success){
                setAuthUser(data.user) // set user with data coming from the api response
                connectSocket(data.user); //provide user data : refer below function
           }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //create function using which user can login or register

    const login = async (state,credentials)=>{
        try { // make both signup and login api
            const {data} = await axios.post(`/api/auth/${state}`,credentials)
            if(data.success){
                setAuthUser(data.userData);
                localStorage.setItem("chat-user", JSON.stringify(data.userData));
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token",data.token) //set token in local storage after getting it from above
                //display a toast notification 
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    //create a logout function to handle user logout and socket disconnection

    const logout = async()=>{
        localStorage.removeItem("") // remove token user logged out
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        token.success("LOGGED OUT SUCCESFULLY")
        socket.disconnect();
    }

    //create a update profile function to handle updates

    const updateProfile = async(body) =>{
        try { //api call and get data in response
            const {data} = await axios.put("/api/auth/update-profile",body)
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile Updated")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //connect socket function to handle socket connection and online users update 
    const connectSocket = (userData) => {
  if (!userData || socket?.connected) return;

  const newSocket = io(backendUrl, {
    query: {
      userId: userData._id,  // ✅ sent as query param
    },
    transports: ['websocket'], // optional, helps with performance
  });

  newSocket.on("connect", () => {
    console.log("Socket connected ✅");
  });

  newSocket.on("getOnlineUsers", (userIds) => {
    console.log("Online users:", userIds);  // ✅ gets online list
    setOnlineUsers(userIds);
  });

  setSocket(newSocket);
};


    //to execute this function when ever we open the page
   useEffect(() => {
  const storedUser = localStorage.getItem("chat-user");
  const storedToken = localStorage.getItem("token");

  if (storedUser && storedToken) {
    const user = JSON.parse(storedUser);
    setAuthUser(user); // ✅ restores the user
    setToken(storedToken);
    axios.defaults.headers.common["token"] = storedToken;
    connectSocket(user); // ✅ reconnects socket
  } else {
    checkAuth(); // fallback if nothing in localStorage
  }
}, []);


    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile 
    }
    return ( // whatever state variable is added to value we access it using context
        <AuthContext.Provider value={value}> 
             {children}
        </AuthContext.Provider>
    )
} */


