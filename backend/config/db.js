const mongoose=require("mongoose");
require("dotenv").config();
const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGOURI || process.env.MONGODB_URI);
        console.log("connected to mongodb");
        
    } catch (error) {
        console.error("error connecting to mongodb:", error.message || error);
    }
}
module.exports=connectDB;