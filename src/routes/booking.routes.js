import express from "express";

import {
    bookingPlacing,
    paymentSuccess,
} from "../controllers/booking.controller.js"


const router = express.Router()


router.post("/create/:place_id",bookingPlacing)

router.post("/success",paymentSuccess)

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