import UserBehaviourModel from "../models/UserBehaviour.model.js";


//track place view
export const trackPlaceView = async (req, res) => {
    try {
        const { place_id } = req.params;

        await UserBehaviourModel.create({
            user: req.user._id,
            place: place_id,
            action: "view",
        })

        res.json({
            message: "view recorded"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


//track place click 
export const trackPlaceClick = async (req, res) => {
    try {

        const { place_id } = req.params

        await UserBehavior.create({
            user: req.user._id,
            place: place_id,
            action: "click"
        })

        res.json({
            message: "click recorded"
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

//track booking
export const trackPlaceBooking = async (req, res) => {
    try {

        const { place_id } = req.params

        await UserBehavior.create({
            user: req.user._id,
            place: place_id,
            action: "booking"
        })

        res.json({
            message: "booking recorded"
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}