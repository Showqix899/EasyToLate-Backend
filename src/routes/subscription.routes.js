import express from "express"
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"
import { createSubscription,
    subscriptionSuccess,
    subscriptionFail,
    cancelSubscription,
 } from "../controllers/subscription.controller.js"
const router = express.Router()


//create subscription 
router.post("/create",protect,createSubscription)

//success subscription
router.post("/success",subscriptionSuccess)

//failed subscription
router.post("/fail",subscriptionFail)

//cancel subscription 
router.get("/cancel/",protect,cancelSubscription)


export default router