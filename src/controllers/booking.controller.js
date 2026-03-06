import Booking from "../models/booking.model.js"
import Place from "../models/Accomodation.model.js"
import User from "../models/User.model.js"

import SSLCommerzPayment from "sslcommerz-lts"
import { v4 as uuidv4 } from "uuid"



// Create Payment Session
export const bookingPlacing = async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            address,
            city,
            country
        } = req.body

        const { place_id } = req.params;

        if (!place_id) {
            return res.status(400).json({
                message: "place id missing"
            })
        }

        // required validation
        const requiredFields = { name, email, phone, address, city, country }

        const data = {}

        for (const [field, value] of Object.entries(requiredFields)) {

            if (!value) {
                return res.status(400).json({
                    message: `please provide ${field}`
                })
            }

            data[field] = value
        }

        // get place
        const place = await Place.findById(place_id)

        if (!place) {
            return res.status(404).json({
                message: "place not found"
            })
        }

        // get owner
        const owner = await User.findById(place.owner)

        if (!owner) {
            return res.status(404).json({
                message: "place owner not found"
            })
        }

        // generate transaction id
        const tran_id = uuidv4()

        const store_id = process.env.STORE_ID
        const store_passwd = process.env.STORE_PASSWORD
        const is_live = false


        // payment data
        const payment_data = {

            total_amount: place.price,
            currency: "BDT",
            tran_id: tran_id,

            success_url: `${process.env.BASE_URL}/api/payment/success`,
            fail_url: `${process.env.BASE_URL}/api/payment/fail`,
            cancel_url: `${process.env.BASE_URL}/api/payment/cancel`,
            ipn_url: `${process.env.BASE_URL}/api/payment/ipn`,

            shipping_method: "Courier",
            product_name: place.title,
            product_category: "Accommodation",
            product_profile: "general",

            cus_name: name,
            cus_email: email,
            cus_add1: address,
            cus_city: city,
            cus_country: country,
            cus_phone: phone,

            //shipping info
            ship_name : name,
            ship_add1:address,
            ship_city:city,
            ship_country:country,
            ship_postcode:3000,

        }

        const sslcz = new SSLCommerzPayment(
            store_id,
            store_passwd,
            is_live
        )

        const apiResponse = await sslcz.init(payment_data)

        
        const GatewayPageURL = apiResponse.GatewayPageURL

        // store temporary booking info in session or cache
        req.session.bookingData = {
            ...data,
            place_id: place._id,
            place_owner: owner._id,
            place_owner_username: owner.username,
            place_owner_email: owner.email,
            place_owner_phone: owner.phone,
            place_rent: place.price,
            pricing_style: place.pricing_style,
            serviceFee: place.serviceFee,
            maxOccupency: place.maxOccupency,
            tran_id: tran_id,
        }

        res.json({
            payment_url: GatewayPageURL
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}