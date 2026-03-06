import express from "express";

import {
    bookingPlacing
} from "../controllers/booking.controller.js"


const router = express.Router()


router.post("/create/:place_id",bookingPlacing)

router.post("/success",(req,res)=>{
    res.send({
        message:"payment success"
    })
})

router.get("/fail",(req,res)=>{
    res.send({
        message:"payment fails"
    })
})

router.get("/cancel",(req,res)=>{
    res.send({
        message:"payment cancel"
    })
})


export default router;