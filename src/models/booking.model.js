import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        maxlength:[255,"name can not exced 255 characters"]
    },
    email:{
        type:String,
        required:true,
        match: [/.+@.+\..+/, 'Please enter a valid email address.'],
        lowercase:true,
    },
    phone:{
        type:String,
        required:true,
        maxlength:11,
    },

    address:{
        type:String,
        required:true,
    },

    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true,
    },
    place_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Place",
        required:true,

    },
    place_owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    isConfirmed:{
        type:Boolean,
        default:false,
    },
    isPaid:{
        type:Boolean,
        default:false,
    }


},{
    timestamps:true,
})


export default mongoose.model("Booking",bookingSchema)