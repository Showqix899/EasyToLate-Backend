import { Worker } from "bullmq";
import cloudinary from "../config/cloudinary.js"
import Place from "../models/Accomodation.model.js"

import fs from "fs"
import IORedis from "ioredis"
//redis config for localhost 
const connection = new IORedis({
    host:"redis",  //redis local host
    port:6379,
    maxRetriesPerRequest:null,         //redis default port 

})



export const placeImageWorker = new Worker(
    "placeImageQueue",
    async(job)=>{

        const {placeId,files}=job.data;

        const uploadedImages = [];

        for (const filePath of files){
            const result = await cloudinary.uploader.upload(filePath,{
                folder:"places",
            });

            uploadedImages.push({
                url:result.secure_url,
                public_id:result.public_id,
            });

            //remove local temp file 
            fs.unlink(filePath)

        }

        //push images to place 
        await Place.findByIdAndUpdate(placeId,{
            $push:{
                images:{ $each:uploadedImages}
            }
        });
    },
    {
        connection
    }
)