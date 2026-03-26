import express from "express";

import {
    trackPlaceBooking,
    trackPlaceClick,
    trackPlaceView,
} from "../controllers/behavior.controller.js"

import {
    protect,
    adminAccess
} from "../middlewares/auth.mddleware.js"

const router = express.Router()


router.post("/view/:place_id",protect,trackPlaceView)
router.post("/click/:place_id",protect,trackPlaceClick)
router.post("/booked/:place_id",protect,trackPlaceBooking)

export default router