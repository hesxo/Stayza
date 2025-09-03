import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    description: {
        type: [String],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    
});