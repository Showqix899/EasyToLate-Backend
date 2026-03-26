import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import UserBehaviourModel from "../models/UserBehaviour.model.js";
import connectDB from "../config/db.js";
import IORedis from "ioredis";

//database connection 
try {
    await connectDB()

} catch (error) {
    console.log(error.message)
}


//Redis connection for BullMQ
const connection = new IORedis({
    host: "redis",
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

const worker = new Worker(
    "user-behavior",
    async (job) => {
        const { user, place, action } = job.data;

        await UserBehaviourModel.create({
            user,
            place,
            action,
        });

        console.log(`Processed ${action} for user ${user}`);
    },
    {
        connection
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.log(`Job ${job.id} failed:`, err.message);
});