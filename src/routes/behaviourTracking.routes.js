import express from "express";

import {
    trackPlaceBooking,
    trackPlaceClick,
    trackPlaceView
} from "../controllers/behaviour.controller.js"

const router = express.Router()

