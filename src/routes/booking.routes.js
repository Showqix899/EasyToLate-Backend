import express from "express";

import {
    bookingPlacing,
    paymentSuccess,
    paymentfail,
    cancelPayment,
    userBookingHistory,
    adminUserBookingHistory,
} from "../controllers/booking.controller.js"
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"


const router = express.Router()


router.post("/create/:place_id",protect,bookingPlacing)

router.post("/success",paymentSuccess)

router.post("/fail",paymentfail)

router.get("/cancel/:booking_id",protect,cancelPayment)

router.get("/history",protect,userBookingHistory)

router.get("/admin-history",adminAccess,adminUserBookingHistory)


export default router;