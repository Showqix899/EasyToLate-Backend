import { Queue } from "bullmq";
import IORedis from "ioredis"

//redis config for localhost 
const connection = new IORedis({
    host:"redis",  //redis local host
    port:6379,
    maxRetriesPerRequest:null,         //redis default port 

})

export const placeImageQueue = new Queue("placeImageQueue",{
    connection
})