import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    roomNumber: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;