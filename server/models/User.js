//create model here
import mongoose from "mongoose";

//define properties available in user data
const userSchema = new mongoose.Schema({
    email: {type:String,required:true,unique:true},
    fullName: {type:String,required:true},
    password: {type:String,required:true,minlength:6},
    profilePic:{type:String,default:""},
    bio: {type:String,default:""}
},{timestamps:true});

//create the user after creating user model

const User = mongoose.model("User",userSchema);

export default User;//using this user model we can store the data in mongodb data base
