import isAuthenticated from './middleware/authentication-middleware';
import express from "express";
import {
  createBooking,
  getAllBookingsForHotel,
  getAllBookings,
  getBookingById,
  getBookingsForUser,
} from "../application/booking";

const bookingsRouter = express.Router();

bookingsRouter
  .route("/")
  .post(isAuthenticated, createBooking)
  .get(isAuthenticated, getAllBookings);
bookingsRouter
  .route("/hotels/:hotelId")
  .get(isAuthenticated, getAllBookingsForHotel);
bookingsRouter
  .route("/user/:userId")
  .get(isAuthenticated, getBookingsForUser);
bookingsRouter.route("/:bookingId").get(isAuthenticated, getBookingById);

export default bookingsRouter;

