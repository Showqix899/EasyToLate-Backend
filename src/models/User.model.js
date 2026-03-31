import mongoose from "mongoose";
import { stringify } from "uuid";

const userSchema = new mongoose.Schema(
  {
    // user's display name
    username: {
      type: String,
      required: true,
      trim: true
    },

    // unique email used for login & verification
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    // optional phone number
    phone: String,

    // hashed password (never returned in queries)
    password: {
      type: String,
      required: true,
      select: false
    },

    // cloudinary image URL
    profile_pic: String,

    address: String,
    city:{
      type:String,
      required:true,
    },
    state:{
      type:String,
      required:true
    },
    country:{
      type:String,
      default:"Bangladesh"
    },
    // role based access control
    role: {
      type: String,
      enum: ["admin", "staff", "user","host"],
      default: "user",
      select: true
    },

    // email verification status
    isActive: {
      type: Boolean,
      default: false
    },

    // email verification token
    emailVerifyToken: String,

    // token expiration time
    emailVerifyExpires:{
      type:Date
    },

    // login protection
    loginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil:{
      type:Date,
      default:null,
      select:true,
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    isSubscribed:{
      type:Boolean,
      default:false,
    },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);

