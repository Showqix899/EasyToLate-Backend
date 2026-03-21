import Subscription from "../models/Subscription.model.js"
import User from "../models/User.model.js"
import axios from "axios"
import SSLCommerzPayment from "sslcommerz-lts"
import { v4 as uuidv4 } from "uuid"
import { getCache, setCache, deleteCacheByPattern } from "../utils/cache.js"
import bookingModel from "../models/booking.model.js"
import SubscriptionHistory from "../models/SubscriptionHistory.model.js"




//create subscription 
export const createSubscription = async (req, res) => {
    try {
        //getting current user
        const user = req.user;

        //getings credentials
        const {
            subscription_style,
        } = req.body;

        if (!user) {
            return req.status(404).json({
                message: "user not found in request"
            })
        }
        //basic validation 
        if (!subscription_style) {
            return res.status(400).json({
                message: "plaease chose a subscription plane"
            })
        }

        //try to get users subscription 
        const user_subscription = await Subscription.findOne({
            "owner": user._id
        })

        if (!user_subscription) {

            //getting current time 
            const currentDate = new Date()
            let endDate = new Date(currentDate)
            let amount;



            if (subscription_style === "monthly") {
                endDate.setMonth(endDate.getMonth() + 1)
                amount = Number(process.env.MONTHLY_SUBSCRIPTION_AMOUNT)
            }

            if (subscription_style === "yearly") {
                endDate.setFullYear(endDate.getFullYear() + 1)
                amount = Number(process.env.YEARLY_SUBSCRIPTION_AMOUNT)
            }

            //generating a transection id
            const tran_id = uuidv4()

            const data = {
                owner: user._id,
                owner_username: user.username,
                owner_email: user.email,
                subscriptionAmount: amount,
                subscriptionStyle: subscription_style,
                subscriptionStartingDate: currentDate,
                subscriptionEndDate: endDate,
                tran_id: tran_id,
            }

            const paymentData = {

                total_amount: amount,
                currency: "BDT",
                tran_id: tran_id,

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
                cus_city: user.city || "undefined",
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


            try {
                const subscriptionRecorde = {
                    user: req.user._id,
                    transactionId: tran_id, // fixed
                    amount: amount,
                    subscriptionType: subscription_style,
                    startDate: currentDate,
                    endDate: endDate,

                    customer: {
                        name: req.user.username,
                        email: req.user.email,
                        phone: req.user.phone,
                        address: req.user.address, // added
                        city: req.user.city,
                        country: req.user.country
                    },

                    shipping: {
                        name: req.user.username, // fixed
                        address: req.user.address,
                        city: req.user.city,
                        country: req.user.country,
                        postcode: 3000
                    }
                }

                await SubscriptionHistory.create(subscriptionRecorde)

            } catch (error) {
                console.error("Subscription Save Error:", error)
            }



            res.status(200).json({
                payment_url: paymentGateWay
            })


        }

        //getting current time 
        const currentDate = new Date()
        let endDate = new Date(currentDate)
        let amount;

        if (subscription_style === "monthly") {
            endDate.setMonth(endDate.getMonth() + 1)
            amount = Number(process.env.MONTHLY_SUBSCRIPTION_AMOUNT)
        }

        if (subscription_style === "yearly") {
            endDate.setFullYear(endDate.getFullYear() + 1)
            amount = Number(process.env.YEARLY_SUBSCRIPTION_AMOUNT)
        }

        //generating a transection id
        const tran_id = uuidv4()

        const paymentData = {

            total_amount: amount,
            currency: "BDT",
            tran_id: tran_id,

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
            cus_city: user.city || "undefined",
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

        user_subscription.subscriptionAmount = amount
        user_subscription.tran_id = tran_id
        user_subscription.subscription_style = subscription_style
        user_subscription.subscriptionStartingDate = currentDate
        user_subscription.subscriptionEndDate = endDate

        //save to db 
        await user_subscription.save();

        try {
            const subscriptionRecorde = {
                user: req.user._id,
                transactionId: tran_id, // fixed
                amount: amount,
                subscriptionType: subscription_style,
                startDate: currentDate,
                endDate: endDate,

                customer: {
                    name: req.user.username,
                    email: req.user.email,
                    phone: req.user.phone,
                    address: req.user.address, // added
                    city: req.user.city,
                    country: req.user.country
                },

                shipping: {
                    name: req.user.username, // fixed
                    address: req.user.address,
                    city: req.user.city,
                    country: req.user.country,
                    postcode: 3000
                }
            }

            await SubscriptionHistory.create(subscriptionRecorde)

        } catch (error) {
            console.error("Subscription Save Error:", error)
        }


        res.status(200).json({
            payment_url: paymentGateWay
        })


    } catch (error) {
        res.status(500).json({
            message: error.message,
            stack: error.stack
        })
    }
}

//subscription success transection
export const subscriptionSuccess = async (req, res) => {
    try {

        const { val_id, tran_id } = req.body;

        //basic validation 
        if ((!val_id || !tran_id)) {
            return res.status(404).json({
                message: "validation id or transection id missing"
            })
        }

        const store_id = process.env.STORE_ID
        const store_passwd = process.env.STORE_PASSWORD

        // validation url
        const validation_url =
            `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`

        const validationResponse = await axios.get(validation_url)

        const paymentData = validationResponse.data

        if (paymentData.status !== "VALID") {
            return re.status(400).json({
                message: "payment validation failed"
            })
        }

        const subscription = await Subscription.findOne({ tran_id })



        if (!subscription) {
            return res.status(404).json({
                message: "booking not found"
            })
        }

        const user = await User.findOne({
            _id: subscription.owner
        })

        if (!user) {
            return res.status(404).json({
                message: "No associated user found"
            })
        }

        //update subscription instance
        subscription.isPaid = true
        subscription.val_id = val_id
        subscription.bank_tran_id = paymentData.bank_tran_id

        //saving subscription data
        await subscription.save()

        //saving user instance
        user.isSubscribed = true
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
export const subscriptionFail = async (req, res) => {
    try {

        const { tran_id } = req.body;

        if (!tran_id) {
            return res.status(400).json({
                message: "no transection id found"
            })
        }

        //database query 
        const subscription = await Subscription.findOne({ tran_id })

        if (!subscription) {
            return res.status(404).json({
                message: "subscription is not found"
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


//cancel subscription 
export const cancelSubscription = async (req, res) => {
    try {
        const valid_user = req.user

        //find the subscription 
        const subscription = await Subscription.findOne({
            "owner": valid_user._id
        })

        //basic validation
        if (!subscription) {
            return res.status(404).json({
                message: "subscription not found",
                data: subscription
            })
        }

        if (subscription.isPaid === false) {
            return res.status(400).json({
                message: "subscription is not paid"
            })
        }

        if (subscription.refundStatus === "refunded" || subscription.refundStatus === "requested") {
            return res.status(400).json({
                message: "refund already is processing"
            })
        }

        //user data
        const user = await User.findById(valid_user._id)

        if (!user) {
            return res.status(404).json({
                message: "No user found"
            })
        }

        if (user.isSubscribed === false) {
            return res.status(400).json({
                message: "already unsubscribed"
            })
        }

        //current date
        const subsdate = new Date(subscription.createdAt)
        const now = new Date()

        const diffDays = Math.floor(
            (now - subsdate) / (1000 * 60 * 60 * 24)
        )

        // Check refund window (5 days)
        if (diffDays > 5) {
            return res.status(400).json({
                message: "refund period expired"
            })
        }

        if (!subscription.bank_tran_id) {
            return res.status(400).json({
                message: "bank transaction id missing"
            })
        }

        //deducted amount
        const deductedAmount = Math.floor(
            subscription.subscriptionAmount - (subscription.subscriptionAmount * 0.05)
        )

        const refund_url =
            `https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php?bank_tran_id=${subscription.bank_tran_id}&store_id=${process.env.STORE_ID}&store_passwd=${process.env.STORE_PASSWORD}&refund_amount=${deductedAmount}&refund_remarks=booking_cancel&format=json`





        const refundResponse = await axios.get(refund_url)

        const refundData = refundResponse.data

        if (refundData.status !== "success") {
            return res.status(400).json({
                message: "refund failed",
                data: refundData
            })
        }

        subscription.status = "canceled"
        subscription.refundStatus = "refunded"
        subscription.refundAmount = deductedAmount
        subscription.refundRequestedAt = now

        user.isSubscribed = false

        await subscription.save()

        await user.save()

        return res.json({
            message: "subscription has been cancelled and refund processed",
            refundAmount: deductedAmount
        })

    } catch (error) {

        console.log("Cancel Payment Error:", error)
        return res.status(500).json({
            message: error.message
        })
    }
}

//get user subscription behaviour
export const getUserSubscriptionHistory = async (req, res) => {
    try {
        // pagination params
        let { page = 1, limit = 10, subscriptionType, startDate, endDate } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;

        // base query (user-specific)
        const query = {
            user: req.user._id
        };

        //  filter by subscription type
        if (subscriptionType) {
            query.subscriptionType = subscriptionType;
        }

        //  filter by date range
        if (startDate || endDate) {
            query.startDate = {};

            if (startDate) {
                query.startDate.$gte = new Date(startDate);
            }

            if (endDate) {
                query.startDate.$lte = new Date(endDate);
            }
        }

        // total count for pagination
        const total = await SubscriptionHistory.countDocuments(query);

        // fetch data
        const subscriptions = await SubscriptionHistory.find(query)
            .sort({ createdAt: -1 }) // latest first
            .skip(skip)
            .limit(limit);

        // response
        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: subscriptions
        });

    } catch (error) {
        console.error("Get Subscription History Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


import mongoose from "mongoose";

export const getSubscriptionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        //  Validate MongoDB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID"
            });
        }

        //  Find subscription (only for this user)
        const subscription = await SubscriptionHistory.findOne({
            _id: id,
            user: req.user._id
        });

        //  Not found
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            });
        }

        //  Success response
        res.status(200).json({
            success: true,
            data: subscription
        });

    } catch (error) {
        console.error("Get Subscription Details Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};





//admin subscripton controlls  

//get user's subscriptions admin controll

export const adminSubscriptionSearch = async (req, res) => {
    try {

        let {
            page = 1,
            limit = 10,
            subscriptionType,
            startdate,
            endDate,
            username,
            email,
            city,
            phone,
            status,
        } = req.query;

        // convert to number
        page = parseInt(page);
        limit = parseInt(limit);

        // ---------------------------
        // BUILD QUERY OBJECT
        // ---------------------------
        let query = {};

        // subscription type
        if (subscriptionType) {
            query.subscriptionType = subscriptionType;
        }

        // status
        if (status) {
            query.status = status;
        }

        // city filter (nested)
        if (city) {
            query["customer.city"] = { $regex: city, $options: "i" };
        }

        // phone filter (nested)
        if (phone) {
            query["customer.phone"] = { $regex: phone, $options: "i" };
        }

        // ---------------------------
        // DATE FILTER
        // ---------------------------
        if (startdate || endDate) {
            query.startDate = {};

            if (startdate) {
                query.startDate.$gte = new Date(startdate);
            }

            if (endDate) {
                query.startDate.$lte = new Date(endDate);
            }
        }

        // ---------------------------
        // USER FILTER (IMPORTANT)
        // ---------------------------
        if (username || email) {

            let userQuery = {};

            if (username) {
                userQuery.username = { $regex: username, $options: "i" };
            }

            if (email) {
                userQuery.email = { $regex: email, $options: "i" };
            }

            const users = await User.find(userQuery).select("_id");

            const userIds = users.map(user => user._id);

            query.user = { $in: userIds };
        }

        // ---------------------------
        // SORT QUERY FOR CACHE KEY
        // ---------------------------
        const sortedQuery = Object.keys(req.query)
            .sort()
            .reduce((acc, key) => {
                acc[key] = req.query[key];
                return acc;
            }, {});

        // cache key
        const cachekey = `${req.user.username}SubscriptionSearch:${JSON.stringify(sortedQuery)}`;

        // ---------------------------
        // CHECK CACHE
        // ---------------------------
        const cachedData = await getCache(cachekey);

        if (cachedData) {
            return res.status(200).json({
                source: "cache",
                ...cachedData
            });
        }

        // ---------------------------
        // PAGINATION
        // ---------------------------
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            SubscriptionHistory.find(query)
                .populate("user", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            SubscriptionHistory.countDocuments(query)
        ]);

        const response = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            count: data.length,
            data
        };

        // ---------------------------
        // SET CACHE (optional TTL = 60s)
        // ---------------------------
        await setCache(cachekey, response, 60);

        return res.status(200).json({
            source: "db",
            ...response
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};