import mongoose from "mongoose";

const subscriptionGistorySchema = new mongoose.Schema({
    
    // User Reference (important)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // Payment Info
    transactionId: {
        type: String,
        required: true,
        unique: true
    },

    amount: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        default: "BDT"
    },

    // Subscription Details
    productName: {
        type: String,
        default: "subscription"
    },

    productCategory: {
        type: String,
        default: "Subscription"
    },

    productProfile: {
        type: String,
        default: "general"
    },

    // Subscription Type (important for logic)
    subscriptionType: {
        type: String,
        enum: ["monthly", "yearly"],
        required: true
    },

    // Dates
    startDate: {
        type: Date,
        default: Date.now
    },

    endDate: {
        type: Date
    },

    // Payment Status
    status: {
        type: String,
        enum: ["pending", "paid", "failed", "cancelled"],
        default: "pending"
    },

    // Customer Info
    customer: {
        name: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        country: {
            type: String,
            default: "Bangladesh"
        }
    },

    // Shipping Info
    shipping: {
        name: String,
        address: String,
        city: String,
        country: {
            type: String,
            default: "Bangladesh"
        },
        postcode: {
            type: Number,
            default: 3000
        }
    }

}, {
    timestamps: true
});

export default mongoose.model("SubscriptionHistory", subscriptionGistorySchema);