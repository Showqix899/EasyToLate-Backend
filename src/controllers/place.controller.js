import { objectToFlatArray } from "bullmq";
import Place from "../models/Accomodation.model.js";
import { placeImageQueue } from "../queue/placeImageQueue.js";

//create place
export const creatPlace = async (req, res) => {
    try {
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

        console.log("FILES LENGTH", files.length)
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


    } catch (error) {

        res.status(500).json({
            message: "Failed to create place",
            error: error.message,
        });
    }
}



//get all the place for seo 
export const placeListseo = async (req, res) => {
    try {
        const places = await Place.find({});

        if (!places) {
            return res.status(404).json({
                message: "no place found"
            })
        }

        return res.status(200).json({
            places: places
        })
    } catch (error) {
        console.log("error at place list controller")
        return res.status(500).json({
            error: error.message
        })
    }
}


//place search filter 
export const searchPlaces = async (req, res) => {
    try {

        //get the query params
        const {
            category,
            title,
            propertyType,
            country,
            city,
            state,
            pricing_style,
            minPrice,
            maxPrice,
            isAvailable,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            order = "desc",

        } = req.query;


        //build a dynamic filter object
        const filter = {
            isDeleted: false,
            isApproved: true,
            isBlocked: false,
        };


        //category
        if (category) {
            filter.category = category;
        }

        //title (case - insensitive partial match)
        if (title) {
            filter.title = { $regex: title, $options: "i" };
        }

        //property type
        if (propertyType) {
            filter.propertyType = propertyType;
        }

        //location filters
        if (country) filter["location.country"] = country;
        if (city) filter["location.city"] = city;
        if (state) filter["location.state"] = state;

        //pricing style 
        if (pricing_style) {
            filter.pricing_style = pricing_style;
        }

        //availability
        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === "true";
        }


        //price range 
        if (minPrice || maxPrice) {
            filter.price = {};

            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);

        }

        //pagination
        const skip = (page - 1) * limit;

        //sorting
        const sortOption = {
            [sortBy]: order === "asc" ? 1 : -1,
        };

        //database query
        const places = await Place.find(filter)
            .populate("owner", "name email")
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const total = await Place.countDocuments(filter);

        if (places) {
            return res.status(200).json({
                success: true,
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit),
                data: places
            })
        }

        return res.status(404).json({
            message: "no places found"
        })


    } catch (error) {
        console.log("error at search filter places")
        return res.status(500).json({
            error: error.message
        })
    }
}

//get a single place instance
export const getPlace = async (req, res) => {
    try {
        //get place id from query
        const { place_id } = req.query;

        //basic validation
        if (!place_id) {
            return res.status(404).json({
                error: "place id missing"
            })
        }

        //database query
        const place = await Place.findById({ "_id": place_id });

        if (!place) {
            return res.json({
                message: "no place found with this id"
            })
        }

        res.staus(200).json({
            place: place
        })


    } catch (error) {
        console.log("error at get place")
        return res.status(500).json({
            error: error.message
        })
    }
}

//updateimages
export const updatePlace = async (req, res) => {
    try {
        const { id } = req.params;

        const place = await Place.findById(id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found",
            });
        }


        //update normal fields
        const { removeImages, ...updateFields } = req.body;

        Object.keys(updateFields).forEach((key) => {
            place[key] = updatedFields[key];
        });

        //remove images

        if (removeImages && removeImages.length > 0) {
            const imagesToRemove = Array.isArray(removeImages)
                ? removeImages
                : [removeImages];

            //remove from cloudinary
            for (const publicId of imagesToRemove) {
                await cloudinary.uploader.destroy(publicId);
            }

            //remove from database
            place.images = place.images.filter(
                (img) => !imagesToRemove.includes(img.public_id)
            )
        }

        await place.save();

        if (req.files && req.files.length > 0) {
            await placeImageQueue.add("uploadPlaceImages", {
                placeId: place._id,
                files: req.files.map((file) => ({
                    buffer: file.buffer.toString("base64"),
                })),
            });

            console.log("New images sent to queue");
        }

        res.status(200).json({
            success: true,
            message: "Place updated successfully",
            data: place,
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({
        success: false,
        message: "Update failed",
        error: error.message,
        });
    }
}