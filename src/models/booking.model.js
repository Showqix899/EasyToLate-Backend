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
        enum:["bangladesh"],
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
    place_owner_username:{
        type:String,
        required:true,
    },
    place_owner_email:{
        type:String,
        required:true,
    },
    place_owner_phone:{
        type:String,
        required:true,
    },
    place_rent:{
        type:Number,
        required:true,
        min:0,
        max:999999
    },
    pricing_style:{
        type:String,
        enum:["per_day","per_night","per_week","per_month"],
        required:true,
    },
    serviceFee:{
        type:Number,
        default:0
    },
    maxOccupency:{
        type:Number,
        required:true,
    },
    bedrooms:Number,
    beds:Number,
    bathrooms:Number,
    kitchen:Number,
    availableFrom:{
        type:Date,
        required:true,
    },

    availableTo:Date,

    houseRules:[String],

    cancelationPolicy:{
        type:String,
        default:"flexible"
    },
    isConfirmed:{
        type:Boolean,
        default:false,
    },
    isPaid:{
        type:Boolean,
        default:false,
    },
    tran_id:{
        type:String,
        required:true,
        unique:true
    },


},{
    timestamps:true,
})


export default mongoose.model("Booking",bookingSchema)