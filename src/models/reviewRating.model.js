import mongoose from "mongoose";

const ratingRecordeSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    gaveRating:{
        type:Boolean,
        default:false,
    }

},{
    timestamps:true
})


export default mongoose.model("RatingRecorde",ratingRecordeSchema)