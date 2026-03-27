import mongoose from "mongoose"

const userBehaviorSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    place:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Place",
        required:true
    },

    action:{
        type:String,
        enum:["view","click","booking"],
        required:true
    },

},{
    timestamps:true
})

export default mongoose.model("UserBehavior",userBehaviorSchema)