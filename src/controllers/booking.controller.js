import Booking from "../models/booking.model.js"
import Place from "../models/Accomodation.model.js"
import User from "../models/User.model.js"

import SSLCommerzPayment from "sslcommerz-lts"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"


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
            ship_name: name,
            ship_add1: address,
            ship_city: city,
            ship_country: country,
            ship_postcode: 3000,

        }

        const sslcz = new SSLCommerzPayment(
            store_id,
            store_passwd,
            is_live
        )

        const apiResponse = await sslcz.init(payment_data)


        const GatewayPageURL = apiResponse.GatewayPageURL

        //boking data
        const bookingData = {
            name,
            email,
            phone,
            address,
            city,
            country:country.toLowerCase(),

            place_id: place._id,
            place_owner: owner._id,
            place_owner_username: owner.username,
            place_owner_email: owner.email,
            place_owner_phone: owner.phone,

            place_rent: place.price,
            pricing_style: place.pricing_style,
            serviceFee: place.serviceFee,
            maxOccupency: place.maxOccupency,

            availableFrom: place.availableFrom,
            cancelationPolicy: place.cancelationPolicy,

            tran_id
        }

        if (place.bedrooms) bookingData.bedrooms = place.bedrooms
        if (place.beds) bookingData.beds = place.beds
        if (place.bathrooms) bookingData.bathrooms = place.bathrooms
        if (place.kitchen) bookingData.kitchen = place.kitchen
        if (place.availableTo) bookingData.availableTo = place.availableTo
        if (place.houseRules) bookingData.houseRules = place.houseRules


        //creating booking instance
        const booking = await Booking.create(bookingData)

        res.json({
            payment_url: GatewayPageURL
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })
    }
}

//payment success
export const paymentSuccess = async (req, res) => {
    try {

        const { val_id, tran_id } = req.body

        console.log("SSLCommerz Response:", req.body)

        // basic validation
        if (!val_id || !tran_id) {
            return res.status(400).json({
                message: "val_id or tran_id missing"
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
            return res.status(400).json({
                message: "payment validation failed"
            })
        }

        // find booking using tran_id
        const booking = await Booking.findOne({ tran_id })

        if (!booking) {
            return res.status(404).json({
                message: "booking not found"
            })
        }

        // update booking payment status
        booking.isPaid = true
        booking.isConfirmed = true

        await booking.save()

        // update place isAvailabe == true
        const place = await Place.findById(booking.place_id)
        place.isAvailable=false

        await place.save()

        return res.status(200).json({
            message: "Payment successful",
            booking
        })

    } catch (error) {

        return res.status(500).json({
            message: error.message
        })
    }
}

//payment cancelation