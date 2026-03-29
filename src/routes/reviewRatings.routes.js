import express from "express";
import {
    giveRatings,
    giveReview,
    updateReview,
    deleteReview,


} from "../controllers/ratingsReview.controller.js"
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"

const router = express.Router()


//ratings routing 
router.post("/user-ratings/:place_id",protect,giveRatings)
//review routing
router.post("/user-review/:place_id",protect,giveReview)
//update review routing
router.put("/user-review-update/:review_id",protect,updateReview)
//delete review routing 
router.delete("/user-review-delete/:review_id",protect,deleteReview)



export default router