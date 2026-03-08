import express from "express";

import {
    bookingPlacing,
    paymentSuccess,
    paymentfail,
    cancelPayment
} from "../controllers/booking.controller.js"


const router = express.Router()


router.post("/create/:place_id",bookingPlacing)

router.post("/success",paymentSuccess)

router.post("/fail",paymentfail)

router.get("/cancel/:booking_id",cancelPayment)


export default router;