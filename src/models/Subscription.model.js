import mongoose from "mongoose";


const subscriptionSchema = new mongoose.Schema({
    
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        
    },
    owner_username:{
        type:String,
        required:true,
    },
    owner_email:{
        type:String,
        required:true
    },
    subscriptionAmount:{
        type:Number,
        required:true
    },
    subscriptionStyle:{
      type:String,
      enum:["monthly","yearly"]
    },
    subscriptionStartingDate:{
      type:Date,
    },
    subscriptionEndDate:{
      type:Date,
    },
    isPaid:{
        type:Boolean,
        default:false
    }

    
},{timestamps: true}
)

export default mongoose.model("Subscription",subscriptionSchema)