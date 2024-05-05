import mongoose, { Schema } from "mongoose";

// Define the subscription schema
const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // The ID of the user who is subscribing
        ref: "User", // Reference to the "User" model
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId, // The ID of the user who is being subscribed
        ref: "User", // Reference to the "User" model
        required: true
    }
}, { timestamps: true });

// Create the Subscription model using the subscription schema
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
