import { NextFunction, Request, Response } from "express";

import Booking from "../infrastructure/entities/Booking";
import { CreateBookingDTO } from "../domain/dtos/booking";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import Hotel from "../infrastructure/entities/Hotel";
import { getAuth } from "@clerk/express";
import UnauthorizedError from "../domain/errors/unauthorized-error";

const MAX_ROOM_NUMBER = 999;
const MIN_ROOM_NUMBER = 100;
const ROOM_ASSIGNMENT_ATTEMPTS = 200;

const generateUniqueRoomNumber = async (
  hotelId: string,
  checkIn: Date,
  checkOut: Date
) => {
  for (let attempt = 0; attempt < ROOM_ASSIGNMENT_ATTEMPTS; attempt++) {
    const roomNumber =
      Math.floor(Math.random() * (MAX_ROOM_NUMBER - MIN_ROOM_NUMBER + 1)) +
      MIN_ROOM_NUMBER;

    const overlappingBookingExists = await Booking.exists({
      hotelId,
      roomNumber,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn },
    });

    if (!overlappingBookingExists) {
      return roomNumber;
    }
  }

  throw new ValidationError(
    "Unable to assign a room number for the selected dates. Please try different dates."
  );
};

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const booking = CreateBookingDTO.safeParse(req.body);
    if (!booking.success) {
      throw new ValidationError(booking.error.message);
    }

    const { hotelId, checkIn, checkOut } = booking.data;

    const { userId } = getAuth(req);
    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }

    const roomNumber = await generateUniqueRoomNumber(hotelId, checkIn, checkOut);

    const newBooking = await Booking.create({
      hotelId,
      userId,
      checkIn,
      checkOut,
      roomNumber,
      paymentStatus: "PENDING",
    });

    res.status(201).json(newBooking);
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    const bookings = await Booking.find({ hotelId: hotelId });
    res.status(200).json(bookings);
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
    return;
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found");
    }
    res.status(200).json(booking);
    return;
  } catch (error) {
    next(error);
  }
};
