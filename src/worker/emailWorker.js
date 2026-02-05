import { Worker } from "bullmq";

//redis connection 
import IORedis from "ioredis"

//import email sending functions 
import {sendAdminStaffInviteEmail} from "../services/email.service.js"

//redis config for localhost 
const connection = new IORedis({
    host:"redis",  //redis local host
    port:6379,         //redis default port 
    maxRetriesPerRequest:null,

})

//create a new worker to listen to emailQueue 
const worker = new Worker(
    "emailQueue",
    async (job)=>{
        //extract job data 
        const {email,role,link} = job.data;

        //for dibugging 
        console.log("sending email to ",email)

        await sendAdminStaffInviteEmail(email,role,link);

        console.log("email sent!!")
    },
    {connection}
)