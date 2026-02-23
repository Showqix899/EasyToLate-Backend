import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import IORedis from "ioredis";
import cloudinary from "../config/cloudinary.js";
import Place from "../models/Accomodation.model.js"
import connectDB from "../config/db.js";

//connect ot db 
await connectDB();


//redis connection
const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});


//remove images form cloudinary worker 
new Worker (
    "placeImageRemoveQueue",
    async (job)=>{
        try {
            console.log("processing remove image job");

            const {imagesToRemove}=job.data;

            for (const publicId of imagesToRemove){
                await cloudinary.uploader.destroy(publicId)
            }

            console.log("done removing images from cloudinary")
        } catch (error) {
            console.log("worker error at remove images from cloudinay",error.message)
        }
    },
    {connection}
);

console.log("image remover worker started")