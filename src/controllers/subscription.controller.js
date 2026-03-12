import Subscription from "../models/Subscription.model.js"
import User from "../models/User.model.js"
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

        //generating a transection id
        const tran_id = uuidv4()

        const data={
            owner:user._id,
            owner_username:user.username,
            owner_email:user.email,
            subscriptionAmount:amount,
            subscriptionStyle:subscription_style,
            subscriptionStartingDate:currentDate,
            subscriptionEndDate:endDate,
            tran_id:tran_id,
        }

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

//subscription success transection
export const subscriptionSuccess = async (req,res)=>{
    try {
        
        const {val_id,tran_id} = req.body;

        //basic validation 
        if((!val_id || !tran_id)){
            return res.status(404).json({
                message:"validation id or transection id missing"
            })
        }

        const store_id = process.env.STORE_ID
        const store_passwd = process.env.STORE_PASSWORD

        // validation url
        const validation_url =
            `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`
        
        const validationResponse = await axios.get(validation_url)

        const paymentData = validationResponse.data

        if (paymentData.status !== "VALID"){
            return re.status(400).json({
                message:"payment validation failed"
            })
        }

        const subscription = await Subscription.findOne({tran_id})

        

        if (!subscription){
            return res.status(404).json({
                message:"booking not found"
            })
        }

        const user = await User.findOne({
            _id:subscription.owner
        })

        if(!user){
            return res.status(404).json({
                message:"No associated user found"
            })
        }

        //update subscription instance
        subscription.isPaid=true
        subscription.val_id=val_id
        subscription.bank_tran_id=paymentData.bank_tran_id

        //saving subscription data
        await subscription.save()

        //saving user instance
        user.isSubscribed=true
        await user.save()

        return res.status(200).json({
            message: "You subscribed to EasyToLet successfully",
            subscription
        })
    } catch (error) {

        return res.status(500).json({
            message: error.message
        })
    }
}


//fail subscription controller
export const subscriptionFail = async (req,res)=>{
    try {
        
        const {tran_id} = req.body;

        if (!tran_id){
            return res.status(400).json({
                message:"no transection id found"
            })
        }

        //database query 
        const subscription = await Subscription.findOne({tran_id})

        if (!subscription){
            return res.status(404).json({
                message:"subscription is not found"
            })
        }

        subscription.status = "failed"
        await subscription.save()


        return res.status(200).json({
            message: "payment failed"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message,

        })
    
    }
}