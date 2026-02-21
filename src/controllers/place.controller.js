import Place from "../models/Accomodation.model.js";
import { placeImageQueue} from "../queue/placeImageQueue.js";

//create place
export const creatPlace = async (req,res)=>{
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

        const files = req.files || [];

        if (files.length > 10) {
            return res.status(400).json({
                message: "Maximum 10 images allowed",
            });
        }


        // Create place first
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
            images: [],
        });
        
        console.log("FILES LENGTH",files.length)
        // Send images to queue
        if (files.length > 0) {
            console.log("sending job to queue")
            await placeImageQueue.add(
                "uploadPlaceImages", 
                {
                placeId: place._id,
                files: files.map((file) => ({
                    buffer: file.buffer.toString("base64"),
                    mimetype: file.mimetype,
                    originalname: file.originalname,
                })),
            });
        }

        res.status(201).json({
            message:
                "Place created successfully. Images uploading in background.",
            placeId: place._id,
        });


    }catch(error){

        res.status(500).json({
            message: "Failed to create place",
            error: error.message,
        });
    }
}