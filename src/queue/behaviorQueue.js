import { Queue } from "bullmq";
import { redisClient } from "../config/redis.js";

export const behaviorQueue = new Queue("user-behavior", {
    connection: redisClient,
});