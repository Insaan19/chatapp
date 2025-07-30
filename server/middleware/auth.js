//we will protect our route so that the user can access the api endpoint only if it is authorized
//middle ware to protect route

import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async(req,res,next) =>{
    try {
        const token = req.headers.token;

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.json({success:false,message:"User not found"});
        }
        req.user = user; // add user data in req and can access in controller function
        next();
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}