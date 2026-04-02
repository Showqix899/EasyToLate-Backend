import express from "express"


//controllers
import { 
    getBookingOverviewAnalytics,
    getRevenueAnalytics,

 } from "../controllers/BookingAnalysis.controller.js"

//authentication middleware
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"
const router = express.Router()


router.get("/analytics/overview",adminAccess,getBookingOverviewAnalytics)
router.get("/analytics/revenue",getRevenueAnalytics)




export default router