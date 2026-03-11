import Subscription from "../models/Subscription.model.js"
import axios from "axios"
import SSLCommerzPayment from "sslcommerz-lts"
import { v4 as uuidv4 } from "uuid"
import { getCache, setCache, deleteCacheByPattern } from "../utils/cache.js"

export const userData = (req,res)=>{
    const user = req.user
    console.log("user data----",user);
    return res.status(200).json({
        user:user
    })
}


export const createSubscription = async (req,res)=>{
    try {
        //getting current user
        const user = req.user;

        //getings credentials
        const {
            subscription_style,
        }=req.body;

        if (!user){
            return req.status(404).json({
                message:"user not found in request"
            })
        }
        //basic validation 
        if (!subscription_style){
            return res.status(400).json({
                message:"plaease chose a subscription plane"
            })
        }

        //getting current time 
        const currentDate = new Date()
        let endDate = new Date(currentDate)
        let amount;

        if (subscription_style === "monthly"){
            endDate.setMonth(endDate.getMonth() + 1)
            amount = Number(process.env.MONTHLY_SUBSCRIPTION_AMOUNT)
        }

        if (subscription_style === "yearly"){
            endDate.setFullYear(endDate.getFullYear() + 1)
            amount = Number(process.env.YEARLY_SUBSCRIPTION_AMOUNT)
        }

        const data={
            owner:user._id,
            owner_username:user.username,
            owner_email:user.email,
            subscriptionAmount:amount,
            subscriptionStyle:subscription_style,
            subscriptionStartingDate:currentDate,
            subscriptionEndDate:endDate,
        }

        //generating a transection id
        const tran_id = uuidv4()

        const paymentData = {

            total_amount:amount,
            currency:"BDT",
            tran_id :tran_id,

            success_url: `${process.env.BASE_URL}/api/subscription/success`,
            fail_url: `${process.env.BASE_URL}/api/subscription/fail`,
            cancel_url: `${process.env.BASE_URL}/api/subscription/cancel`,
            ipn_url: `${process.env.BASE_URL}/api/subscription/ipn`,

            shipping_method: "online",
            product_name: "subscription",
            product_category: "Subscription",
            product_profile: "general",

            cus_name: user.username,
            cus_email: user.email,
            cus_add1: user.address,
            cus_city:user.city || "undefined",
            cus_country: user.country || "bangladesh",
            cus_phone: user.phone,

            //shipping info
            ship_name: user.username,
            ship_add1: user.address,
            ship_city: user.city || "undefined",
            ship_country: user.country || "bangladesh",
            ship_postcode: 3000,

        }

        const is_live = false
        //creating sslcz instance 
        const sslcz = new SSLCommerzPayment(
            process.env.STORE_ID,
            process.env.STORE_PASSWORD,
            is_live,
        )

        //initiation payment and getting api response 
        const apiResponse = await sslcz.init(paymentData)

        const paymentGateWay = apiResponse.GatewayPageURL

        await Subscription.create(data)

        res.status(200).json({
            payment_url:paymentGateWay
        })

    } catch (error) {
        res.status(500).json({
            message: error.message,
            stack:error.stack
        })
    }
}