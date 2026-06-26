const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");



router.post("/", async(req,res)=>{


    const {name,email}=req.body;


    const {data,error}= await supabase
        .from("users")
        .insert([
            {
                name:name,
                email:email
            }
        ])
        .select();



    if(error){

        return res.status(500).json({
            error:error.message
        });

    }


    res.json({
        message:"User Added",
        data
    });


});


module.exports = router;