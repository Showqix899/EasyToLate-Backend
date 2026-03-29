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

        if (!place_id) {
            return res.status(400).json({
                message: "no place id porvided"
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
            "place": place_id
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
            place: place_id,
            gaveRating: true,
            rating:rating
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

//update ratings 
export const updateRatings = async(req,res)=>{
    try {
        //get user id
        const userId = req.user._id

        //get rating recorde id 
        const {rating_recorde_id} = req.params;

        const {rating} = req.body;

        if(!rating){
            return res.status(404).json({
                message:"please provide a rating"
            })
        }

        if(!rating_recorde_id){
            return res.status(400).json({
                message:"no ratings recorde id provided"
            })
        }


        //find the recorde ratings 
        const recorde = await RatingRecorde.findById(rating_recorde_id)

        if(!recorde){
            return res.status(404).json({
                message:"no ratings recorde found"
            })
        }

        //find the place 
        const place = await Place.findById(recorde.place)

        if(!place){
            return res.status(404).json({
                message:"no place found"
            })
        }

        //update ratings 
        place.totalRatingScore -= recorde.rating
        await place.save()


        place.totalRatingScore+=parseInt(rating) //add the new rating 

        //update avarage rating 
        place.ratingAverage = (place.totalRatingScore/place.ratingCount).toFixed(1)

        //save the new instance
        await place.save()

        //update the recorde 
        recorde.rating = rating
        await recorde.save()
        
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




//user review
export const giveReview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { comment } = req.body;
        //get place id
        const { place_id } = req.params;

        if (!place_id) {
            return res.status(400).json({
                message: "no place id porvided"
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

        if (!comment) {
            return res.status(400).json({
                message: "please provie comments"
            })
        }

        //check if the user already gave review 
        const checkReview = await Review.find({
            "user": userId,
            "place": place_id
        })

        if (checkReview.length > 0) {
            return res.status(400).json({
                message: "you already gave reivew to this place"
            })
        }

        //create review instance
        await Review.create({
            user: userId,
            place: place_id,
            comment: comment,
        })

        return res.status(200).json({
            message: "done"
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}


//update comments 
export const updateReview = async (req, res) => {
    try {
        //get user  id
        const userId = req.user._id

        //get review id 
        const { review_id } = req.params;

        if (!review_id) {
            return res.status(400).json({
                message: "no review id provided"
            })
        }

        const { comment } = req.body;

        //get the review 
        const review = await Review.findById(review_id)

        if (!review) {
            return res.status(404).json({
                message: "no review found"
            })
        }
        //chekeck if the review created by this user 
        if (toString(userId) !== toString(review.user)) {
            return res.status(403).json({
                message: "forbidden request. You are not the owner of this review"
            })
        }

        if (!comment) {
            return res.status(400).json({
                message: "please, provide a comment"
            })
        }

        review.comment = comment;
        await review.save()

        return res.status(200).json({
            message: "your review is updated successfully"
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}


//delete comments 
export const deleteReview = async (req, res) => {
    try {
        //get user  id
        const userId = req.user._id

        //get review id 
        const { review_id } = req.params;

        if (!review_id) {
            return res.status(400).json({
                message: "no review id provided"
            })
        }

        //get the review 
        const review = await Review.findById(review_id)

        if (!review) {
            return res.status(404).json({
                message: "no review found"
            })
        }

        //chekeck if the review created by this user 
        if (toString(userId) !== toString(review.user)) {
            return res.status(400).json({
                message: "forbidden, you are not the owner of this review"
            })
        }

        //delete the review 
        await review.deleteOne()

        return res.status(200).json({
            message: "your review is deleted successfully"
        })




    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}