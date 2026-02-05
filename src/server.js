import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
});



import app from "./app.js"
import connectDB from "./config/db.js";

//start server
const startServer = async ()=>{
    await connectDB();

    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
}

startServer();