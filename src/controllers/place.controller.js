import Place from "../models/Accomodation.model.js"
import {placeImageQueue} from "../queue/placeImageQueue.js"
//create a place instance 
export const createPlace = async (req,res)=>{


    try{
        const {
            title,
            description,
            category,
            propertyType,
            location,
            pricing_style,
            price,
            serviceFee,
            maxOccupency,
            bedrooms,
            beds,
            bathrooms,
            kitchen,
            availableFrom,
            availableTo,
            houseRules,
            cancelationPolicy,
            } = req.body;


        //files from multer (stored locally / temp)
        const files = req.files || [];
        
        if (files.length > 20){
            return res.status(400).json({
                message:"maximum 20 images allowed"
            });
        };

        //create place first (without images)
        // Create place first (without images)
        const place = await Place.create({
        owner: req.user._id,
        title,
        description,
        category,
        propertyType,
        location,
        pricing_style,
        price,
        serviceFee,
        maxOccupency,
        bedrooms,
        beds,
        bathrooms,
        kitchen,
        availableFrom,
        availableTo,
        houseRules,
        cancelationPolicy,
        images: [], // will be updated by worker
        });


        //send images to background worker 
        if (files.length>0){
            await placeImageQueue.add("uploadPlaceImages",{
                placeID:place._id,
                files:files.map((f)=>f.path), //local path
            })
        }

        res.status(201).json({
            message:"Your Data Have Been Submitted  successfully"
        })
    }catch(error){
        res.status(500).json({
            message:"Failed to create place",
            error:error.message,
        })
    }
}