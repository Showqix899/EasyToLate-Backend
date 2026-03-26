import { Queue } from "bullmq";
import { redisClient } from "../config/redis.js";
import IORedis from "ioredis"


//redis config for localhost 
const connection = new IORedis({
    host:"redis",  //redis local host
    port:6379,
    maxRetriesPerRequest:null,         //redis default port 

})

export const behaviorQueue = new Queue("user-behavior", {
    connection
});