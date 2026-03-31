import UserBehaviour from "../models/UserBehaviour.model.js"
import Place from "../models/Accomodation.model.js"
import {getCache,setCache} from "../utils/cache.js"

const ACTION_SCORE = {
    view:1,
    click:3,
    booking:10
}

//get recommendation of places 
export const getRecomendedPlace = async (req,res)=>{
    try {
        const userId = req.user._id
        //get user behaviours 
        const behaviours = await UserBehaviour.find({user:userId})


        if(!behaviours.length){
            //fallback recommendation            
            const places = await Place.find({
                "location.city":req.user.city,
                "location.state":req.user.state,
                "location.country":req.user.country,
                isApproved:true,
                isBlocked:false,
            })
            .sort({ratingAverage:-1}) //highest rating first
            .limit(10)

            console.log("response from fallback recomendation")

            return res.json(places)
        }

        const placeScores = {}

        behaviours.forEach((b)=>{
            const placeId = b.place.toString()

            if(!placeScores[placeId]){
                placeScores[placeId] = 0
            }

            placeScores[placeId] += ACTION_SCORE[b.action]
        })

        //sort place by score 
        const sortedPlaces = Object.entries(placeScores)
        .sort((a,b)=>b[1]-a[1])
        .map(p=>p[0])

        //get categories of top places 
        const topPlaces = await Place.find({
            _id:{$in:sortedPlaces}
        }).limit(5)

        const categories = topPlaces.map(p=>p.category)

        //recommend similar category places
        const recommendations = await Place.find({
            category:{$in:categories},
            isApproved:true,
            isBlocked:false
        })
        .limit(10)

        res.json(recommendations)



    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    
    }
}