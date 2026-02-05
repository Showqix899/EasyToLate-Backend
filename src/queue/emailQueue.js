import { Queue } from "bullmq";
import IORedis from "ioredis"
//redis config for localhost 
const connection = new IORedis({
    host:"redis",  //redis local host
    port:6379,
    maxRetriesPerRequest:null,         //redis default port 

})


//create a queue name "emailQueue"
//jobs added here will be stored in redis 
export const emailQueue = new Queue(
    "emailQueue",
    {
        connection,
    }
);

