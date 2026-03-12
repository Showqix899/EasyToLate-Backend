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
    tran_id:{
        type:String,
    },
    bank_tran_id:{
        type:String,
    },
    val_id: String,
    status:{
        type:String,
        enum:["success","failed","pending","canceled"]

    },
    refundStatus: {
        type: String,
        enum: ["none", "requested", "refunded"],
        default: "none"
    },

    refundAmount: {
        type: Number,
        default: 0
    },

    refundRequestedAt: Date,

    isPaid:{
        type:Boolean,
        default:false
    }

    
},{timestamps: true}
)

export default mongoose.model("Subscription",subscriptionSchema)