import { NextFunction, Request, Response } from "express";

import Booking from "../infrastructure/entities/Booking";
import { CreateBookingDTO } from "../domain/dtos/booking";
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import Hotel from "../infrastructure/entities/Hotel";
import { getAuth } from "@clerk/express";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { z } from "zod";

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

const BookingFiltersSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

const toCurrencyAmount = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(2)) : 0;

export const getBookingsForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestedUserId = req.params.userId;
    const auth = getAuth(req);
    const authUserId = auth.userId;
    const isAdmin = auth?.sessionClaims?.metadata?.role === "admin";

    if (!authUserId || (!isAdmin && authUserId !== requestedUserId)) {
      throw new UnauthorizedError("Unauthorized");
    }

    const parsedFilters = BookingFiltersSchema.safeParse(req.query);
    if (!parsedFilters.success) {
      throw new ValidationError(parsedFilters.error.message);
    }

    const { status, startDate, endDate, page, limit } = parsedFilters.data;

    const baseFilter: Record<string, unknown> = {
      userId: requestedUserId,
    };

    const filter: Record<string, unknown> = { ...baseFilter };

    if (status) {
      filter.paymentStatus = status;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.$gte = startDate;
      }
      if (endDate) {
        dateFilter.$lte = endDate;
      }
      filter.checkIn = dateFilter;
    }

    const skip = (page - 1) * limit;

    const bookingsPromise = Booking.find(filter)
      .populate("hotelId", "name location image price rating")
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const filteredCountPromise = Booking.countDocuments(filter);

    const aggregateSummaryPromise = Booking.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    const upcomingTripsPromise = Booking.countDocuments({
      ...baseFilter,
      checkIn: { $gte: new Date() },
    });

    const [bookings, filteredCount, summaryCounts, upcomingTrips] =
      await Promise.all([
        bookingsPromise,
        filteredCountPromise,
        aggregateSummaryPromise,
        upcomingTripsPromise,
      ]);

    const formattedBookings = bookings.map((booking) => {
      const hotel = booking.hotelId as unknown as {
        _id: string;
        name: string;
        location: string;
        image: string;
        price: number;
        rating?: number;
      };

      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);
      const nights = Math.max(
        1,
        Math.ceil(
          (checkOutDate.getTime() - checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      const nightlyRate = typeof hotel?.price === "number" ? hotel.price : 0;

      return {
        _id: booking._id,
        hotel: hotel
          ? {
              _id: hotel._id,
              name: hotel.name,
              location: hotel.location,
              image: hotel.image,
              price: hotel.price,
              rating: hotel.rating,
            }
          : null,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        roomNumber: booking.roomNumber,
        paymentStatus: booking.paymentStatus,
        totalAmount: toCurrencyAmount(nightlyRate * nights),
        bookingDate: booking.createdAt ?? booking.checkIn,
      };
    });

    const paymentSummary = summaryCounts.reduce<Record<string, number>>(
      (acc, current) => {
        acc[current._id as string] = current.count;
        return acc;
      },
      {}
    );

    const totalBookings =
      (paymentSummary.PENDING || 0) +
      (paymentSummary.PAID || 0) +
      (paymentSummary.FAILED || 0);

    res.status(200).json({
      data: formattedBookings,
      pagination: {
        total: filteredCount,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(filteredCount / limit)),
      },
      stats: {
        totalBookings,
        pendingPayments: paymentSummary.PENDING || 0,
        paidBookings: paymentSummary.PAID || 0,
        failedPayments: paymentSummary.FAILED || 0,
        upcomingTrips,
      },
    });
  } catch (error) {
    next(error);
  }
};
