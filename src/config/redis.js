import IORedis from "ioredis"

//redis config for localhost 
const connection = new IORedis({
    host:"redis",  //redis local host
    port:6379,        //redis default port 
    maxRetriesPerRequest:null,

})

export default connection