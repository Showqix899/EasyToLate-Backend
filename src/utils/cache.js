import { redisClient } from "../config/redis.js";

//GET Cache 
export const getCache = async (key) =>{
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) :null;
}



//Set cache 
export const setCache = async (key,value,ttl = 300)=>{
    await redisClient.setEx(
        key,
        ttl,
        JSON.stringify(value)
    )
}


//DELETE cache by pattern 
export const deleteCacheByPattern = async (pattern)=>{
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0){
        await redisClient.del(keys);
        console.log("cache cleared")
    }
}