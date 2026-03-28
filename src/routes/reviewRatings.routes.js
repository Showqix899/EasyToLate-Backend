import express from "express";
import {giveRatings} from "../controllers/ratingsReview.controller.js"
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"

const router = express.Router()


//ratings routing 
router.post("/user-ratings/:place_id",protect,giveRatings)


export default router