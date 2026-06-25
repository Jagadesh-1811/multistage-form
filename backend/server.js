const express=require("express");
const app=express();
require("dotenv").config();
const connectDB=require("./config/db");

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})

connectDB();