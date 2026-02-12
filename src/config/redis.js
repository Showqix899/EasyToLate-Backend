import { createClient } from "redis";


//create redis client 
export const redisClient = createClient({
    url:process.env.REDIS_URL || "redis://127.0.0.1:6379"
});


//connect redis 
redisClient.on("error",(err)=>{
    console.log("Redis Client error",err)
});


await redisClient.connect();

console.log("redis Connected")