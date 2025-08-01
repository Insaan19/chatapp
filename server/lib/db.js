import mongoose  from "mongoose";

//function to connect to the the mongodb database
export const connectDB = async()=>{
    try {
        mongoose.connection.on('connected',()=>console.log('Database Connection'));
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    } catch (error) {
        console.log(error);
    }
}