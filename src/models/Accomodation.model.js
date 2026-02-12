import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
    //user ref
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    //basic listing info 
    title:{
        type:String,
        required:true,
        trim:true,
    },

 
    description:{
        type:String,
        required:true,

    },
    category:{
        type:String,
        required:true,
    },

    propertyType:{
        type:String,
        enum:["entire_place","single_room","single_sit"],
        default:"entire_place"
    },

    location:{
        country:String,
        city:String,
        state:String,
        address:String,
        zipCode:String,


        //for maps and geo location,
        lattitude:Number,
        longitude:Number,
    },

    pricing_style:{
        type:String,
        enum:["per_day","per_night","per_week","per_month"],
        required:true,
    },

    price:{
        type:Number,
        required:true,
    },
    //total gas current wifi
    serviceFee:{
        type:Number,
        default:0
    },

    //maximum occupency 
    maxOccupency:{
        type:Number,
        required:true,
    },

    bedrooms:Number,
    beds:Number,
    bathrooms:Number,
    kitchen:Number,
    
    //images 
    images:[
        {
            url:{
                type:String,
                required:true,
            },
            public_id:{
                type:String,
                required:true,
            }
        }
    ],

    //availability 
    isAvailable:{
        type:Boolean,
        default:true,
    },

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
    //rating
    ratingAverage:{
        type:Number,
        default:0
    },

    ratingCount:{
        type:Number,
        default:0,
    },

    isApproved:{
        type:Boolean,
        default:false
    },

    isBlocked:{
        type:Boolean,
        default:false,
    },

    //soft delete 
    isDeleted:{
        type:Boolean,
        default:false,
    },



},{
    timestamps:true
})

export default mongoose.model("Place",placeSchema)