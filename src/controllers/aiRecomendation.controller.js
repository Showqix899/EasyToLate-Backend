import UserBehavior from "../models/UserBehaviour.model.js"
import Place from "../models/Accomodation.model.js"

import aiRecomendationPormpt from "../utils/aiPrompt.js"
import model from "../config/genAI.js"

//assigning scores
const WEIGHTS = {
    view: 1,
    click: 3,
    booking: 5
};

//get ai recomendation 
export const getAiRecomendations = async (req, res) => {
    try {
        //get user id 
        const userId = req.user._id;

        //get user behaviours
        const behaviors = await UserBehavior.find({ user: userId })
            .populate("place");

        if (!behaviors.length) {
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

            return res.json(places)
        }


        const profile = {
            category: {},
            city: {},
            price:[],
        }

        behaviors.forEach(b => {
            const weight = WEIGHTS[b.action];
            const place = b.place

            //category score
            profile.category[place.category] = (profile.category[place.category] || 0) + weight;

            //city score 
            profile.city[place.location.city] = (profile.city[place.location.city] || 0) + weight;

            //price preference 
            for (let i = 0; i < weight; i++) {
                profile.price.push(place.price)
            }
        });


        const getTop = obj =>
            Object.keys(obj).sort((a, b) => obj[b] - obj[a])[0];

        const userProfile = {
            category: getTop(profile.category),
            city: getTop(profile.city),
            avgPrice:
                profile.price.reduce((a, b) => a + b, 0) / profile.price.length
        };

        const candidates = await Place.find({
            isAvailable: true,
            isApproved: true,
            isDeleted: false
        }).limit(40);

        const scorePlace = (place, userProfile) => {
            let score = 0;

            if (place.category === userProfile.category) score += 5;
            if (place.location.city === userProfile.city) score += 3;

            const priceDiff = Math.abs(place.price - userProfile.avgPrice);
            score += Math.max(0, 2 - priceDiff / userProfile.avgPrice);

            return score;
        };

        const ranked = candidates
            .map(p => ({
                place: p,
                score: scorePlace(p, userProfile)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 20); // send only top 20 to AI

        const prompt = aiRecomendationPormpt(userProfile, ranked)

        //get result from gen Ai model 
        const result = await model.generateContent(prompt);
        let ids;

        try {
            ids = JSON.parse(result.response.text())
        } catch {
            ids = ranked.slice(0, 10).map(r => r.place._id)
        }

        const interactedIds = behaviors.map(b => b.place._id.toString());

        const finalPlaces = await Place.find({
            _id: {
                $in: ids,
                $nin: interactedIds
            }
        });


        return res.status(200).json({
            result: finalPlaces
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }





}