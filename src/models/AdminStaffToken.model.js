import mongoose from "mongoose";


//Admin Token Recorde
const adminStaffTokenRecordeSchema = new mongoose.Schema({

    email:{
      required:true,
      type:String,
      lowercase:true,
    },
    role:{
      type:String,
      enum:["admin","staff"]
    },
    invite_token:String,
    token_expires:{
      type:Date
    },
    sender:{
      type:String
    },
    sender_role:{
        type:String,
        enum:["admin"]
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
  timestamps:true
})

export default mongoose.model("AdminStaffTokenRecorde",adminStaffTokenRecordeSchema)