import { isObjectIdOrHexString } from "mongoose";
import Place from "../models/Accomodation.model.js"
import User from "../models/User.model.js"
import RatingRecorde from "../models/Rating.model.js"
import Review from "../models/Review.model.js"



//give ratings 
export const giveRatings = async (req, res) => {
    try {
        //get user id 
        const userId = req.user._id;
        //get place id
        const { place_id } = req.params;

        if(!place_id){
            return res.status(400).json({
                message:"no place id porvided"
            })
        }

        //get place 
        const place = await Place.findById(place_id)

        if (!place) {
            return res.status(404).json({
                message: "no place found"
            })
        }



        if (!userId) {
            return res.status(404).json({
                message: "no user id found"
            })
        }

        //check if the user already gave ratings 
        const ratingRecorde = await RatingRecorde.find({
            "user": userId,
            "place":place_id
        })

        if (ratingRecorde.length > 0) {
            return res.status(400).json({
                message: "you already gave ratings to this place"
            })
        }

        const { rating } = req.body;

        if (!rating) {
            return res.status(404).json({
                message: "ratings missing"
            })
        }

        if (rating > 5) {
            return res.status(400).json({
                message: "rating must be 5 or less"
            })
        }

        //get place id 


        
        //get the current ratings status
        let currentTotalScore = place.totalRatingScore;
        let ratingCount = place.ratingCount;

        currentTotalScore += parseInt(rating)
        ratingCount += 1

        place.ratingAverage = (currentTotalScore / ratingCount).toFixed(1)
        place.totalRatingScore = currentTotalScore
        place.ratingCount = ratingCount

        await place.save()

        await RatingRecorde.create({
            user: userId,
            place:place_id,
            gaveRating: true,
        })

        return res.status(200).json({
            rating: place.ratingAverage,
            message: "done"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}



export const giveReview = async (req, res)=>{
    try {
        const userId = req.user._id;
        const {comment} = req.body;
         //get place id
        const { place_id } = req.params;

        if(!place_id){
            return res.status(400).json({
                message:"no place id porvided"
            })
        }

        //get place 
        const place = await Place.findById(place_id)

        if (!place) {
            return res.status(404).json({
                message: "no place found"
            })
        }
        if (!userId) {

            return res.status(404).json({
                message: "no user id found"
            })
        }

        if (!comment){
            return res.status(400).json({
                message:"please provie comments"
            })
        }

        //check if the user already gave review 
        const checkReview = await Review.find({
            "user":userId,
            "place":place_id
        })

        if(checkReview.length > 0){
            return res.status(400).json({
                message: "you already gave reivew to this place"
            })
        }

        //create review instance
        await Review.create({
            user:userId,
            place:place_id,
            comment:comment,
        })

        return res.status(200).json({
            message:"done"
        })


    } catch (error) {
        return res.status(500).json({
                message:error.message
            })
    }
}