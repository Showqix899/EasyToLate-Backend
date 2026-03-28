import { isObjectIdOrHexString } from "mongoose";
import Place from "../models/Accomodation.model.js"
import User from "../models/User.model.js"
import RatingRecorde from "../models/reviewRating.model.js"



//give ratings 
export const giveRatings = async (req, res) => {
    try {
        //get user id 
        const userId = req.user._id;

        if(!userId){
            return res.status(404).json({
                message: "no user id found"
            })
        }

        //check if the user already gave ratings 
        const ratingRecorde = await RatingRecorde.find({
            "user":userId
        })

        if (ratingRecorde.length > 0){
            return res.status(400).json({
                message:"you already gave ratings to this place"
            })
        }

        const {rating} = req.body;

        if (!rating){
            return res.status(404).json({
                message: "ratings missing"
            })
        }

        if (rating > 5){
            return res.status(400).json({
                message:"rating must be 5 or less"
            })
        }

        //get place id 
        const { place_id } = req.params;


        //get place 
        const place = await Place.findById(place_id)

        if (!place) {
            return res.status(404).json({
                message: "no place found"
            })
        }

        //get the current ratings status
        let currentTotalScore = place.totalRatingScore;
        let ratingCount = place.ratingCount;

        currentTotalScore+=parseInt(rating)
        ratingCount+=1

        place.ratingAverage = (currentTotalScore/ratingCount).toFixed(1)
        place.totalRatingScore= currentTotalScore
        place.ratingCount = ratingCount

        await place.save()

        await RatingRecorde.create({
            user:userId,
            gaveRating:true,
        })
        
        

        return res.status(200).json({
            rating:place.ratingAverage,
            message:"done"
        })

    } catch (error) {
        return res.status(500).json({
                message: error.message
            })
    }
}
