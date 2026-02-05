import mongoose from "mongoose";

//connect to db function
const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI,{
            dbName:process.env.DB_NAME
        });

        console.log(`successfully connecto mongodb`)
    } catch (error) {
        console.log("faliled connect to mongodb",error.message)
    }


}
export default connectDB;