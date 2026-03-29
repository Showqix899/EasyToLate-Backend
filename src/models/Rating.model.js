import mongoose from "mongoose";

const ratingRecordeSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    place:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Place",
        required:true,
    },

    gaveRating:{
        type:Boolean,
        default:false,
    },
    rating:{
        type:Number,
        default:0,
        required:true
        }
    

},{
    timestamps:true
})


export default mongoose.model("RatingRecorde",ratingRecordeSchema)