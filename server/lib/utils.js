//generate token using jsonwebtoken package

import jwt from "jsonwebtoken";

//function to generate a token for user

export const generateToken = (userId)=>{
        const token = jwt.sign({userId},process.env.JWT_SECRET) // add it in .env file so that it is a secure key
        return token;
    }       