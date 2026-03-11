import express from "express"
import {protect,adminAccess} from "../middlewares/auth.mddleware.js"
import { createSubscription } from "../controllers/subscription.controller.js"
const router = express.Router()


//create subscription 
router.post("/create",protect,createSubscription)

//success subscription
router.post("/success",(req,res)=>{
    res.send("subscription payment success")
})

//failed subscription
router.post("/fail",(req,res)=>{
    res.send("subscription payment failed")
})


export default router