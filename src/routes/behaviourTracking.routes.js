import express from "express";

import {
    trackPlaceBooking,
    trackPlaceClick,
    trackPlaceView,
} from "../controllers/behaviour.controller.js"

import {
    protect,
    adminAccess
} from "../middlewares/auth.mddleware.js"

const router = express.Router()


router.post("/:place_id/view",trackPlaceView)
router.post("/:place_id/click",protect,trackPlaceClick)
router.post("/:place_id/booked",protect,trackPlaceBooking)

