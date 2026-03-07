import express from "express";

import {
    bookingPlacing,
    paymentSuccess,
    paymentfail,
} from "../controllers/booking.controller.js"


const router = express.Router()


router.post("/create/:place_id",bookingPlacing)

router.post("/success",paymentSuccess)

router.post("/fail",paymentfail)

router.get("/cancel",(req,res)=>{
    res.send({
        message:"payment cancel"
    })
})


export default router;