import dotenv from "dotenv";
dotenv.config();
import { Worker } from "bullmq";
import IORedis from "ioredis";
import cloudinary from "../config/cloudinary.js";
import Place from "../models/Accomodation.model.js"
import connectDB from "../config/db.js";

//connectt to db
await connectDB();


//Redis connection for BullMQ
const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

//upload buffer 
const uploadBuffer = (buffer)=>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream(
            {folder:"places"},
            (err,result)=>{
                if (err) reject(err);
                else resolve(result)
            }
        );
        stream.end(buffer);
    })
}


new Worker(
  "placeImageQueue",
  async (job) => {
    try {
        console.log("Processing job:", job.id);

        const { placeId, files } = job.data;

        const uploadedImages = [];

        for (const file of files) {
            console.log("Uploading image...");

            const result = await uploadBuffer(
                Buffer.from(file.buffer, "base64")
            );

            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }

        await Place.findByIdAndUpdate(placeId, {
            $push: { images: { $each: uploadedImages } },
        });

        console.log("Images uploaded & DB updated");

    } catch (error) {
        console.error("Worker error:", error);
    }
  },
  { connection }
);
console.log("Place image worker started")