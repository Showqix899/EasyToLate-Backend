import express from "express";
import {
    giveRatings,
    giveReview,


} from "../controllers/ratingsReview.controller.js"
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"

const router = express.Router()


//ratings routing 
router.post("/user-ratings/:place_id",protect,giveRatings)
//review routing
router.post("/user-review/:place_id",protect,giveReview)


export default router