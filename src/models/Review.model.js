import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
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


    comment:{
        type:String,
        maxlength:[255,"you can't excced 255 charecters"],
        required:true,
    }
},{
    timestamps:true
})

//data base indexing 
reviewSchema.index({place:1,createdAt:-1});


export default mongoose.model("Review",reviewSchema)