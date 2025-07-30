//create function by which we can create user, allow login ,authenticate and update profile

import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

//user signup function 
export const signup = async (req,res)=>{
    const{fullName,email,password,bio} = req.body; //

    try {
        //check whether data is available or not
        if(!fullName || !email  || !password || !bio){
            return res.json({success:false,message:"Missing Details"})
        }

        const user = await User.findOne({email}); // if user exist with this email we need to return a response
        if(user){
            return res.json({success:false,message:"Account Exists!"})
        }   

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt); //hashed password will be stored in the database

        const newUser = await User.create({
            fullName, email, password:hashedPassword, bio
        });
        //token to authenticate the user , create a separate function 
        const token = generateToken(newUser._id)
        //token will be generated with new user id passed, send this token to response

        res.json({success:true,userData:newUser,token,message:"Account created"})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}


//Controller function for user login 
export const login = async(req,res)=>{
    try {
        const{email,password} = req.body;

        const userData = await User.findOne({email})

        const isPassWord = await bcrypt.compare(password,userData.password);
        if(!isPassWord){
            return res.json({success:false,message:"Invalid Credentials"});
        }

        const token = generateToken(userData._id)
        res.json({success:true,userData,token,message:"login Succesful"})

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//whether the user is authenticated or not
export const checkAuth = (req,res)=>{
    res.json({success:true, user:req.user});
}
//create a controller function where user can updated their profile and can store their image on cloud
export const updateProfile = async(req,res)=>{
    try {
        const {profilePic,bio,fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true})
        }else{ //upload - first we have to upload on cloudinary then we will get url
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true});
        }
        res.json({success:true,user:updatedUser})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

//now create api endpoint using all these controller functions done in userRoutes.js, then add these in server .js